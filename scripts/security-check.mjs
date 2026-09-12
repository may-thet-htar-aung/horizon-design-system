#!/usr/bin/env node
// Pre-deploy security gate. No dependencies — Node built-ins only.
// See .claude/skills/security-check/SKILL.md for what this covers and what it does not.

import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
function getFlag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
}
function hasFlag(name) {
  return args.includes(`--${name}`);
}

const ALL_CHECKS = ['credentials', 'private-ids', 'env-leak', 'advisories', 'dirty-tree'];
let checksToRun = ALL_CHECKS;
const only = getFlag('only');
const skip = getFlag('skip');
if (only) checksToRun = only.split(',').map((s) => s.trim());
if (skip) {
  const skipSet = new Set(skip.split(',').map((s) => s.trim()));
  checksToRun = checksToRun.filter((c) => !skipSet.has(c));
}

const dir = getFlag('dir', 'build');
const jsonOut = hasFlag('json');
const liveUrl = getFlag('live');
const expectMode = getFlag('expect');

const findings = [];
const inconclusive = [];

// ---------- filesystem helpers ----------

function walk(root) {
  const out = [];
  if (!existsSync(root)) return out;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    let stat;
    try {
      stat = statSync(current);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current)) stack.push(join(current, entry));
    } else if (stat.isFile()) {
      out.push(current);
    }
  }
  return out;
}

function isTextFile(filePath) {
  return /\.(js|mjs|cjs|css|html|json|map|txt|svg)$/i.test(filePath);
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

// ---------- 1. credentials — provider-specific shapes, not entropy ----------

const CREDENTIAL_PATTERNS = [
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g, severity: 'critical' },
  { name: 'AWS Secret Access Key (labeled)', regex: /aws_secret_access_key\s*[:=]\s*['"][A-Za-z0-9/+=]{40}['"]/gi, severity: 'critical' },
  { name: 'GitHub token', regex: /gh[pousr]_[A-Za-z0-9]{36,255}/g, severity: 'critical' },
  { name: 'GitHub fine-grained PAT', regex: /github_pat_[A-Za-z0-9_]{60,90}/g, severity: 'critical' },
  { name: 'Slack token', regex: /xox[baprs]-[A-Za-z0-9-]{10,72}/g, severity: 'critical' },
  { name: 'Slack webhook URL', regex: /hooks\.slack\.com\/services\/T[A-Za-z0-9]+\/B[A-Za-z0-9]+\/[A-Za-z0-9]+/g, severity: 'high' },
  { name: 'Stripe secret key', regex: /sk_live_[A-Za-z0-9]{24,}/g, severity: 'critical' },
  { name: 'Stripe restricted key', regex: /rk_live_[A-Za-z0-9]{24,}/g, severity: 'critical' },
  { name: 'Google API key', regex: /AIza[0-9A-Za-z\-_]{35}/g, severity: 'high' },
  { name: 'npm token', regex: /npm_[A-Za-z0-9]{36}/g, severity: 'critical' },
  { name: 'Figma personal access token', regex: /figd_[A-Za-z0-9_-]{20,}/g, severity: 'critical' },
  { name: 'Airtable personal access token', regex: /pat[A-Za-z0-9]{14}\.[A-Za-z0-9]{64}/g, severity: 'critical' },
  { name: 'Airtable legacy API key', regex: /\bkey[A-Za-z0-9]{14}\b/g, severity: 'high' },
  { name: 'Private key block', regex: /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g, severity: 'critical' },
];

// ---------- 2. private identifiers ----------

const PRIVATE_ID_PATTERNS = [
  { name: 'Airtable base ID', regex: /\bapp[A-Za-z0-9]{14}\b/g, severity: 'high' },
  { name: 'Airtable table ID', regex: /\btbl[A-Za-z0-9]{14}\b/g, severity: 'high' },
  { name: 'Airtable record ID', regex: /\brec[A-Za-z0-9]{14}\b/g, severity: 'medium' },
  { name: 'Airtable field ID', regex: /\bfld[A-Za-z0-9]{14}\b/g, severity: 'medium' },
  { name: 'Airtable view ID', regex: /\bviw[A-Za-z0-9]{14}\b/g, severity: 'medium' },
  { name: 'Private IPv4 (10.x)', regex: /\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, severity: 'medium' },
  { name: 'Private IPv4 (192.168.x)', regex: /\b192\.168\.\d{1,3}\.\d{1,3}\b/g, severity: 'medium' },
  { name: 'Private IPv4 (172.16-31.x)', regex: /\b172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}\b/g, severity: 'medium' },
  { name: 'Internal hostname', regex: /\b[a-z0-9-]+\.(internal|corp|lan)\b/gi, severity: 'medium' },
];

function runPatternCheck(checkName, patterns) {
  const files = walk(dir).filter(isTextFile);
  for (const file of files) {
    let content;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const { name, regex, severity } of patterns) {
      const re = new RegExp(regex.source, regex.flags);
      let m;
      while ((m = re.exec(content)) !== null) {
        findings.push({
          check: checkName,
          severity,
          file: relative(process.cwd(), file),
          line: lineOf(content, m.index),
          pattern: name,
          match: m[0].length > 60 ? m[0].slice(0, 57) + '...' : m[0],
        });
        if (m[0].length === 0) re.lastIndex++; // guard against zero-width matches
      }
    }
  }
}

// ---------- 3. environment leakage into client JS ----------

function runEnvLeakCheck() {
  const files = walk(dir).filter(isTextFile);
  const SAFE_VITE_NAMES = new Set(['MODE', 'DEV', 'PROD', 'SSR', 'BASE_URL']);

  for (const file of files) {
    let content;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const importMetaRe = /import\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
    let m;
    while ((m = importMetaRe.exec(content)) !== null) {
      const name = m[1];
      if (SAFE_VITE_NAMES.has(name) || name.startsWith('VITE_')) continue;
      findings.push({
        check: 'env-leak',
        severity: 'high',
        file: relative(process.cwd(), file),
        line: lineOf(content, m.index),
        pattern: 'non-VITE_ import.meta.env reference in client output',
        match: `import.meta.env.${name}`,
      });
    }

    const processEnvRe = /process\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
    let m2;
    while ((m2 = processEnvRe.exec(content)) !== null) {
      if (m2[1] === 'NODE_ENV') continue;
      findings.push({
        check: 'env-leak',
        severity: 'high',
        file: relative(process.cwd(), file),
        line: lineOf(content, m2.index),
        pattern: 'process.env reference in client output',
        match: `process.env.${m2[1]}`,
      });
    }
  }

  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const envContent = readFileSync(envPath, 'utf8');
  const suspiciousName = /(SECRET|TOKEN|KEY|PASSWORD|PWD|CREDENTIAL)/i;
  const placeholder = /^(changeme|xxx+|todo|example|placeholder|your[-_]?)/i;

  for (const rawLine of envContent.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    if (!suspiciousName.test(key)) continue;
    const val = rawVal.trim().replace(/^['"]|['"]$/g, '');
    if (val.length < 8 || placeholder.test(val)) continue;

    for (const file of files) {
      let content;
      try {
        content = readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      const idx = content.indexOf(val);
      if (idx !== -1) {
        findings.push({
          check: 'env-leak',
          severity: 'critical',
          file: relative(process.cwd(), file),
          line: lineOf(content, idx),
          pattern: `.env value for ${key} found verbatim in build output`,
          match: `${key}=<redacted, ${val.length} chars>`,
        });
      }
    }
  }
}

// ---------- 4. dependency advisories ----------

function runAdvisoriesCheck() {
  let output;
  try {
    output = execSync('npm audit --json', { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  } catch (err) {
    // npm audit exits non-zero when it finds vulnerabilities; stdout still carries the JSON.
    output = err.stdout ? err.stdout.toString() : null;
  }
  if (!output) {
    inconclusive.push({ check: 'advisories', reason: 'npm audit produced no output — could not run' });
    return;
  }
  let report;
  try {
    report = JSON.parse(output);
  } catch {
    inconclusive.push({ check: 'advisories', reason: 'npm audit output was not valid JSON' });
    return;
  }
  const vulns = report.vulnerabilities || {};
  for (const [pkg, info] of Object.entries(vulns)) {
    if (info.severity === 'high' || info.severity === 'critical') {
      findings.push({
        check: 'advisories',
        severity: info.severity,
        file: 'package-lock.json',
        line: null,
        pattern: pkg,
        match: `${info.severity} advisory on ${pkg}${info.range ? ' ' + info.range : ''}`,
      });
    }
  }
}

// ---------- 5. dirty working tree ----------

function runDirtyTreeCheck() {
  let output;
  try {
    output = execSync('git status --porcelain', { cwd: process.cwd() }).toString();
  } catch (err) {
    inconclusive.push({ check: 'dirty-tree', reason: `git status failed: ${err.message}` });
    return;
  }
  const lines = output.split('\n').filter(Boolean);
  if (lines.length > 0) {
    findings.push({
      check: 'dirty-tree',
      severity: 'medium',
      file: null,
      line: null,
      pattern: 'uncommitted changes',
      match: `${lines.length} path(s) not committed`,
    });
  }
}

// ---------- 6. live mode ----------

async function runLiveCheck(url, expect) {
  if (expect !== 'public' && expect !== 'protected') {
    console.error('--expect must be "public" or "protected"');
    process.exitCode = 2;
    return;
  }
  let res;
  try {
    res = await fetch(url, { redirect: 'follow' });
  } catch (err) {
    inconclusive.push({ check: 'live', reason: `request to ${url} failed: ${err.message}` });
    return;
  }
  const status = res.status;
  let actual;
  if (status >= 200 && status < 300) actual = 'public';
  else if (status === 401 || status === 403 || status === 407) actual = 'protected';
  else {
    inconclusive.push({ check: 'live', reason: `${url} returned HTTP ${status} — neither a clean 2xx nor a 401/403/407, can't classify` });
    return;
  }
  if (actual !== expect) {
    findings.push({
      check: 'live',
      severity: 'critical',
      file: null,
      line: null,
      pattern: `expected ${expect}, observed ${actual}`,
      match: `${url} → HTTP ${status}`,
    });
  }
}

// ---------- run ----------

async function main() {
  if (liveUrl) {
    await runLiveCheck(liveUrl, expectMode);
  } else {
    if (checksToRun.includes('credentials')) runPatternCheck('credentials', CREDENTIAL_PATTERNS);
    if (checksToRun.includes('private-ids')) runPatternCheck('private-ids', PRIVATE_ID_PATTERNS);
    if (checksToRun.includes('env-leak')) runEnvLeakCheck();
    if (checksToRun.includes('advisories')) runAdvisoriesCheck();
    if (checksToRun.includes('dirty-tree')) runDirtyTreeCheck();
  }

  if (jsonOut) {
    console.log(JSON.stringify({ findings, inconclusive }, null, 2));
  } else if (findings.length === 0 && inconclusive.length === 0) {
    console.log('security-check: clean — no known-shape credential, private ID, env leak, advisory, or dirty-tree finding.');
  } else {
    for (const f of findings) {
      const loc = f.file ? `${f.file}${f.line ? ':' + f.line : ''}` : '(n/a)';
      console.log(`[${f.severity.toUpperCase()}] ${f.check} — ${f.pattern} — ${loc}${f.match ? ' — ' + f.match : ''}`);
    }
    for (const i of inconclusive) {
      console.log(`[INCONCLUSIVE] ${i.check} — ${i.reason}`);
    }
  }

  process.exitCode = findings.length > 0 || inconclusive.length > 0 ? 1 : 0;
}

main();

#!/usr/bin/env node
/*
 * Webspace documentation covenant: every revision adds one matched, dated
 * backward-and-forward README entry and technical manual entry.
 * Read-only. No dependencies outside Node and git. Never executes PR content.
 */
import {execFileSync} from 'node:child_process';

function git(...args) {
  return execFileSync('git', args, {encoding: 'utf8', stdio: ['ignore','pipe','pipe']}).trimEnd();
}
function fail(message) { throw Error('Webspace covenant: ' + message); }
function uniqEntries(source, regex, label) {
  const entries = new Map();
  for (const match of source.matchAll(regex)) {
    const [, id, date, body] = match;
    if (entries.has(id)) fail('duplicate ' + label + ' ledger ID: ' + id);
    if (Number.isNaN(Date.parse(date + 'T00:00:00Z')) ||
        new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) !== date) {
      fail('invalid date for ' + id);
    }
    entries.set(id, {date, body: body.trim()});
  }
  return entries;
}
function readmeEntries(source) {
  return uniqEntries(source,
    /<!-- WEBSPACE-LEDGER id="([A-Za-z0-9_.-]+)" date="(\d{4}-\d{2}-\d{2})" -->([\s\S]*?)<!-- \/WEBSPACE-LEDGER -->/g,
    'README');
}
function manualEntries(source) {
  return uniqEntries(source,
    /<article data-ledger-id="([A-Za-z0-9_.-]+)" data-ledger-date="(\d{4}-\d{2}-\d{2})">([\s\S]*?)<\/article>/g,
    'manual');
}
function requireFields(body, fields, label, id) {
  for (const field of fields) if (!body.includes(field)) {
    fail(label + ' ledger ' + id + ' missing field: ' + field);
  }
}
function added(oldRecords, newRecords, label) {
  for (const [id, before] of oldRecords) {
    const after = newRecords.get(id);
    if (!after) fail(label + ' removed historical entry ' + id);
    if (after.date !== before.date || after.body !== before.body) {
      fail(label + ' silently changed historical entry ' + id + '; append an erratum instead');
    }
  }
  const ids = [...newRecords.keys()].filter(id => !oldRecords.has(id));
  if (!ids.length) fail(label + ' needs a NEW dated ledger entry, not a text-only revision');
  return ids;
}

try {
  const base = process.env.COVENANT_BASE_SHA || 'HEAD^';
  const changed = git('diff', '--name-only', base, 'HEAD').split('\n').filter(Boolean);
  if (!changed.length) {
    console.log('PASS Webspace covenant: no changed paths');
    process.exit(0);
  }
  if (!changed.includes('README.md') || !changed.includes('TECH_MANUAL.html')) {
    fail('every revision must change BOTH README.md and TECH_MANUAL.html; changed: ' + changed.join(', '));
  }
  const priorReadme = readmeEntries(git('show', base + ':README.md'));
  const currentReadme = readmeEntries(git('show', 'HEAD:README.md'));
  const priorManual = manualEntries(git('show', base + ':TECH_MANUAL.html'));
  const currentManual = manualEntries(git('show', 'HEAD:TECH_MANUAL.html'));
  const newReadme = added(priorReadme, currentReadme, 'README');
  const newManual = added(priorManual, currentManual, 'manual');
  for (const id of newReadme) {
    const readme = currentReadme.get(id), manual = currentManual.get(id);
    if (!manual || !newManual.includes(id)) fail('technical manual lacks new matching entry ' + id);
    if (readme.date !== manual.date) fail('mismatched dates for ' + id);
    requireFields(readme.body, ['**Backwards:**','**Forwards:**','**Not yet:**','**Invariant impact:**','**Evidence:**'], 'README', id);
    requireFields(manual.body, ['<strong>Changed:</strong>','<strong>Checked:</strong>','<strong>Deferred:</strong>','<strong>Contract impact:</strong>'], 'technical', id);
  }
  for (const id of newManual) if (!newReadme.includes(id)) fail('README lacks new matching entry ' + id);
  console.log('PASS Webspace covenant: ' + newReadme.join(', ') + '; both manuals updated and history preserved');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

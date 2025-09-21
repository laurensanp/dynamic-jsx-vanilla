#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.resolve(__dirname, '..');

const EXCLUDE_DIRS = new Set(['node_modules', '.git']);
const INCLUDE_EXTS = new Set(['.js', '.css', '.html', '.htm', '.md']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      files.push(...walk(path.join(dir, e.name)));
    } else if (e.isFile()) {
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}

function stripJS(content) {
  
  let out = content.replace(/\/\*[\s\S]*?\*\
  
  out = out.replace(/(^|[^:])\/\/.*$/gm, '$1');
  return out;
}

function stripCSS(content) {
  return content.replace(/\/\*[\s\S]*?\*\
}

function stripHTML(content) {
  return content.replace(/<!--([\s\S]*?)-->/g, '');
}

function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!INCLUDE_EXTS.has(ext)) return; 
  const original = fs.readFileSync(file, 'utf8');
  let stripped = original;

  try {
    if (ext === '.js') stripped = stripJS(original);
    else if (ext === '.css') stripped = stripCSS(original);
    else if (ext === '.html' || ext === '.htm' || ext === '.md') stripped = stripHTML(original);
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
    return;
  }

  if (stripped !== original) {
    if (DRY_RUN) {
      console.log(`[DRY] Would update: ${path.relative(ROOT, file)} (removed ${original.length - stripped.length} chars)`);
    } else {
      fs.writeFileSync(file, stripped, 'utf8');
      console.log(`[OK ] Updated: ${path.relative(ROOT, file)} (removed ${original.length - stripped.length} chars)`);
    }
  }
}

function main() {
  const files = walk(ROOT);
  for (const f of files) {
    processFile(f);
  }
  console.log('\nDone.');
}

main();

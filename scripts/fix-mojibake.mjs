#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd()
const SHOULD_FIX = process.argv.includes('--fix')

const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.css',
  '.scss',
  '.html',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
  '.svg',
])

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  'out',
])

const SUSPICIOUS_PATTERNS = [/Ð/g, /Ñ/g, /â[€™œ]/g, /Â/g]

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath, files)
      continue
    }

    if (!entry.isFile()) continue
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) continue
    if (entry.name.endsWith('.min.js')) continue

    files.push(fullPath)
  }

  return files
}

function hasSuspiciousMojibake(text) {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(text))
}

function tryFixUtf8Mojibake(text) {
  return Buffer.from(text, 'latin1').toString('utf8')
}

function countCyrillic(text) {
  const match = text.match(/[А-Яа-яЁё]/g)
  return match ? match.length : 0
}

function countReplacementChars(text) {
  const match = text.match(/�/g)
  return match ? match.length : 0
}

function countSuspiciousChars(text) {
  return (text.match(/Ð|Ñ|Â|â[€™œ]/g) || []).length
}

function looksBetter(before, after) {
  const beforeCyr = countCyrillic(before)
  const afterCyr = countCyrillic(after)

  const beforeBad = countReplacementChars(before)
  const afterBad = countReplacementChars(after)

  const beforeSuspicious = countSuspiciousChars(before)
  const afterSuspicious = countSuspiciousChars(after)

  return (
    afterBad <= beforeBad &&
    afterSuspicious < beforeSuspicious &&
    afterCyr >= beforeCyr
  )
}

function processFile(filePath) {
  let original

  try {
    original = fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.warn(`[warn] failed to read ${filePath}: ${error.message}`)
    return null
  }

  if (!hasSuspiciousMojibake(original)) return null

  const fixed = tryFixUtf8Mojibake(original)
  const better = looksBetter(original, fixed)

  return {
    filePath,
    fixed,
    better,
  }
}

const files = walk(ROOT)
const results = []

for (const filePath of files) {
  const result = processFile(filePath)
  if (result) results.push(result)
}

if (results.length === 0) {
  console.log('No suspicious mojibake found.')
  process.exit(0)
}

let fixedCount = 0
let safeFixableCount = 0
let skippedCount = 0

for (const result of results) {
  const rel = path.relative(ROOT, result.filePath)

  if (!result.better) {
    console.log(
      `[warn] ${rel} -> suspicious text found, but auto-fix was skipped`,
    )
    skippedCount++
    continue
  }

  console.log(`[found] ${rel}`)
  safeFixableCount++

  if (SHOULD_FIX) {
    fs.writeFileSync(result.filePath, result.fixed, 'utf8')
    console.log(`[fixed] ${rel}`)
    fixedCount++
  }
}

if (!SHOULD_FIX) {
  console.log(
    `\nSummary: found ${results.length}, safe to fix ${safeFixableCount}, skipped ${skippedCount}`,
  )
  console.log('Run with --fix to apply safe auto-fixes.')
  process.exit(safeFixableCount > 0 ? 1 : 0)
} else {
  console.log(`\nDone. Fixed files: ${fixedCount}, skipped: ${skippedCount}`)
}

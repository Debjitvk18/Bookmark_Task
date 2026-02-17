#!/usr/bin/env node

/**
 * Pre-Deployment Security Check
 * Run this before pushing to GitHub: node scripts/check-security.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔒 Running Security Audit...\n')

let hasIssues = false

// Check 1: Verify .gitignore exists and includes .env
console.log('📋 Checking .gitignore...')
try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8')
    if (gitignore.includes('.env')) {
        console.log('✅ .gitignore properly excludes .env files\n')
    } else {
        console.log('❌ WARNING: .gitignore does NOT exclude .env files!\n')
        hasIssues = true
    }
} catch (error) {
    console.log('❌ ERROR: .gitignore file not found!\n')
    hasIssues = true
}

// Check 2: Verify .env.example exists and has no real credentials
console.log('📋 Checking .env.example...')
try {
    const envExample = fs.readFileSync('.env.example', 'utf8')
    if (envExample.includes('your_') || envExample.includes('_here')) {
        console.log('✅ .env.example contains placeholders (no real credentials)\n')
    } else {
        console.log('⚠️  WARNING: .env.example might contain real credentials!\n')
        hasIssues = true
    }
} catch (error) {
    console.log('❌ ERROR: .env.example file not found!\n')
    hasIssues = true
}

// Check 3: Search for common secret patterns in src/
console.log('📋 Scanning source code for secrets...')
const srcPath = path.join(process.cwd(), 'src')

function scanDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true })

    for (const file of files) {
        const fullPath = path.join(dir, file.name)

        if (file.isDirectory()) {
            scanDirectory(fullPath)
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8')

            // Check for common credential patterns
            const patterns = [
                { regex: /supabase\.co\/[a-zA-Z0-9]+/g, name: 'Supabase URL' },
                { regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, name: 'JWT token' },
                { regex: /sk_[a-zA-Z0-9]{32,}/g, name: 'Service key' }
            ]

            for (const pattern of patterns) {
                const matches = content.match(pattern.regex)
                if (matches) {
                    console.log(`❌ FOUND ${pattern.name} in ${file.name}`)
                    hasIssues = true
                }
            }
        }
    }
}

try {
    scanDirectory(srcPath)
    if (!hasIssues) {
        console.log('✅ No hardcoded secrets found in source code\n')
    }
} catch (error) {
    console.log('⚠️  Could not scan src/ directory\n')
}

// Check 4: Verify .env is NOT staged
console.log('📋 Checking git status...')
try {
    const { execSync } = require('child_process')
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' })

    if (gitStatus.includes('.env')) {
        console.log('❌ CRITICAL: .env file is staged for commit!')
        console.log('   Run: git reset .env\n')
        hasIssues = true
    } else {
        console.log('✅ .env files not staged for commit\n')
    }
} catch (error) {
    console.log('⚠️  Not a git repository or git not installed\n')
}

// Check 5: Verify package.json has correct scripts
console.log('📋 Checking package.json scripts...')
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const requiredScripts = ['dev', 'build', 'start']
    const missingScripts = requiredScripts.filter(script => !pkg.scripts[script])

    if (missingScripts.length === 0) {
        console.log('✅ All required npm scripts present\n')
    } else {
        console.log(`❌ Missing scripts: ${missingScripts.join(', ')}\n`)
        hasIssues = true
    }
} catch (error) {
    console.log('❌ ERROR: Could not read package.json\n')
    hasIssues = true
}

// Final Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
if (hasIssues) {
    console.log('❌ SECURITY ISSUES FOUND - DO NOT PUSH!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('Please fix the issues above before pushing to GitHub.\n')
    process.exit(1)
} else {
    console.log('✅ ALL CHECKS PASSED!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('Your code is ready to push to GitHub! 🚀\n')
    console.log('Next steps:')
    console.log('  1. git add .')
    console.log('  2. git commit -m "Initial commit"')
    console.log('  3. git push\n')
    process.exit(0)
}

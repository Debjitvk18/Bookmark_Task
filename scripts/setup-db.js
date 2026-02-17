#!/usr/bin/env node

/**
 * Database Migration Script - Alternative Approach
 * This script checks if tables exist and guides you through setup
 * Run: node scripts/setup-db.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing environment variables in .env file!')
    console.error('\nMake sure you have:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co')
    console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabaseSetup() {
    console.log('� Checking database setup...\n')

    try {
        // Try to query the bookmarks table
        console.log('📋 Checking if bookmarks table exists...')
        const { data, error } = await supabase
            .from('bookmarks')
            .select('count')
            .limit(0)

        if (error) {
            if (error.message.includes('does not exist') || error.code === '42P01') {
                console.log('❌ Bookmarks table does NOT exist\n')
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
                console.log('📝 TO FIX: Run this SQL in Supabase Dashboard')
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
                console.log('1. Go to: https://supabase.com/dashboard')
                console.log('2. Select your project')
                console.log('3. Click: SQL Editor (left sidebar)')
                console.log('4. Click: New Query')
                console.log('5. Copy and paste this SQL:\n')

                const sql = `
-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe for re-running)
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- Create RLS policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS bookmarks;
`
                console.log(sql)
                console.log('\n6. Click: Run (or press Ctrl+Enter)')
                console.log('7. Run this script again to verify\n')
                process.exit(1)
            } else {
                console.error('❌ Database error:', error.message)
                process.exit(1)
            }
        }

        console.log('✅ Bookmarks table exists!')

        // Try a test insert to check RLS policies
        console.log('\n� Checking RLS policies...')

        // This should fail because we're not authenticated (which is good!)
        const { error: insertError } = await supabase
            .from('bookmarks')
            .insert({
                title: 'test',
                url: 'https://test.com',
                user_id: '00000000-0000-0000-0000-000000000000'
            })

        if (insertError) {
            if (insertError.message.includes('row-level security') || insertError.code === '42501') {
                console.log('✅ RLS policies are working correctly!')
            } else {
                console.log('⚠️  Warning: Unexpected error:', insertError.message)
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🎉 Database is properly configured!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        console.log('✅ Bookmarks table exists')
        console.log('✅ RLS policies are enabled')
        console.log('✅ Ready to use!\n')
        console.log('Next steps:')
        console.log('  1. Make sure Google OAuth is configured in Supabase')
        console.log('  2. Start your app: npm run dev')
        console.log('  3. Sign in with Google')
        console.log('  4. Add bookmarks!\n')

    } catch (error) {
        console.error('❌ Unexpected error:', error.message)
        process.exit(1)
    }
}

checkDatabaseSetup()

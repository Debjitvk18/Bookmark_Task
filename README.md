# Smart Bookmark Manager

A real-time bookmark management application built with Next.js, Supabase, and Google OAuth.

## Features

✨ **Google OAuth Authentication** - Secure sign-in with Google (no email/password required)  
📚 **Bookmark Management** - Add, view, and delete bookmarks with URL and title  
🔒 **Private Bookmarks** - Each user's bookmarks are completely private  
⚡ **Real-time Sync** - Bookmarks update instantly across all open tabs  
🎨 **Modern UI** - Beautiful glassmorphism design with Tailwind CSS  

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript
- **Backend:** Supabase (Authentication, Database, Realtime)
- **Styling:** Tailwind CSS
- **Icons:** React Icons

## Prerequisites

- Node.js 20.x or higher
- A Supabase account ([supabase.com](https://supabase.com))
- Google OAuth credentials (Google Cloud Console)

## Setup Instructions

### 1. Clone and Install

```bash
cd smart-bookmark-app
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to initialize

#### Create the Bookmarks Table
Run this SQL in the Supabase SQL Editor:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies to ensure users can only see their own bookmarks
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
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

#### Get Supabase Credentials
1. Go to Project Settings → API
2. Copy your **Project URL** and **anon public** key

### 3. Google OAuth Setup

#### Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Set Application type to **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://your-domain.com/auth/callback` (for production)
8. Copy your **Client ID** and **Client Secret**

#### Configure in Supabase
1. Go to your Supabase project → Authentication → Providers
2. Enable **Google** provider
3. Enter your Google **Client ID** and **Client Secret**
4. Save

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace with your actual Supabase credentials from Step 2.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
smart-bookmark-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── logout/          # Logout API route
│   │   ├── auth/
│   │   │   └── callback/            # OAuth callback handler
│   │   ├── bookmarks/               # Main bookmarks page
│   │   ├── login/                   # Login page
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page (redirects)
│   ├── components/
│   │   └── BookmarkManager.tsx      # Main bookmark component
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts            # Browser Supabase client
│   │       └── server.ts            # Server Supabase client
│   ├── types/
│   │   └── database.types.ts        # TypeScript types
│   └── middleware.ts                # Auth middleware
├── .env.local                       # Environment variables
└── package.json
```

## Features Explained

### Authentication
- Google OAuth is the only sign-in method
- Auth state is managed via Supabase Auth
- Middleware protects the `/bookmarks` route
- Users are automatically redirected based on auth state

### Bookmarks
- Each bookmark has a title and URL
- Bookmarks are private to the user who created them
- Form validation ensures valid URLs and non-empty titles

### Real-time Updates
- Uses Supabase Realtime subscriptions
- Listens for INSERT, UPDATE, and DELETE events
- Updates appear instantly across all tabs/devices

### Security
- Row Level Security (RLS) ensures data privacy
- Users can only access their own bookmarks
- Auth tokens are managed securely via cookies

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

### Update Google OAuth Redirect URI

After deployment, add your production URL to Google OAuth:
- `https://your-domain.vercel.app/auth/callback`

And update it in Supabase Authentication settings as well.

## Testing Real-time Sync

1. Sign in to your account
2. Open the app in two different browser tabs
3. Add a bookmark in one tab
4. Watch it appear instantly in the other tab
5. Delete a bookmark in one tab
6. Watch it disappear from the other tab

## Troubleshooting

### "Invalid login credentials" error
- Verify Google OAuth is properly configured in Supabase
- Check that redirect URIs match exactly

### Bookmarks not appearing
- Verify the bookmarks table was created correctly
- Check RLS policies are enabled
- Ensure user is authenticated

### Real-time not working
- Verify Realtime is enabled for the bookmarks table
- Check browser console for errors
- Ensure Supabase project has Realtime enabled (free tier has limits)

## License

MIT

## Support

For issues and questions, please check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

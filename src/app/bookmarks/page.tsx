import { createClient } from '@/lib/supabase/server'
import BookmarkManager from '@/components/BookmarkManager'
import { redirect } from 'next/navigation'

export default async function BookmarksPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <BookmarkManager user={user} />
            </div>
        </div>
    )
}

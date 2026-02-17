'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Bookmark } from '@/types/database.types'
import { FiPlus, FiTrash2, FiLogOut, FiExternalLink } from 'react-icons/fi'

interface BookmarkManagerProps {
    user: User
}

export default function BookmarkManager({ user }: BookmarkManagerProps) {
    const router = useRouter()
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [fetchingBookmarks, setFetchingBookmarks] = useState(true)

    const supabase = createClient()
    const isDev = process.env.NODE_ENV === 'development'

    // Fetch bookmarks
    useEffect(() => {
        fetchBookmarks()
    }, [])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('bookmarks_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (isDev) console.log('🔔 Realtime event:', payload.eventType, payload)

                    if (payload.eventType === 'INSERT') {
                        setBookmarks((current) => {
                            // Prevent duplicates from optimistic updates
                            const exists = current.some((b) => b.id === (payload.new as Bookmark).id)
                            if (exists) return current
                            return [payload.new as Bookmark, ...current]
                        })
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((current) =>
                            current.filter((bookmark) => bookmark.id !== payload.old.id)
                        )
                    } else if (payload.eventType === 'UPDATE') {
                        setBookmarks((current) =>
                            current.map((bookmark) =>
                                bookmark.id === payload.new.id ? (payload.new as Bookmark) : bookmark
                            )
                        )
                    }
                }
            )
            .subscribe((status) => {
                if (isDev) console.log('📡 Realtime subscription status:', status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user.id])

    async function fetchBookmarks() {
        setFetchingBookmarks(true)
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching bookmarks:', error)
        } else {
            setBookmarks(data || [])
        }
        setFetchingBookmarks(false)
    }

    async function addBookmark(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim() || !url.trim()) return

        setLoading(true)
        const { data, error } = await supabase
            .from('bookmarks')
            .insert({
                title: title.trim(),
                url: url.trim(),
                user_id: user.id,
            })
            .select()
            .single()

        if (error) {
            console.error('Error adding bookmark:', error)
            alert('Failed to add bookmark')
        } else {
            // Optimistic update - add to UI immediately
            setBookmarks((current) => [data as Bookmark, ...current])
            setTitle('')
            setUrl('')
        }
        setLoading(false)
    }

    async function deleteBookmark(id: string) {
        // Optimistic update - remove from UI immediately
        setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id))

        const { error } = await supabase.from('bookmarks').delete().eq('id', id)

        if (error) {
            console.error('Error deleting bookmark:', error)
            alert('Failed to delete bookmark')
            // Rollback on error - refetch bookmarks
            fetchBookmarks()
        }
    }

    async function handleLogout() {
        setLoggingOut(true)
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Logout failed:', error)
            setLoggingOut(false)
        }
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 mb-6 border border-white/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">My Bookmarks</h1>
                        <p className="text-purple-200 text-sm sm:text-base break-all">
                            Signed in as {user.email}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-all border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                        <FiLogOut />
                        {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </div>

            {/* Add Bookmark Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 mb-6 border border-white/20">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Add New Bookmark</h2>
                <form onSubmit={addBookmark} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-purple-200 mb-2 text-sm font-medium">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter bookmark title"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={loading}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="url" className="block text-purple-200 mb-2 text-sm font-medium">
                            URL
                        </label>
                        <input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={loading}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                    >
                        <FiPlus className="text-xl" />
                        {loading ? 'Adding...' : 'Add Bookmark'}
                    </button>
                </form>
            </div>

            {/* Bookmarks List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
                    Your Bookmarks ({bookmarks.length})
                </h2>

                {fetchingBookmarks ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                        <p className="text-purple-200 mt-4">Loading bookmarks...</p>
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-purple-200 text-lg">No bookmarks yet</p>
                        <p className="text-purple-300/70 mt-2">Add your first bookmark above!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bookmarks.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex flex-col xs:flex-row items-start justify-between gap-3 sm:gap-4">
                                    <div className="flex-1 min-w-0 w-full">
                                        <h3 className="text-white font-semibold mb-1 truncate text-sm sm:text-base">
                                            {bookmark.title}
                                        </h3>
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-300 hover:text-purple-200 text-xs sm:text-sm flex items-center gap-1 truncate"
                                        >
                                            <span className="truncate">{bookmark.url}</span>
                                            <FiExternalLink className="flex-shrink-0" />
                                        </a>
                                        <p className="text-purple-400/70 text-xs mt-1 sm:mt-2">
                                            Added {new Date(bookmark.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteBookmark(bookmark.id)}
                                        className="flex-shrink-0 text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all self-start xs:self-auto"
                                        title="Delete bookmark"
                                    >
                                        <FiTrash2 className="text-xl" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

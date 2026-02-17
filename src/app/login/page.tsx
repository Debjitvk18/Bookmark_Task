'use client'

import { createClient } from '@/lib/supabase/client'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
    const supabase = createClient()

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error logging in:', error.message)
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            Smart Bookmark
                        </h1>
                        <p className="text-purple-200">
                            Save and organize your favorite links
                        </p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <FcGoogle className="text-2xl" />
                        <span>Continue with Google</span>
                    </button>

                    <p className="text-center text-purple-200 text-sm mt-6">
                        Sign in to start managing your bookmarks
                    </p>
                </div>
            </div>
        </div>
    )
}

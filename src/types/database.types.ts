export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            bookmarks: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    title: string
                    url: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    title: string
                    url: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    title?: string
                    url?: string
                }
            }
        }
    }
}

export type Bookmark = Database['public']['Tables']['bookmarks']['Row']

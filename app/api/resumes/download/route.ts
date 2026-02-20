import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Signed URL expiration time in seconds (1 hour)
const SIGNED_URL_EXPIRATION_SECONDS = 3600

// GET - Get a signed URL to download the original PDF
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const filePath = searchParams.get('path')

        if (!filePath) {
            return NextResponse.json({ error: 'File path is required' }, { status: 400 })
        }

        // Verify the file belongs to the user (path should start with user.id/)
        if (!filePath.startsWith(`${user.id}/`)) {
            return NextResponse.json({ error: 'Unauthorized access to file' }, { status: 403 })
        }

        // Generate a signed URL for downloading
        const { data, error } = await supabase.storage
            .from('resumes')
            .createSignedUrl(filePath, SIGNED_URL_EXPIRATION_SECONDS)

        if (error) {
            console.error('Error creating signed URL:', error)
            return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
        }

        return NextResponse.json({ url: data.signedUrl })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

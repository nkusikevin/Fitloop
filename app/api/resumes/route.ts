import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all user's resumes
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: resumes, error } = await supabase
            .from('user_resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching resumes:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ resumes })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Upload and save a new resume
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const resumeText = formData.get('resumeText') as string
        const isDefault = formData.get('isDefault') === 'true'

        if (!file || !resumeText) {
            return NextResponse.json({ error: 'File and resume text are required' }, { status: 400 })
        }

        // Upload file to Supabase Storage
        const fileName = `${user.id}/${Date.now()}_${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Error uploading file:', uploadError)
            return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
        }

        // Save resume metadata to database
        const { data: resume, error: dbError } = await supabase
            .from('user_resumes')
            .insert({
                user_id: user.id,
                file_name: file.name,
                file_path: uploadData.path,
                file_size: file.size,
                resume_text: resumeText,
                is_default: isDefault
            })
            .select()
            .single()

        if (dbError) {
            console.error('Error saving resume metadata:', dbError)
            // Clean up uploaded file if DB insert fails
            await supabase.storage.from('resumes').remove([fileName])
            return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
        }

        return NextResponse.json({ resume }, { status: 201 })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete a resume
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const resumeId = searchParams.get('id')

        if (!resumeId) {
            return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
        }

        // Get resume to get file path
        const { data: resume, error: fetchError } = await supabase
            .from('user_resumes')
            .select('file_path')
            .eq('id', resumeId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('resumes')
            .remove([resume.file_path])

        if (storageError) {
            console.error('Error deleting file from storage:', storageError)
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('user_resumes')
            .delete()
            .eq('id', resumeId)
            .eq('user_id', user.id)

        if (deleteError) {
            return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update resume (set as default)
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { resumeId, isDefault } = body

        if (!resumeId) {
            return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
        }

        const { data: resume, error: updateError } = await supabase
            .from('user_resumes')
            .update({ is_default: isDefault })
            .eq('id', resumeId)
            .eq('user_id', user.id)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 })
        }

        return NextResponse.json({ resume })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

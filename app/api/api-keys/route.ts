import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('user_api_keys')
            .select('id, provider, model_name, is_active, created_at, updated_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
        }

        return NextResponse.json({ apiKeys: data })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { provider, apiKey, modelName } = await request.json()

        if (!provider || !apiKey || !modelName) {
            return NextResponse.json(
                { error: 'Missing required fields: provider, apiKey, modelName' },
                { status: 400 }
            )
        }

        // Validate provider
        const validProviders = ['openai', 'anthropic', 'google']
        if (!validProviders.includes(provider)) {
            return NextResponse.json(
                { error: 'Invalid provider. Must be one of: openai, anthropic, google' },
                { status: 400 }
            )
        }

        // Deactivate any existing keys for this provider
        await supabase
            .from('user_api_keys')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('provider', provider)

        // Insert new API key
        const { data, error } = await supabase
            .from('user_api_keys')
            .upsert(
                {
                    user_id: user.id,
                    provider,
                    api_key: apiKey,
                    model_name: modelName,
                    is_active: true,
                },
                {
                    onConflict: 'user_id,provider',
                }
            )
            .select('id, provider, model_name, is_active, created_at')
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 })
        }

        return NextResponse.json({ apiKey: data })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing API key ID' }, { status: 400 })
        }

        const { error } = await supabase
            .from('user_api_keys')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

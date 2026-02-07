'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert'
import { Trash2, Plus, Key, AlertCircle, CheckCircle2, ArrowLeft, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface ApiKey {
    id: string
    provider: 'openai' | 'anthropic' | 'google'
    model_name: string
    is_active: boolean
    created_at: string
    api_key?: string
}

const providerModels = {
    openai: [
        { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    anthropic: [
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recommended)' },
        { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    ],
    google: [
        { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Recommended)' },
        { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' },
        { value: 'gemini-pro', label: 'Gemini Pro' },
    ],
}

export default function SettingsPage() {
    const router = useRouter()
    const supabase = createClient()
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [newKey, setNewKey] = useState({
        provider: 'openai' as 'openai' | 'anthropic' | 'google',
        apiKey: '',
        modelName: 'gpt-4o',
    })

    useEffect(() => {
        fetchApiKeys()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const fetchApiKeys = () => {
        try {
            const stored = localStorage.getItem('apiKeys')
            console.log('📦 Fetching API keys from localStorage:', stored)
            if (stored) {
                const parsed = JSON.parse(stored)
                console.log('✅ Parsed API keys:', parsed)
                setApiKeys(parsed)
            } else {
                console.log('⚠️ No API keys found in localStorage')
            }
        } catch (error) {
            console.error('❌ Error fetching API keys:', error)
            toast.error('Failed to load API keys')
        } finally {
            setLoading(false)
        }
    }

    const handleAddApiKey = () => {
        if (!newKey.apiKey.trim()) {
            toast.error('Please enter an API key')
            return
        }

        console.log('💾 Saving new API key for provider:', newKey.provider)
        console.log('🔑 API key input value:', newKey.apiKey)

        setSaving(true)
        try {
            const newApiKey: ApiKey = {
                id: Date.now().toString(),
                provider: newKey.provider,
                model_name: newKey.modelName,
                is_active: true,
                created_at: new Date().toISOString(),
            }

            // Store the actual API key separately with the id as reference
            const apiKeyData = {
                ...newApiKey,
                api_key: newKey.apiKey.trim(), // Trim whitespace
            }

            console.log('🔑 API key data (FULL):', apiKeyData)

            // Deactivate other keys for this provider
            const updatedKeys = apiKeys.map(key =>
                key.provider === newKey.provider ? { ...key, is_active: false } : key
            )

            // Add the new key
            const allKeys = [...updatedKeys.filter(k => k.provider !== newKey.provider || !k.is_active), apiKeyData]

            console.log('📝 All keys to save:', allKeys)
            localStorage.setItem('apiKeys', JSON.stringify(allKeys))

            // Verify it was saved
            const verification = localStorage.getItem('apiKeys')
            console.log('✅ Verification - saved to localStorage:', verification)

            toast.success('API key saved successfully')
            setNewKey({
                provider: 'openai',
                apiKey: '',
                modelName: 'gpt-4o',
            })
            fetchApiKeys()
        } catch (error) {
            console.error('Error saving API key:', error)
            toast.error('Failed to save API key')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteApiKey = (id: string) => {
        try {
            const updatedKeys = apiKeys.filter(key => key.id !== id)
            localStorage.setItem('apiKeys', JSON.stringify(updatedKeys))
            toast.success('API key deleted')
            fetchApiKeys()
        } catch (error) {
            console.error('Error deleting API key:', error)
            toast.error('Failed to delete API key')
        }
    }

    const handleClearAllKeys = () => {
        try {
            localStorage.removeItem('apiKeys')
            console.log('🗑️ Cleared all API keys from localStorage')
            toast.success('All API keys cleared')
            fetchApiKeys()
        } catch (error) {
            console.error('Error clearing API keys:', error)
            toast.error('Failed to clear API keys')
        }
    }

    const getProviderName = (provider: string) => {
        const names: Record<string, string> = {
            openai: 'OpenAI',
            anthropic: 'Anthropic',
            google: 'Google',
        }
        return names[provider] || provider
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/50">
                <div className="px-6 md:px-12 py-4 flex items-center justify-between">
                    <Link href="/protected" className="flex items-center gap-3">
                        <span className="font-display text-2xl tracking-wider">FITLOOP</span>
                        <span className="label-mono text-muted-foreground hidden md:inline">SETTINGS</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/protected">
                            <Button
                                variant="outline"
                                className="gap-2 bg-transparent border-border/50 hover:border-accent hover:text-accent font-mono uppercase text-[10px] tracking-widest"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className="gap-2 bg-transparent border-border/50 hover:border-accent hover:text-accent font-mono uppercase text-[10px] tracking-widest"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container max-w-4xl mx-auto py-10 px-6">
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your AI provider API keys and preferences
                        </p>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Privacy & Security</AlertTitle>
                        <AlertDescription>
                            Your API keys are stored securely and are only used to make requests on your behalf.
                            We never share your keys with third parties.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Add New API Key
                            </CardTitle>
                            <CardDescription>
                                Configure an AI provider to analyze resumes. You can use OpenAI, Anthropic, or Google.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="provider">Provider</Label>
                                    <Select
                                        value={newKey.provider}
                                        onValueChange={(value: 'openai' | 'anthropic' | 'google') => {
                                            setNewKey({
                                                ...newKey,
                                                provider: value,
                                                modelName: providerModels[value][0].value,
                                            })
                                        }}
                                    >
                                        <SelectTrigger id="provider">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="openai">OpenAI</SelectItem>
                                            <SelectItem value="anthropic">Anthropic</SelectItem>
                                            <SelectItem value="google">Google</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="model">Model</Label>
                                    <Select
                                        value={newKey.modelName}
                                        onValueChange={(value) => setNewKey({ ...newKey, modelName: value })}
                                    >
                                        <SelectTrigger id="model">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providerModels[newKey.provider].map((model) => (
                                                <SelectItem key={model.value} value={model.value}>
                                                    {model.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="apiKey">API Key</Label>
                                    <Input
                                        id="apiKey"
                                        type="password"
                                        placeholder={`Enter your ${getProviderName(newKey.provider)} API key`}
                                        value={newKey.apiKey}
                                        onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Get your API key from{' '}
                                        {newKey.provider === 'openai' && (
                                            <a
                                                href="https://platform.openai.com/api-keys"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                                OpenAI Dashboard
                                            </a>
                                        )}
                                        {newKey.provider === 'anthropic' && (
                                            <a
                                                href="https://console.anthropic.com/settings/keys"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                                Anthropic Console
                                            </a>
                                        )}
                                        {newKey.provider === 'google' && (
                                            <a
                                                href="https://aistudio.google.com/app/apikey"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline"
                                            >
                                                Google AI Studio
                                            </a>
                                        )}
                                    </p>
                                </div>

                                <Button onClick={handleAddApiKey} disabled={saving} className="w-full">
                                    {saving ? 'Saving...' : 'Save API Key'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Your API Keys
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearAllKeys}
                                    className="text-xs"
                                >
                                    Clear All
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                Manage your configured AI provider keys
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <p className="text-muted-foreground text-center py-8">Loading...</p>
                            ) : apiKeys.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No API keys configured yet. Add one above to get started.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {apiKeys.map((key) => (
                                        <div
                                            key={key.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                {key.is_active && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{getProviderName(key.provider)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Model: {key.model_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Added {new Date(key.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteApiKey(key.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

'use client'

import React from "react"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/protected`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-block mb-12 group">
          <div className="font-display text-2xl tracking-wider group-hover:text-accent transition">
            FITLOOP
          </div>
          <div className="label-mono text-muted-foreground mt-1">v.01 / Experimental Build</div>
        </Link>

        <div className="border border-border/50 bg-card p-8">
          <div className="space-y-6">
            <div>
              <span className="label-mono text-accent">REGISTRATION</span>
              <h1 className="font-display text-4xl tracking-wider mt-2">GET STARTED</h1>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                Create an account to begin optimizing your resume signal
              </p>
            </div>

            <div className="h-px bg-border/50" />

            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="label-mono text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border/50 font-mono text-sm focus:border-accent"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="label-mono text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary border-border/50 font-mono text-sm focus:border-accent"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="label-mono text-muted-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-secondary border-border/50 font-mono text-sm focus:border-accent"
                  />
                </div>
                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 p-3 font-mono text-xs text-destructive">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs tracking-widest h-11 gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-6 text-center font-mono text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-accent hover:text-accent/90">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center label-mono text-muted-foreground mt-8">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-block mb-8 group">
          <div className="font-display text-2xl tracking-wider group-hover:text-accent transition">
            FITLOOP
          </div>
          <div className="label-mono text-muted-foreground mt-1">v.01 / Experimental Build</div>
        </Link>

        <div className="border border-border/50 bg-card p-8">
          <div className="space-y-6 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="border border-accent/50 bg-accent/10 p-4">
                <CheckCircle className="w-12 h-12 text-accent" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h1 className="font-display text-4xl tracking-wider">ACCOUNT CREATED</h1>
              <p className="font-mono text-xs text-muted-foreground">
                Your account has been successfully initialized.
              </p>
            </div>

            {/* Email Verification Message */}
            <div className="bg-accent/5 border border-accent/30 p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-accent">
                <Mail className="w-5 h-5" />
                <span className="label-mono">VERIFY YOUR EMAIL</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                We&apos;ve sent a confirmation link to your email. Click it to verify your account and get started.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-secondary p-4 space-y-3">
              <p className="label-mono text-foreground">NEXT STEPS</p>
              <ul className="font-mono text-xs text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <span className="text-accent">01.</span>
                  <span>Check your email inbox</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">02.</span>
                  <span>Click the verification link</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">03.</span>
                  <span>Sign in and start analyzing</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/auth/login">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs tracking-widest h-11 gap-2">
                  BACK TO SIGN IN <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent border-border/50 hover:border-accent font-mono uppercase text-xs tracking-widest h-11 mt-2">
                  RETURN HOME
                </Button>
              </Link>
            </div>

            {/* Help */}
            <p className="label-mono text-muted-foreground">
              Didn&apos;t receive the email?{' '}
              <button className="text-accent hover:text-accent/80">Resend</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

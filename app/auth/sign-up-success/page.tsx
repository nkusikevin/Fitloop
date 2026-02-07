'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-block mb-8 group">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-300 transition">
            ResumeMatch
          </div>
        </Link>

        <Card className="bg-slate-800/50 border-slate-700 p-8">
          <div className="space-y-6 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 border border-green-500/50 p-4">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Account Created!</h1>
              <p className="text-slate-400">
                Your account has been successfully created.
              </p>
            </div>

            {/* Email Verification Message */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <Mail className="w-5 h-5" />
                <span className="font-semibold">Verify Your Email</span>
              </div>
              <p className="text-sm text-slate-400">
                We&apos;ve sent a confirmation link to your email. Click it to verify your account and get started.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-300">What&apos;s Next?</p>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex gap-2">
                  <span className="text-blue-400">1.</span>
                  <span>Check your email inbox</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">2.</span>
                  <span>Click the verification link</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">3.</span>
                  <span>Sign in and start analyzing</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/auth/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                  Back to Sign In <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Return Home
                </Button>
              </Link>
            </div>

            {/* Help */}
            <p className="text-xs text-slate-500">
              Didn&apos;t receive the email?{' '}
              <button className="text-blue-400 hover:text-blue-300">Resend</button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

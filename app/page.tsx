'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">ResumeMatch</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight text-balance">
              AI-Powered Resume Matching
            </h1>
            <p className="text-xl text-muted-foreground text-balance leading-relaxed">
              Discover how your resume stacks up. Get instant insights on skills alignment, experience gaps, and personalized recommendations to land your dream job.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  Start Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
            <div className="pt-4 space-y-3">
              {['Instant AI Analysis', 'PDF Resume Upload', 'Job Fit Scoring'].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Highlight */}
          <div className="space-y-6">
            <div className="bg-secondary rounded-2xl p-8 border border-border">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-accent uppercase tracking-widest">Performance</div>
                <div className="text-4xl font-bold">94%</div>
                <p className="text-muted-foreground">Average match score improvement after using ResumeMatch</p>
              </div>
            </div>

            <div className="bg-secondary rounded-2xl p-8 border border-border">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-accent uppercase tracking-widest">Trusted By</div>
                <p className="text-lg font-semibold">10,000+ Job Seekers</p>
                <p className="text-muted-foreground">Across finance, tech, and professional services</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-border">
        <div className="space-y-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl">Three simple steps to optimize your resume and land more interviews.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Select and upload your resume PDF. Our system instantly extracts and analyzes your content.' },
              { step: '02', title: 'Paste Job Post', desc: 'Share the job description you\'re targeting. We extract key requirements and qualifications.' },
              { step: '03', title: 'Get Insights', desc: 'Receive detailed analysis with compatibility scores, missing skills, and personalized recommendations.' },
            ].map((item) => (
              <div key={item.step} className="group">
                <div className="text-6xl font-bold text-secondary mb-6">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-border">
        <div className="space-y-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">Why ResumeMatch?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl">Everything you need to stand out to recruiters</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: 'AI-Powered Analysis', desc: 'Advanced machine learning analyzes your resume against job requirements with precision.' },
              { title: 'Instant Feedback', desc: 'Get results in seconds. No waiting, no guesswork. Pure actionable intelligence.' },
              { title: 'Skill Gap Detection', desc: 'Identify missing skills and experience. Know exactly what you need to address.' },
              { title: 'Privacy First', desc: 'Your resume data is encrypted and never shared. Enterprise-grade security standard.' },
            ].map((benefit, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-2xl font-bold">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24 border-t border-border">
        <div className="rounded-2xl bg-secondary border border-border p-12 md:p-16 text-center space-y-6">
          <h2 className="text-5xl font-bold tracking-tight">Ready to Optimize?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of job seekers who've improved their resume match. Start free today.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex items-center justify-between">
          <p className="text-muted-foreground">Copyright 2024 ResumeMatch. All rights reserved.</p>
          <div className="flex gap-8 text-muted-foreground text-sm">
            <Link href="#" className="hover:text-foreground transition">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ScrambleText } from '@/components/scramble-text'

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border/50 fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className=" px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-display text-2xl tracking-wider">FITLOOP</span>
            <span className="label-mono text-muted-foreground hidden md:inline">v.01</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="label-mono text-muted-foreground hover:text-accent text-[10px]">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground label-mono text-[10px] px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative pt-16">
        {/* Vertical label */}
        <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 hidden md:block">
          <div className="label-mono text-accent -rotate-90 origin-center whitespace-nowrap">
            SIGNAL
          </div>
        </div>

        <div className="px-6 md:px-28 py-32 space-y-12">
          <div className="label-mono text-muted-foreground">
            01 / RESUME INTELLIGENCE
          </div>

          <h1 className="font-display text-[clamp(4rem,12vw,10rem)] leading-[0.85] tracking-wider text-foreground">
            FIT<span className="text-accent">LOOP</span>
          </h1>

          <div className="max-w-xl space-y-6">
            <p className="text-sm font-mono text-muted-foreground leading-relaxed tracking-wide">
              Studies in Controlled Environments — We analyze systems that match,
              not screens that display. AI-powered resume intelligence for
              precision career alignment.
            </p>

            <div className="flex gap-4 flex-wrap pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-3 font-mono uppercase text-xs tracking-widest px-8 h-12">
                  <ScrambleText text="BEGIN ANALYSIS" scrambleOnMount />
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-border hover:border-accent hover:text-accent font-mono uppercase text-xs tracking-widest px-8 h-12">
                  <ScrambleText text="LEARN MORE" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border/50 max-w-xl">
            {[
              { value: '94%', label: 'ACCURACY' },
              { value: '10K+', label: 'ANALYZED' },
              { value: '<3s', label: 'RESPONSE' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl md:text-4xl text-foreground">{stat.value}</div>
                <div className="label-mono text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 border-t border-border/50">
        <div className=" px-6 md:px-28">
          <div className="space-y-16">
            <div className="flex items-baseline gap-4">
              <span className="label-mono text-accent">02 / PROCESS</span>
              <h2 className="font-display text-5xl md:text-7xl tracking-wider">HOW IT WORKS</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                { step: '01', title: 'UPLOAD RESUME', desc: 'Select and upload your resume PDF. Our system instantly extracts and analyzes your content with precision.' },
                { step: '02', title: 'PASTE JOB POST', desc: 'Share the job description you\'re targeting. We extract key requirements, qualifications, and signals.' },
                { step: '03', title: 'GET INSIGHTS', desc: 'Receive detailed analysis with compatibility scores, missing skills, and controlled recommendations.' },
              ].map((item) => (
                <div key={item.step} className="group border border-border/50 p-8 hover:border-accent/50 transition-colors">
                  <div className="font-display text-6xl text-accent/20 group-hover:text-accent/50 transition-colors mb-6">{item.step}</div>
                  <h3 className="font-display text-2xl tracking-wider mb-4">{item.title}</h3>
                  <p className="font-mono text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  <div className="h-px bg-border/50 group-hover:bg-accent/50 mt-6 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Principles */}
      <section className="py-32 border-t border-border/50">
        <div className=" px-6 md:px-28">
          <div className="space-y-16">
            <div className="flex items-baseline gap-4">
              <span className="label-mono text-accent">03 / PRINCIPLES</span>
              <h2 className="font-display text-5xl md:text-7xl tracking-wider">WHY US</h2>
            </div>

            <div className="space-y-0">
              {[
                { title: 'AI-POWERED ANALYSIS', desc: 'Advanced machine learning analyzes your resume against job requirements with clinical precision. Every signal matters.' },
                { title: 'INSTANT FEEDBACK', desc: 'Get results in seconds. No waiting, no guesswork. Pure actionable intelligence delivered in controlled environments.' },
                { title: 'SKILL GAP DETECTION', desc: 'Identify missing skills and experience with clarity. Know exactly what signals you need to strengthen.' },
                { title: 'PRIVACY FIRST', desc: 'Your resume data is encrypted and never shared. Enterprise-grade security as standard protocol.' },
              ].map((benefit, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-start gap-8 py-12 border-b border-border/50 group hover:border-accent/30 transition-colors">
                  <div className="md:w-1/2">
                    <h3 className="font-display text-3xl md:text-5xl tracking-wider group-hover:text-accent transition-colors">
                      {benefit.title}
                    </h3>
                  </div>
                  <div className="md:w-1/2">
                    <p className="font-mono text-xs text-muted-foreground leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-border/50">
        <div className=" px-6 md:px-28">
          <div className="border border-border/50 p-12 md:p-20 text-center space-y-8">
            <span className="label-mono text-accent">04 / INITIALIZE</span>
            <h2 className="font-display text-5xl md:text-7xl tracking-wider">READY TO<br /><span className="text-accent">OPTIMIZE?</span></h2>
            <p className="font-mono text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Join thousands of candidates who&apos;ve improved their resume signal.
              Begin your controlled analysis today.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs tracking-widest px-10 h-12 mt-4">
                <ScrambleText text="INITIALIZE" />
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="px-6 md:px-28">
          {/* Top row */}
          <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Brand */}
            <div className="md:col-span-4 space-y-4">
              <span className="font-display text-3xl tracking-wider">FITLOOP</span>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-xs">
                AI-powered resume intelligence platform. Helping professionals land the right role through precision analysis.
              </p>
            </div>

            {/* Links */}
            <div className="md:col-span-2">
              <div className="label-mono text-foreground mb-4">PRODUCT</div>
              <ul className="space-y-3">
                <li><Link href="/auth/signup" className="font-mono text-xs text-muted-foreground hover:text-accent transition">Get Started</Link></li>
                <li><Link href="#how-it-works" className="font-mono text-xs text-muted-foreground hover:text-accent transition">How It Works</Link></li>
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">Pricing</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="label-mono text-foreground mb-4">COMPANY</div>
              <ul className="space-y-3">
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">About</Link></li>
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">Careers</Link></li>
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">Contact</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="label-mono text-foreground mb-4">LEGAL</div>
              <ul className="space-y-3">
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">Privacy Policy</Link></li>
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">Terms of Service</Link></li>
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">Cookie Policy</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="label-mono text-foreground mb-4">CONNECT</div>
              <ul className="space-y-3">
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">LinkedIn</Link></li>
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">Twitter / X</Link></li>
                <li><Link href="#" className="font-mono text-xs text-muted-foreground hover:text-accent transition">GitHub</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/50 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="label-mono text-muted-foreground">
              &copy; {new Date().getFullYear()} FITLOOP INC. ALL RIGHTS RESERVED.
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Built by Kevin
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

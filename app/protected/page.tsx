'use client'

import React from "react"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LogOut, Loader2, Upload, File, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Resume from '@/components/resume/resume-analysis'
import { extractTextFromPDF } from '@/lib/pdf-utils'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resume, setResume] = useState('')
  const [resumeFileName, setResumeFileName] = useState<string>('')
  const [jobPosting, setJobPosting] = useState('')
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')
  const [isExtractingPDF, setIsExtractingPDF] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file')
      return
    }

    setError('')
    setIsExtractingPDF(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const text = await extractTextFromPDF(arrayBuffer)
      setResume(text)
      setResumeFileName(file.name)
    } catch (err) {
      setError('Failed to extract text from PDF. Please try again.')
      console.error(err)
    } finally {
      setIsExtractingPDF(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobPosting.trim()) {
      setError('Please fill in both resume and job posting')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobPosting }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Analysis failed')
        return
      }

      setResults(data)
    } catch (err) {
      setError('An error occurred during analysis')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-display text-2xl tracking-wider">RESUMEMATCH</span>
            <span className="label-mono text-muted-foreground hidden md:inline">DASHBOARD</span>
          </Link>
          <div className="flex items-center gap-3">
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

      <main className="px-6 md:px-12 py-12">
        {!results ? (
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <span className="label-mono text-accent">ANALYSIS MODULE</span>
                <h2 className="font-display text-4xl md:text-5xl tracking-wider mt-2">RESUME ANALYSIS</h2>
                <p className="font-mono text-xs text-muted-foreground mt-3 max-w-lg">
                  Upload your resume PDF and paste the job posting to receive
                  AI-powered compatibility insights and signal mapping.
                </p>
              </div>

              <div className="border border-border/50 bg-card p-8 space-y-8">
                {/* Resume Upload */}
                <div>
                  <label className="label-mono text-muted-foreground mb-4 block">YOUR RESUME (PDF)</label>
                  <div className="space-y-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isExtractingPDF || isLoading}
                      className="w-full border border-dashed border-border/50 p-8 hover:border-accent/50 hover:bg-accent/5 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                    >
                      {resumeFileName ? (
                        <>
                          <File className="w-6 h-6 text-accent flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-mono text-sm text-accent">{resumeFileName}</p>
                            <p className="label-mono text-muted-foreground mt-1">Click to change</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <div className="text-left">
                            <p className="font-mono text-sm">Upload your resume PDF</p>
                            <p className="label-mono text-muted-foreground mt-1">Click to browse</p>
                          </div>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handlePDFUpload}
                      className="hidden"
                    />
                    {isExtractingPDF && (
                      <div className="flex items-center justify-center gap-2 text-accent font-mono text-xs">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        EXTRACTING TEXT FROM PDF...
                      </div>
                    )}
                    {resume && !isExtractingPDF && (
                      <p className="font-mono text-xs text-accent flex items-center gap-2">
                        SIGNAL RECEIVED — Resume extracted ({resume.length} characters)
                      </p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border/30" />

                {/* Job Posting */}
                <div>
                  <label className="label-mono text-muted-foreground mb-4 block">JOB POSTING</label>
                  <Textarea
                    placeholder="Paste the job posting here..."
                    value={jobPosting}
                    onChange={(e) => setJobPosting(e.target.value)}
                    className="bg-secondary border-border/50 h-56 font-mono text-sm focus:border-accent"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 p-4 font-mono text-xs text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs tracking-widest gap-2 h-12"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'PROCESSING SIGNALS...' : 'ANALYZE RESUME'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <div className="border border-border/50 bg-card p-6 space-y-5">
                <div>
                  <span className="label-mono text-accent">ANALYSIS SCOPE</span>
                  <h3 className="font-display text-xl tracking-wider mt-2">WHAT WE ANALYZE</h3>
                </div>
                <div className="h-px bg-border/30" />
                <ul className="space-y-3">
                  {[
                    'Skill matching and relevance',
                    'Experience alignment',
                    'Missing keywords and skills',
                    'Compatibility score',
                    'Actionable recommendations',
                  ].map((item) => (
                    <li key={item} className="flex gap-3 items-start">
                      <span className="text-accent font-mono text-xs mt-0.5">--</span>
                      <span className="font-mono text-xs text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-border/50 bg-secondary p-6 space-y-4">
                <div>
                  <span className="label-mono text-accent">PROTOCOL</span>
                  <h3 className="font-display text-xl tracking-wider mt-2">BEST PRACTICES</h3>
                </div>
                <div className="h-px bg-border/30" />
                <ul className="font-mono text-xs text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span className="text-accent">01.</span>
                    Use the complete job description
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">02.</span>
                    Include all relevant experience
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">03.</span>
                    Be specific about skills
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <Resume data={results} onNewAnalysis={() => setResults(null)} />
        )}
      </main>
    </div>
  )
}

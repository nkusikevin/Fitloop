'use client'

import React from "react"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { LogOut, Loader2, Upload, File } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Resume from '@/components/resume/resume-analysis'
import { extractTextFromPDF } from '@/lib/pdf-utils'
import { ThemeToggle } from '@/components/theme-toggle'

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
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            ResumeMatch
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleSignOut} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {!results ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-4">Resume Analysis</h2>
                <p className="text-muted-foreground text-lg">
                  Upload your resume PDF and paste the job posting to get AI-powered insights on compatibility
                </p>
              </div>

              <Card className="border-border p-8 space-y-8">
                <div>
                  <label className="block text-sm font-semibold mb-4">Your Resume (PDF)</label>
                  <div className="space-y-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isExtractingPDF || isLoading}
                      className="w-full border-2 border-dashed border-border rounded-xl p-8 hover:border-accent/50 hover:bg-secondary/50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                    >
                      {resumeFileName ? (
                        <>
                          <File className="w-6 h-6 text-accent flex-shrink-0" />
                          <div className="text-left">
                            <p className="font-semibold text-accent">{resumeFileName}</p>
                            <p className="text-sm text-muted-foreground">Click to change</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <div className="text-left">
                            <p className="font-semibold">Upload your resume PDF</p>
                            <p className="text-sm text-muted-foreground">Click to browse</p>
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
                      <div className="flex items-center justify-center gap-2 text-accent text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting text from PDF...
                      </div>
                    )}
                    {resume && !isExtractingPDF && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                        ✓ Resume extracted ({resume.length} characters)
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-4">Job Posting</label>
                  <Textarea
                    placeholder="Paste the job posting here..."
                    value={jobPosting}
                    onChange={(e) => setJobPosting(e.target.value)}
                    className="bg-secondary border-border h-56 focus-visible:ring-accent"
                  />
                </div>

                {error && <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">{error}</div>}

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2 h-11"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                </Button>
              </Card>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <Card className="border-border p-6 space-y-4">
                <h3 className="font-bold text-lg tracking-tight">What We Analyze</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">✓</span>
                    <span className="text-muted-foreground">Skill matching and relevance</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">✓</span>
                    <span className="text-muted-foreground">Experience alignment</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">✓</span>
                    <span className="text-muted-foreground">Missing keywords and skills</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">✓</span>
                    <span className="text-muted-foreground">Compatibility score</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent font-bold">✓</span>
                    <span className="text-muted-foreground">Actionable recommendations</span>
                  </li>
                </ul>
              </Card>

              <Card className="border-border bg-secondary p-6 space-y-3">
                <h3 className="font-bold tracking-tight">Tips for Best Results</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Use the complete job description</li>
                  <li>• Include all relevant experience</li>
                  <li>• Be specific about skills</li>
                </ul>
              </Card>
            </div>
          </div>
        ) : (
          <Resume data={results} onNewAnalysis={() => setResults(null)} />
        )}
      </main>
    </div>
  )
}

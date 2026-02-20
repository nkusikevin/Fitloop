'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Plus,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  Loader2,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ClipboardList,
} from 'lucide-react'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

interface AnalysisData {
  overallScore: number
  matchPercentage: number
  matchedSkills: string[]
  missingSkills: string[]
  matchedExperience: string[]
  gapAreas: string[]
  strengths: string[]
  recommendations: string[]
  summary: string
}

interface ImprovedExperience {
  title: string
  company: string
  duration: string
  achievements: string[]
}

interface Improvement {
  section: string
  original: string
  improved: string
  reason: string
}

interface ImprovedResumeData {
  summary: string
  skills: string[]
  experience: ImprovedExperience[]
  improvements: Improvement[]
  keywordMatches: string[]
  additionalSuggestions: string[]
}

interface ResumeProps {
  data: AnalysisData
  onNewAnalysis: () => void
  resumeText?: string
  jobPosting?: string
}

export default function Resume({ data, onNewAnalysis, resumeText, jobPosting }: ResumeProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [improvedResume, setImprovedResume] = useState<ImprovedResumeData | null>(null)
  const [error, setError] = useState('')
  const [showImprovements, setShowImprovements] = useState(true)

  const generateImprovedResume = async () => {
    if (!resumeText || !jobPosting) {
      setError('Resume and job posting are required to generate improvements')
      return
    }

    // Get API key from localStorage
    const stored = localStorage.getItem('apiKeys')
    let apiKeyConfig = null

    if (stored) {
      try {
        const keys = JSON.parse(stored)
        apiKeyConfig = keys.find((key: { is_active: boolean }) => key.is_active)
      } catch {
        setError('Invalid API key configuration. Please check your Settings.')
        return
      }
    }

    if (!apiKeyConfig) {
      setError('No API key configured. Please add one in Settings.')
      return
    }

    setError('')
    setIsGenerating(true)

    try {
      const response = await fetch('/api/improve-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeText,
          jobPosting,
          apiKey: apiKeyConfig.api_key,
          provider: apiKeyConfig.provider,
          modelName: apiKeyConfig.model_name,
          analysisData: data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to generate improved resume')
        return
      }

      setImprovedResume(result)
    } catch (err) {
      setError('An error occurred while generating improvements')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // State to track which items have been copied
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({})

  // Copy text to clipboard with visual feedback
  const copyToClipboard = async (text: string, itemKey: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => ({ ...prev, [itemKey]: true }))
      toast.success('Copied to clipboard!')
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [itemKey]: false }))
      }, 2000)
    } catch {
      toast.error('Failed to copy to clipboard. Please ensure clipboard permissions are enabled or try selecting the text manually.')
    }
  }

  // Format experience as copyable text
  const formatExperienceForCopy = (exp: ImprovedExperience) => {
    const achievements = exp.achievements.map(a => `• ${a}`).join('\n')
    return `${exp.title}\n${exp.company} | ${exp.duration}\n\n${achievements}`
  }

  // Copy all improved content at once
  const copyAllImprovements = async () => {
    if (!improvedResume) return

    const sections = []
    
    sections.push('=== PROFESSIONAL SUMMARY ===')
    sections.push(improvedResume.summary)
    sections.push('')
    
    sections.push('=== SKILLS ===')
    sections.push(improvedResume.skills.join(', '))
    sections.push('')
    
    sections.push('=== EXPERIENCE ===')
    improvedResume.experience.forEach(exp => {
      sections.push(formatExperienceForCopy(exp))
      sections.push('')
    })

    const fullText = sections.join('\n')
    await copyToClipboard(fullText, 'all')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'EXCELLENT'
    if (score >= 60) return 'GOOD'
    return 'NEEDS IMPROVEMENT'
  }

  const getScoreBorder = (score: number) => {
    if (score >= 80) return 'border-accent/50'
    if (score >= 60) return 'border-yellow-500/50'
    return 'border-red-500/50'
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    const addText = (text: string, fontSize = 12, bold = false) => {
      doc.setFontSize(fontSize)
      if (bold) doc.setFont('Helvetica', 'bold')
      else doc.setFont('Helvetica', 'normal')

      const lines = doc.splitTextToSize(text, 180)
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 10) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, 15, yPosition)
        yPosition += 8
      })
    }

    const addSection = (title: string, items: string[]) => {
      yPosition += 5
      addText(title, 14, true)
      items.forEach((item) => {
        addText(`• ${item}`, 11)
      })
    }

    doc.setFillColor(13, 13, 13)
    doc.rect(0, 0, 210, 30, 'F')
    doc.setTextColor(255, 165, 0)
    addText('FITLOOP — Analysis Report', 18, true)
    yPosition = 40

    doc.setTextColor(0, 0, 0)

    addText(`Overall Compatibility: ${data.overallScore}%`, 16, true)
    addText(`Status: ${getScoreLabel(data.overallScore)}`, 12)
    yPosition += 10

    addSection('Analysis Summary', [data.summary])

    if (data.matchedSkills.length > 0) {
      addSection('Matched Skills', data.matchedSkills)
    }

    if (data.missingSkills.length > 0) {
      addSection('Missing Skills', data.missingSkills)
    }

    if (data.strengths.length > 0) {
      addSection('Your Strengths', data.strengths)
    }

    if (data.recommendations.length > 0) {
      addSection('Recommendations', data.recommendations)
    }

    doc.save('resume-analysis.pdf')
  }

  return (
    <div className="space-y-8">
      {/* Score Card */}
      <div className={`border ${getScoreBorder(data.overallScore)} bg-card p-8`}>
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex-1 space-y-4">
            <span className="label-mono text-accent">ANALYSIS COMPLETE</span>
            <h2 className="font-display text-4xl tracking-wider mt-2">RESULTS</h2>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-xl">{data.summary}</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={downloadPDF}
                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-[10px] tracking-widest"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD PDF
              </Button>
              <Button
                onClick={generateImprovedResume}
                disabled={isGenerating || !resumeText || !jobPosting}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white font-mono uppercase text-[10px] tracking-widest"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    GENERATING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    GENERATE IMPROVED RESUME
                  </>
                )}
              </Button>
              <Button
                onClick={onNewAnalysis}
                variant="outline"
                className="gap-2 bg-transparent border-border/50 hover:border-accent hover:text-accent font-mono uppercase text-[10px] tracking-widest"
              >
                <Plus className="w-4 h-4" />
                NEW ANALYSIS
              </Button>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex flex-col items-center gap-3">
            <div className={`relative w-32 h-32 border-2 ${getScoreBorder(data.overallScore)} flex items-center justify-center`}>
              <div className="text-center">
                <div className={`font-display text-5xl ${getScoreColor(data.overallScore)}`}>
                  {data.overallScore}
                </div>
                <div className="label-mono text-muted-foreground">% MATCH</div>
              </div>
            </div>
            <p className={`label-mono ${getScoreColor(data.overallScore)}`}>
              {getScoreLabel(data.overallScore)}
            </p>
          </div>
        </div>
      </div>

      {/* Matched Skills */}
      {data.matchedSkills.length > 0 && (
        <div className="border border-accent/20 bg-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-accent" />
            <div>
              <span className="label-mono text-accent">SIGNALS DETECTED</span>
              <h3 className="font-display text-xl tracking-wider mt-1">MATCHED SKILLS</h3>
            </div>
          </div>
          <div className="h-px bg-border/30" />
          <div className="grid md:grid-cols-2 gap-3">
            {data.matchedSkills.map((skill, i) => (
              <div key={i} className="bg-accent/5 border border-accent/20 px-4 py-2.5 font-mono text-xs text-accent">
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {data.missingSkills.length > 0 && (
        <div className="border border-yellow-500/20 bg-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
              <span className="label-mono text-yellow-500">GAPS IDENTIFIED</span>
              <h3 className="font-display text-xl tracking-wider mt-1">MISSING SKILLS</h3>
            </div>
          </div>
          <p className="font-mono text-xs text-muted-foreground">These skills are critical for the role and absent from your resume:</p>
          <div className="h-px bg-border/30" />
          <div className="grid md:grid-cols-2 gap-3">
            {data.missingSkills.map((skill, i) => (
              <div key={i} className="bg-yellow-500/5 border border-yellow-500/20 px-4 py-2.5 font-mono text-xs text-yellow-500">
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {data.strengths.length > 0 && (
        <div className="border border-border/50 bg-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-accent" />
            <div>
              <span className="label-mono text-accent">SIGNAL STRENGTH</span>
              <h3 className="font-display text-xl tracking-wider mt-1">YOUR STRENGTHS</h3>
            </div>
          </div>
          <div className="h-px bg-border/30" />
          <ul className="space-y-3">
            {data.strengths.map((strength, i) => (
              <li key={i} className="flex gap-3">
                <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="font-mono text-xs text-muted-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gap Areas */}
      {data.gapAreas.length > 0 && (
        <div className="border border-border/50 bg-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-accent" />
            <div>
              <span className="label-mono text-accent">IMPROVEMENT AREAS</span>
              <h3 className="font-display text-xl tracking-wider mt-1">AREAS TO IMPROVE</h3>
            </div>
          </div>
          <div className="h-px bg-border/30" />
          <ul className="space-y-3">
            {data.gapAreas.map((gap, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-accent font-mono text-xs flex-shrink-0 mt-0.5">--</span>
                <span className="font-mono text-xs text-muted-foreground">{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="border border-accent/30 bg-accent/5 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-accent" />
            <div>
              <span className="label-mono text-accent">ACTION ITEMS</span>
              <h3 className="font-display text-xl tracking-wider mt-1">RECOMMENDATIONS</h3>
            </div>
          </div>
          <div className="h-px bg-accent/20" />
          <ol className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-mono text-xs text-accent flex-shrink-0">{String(i + 1).padStart(2, '0')}.</span>
                <span className="font-mono text-xs text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 p-4 font-mono text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Improved Resume Section */}
      {improvedResume && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-2 border-green-500/50 bg-green-500/5 p-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <span className="label-mono text-green-500">AI-ENHANCED SUGGESTIONS</span>
                <h2 className="font-display text-4xl tracking-wider mt-2">RESUME IMPROVEMENTS</h2>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-xl">
                  Below are optimized text suggestions for your resume. <strong className="text-foreground">Copy these improvements and paste them into your original resume</strong> to preserve your design while enhancing the content for this job posting.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    onClick={copyAllImprovements}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white font-mono uppercase text-[10px] tracking-widest"
                  >
                    {copiedItems['all'] ? (
                      <>
                        <Check className="w-4 h-4" />
                        COPIED!
                      </>
                    ) : (
                      <>
                        <ClipboardList className="w-4 h-4" />
                        COPY ALL IMPROVEMENTS
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={generateImprovedResume}
                    disabled={isGenerating}
                    variant="outline"
                    className="gap-2 bg-transparent border-green-500/50 hover:border-green-500 text-green-500 font-mono uppercase text-[10px] tracking-widest"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    REGENERATE
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-12 h-12 text-green-500" />
              </div>
            </div>
          </div>

          {/* Improved Professional Summary */}
          <div className="border border-green-500/20 bg-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-500" />
                <div>
                  <span className="label-mono text-green-500">COPY & PASTE</span>
                  <h3 className="font-display text-xl tracking-wider mt-1">PROFESSIONAL SUMMARY</h3>
                </div>
              </div>
              <Button
                onClick={() => copyToClipboard(improvedResume.summary, 'summary')}
                variant="outline"
                size="sm"
                className="gap-2 border-green-500/50 hover:border-green-500 text-green-500"
              >
                {copiedItems['summary'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedItems['summary'] ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="h-px bg-border/30" />
            <div className="bg-green-500/5 border border-green-500/20 p-4 rounded">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap select-all">
                {improvedResume.summary}
              </p>
            </div>
          </div>

          {/* Improved Skills */}
          <div className="border border-green-500/20 bg-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <span className="label-mono text-green-500">COPY & PASTE</span>
                  <h3 className="font-display text-xl tracking-wider mt-1">SKILLS</h3>
                </div>
              </div>
              <Button
                onClick={() => copyToClipboard(improvedResume.skills.join(', '), 'skills')}
                variant="outline"
                size="sm"
                className="gap-2 border-green-500/50 hover:border-green-500 text-green-500"
              >
                {copiedItems['skills'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedItems['skills'] ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="h-px bg-border/30" />
            <div className="bg-green-500/5 border border-green-500/20 p-4 rounded">
              <p className="font-mono text-sm text-muted-foreground select-all">
                {improvedResume.skills.join(', ')}
              </p>
            </div>
          </div>

          {/* Improved Experience */}
          <div className="border border-green-500/20 bg-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <span className="label-mono text-green-500">COPY & PASTE</span>
                <h3 className="font-display text-xl tracking-wider mt-1">EXPERIENCE</h3>
              </div>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Click the copy button on each role to copy the improved bullet points to your clipboard.
            </p>
            <div className="h-px bg-border/30" />
            <div className="space-y-6">
              {improvedResume.experience.map((exp, i) => (
                <div key={i} className="bg-green-500/5 border border-green-500/20 p-4 rounded space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-mono text-sm font-semibold">{exp.title}</h4>
                      <p className="font-mono text-xs text-muted-foreground">
                        {exp.company} | {exp.duration}
                      </p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(formatExperienceForCopy(exp), `exp-${i}`)}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-green-500/50 hover:border-green-500 text-green-500 flex-shrink-0"
                    >
                      {copiedItems[`exp-${i}`] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedItems[`exp-${i}`] ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <ul className="space-y-2 pl-4">
                    {exp.achievements.map((achievement, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-green-500 flex-shrink-0">•</span>
                        <span className="font-mono text-xs text-muted-foreground">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Incorporated Keywords */}
          {improvedResume.keywordMatches.length > 0 && (
            <div className="border border-accent/20 bg-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-accent" />
                  <div>
                    <span className="label-mono text-accent">ATS OPTIMIZED</span>
                    <h3 className="font-display text-xl tracking-wider mt-1">KEYWORDS INCORPORATED</h3>
                  </div>
                </div>
                <Button
                  onClick={() => copyToClipboard(improvedResume.keywordMatches.join(', '), 'keywords')}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-accent/50 hover:border-accent text-accent"
                >
                  {copiedItems['keywords'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedItems['keywords'] ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                These keywords from the job posting have been naturally incorporated into your suggestions:
              </p>
              <div className="h-px bg-border/30" />
              <div className="bg-accent/5 border border-accent/20 p-4 rounded">
                <p className="font-mono text-sm text-muted-foreground select-all">
                  {improvedResume.keywordMatches.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Improvements */}
          {improvedResume.improvements.length > 0 && (
            <div className="border border-border/50 bg-card p-6 space-y-5">
              <button
                onClick={() => setShowImprovements(!showImprovements)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <div className="text-left">
                    <span className="label-mono text-accent">BEFORE & AFTER</span>
                    <h3 className="font-display text-xl tracking-wider mt-1">DETAILED CHANGES</h3>
                  </div>
                </div>
                {showImprovements ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              {showImprovements && (
                <>
                  <p className="font-mono text-xs text-muted-foreground">
                    See exactly what was changed and why. Click copy on any improved text to use it in your resume.
                  </p>
                  <div className="h-px bg-border/30" />
                  <div className="space-y-6">
                    {improvedResume.improvements.map((improvement, i) => (
                      <div key={i} className="space-y-3 p-4 bg-secondary/50 rounded">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-accent font-semibold uppercase">
                            {improvement.section}
                          </span>
                          <Button
                            onClick={() => copyToClipboard(improvement.improved, `improvement-${i}`)}
                            variant="outline"
                            size="sm"
                            className="gap-2 border-green-500/50 hover:border-green-500 text-green-500"
                          >
                            {copiedItems[`improvement-${i}`] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedItems[`improvement-${i}`] ? 'Copied!' : 'Copy Improved'}
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="label-mono text-red-500">BEFORE</span>
                            <p className="font-mono text-xs text-muted-foreground bg-red-500/5 border border-red-500/20 p-3">
                              {improvement.original}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <span className="label-mono text-green-500">AFTER</span>
                            <p className="font-mono text-xs text-muted-foreground bg-green-500/5 border border-green-500/20 p-3 select-all">
                              {improvement.improved}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <p className="font-mono text-xs text-accent">{improvement.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Additional Suggestions */}
          {improvedResume.additionalSuggestions.length > 0 && (
            <div className="border border-accent/30 bg-accent/5 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-accent" />
                <div>
                  <span className="label-mono text-accent">PRO TIPS</span>
                  <h3 className="font-display text-xl tracking-wider mt-1">ADDITIONAL SUGGESTIONS</h3>
                </div>
              </div>
              <div className="h-px bg-accent/20" />
              <ul className="space-y-3">
                {improvedResume.additionalSuggestions.map((suggestion, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-xs text-accent flex-shrink-0">{String(i + 1).padStart(2, '0')}.</span>
                    <span className="font-mono text-xs text-muted-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

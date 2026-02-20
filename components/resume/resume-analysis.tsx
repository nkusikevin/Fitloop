'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Eye,
  X,
  Code,
} from 'lucide-react'
import { toast } from 'sonner'
import { parseResumeText, StructuredResume, generateId } from '@/lib/resume-types'
import { ResumePreview, DiffViewer } from '@/components/resume/resume-preview'
import { downloadResumePDF } from '@/lib/pdf-generator'
import { downloadLatexBundle } from '@/lib/latex-generator'

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
  resumeFilePath?: string
}

export default function Resume({ data, onNewAnalysis, resumeText, jobPosting }: ResumeProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [improvedResumeData, setImprovedResumeData] = useState<ImprovedResumeData | null>(null)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [showImprovements, setShowImprovements] = useState(true)

  // Parse the resume text into structured format
  const originalResume = useMemo(() => {
    if (!resumeText) return null
    return parseResumeText(resumeText)
  }, [resumeText])

  // Create improved resume by applying AI suggestions
  const improvedResume = useMemo((): StructuredResume | null => {
    if (!originalResume || !improvedResumeData) return null
    
    // Create a copy with improvements applied
    const improved: StructuredResume = {
      ...originalResume,
      summary: improvedResumeData.summary,
      originalSummary: originalResume.summary,
      summaryModified: improvedResumeData.summary !== originalResume.summary,
      skills: improvedResumeData.skills,
      originalSkills: originalResume.skills,
      skillsModified: true,
      experience: improvedResumeData.experience.map((exp, idx) => ({
        id: originalResume.experience[idx]?.id || generateId(),
        title: exp.title,
        company: exp.company,
        startDate: originalResume.experience[idx]?.startDate || '',
        endDate: originalResume.experience[idx]?.endDate || exp.duration,
        location: originalResume.experience[idx]?.location,
        achievements: exp.achievements,
        originalAchievements: originalResume.experience[idx]?.achievements,
        isModified: true,
      })),
    }
    
    return improved
  }, [originalResume, improvedResumeData])

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

      setImprovedResumeData(result)
      setShowPreview(true)
      toast.success('Resume improvements generated! Check the preview on the right.')
    } catch (err) {
      setError('An error occurred while generating improvements')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadImprovedPDF = () => {
    if (improvedResume) {
      downloadResumePDF(improvedResume, 'improved-resume.pdf', false)
      toast.success('Downloading your improved resume!')
    }
  }

  const handleDownloadHighlightedPDF = () => {
    if (improvedResume) {
      downloadResumePDF(improvedResume, 'resume-with-changes.pdf', true)
      toast.success('Downloading resume with highlighted changes!')
    }
  }

  const handleDownloadLatex = () => {
    if (improvedResume) {
      downloadLatexBundle(improvedResume, false)
      toast.success('Downloading FAANG LaTeX template! Upload both files to Overleaf to compile.')
    }
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

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left Panel - Analysis Results */}
      <div className={`flex-1 overflow-y-auto space-y-6 pr-4 ${showPreview ? 'max-w-[50%]' : ''}`}>
        {/* Score Card */}
        <div className={`border ${getScoreBorder(data.overallScore)} bg-card p-6`}>
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <span className="label-mono text-accent">ANALYSIS COMPLETE</span>
              <h2 className="font-display text-3xl tracking-wider mt-2">RESULTS</h2>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed">{data.summary}</p>
              
              <div className="flex flex-wrap gap-3 pt-4">
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
                      IMPROVE RESUME
                    </>
                  )}
                </Button>
                
                {improvedResume && (
                  <>
                    <Button
                      onClick={handleDownloadImprovedPDF}
                      className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-[10px] tracking-widest"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD PDF
                    </Button>
                    <Button
                      onClick={handleDownloadLatex}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-mono uppercase text-[10px] tracking-widest"
                    >
                      <Code className="w-4 h-4" />
                      FAANG LATEX
                    </Button>
                    <Button
                      onClick={handleDownloadHighlightedPDF}
                      variant="outline"
                      className="gap-2 border-accent/50 hover:border-accent text-accent font-mono uppercase text-[10px] tracking-widest"
                    >
                      <Download className="w-4 h-4" />
                      WITH HIGHLIGHTS
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="gap-2 border-border/50 hover:border-accent hover:text-accent font-mono uppercase text-[10px] tracking-widest"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'HIDE' : 'SHOW'} PREVIEW
                </Button>
                
                <Button
                  onClick={onNewAnalysis}
                  variant="outline"
                  className="gap-2 bg-transparent border-border/50 hover:border-accent hover:text-accent font-mono uppercase text-[10px] tracking-widest"
                >
                  <Plus className="w-4 h-4" />
                  NEW
                </Button>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex flex-col items-center gap-2">
              <div className={`relative w-24 h-24 border-2 ${getScoreBorder(data.overallScore)} flex items-center justify-center`}>
                <div className="text-center">
                  <div className={`font-display text-4xl ${getScoreColor(data.overallScore)}`}>
                    {data.overallScore}
                  </div>
                  <div className="label-mono text-muted-foreground text-[8px]">% MATCH</div>
                </div>
              </div>
              <p className={`label-mono text-[10px] ${getScoreColor(data.overallScore)}`}>
                {getScoreLabel(data.overallScore)}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 p-4 font-mono text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Matched Skills */}
        {data.matchedSkills.length > 0 && (
          <div className="border border-accent/20 bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-accent" />
              <div>
                <span className="label-mono text-accent text-[10px]">SIGNALS DETECTED</span>
                <h3 className="font-display text-lg tracking-wider mt-1">MATCHED SKILLS</h3>
              </div>
            </div>
            <div className="h-px bg-border/30" />
            <div className="flex flex-wrap gap-2">
              {data.matchedSkills.map((skill, i) => (
                <span key={i} className="bg-accent/5 border border-accent/20 px-3 py-1.5 font-mono text-[10px] text-accent">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {data.missingSkills.length > 0 && (
          <div className="border border-yellow-500/20 bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <div>
                <span className="label-mono text-yellow-500 text-[10px]">GAPS IDENTIFIED</span>
                <h3 className="font-display text-lg tracking-wider mt-1">MISSING SKILLS</h3>
              </div>
            </div>
            <div className="h-px bg-border/30" />
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map((skill, i) => (
                <span key={i} className="bg-yellow-500/5 border border-yellow-500/20 px-3 py-1.5 font-mono text-[10px] text-yellow-500">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="border border-accent/30 bg-accent/5 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-accent" />
              <div>
                <span className="label-mono text-accent text-[10px]">ACTION ITEMS</span>
                <h3 className="font-display text-lg tracking-wider mt-1">RECOMMENDATIONS</h3>
              </div>
            </div>
            <div className="h-px bg-accent/20" />
            <ol className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-[10px] text-accent flex-shrink-0">{String(i + 1).padStart(2, '0')}.</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Improvements Details (if generated) */}
        {improvedResumeData && (
          <div className="border border-green-500/30 bg-green-500/5 p-5 space-y-4">
            <button
              onClick={() => setShowImprovements(!showImprovements)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-green-500" />
                <div className="text-left">
                  <span className="label-mono text-green-500 text-[10px]">AI IMPROVEMENTS</span>
                  <h3 className="font-display text-lg tracking-wider mt-1">CHANGES MADE</h3>
                </div>
              </div>
              {showImprovements ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            {showImprovements && (
              <>
                <div className="h-px bg-green-500/20" />
                <div className="space-y-4">
                  {/* Summary diff */}
                  {improvedResumeData.summary && (
                    <DiffViewer
                      title="Professional Summary"
                      original={originalResume?.summary || ''}
                      improved={improvedResumeData.summary}
                    />
                  )}
                  
                  {/* Skills */}
                  {improvedResumeData.skills.length > 0 && (
                    <div className="border border-border/50 rounded overflow-hidden">
                      <div className="p-3 bg-secondary/50 border-b border-border/50">
                        <span className="font-mono text-xs uppercase tracking-widest">Optimized Skills</span>
                      </div>
                      <div className="p-3 bg-green-500/5">
                        <div className="flex flex-wrap gap-2">
                          {improvedResumeData.skills.map((skill, i) => (
                            <span key={i} className="bg-green-500/10 border border-green-500/30 px-2 py-1 font-mono text-[10px] text-green-500">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keywords incorporated */}
                  {improvedResumeData.keywordMatches.length > 0 && (
                    <div className="border border-accent/20 rounded overflow-hidden">
                      <div className="p-3 bg-secondary/50 border-b border-border/50">
                        <span className="font-mono text-xs uppercase tracking-widest">Keywords Incorporated</span>
                      </div>
                      <div className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {improvedResumeData.keywordMatches.map((keyword, i) => (
                            <span key={i} className="bg-accent/10 border border-accent/30 px-2 py-1 font-mono text-[10px] text-accent">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Panel - PDF Preview */}
      {showPreview && (
        <div className="w-[50%] h-full sticky top-0">
          <ResumePreview
            originalResume={originalResume}
            improvedResume={improvedResume}
            onDownload={handleDownloadImprovedPDF}
          />
        </div>
      )}
    </div>
  )
}

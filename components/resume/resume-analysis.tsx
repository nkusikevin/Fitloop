'use client'

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
} from 'lucide-react'
import jsPDF from 'jspdf'

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

interface ResumeProps {
  data: AnalysisData
  onNewAnalysis: () => void
}

export default function Resume({ data, onNewAnalysis }: ResumeProps) {
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
            <div className="flex gap-4 pt-4">
              <Button
                onClick={downloadPDF}
                className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-[10px] tracking-widest"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD PDF
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
    </div>
  )
}

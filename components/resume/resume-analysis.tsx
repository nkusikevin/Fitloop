'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
  Plus,
  Zap,
  Target,
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
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-amber-500'
    return 'from-red-500 to-rose-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Improvement'
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

    // Header
    doc.setFillColor(30, 41, 59) // slate-900
    doc.rect(0, 0, 210, 30, 'F')
    doc.setTextColor(255, 255, 255)
    addText('ResumeMatch Analysis Report', 18, true)
    yPosition = 40

    doc.setTextColor(0, 0, 0)

    // Score
    addText(`Overall Compatibility: ${data.overallScore}%`, 16, true)
    addText(`Status: ${getScoreLabel(data.overallScore)}`, 12)
    yPosition += 10

    // Summary
    addSection('Analysis Summary', [data.summary])

    // Matched Skills
    if (data.matchedSkills.length > 0) {
      addSection('Matched Skills', data.matchedSkills)
    }

    // Missing Skills
    if (data.missingSkills.length > 0) {
      addSection('Missing Skills', data.missingSkills)
    }

    // Strengths
    if (data.strengths.length > 0) {
      addSection('Your Strengths', data.strengths)
    }

    // Recommendations
    if (data.recommendations.length > 0) {
      addSection('Recommendations', data.recommendations)
    }

    doc.save('resume-analysis.pdf')
  }

  return (
    <div className="space-y-8">
      {/* Score Card */}
      <Card className="bg-slate-800/50 border-slate-700 p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold">Analysis Results</h2>
            <p className="text-slate-400 text-lg">{data.summary}</p>
            <div className="flex gap-4 pt-4">
              <Button onClick={downloadPDF} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button onClick={onNewAnalysis} variant="outline" className="gap-2 bg-transparent">
                <Plus className="w-4 h-4" />
                New Analysis
              </Button>
            </div>
          </div>

          {/* Score Circle */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(
                data.overallScore
              )} flex items-center justify-center shadow-lg`}
            >
              <div className="absolute inset-2 bg-slate-800 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">{data.overallScore}</div>
                  <div className="text-sm text-slate-400">% Match</div>
                </div>
              </div>
            </div>
            <p className="text-lg font-semibold text-center">{getScoreLabel(data.overallScore)}</p>
          </div>
        </div>
      </Card>

      {/* Matched Skills */}
      {data.matchedSkills.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold">Matched Skills</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {data.matchedSkills.map((skill, i) => (
              <div key={i} className="bg-green-500/10 border border-green-500/30 rounded px-4 py-2 text-green-300">
                {skill}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Missing Skills */}
      {data.missingSkills.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold">Missing Skills</h3>
          </div>
          <p className="text-slate-400 text-sm">These skills are important for the job and missing from your resume:</p>
          <div className="grid md:grid-cols-2 gap-3">
            {data.missingSkills.map((skill, i) => (
              <div key={i} className="bg-yellow-500/10 border border-yellow-500/30 rounded px-4 py-2 text-yellow-300">
                {skill}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strengths */}
      {data.strengths.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold">Your Strengths</h3>
          </div>
          <ul className="space-y-3">
            {data.strengths.map((strength, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-blue-400 flex-shrink-0">→</span>
                <span className="text-slate-300">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Gap Areas */}
      {data.gapAreas.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold">Areas to Improve</h3>
          </div>
          <ul className="space-y-3">
            {data.gapAreas.map((gap, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-orange-400 flex-shrink-0">•</span>
                <span className="text-slate-300">{gap}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold">Recommendations</h3>
          </div>
          <ol className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-semibold text-cyan-400 flex-shrink-0">{i + 1}.</span>
                <span className="text-slate-300">{rec}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  )
}

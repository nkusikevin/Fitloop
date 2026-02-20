'use client'

import { useState, useEffect } from 'react'
import { StructuredResume } from '@/lib/resume-types'
import { generateResumePDFUrl, downloadResumePDF } from '@/lib/pdf-generator'
import { downloadLatexBundle } from '@/lib/latex-generator'
import { Button } from '@/components/ui/button'
import { Download, Eye, RefreshCw, Check, FileText, Code } from 'lucide-react'
import { toast } from 'sonner'

interface ResumePreviewProps {
  originalResume: StructuredResume | null
  improvedResume: StructuredResume | null
  onDownload?: () => void
}

export function ResumePreview({ originalResume, improvedResume, onDownload }: ResumePreviewProps) {
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null)
  const [improvedPdfUrl, setImprovedPdfUrl] = useState<string | null>(null)
  const [showHighlights, setShowHighlights] = useState(true)
  const [activeTab, setActiveTab] = useState<'original' | 'improved' | 'comparison'>('comparison')

  // Generate PDF URLs when resumes change
  useEffect(() => {
    if (originalResume) {
      const url = generateResumePDFUrl(originalResume, false)
      setOriginalPdfUrl(url)
      return () => {
        setOriginalPdfUrl(null)
        URL.revokeObjectURL(url)
      }
    } else {
      setOriginalPdfUrl(null)
    }
  }, [originalResume])

  useEffect(() => {
    if (improvedResume) {
      const url = generateResumePDFUrl(improvedResume, showHighlights)
      setImprovedPdfUrl(url)
      return () => {
        setImprovedPdfUrl(null)
        URL.revokeObjectURL(url)
      }
    } else {
      setImprovedPdfUrl(null)
    }
  }, [improvedResume, showHighlights])

  const handleDownloadImproved = () => {
    if (improvedResume) {
      downloadResumePDF(improvedResume, 'improved-resume.pdf', false)
      toast.success('Downloading your improved resume!')
      onDownload?.()
    }
  }

  const handleDownloadHighlighted = () => {
    if (improvedResume) {
      downloadResumePDF(improvedResume, 'resume-with-highlights.pdf', true)
      toast.success('Downloading resume with highlighted changes!')
    }
  }

  const handleDownloadLatex = () => {
    if (improvedResume) {
      downloadLatexBundle(improvedResume, false)
      toast.success('Downloading FAANG LaTeX template! Upload both files to Overleaf.')
    }
  }

  if (!originalResume && !improvedResume) {
    return (
      <div className="h-full flex items-center justify-center border border-dashed border-border/50 rounded bg-card/50">
        <div className="text-center p-8">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-mono text-xs text-muted-foreground">
            Resume preview will appear here after analysis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col border border-border/50 rounded bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-widest">Preview</span>
        </div>
        
        {/* Tab buttons */}
        <div className="flex gap-1 bg-secondary rounded p-1">
          <button
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded transition-colors ${
              activeTab === 'original' 
                ? 'bg-accent text-accent-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveTab('improved')}
            className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded transition-colors ${
              activeTab === 'improved' 
                ? 'bg-green-600 text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Improved
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest rounded transition-colors ${
              activeTab === 'comparison' 
                ? 'bg-blue-600 text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Compare
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'comparison' ? (
          <div className="h-full grid grid-cols-2 gap-0.5 bg-border/50">
            {/* Original side */}
            <div className="bg-card flex flex-col">
              <div className="p-2 bg-secondary/50 border-b border-border/50">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">Original</span>
              </div>
              <div className="flex-1 overflow-auto">
                {originalPdfUrl ? (
                  <iframe 
                    src={originalPdfUrl} 
                    className="w-full h-full border-0"
                    title="Original Resume"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No original resume</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Improved side */}
            <div className="bg-card flex flex-col">
              <div className="p-2 bg-green-500/10 border-b border-green-500/20 flex items-center justify-between">
                <span className="font-mono text-[10px] text-green-500 uppercase">Improved</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHighlights}
                    onChange={(e) => setShowHighlights(e.target.checked)}
                    className="w-3 h-3 rounded"
                  />
                  <span className="font-mono text-[9px] text-muted-foreground">Show highlights</span>
                </label>
              </div>
              <div className="flex-1 overflow-auto">
                {improvedPdfUrl ? (
                  <iframe 
                    src={improvedPdfUrl} 
                    className="w-full h-full border-0"
                    title="Improved Resume"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Generate improvements to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {activeTab === 'original' && originalPdfUrl && (
              <iframe 
                src={originalPdfUrl} 
                className="w-full h-full border-0"
                title="Original Resume"
              />
            )}
            {activeTab === 'improved' && improvedPdfUrl && (
              <iframe 
                src={improvedPdfUrl} 
                className="w-full h-full border-0"
                title="Improved Resume"
              />
            )}
            {activeTab === 'original' && !originalPdfUrl && (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No original resume available</p>
              </div>
            )}
            {activeTab === 'improved' && !improvedPdfUrl && (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Generate improvements to preview</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with download buttons */}
      {improvedResume && (
        <div className="p-3 border-t border-border/50 bg-secondary/30 flex gap-2 justify-end flex-wrap">
          <Button
            onClick={handleDownloadHighlighted}
            variant="outline"
            size="sm"
            className="gap-2 font-mono text-[10px] uppercase"
          >
            <Download className="w-3 h-3" />
            With Highlights
          </Button>
          <Button
            onClick={handleDownloadLatex}
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] uppercase"
          >
            <Code className="w-3 h-3" />
            FAANG LaTeX
          </Button>
          <Button
            onClick={handleDownloadImproved}
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white font-mono text-[10px] uppercase"
          >
            <Download className="w-3 h-3" />
            Download PDF
          </Button>
        </div>
      )}
    </div>
  )
}

// Diff viewer for text comparison
interface DiffViewerProps {
  original: string
  improved: string
  title: string
}

export function DiffViewer({ original, improved, title }: DiffViewerProps) {
  const hasChanges = original !== improved
  
  return (
    <div className="border border-border/50 rounded overflow-hidden">
      <div className="p-3 bg-secondary/50 border-b border-border/50 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest">{title}</span>
        {hasChanges && (
          <span className="flex items-center gap-1 text-green-500">
            <Check className="w-3 h-3" />
            <span className="font-mono text-[10px]">Modified</span>
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 divide-x divide-border/50">
        <div className="p-3">
          <span className="block font-mono text-[10px] text-muted-foreground uppercase mb-2">Before</span>
          <p className="text-sm text-muted-foreground">{original || '(empty)'}</p>
        </div>
        <div className={`p-3 ${hasChanges ? 'bg-green-500/5' : ''}`}>
          <span className="block font-mono text-[10px] text-green-500 uppercase mb-2">After</span>
          <p className={`text-sm ${hasChanges ? 'text-foreground' : 'text-muted-foreground'}`}>
            {improved || '(empty)'}
          </p>
        </div>
      </div>
    </div>
  )
}

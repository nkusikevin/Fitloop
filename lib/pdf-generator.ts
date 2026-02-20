import jsPDF from 'jspdf'
import { StructuredResume } from './resume-types'

// Colors
const COLORS = {
  primary: '#1a1a1a',      // Dark text
  secondary: '#4a4a4a',    // Light text
  accent: '#2563eb',       // Blue accent
  highlight: '#fef08a',    // Yellow highlight for changes
  border: '#e5e7eb',       // Light border
}

export function generateResumePDF(resume: StructuredResume, highlightChanges: boolean = false): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin

  // Helper to add page if needed
  const checkPageBreak = (height: number) => {
    const pageHeight = doc.internal.pageSize.getHeight()
    if (yPos + height > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // Helper to draw highlighted background
  const drawHighlight = (x: number, y: number, width: number, height: number) => {
    if (highlightChanges) {
      doc.setFillColor(254, 240, 138) // Yellow highlight
      doc.rect(x - 1, y - height + 1, width + 2, height + 1, 'F')
    }
  }

  // === HEADER: Name & Contact ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(COLORS.primary)
  doc.text(resume.name || 'Your Name', margin, yPos)
  yPos += 8

  // Contact info on one line
  const contactParts: string[] = []
  if (resume.email) contactParts.push(resume.email)
  if (resume.phone) contactParts.push(resume.phone)
  if (resume.location) contactParts.push(resume.location)
  if (resume.linkedin) contactParts.push(resume.linkedin.replace('https://', ''))

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(COLORS.secondary)
    doc.text(contactParts.join('  |  '), margin, yPos)
    yPos += 6
  }

  // Divider
  yPos += 2
  doc.setDrawColor(COLORS.border)
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // === SUMMARY ===
  if (resume.summary) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(COLORS.accent)
    doc.text('PROFESSIONAL SUMMARY', margin, yPos)
    yPos += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(COLORS.primary)
    
    const summaryLines = doc.splitTextToSize(resume.summary, contentWidth)
    
    if (highlightChanges && resume.summaryModified) {
      const lineHeight = 4.5
      drawHighlight(margin, yPos + lineHeight, contentWidth, summaryLines.length * lineHeight)
    }
    
    summaryLines.forEach((line: string) => {
      checkPageBreak(5)
      doc.text(line, margin, yPos)
      yPos += 4.5
    })
    yPos += 6
  }

  // === SKILLS ===
  if (resume.skills && resume.skills.length > 0) {
    checkPageBreak(15)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(COLORS.accent)
    doc.text('SKILLS', margin, yPos)
    yPos += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(COLORS.primary)
    
    const skillsText = resume.skills.join('  •  ')
    const skillsLines = doc.splitTextToSize(skillsText, contentWidth)
    
    if (highlightChanges && resume.skillsModified) {
      const lineHeight = 4.5
      drawHighlight(margin, yPos + lineHeight, contentWidth, skillsLines.length * lineHeight)
    }
    
    skillsLines.forEach((line: string) => {
      checkPageBreak(5)
      doc.text(line, margin, yPos)
      yPos += 4.5
    })
    yPos += 6
  }

  // === EXPERIENCE ===
  if (resume.experience && resume.experience.length > 0) {
    checkPageBreak(15)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(COLORS.accent)
    doc.text('PROFESSIONAL EXPERIENCE', margin, yPos)
    yPos += 8

    for (const exp of resume.experience) {
      checkPageBreak(25)
      
      // Job title and company
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(COLORS.primary)
      doc.text(exp.title, margin, yPos)
      
      // Dates on the right
      if (exp.startDate || exp.endDate) {
        const dateText = `${exp.startDate} - ${exp.endDate}`
        const dateWidth = doc.getTextWidth(dateText)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(COLORS.secondary)
        doc.text(dateText, pageWidth - margin - dateWidth, yPos)
      }
      yPos += 5

      // Company
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(COLORS.secondary)
      const companyText = exp.location ? `${exp.company}  |  ${exp.location}` : exp.company
      doc.text(companyText, margin, yPos)
      yPos += 5

      // Achievements
      doc.setTextColor(COLORS.primary)
      for (let i = 0; i < exp.achievements.length; i++) {
        const achievement = exp.achievements[i]
        checkPageBreak(8)
        
        const bulletX = margin + 3
        const textX = margin + 8
        const achievementLines = doc.splitTextToSize(achievement, contentWidth - 8)
        
        // Highlight if modified
        if (highlightChanges && exp.isModified) {
          const lineHeight = 4.5
          drawHighlight(textX, yPos + lineHeight, contentWidth - 8, achievementLines.length * lineHeight)
        }
        
        doc.text('•', bulletX, yPos)
        achievementLines.forEach((line: string, idx: number) => {
          doc.text(line, textX, yPos)
          yPos += 4.5
        })
      }
      yPos += 4
    }
    yPos += 4
  }

  // === EDUCATION ===
  if (resume.education && resume.education.length > 0) {
    checkPageBreak(15)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(COLORS.accent)
    doc.text('EDUCATION', margin, yPos)
    yPos += 8

    for (const edu of resume.education) {
      checkPageBreak(15)
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(COLORS.primary)
      doc.text(edu.degree, margin, yPos)
      
      if (edu.graduationDate) {
        const dateWidth = doc.getTextWidth(edu.graduationDate)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(COLORS.secondary)
        doc.text(edu.graduationDate, pageWidth - margin - dateWidth, yPos)
      }
      yPos += 5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(COLORS.secondary)
      doc.text(edu.school, margin, yPos)
      yPos += 6
    }
  }

  // === CERTIFICATIONS ===
  if (resume.certifications && resume.certifications.length > 0) {
    checkPageBreak(15)
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(COLORS.accent)
    doc.text('CERTIFICATIONS', margin, yPos)
    yPos += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(COLORS.primary)
    
    for (const cert of resume.certifications) {
      checkPageBreak(6)
      doc.text('•  ' + cert, margin + 3, yPos)
      yPos += 5
    }
  }

  return doc
}

/**
 * Generate PDF and return as blob URL for preview.
 * IMPORTANT: Callers are responsible for calling URL.revokeObjectURL() 
 * on the returned URL when done to prevent memory leaks.
 */
export function generateResumePDFUrl(resume: StructuredResume, highlightChanges: boolean = false): string {
  const doc = generateResumePDF(resume, highlightChanges)
  const blob = doc.output('blob')
  return URL.createObjectURL(blob)
}

// Download the PDF
export function downloadResumePDF(resume: StructuredResume, filename: string = 'improved-resume.pdf', highlightChanges: boolean = false) {
  const doc = generateResumePDF(resume, highlightChanges)
  doc.save(filename)
}

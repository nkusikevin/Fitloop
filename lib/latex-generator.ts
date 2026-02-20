import { StructuredResume } from './resume-types'

// Clean text before LaTeX escaping - decode HTML entities and remove artifacts
function cleanText(text: string): string {
  if (!text) return ''
  
  let cleaned = text
  
  // Decode common HTML entities first
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&bull;': '•',
  }
  
  for (const [entity, char] of Object.entries(htmlEntities)) {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), char)
  }
  
  // Remove garbage characters
  cleaned = cleaned.replace(/[%Ï\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  return cleaned
}

// Escape special LaTeX characters
// Note: Order matters - backslash must be replaced first to avoid double-escaping
function escapeLatex(text: string): string {
  if (!text) return ''
  
  // First clean the text
  let result = cleanText(text)
  
  // Map of special LaTeX characters to their escape sequences
  const latexEscapes: [RegExp, string][] = [
    [/\\/g, '\\textbackslash{}'],  // Must be first to avoid double-escaping
    [/&/g, '\\&'],
    [/%/g, '\\%'],
    [/\$/g, '\\$'],
    [/#/g, '\\#'],
    [/_/g, '\\_'],
    [/\{/g, '\\{'],
    [/\}/g, '\\}'],
    [/~/g, '\\textasciitilde{}'],
    [/\^/g, '\\textasciicircum{}'],
  ]
  
  for (const [pattern, replacement] of latexEscapes) {
    result = result.replace(pattern, replacement)
  }
  return result
}

// Generate the resume.cls file content (FAANG style)
export function generateResumeClsContent(): string {
  return `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% FAANG Resume/CV
% LaTeX Class
% Version 1.0 (based on FAANGPath template)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\NeedsTeXFormat{LaTeX2e}
\\ProvidesClass{resume}[2024/01/01 FAANG Resume class]

\\LoadClass[11pt,letterpaper]{article}

\\RequirePackage[parfill]{parskip}
\\RequirePackage{array}
\\RequirePackage{ifthen}
\\RequirePackage{hyperref}

\\pagestyle{empty}

%----------------------------------------------------------------------------------------
%   HEADINGS COMMANDS
%----------------------------------------------------------------------------------------

\\def \\name#1{\\def\\@name{#1}}
\\def \\@name {}

\\def \\addressSep {$\\diamond$}

\\let \\@addressone \\relax
\\let \\@addresstwo \\relax
\\let \\@addressthree \\relax

\\def \\address #1{
  \\@ifundefined{@addresstwo}{
    \\def \\@addresstwo {#1}
  }{
  \\@ifundefined{@addressthree}{
    \\def \\@addressthree {#1}
  }{
     \\def \\@addressone {#1}
  }}
}

\\def \\printaddress #1{
  \\begingroup
    \\def \\\\ {\\addressSep\\ }
    \\centerline{#1}
  \\endgroup
  \\par
  \\addressskip
}

\\def \\printname {
  \\begingroup
    \\hfil{\\MakeUppercase{\\namesize\\bf \\@name}}\\hfil
    \\nameskip\\break
  \\endgroup
}

%----------------------------------------------------------------------------------------
%   PRINT THE HEADING LINES
%----------------------------------------------------------------------------------------

\\let\\ori@document=\\document
\\renewcommand{\\document}{
  \\ori@document
  \\printname
  \\@ifundefined{@addressone}{}{
    \\printaddress{\\@addressone}}
  \\@ifundefined{@addresstwo}{}{
    \\printaddress{\\@addresstwo}}
  \\@ifundefined{@addressthree}{}{
    \\printaddress{\\@addressthree}}
}

%----------------------------------------------------------------------------------------
%   SECTION FORMATTING
%----------------------------------------------------------------------------------------

\\newenvironment{rSection}[1]{
  \\sectionskip
  \\MakeUppercase{\\bf #1}
  \\sectionlineskip
  \\hrule
  \\begin{list}{}{
    \\setlength{\\leftmargin}{1.5em}
  }
  \\item[]
}{
  \\end{list}
}

%----------------------------------------------------------------------------------------
%   WORK EXPERIENCE FORMATTING
%----------------------------------------------------------------------------------------

\\newenvironment{rSubsection}[4]{
  {\\bf #1} \\hfill {#2}
  \\ifthenelse{\\equal{#3}{}}{}{
  \\\\
  {\\em #3} \\hfill {\\em #4}
  }\\smallskip
  \\begin{list}{$\\cdot$}{\\leftmargin=0em}
  \\itemsep -0.5em \\vspace{-0.5em}
}{
  \\end{list}
  \\vspace{0.5em}
}

\\def\\namesize{\\huge}
\\def\\addressskip{\\smallskip}
\\def\\sectionlineskip{\\medskip}
\\def\\nameskip{\\bigskip}
\\def\\sectionskip{\\medskip}
`
}

// Generate LaTeX content from structured resume using FAANG template
export function generateLatexContent(resume: StructuredResume, highlightChanges: boolean = false): string {
  const name = escapeLatex(resume.name || 'Your Name')
  const email = escapeLatex(resume.email || 'email@example.com')
  const phone = escapeLatex(resume.phone || '+1(123) 456-7890')
  const location = escapeLatex(resume.location || 'City, State')
  const linkedin = resume.linkedin ? escapeLatex(resume.linkedin.replace('https://', '')) : 'linkedin.com/in/yourprofile'
  const website = resume.website ? escapeLatex(resume.website.replace('https://', '')) : ''

  // Build contact line
  const contactLine2Parts = [
    email ? `\\href{mailto:${email}}{${email}}` : '',
    linkedin ? `\\href{https://${linkedin}}{${linkedin}}` : '',
    website ? `\\href{https://${website}}{${website}}` : '',
  ].filter(p => p)

  let latex = `\\documentclass{resume}

\\usepackage[left=0.4in,top=0.4in,right=0.4in,bottom=0.4in]{geometry}
\\newcommand{\\tab}[1]{\\hspace{.2667\\textwidth}\\rlap{#1}} 
\\newcommand{\\itab}[1]{\\hspace{0em}\\rlap{#1}}
\\name{${name}}
\\address{${phone} \\\\\\\\ ${location}} 
\\address{${contactLine2Parts.join(' \\\\\\\\ ')}}

\\begin{document}

`

  // === OBJECTIVE/SUMMARY ===
  if (resume.summary) {
    const summary = escapeLatex(resume.summary)
    const highlightStart = highlightChanges && resume.summaryModified ? '\\colorbox{yellow}{' : ''
    const highlightEnd = highlightChanges && resume.summaryModified ? '}' : ''
    
    latex += `%----------------------------------------------------------------------------------------
%	OBJECTIVE
%----------------------------------------------------------------------------------------

\\begin{rSection}{OBJECTIVE}

{${highlightStart}${summary}${highlightEnd}}

\\end{rSection}
`
  }

  // === EDUCATION ===
  if (resume.education && resume.education.length > 0) {
    latex += `%----------------------------------------------------------------------------------------
%	EDUCATION SECTION
%----------------------------------------------------------------------------------------

\\begin{rSection}{Education}

`
    for (const edu of resume.education) {
      const degree = escapeLatex(edu.degree)
      const school = escapeLatex(edu.school)
      const date = escapeLatex(edu.graduationDate)
      const gpa = edu.gpa ? `GPA: ${escapeLatex(edu.gpa)}` : ''
      
      latex += `{\\bf ${degree}}, ${school} \\hfill {${date}}\\\\
${gpa}

`
    }
    latex += `\\end{rSection}
`
  }

  // === SKILLS ===
  if (resume.skills && resume.skills.length > 0) {
    const highlightStart = highlightChanges && resume.skillsModified ? '\\colorbox{yellow}{' : ''
    const highlightEnd = highlightChanges && resume.skillsModified ? '}' : ''
    
    // Split skills into technical (first 70%) and other (remaining 30%)
    // This follows the common FAANG resume convention of prioritizing technical skills
    const TECHNICAL_SKILLS_RATIO = 0.7
    const technicalSkills = resume.skills.slice(0, Math.ceil(resume.skills.length * TECHNICAL_SKILLS_RATIO))
    const otherSkills = resume.skills.slice(Math.ceil(resume.skills.length * TECHNICAL_SKILLS_RATIO))
    
    latex += `%----------------------------------------------------------------------------------------
% SKILLS
%----------------------------------------------------------------------------------------
\\begin{rSection}{SKILLS}

\\begin{tabular}{ @{} >{\\bfseries}l @{\\hspace{6ex}} l }
Technical Skills & ${highlightStart}${technicalSkills.map(s => escapeLatex(s)).join(', ')}${highlightEnd}\\\\
`
    if (otherSkills.length > 0) {
      latex += `Other Skills & ${highlightStart}${otherSkills.map(s => escapeLatex(s)).join(', ')}${highlightEnd}\\\\
`
    }
    latex += `\\end{tabular}

\\end{rSection}
`
  }

  // === EXPERIENCE ===
  if (resume.experience && resume.experience.length > 0) {
    latex += `%----------------------------------------------------------------------------------------
%	EXPERIENCE SECTION
%----------------------------------------------------------------------------------------

\\begin{rSection}{EXPERIENCE}

`
    for (const exp of resume.experience) {
      const title = escapeLatex(exp.title)
      const company = escapeLatex(exp.company)
      const location = escapeLatex(exp.location || '')
      const dateRange = `${escapeLatex(exp.startDate)} - ${escapeLatex(exp.endDate)}`
      const shouldHighlight = highlightChanges && exp.isModified
      
      latex += `\\textbf{${title}} \\hfill ${dateRange}\\\\
${company} \\hfill \\textit{${location}}
 \\begin{itemize}
    \\itemsep -3pt {} 
`
      for (const achievement of exp.achievements) {
        const achievementText = escapeLatex(achievement)
        if (shouldHighlight) {
          latex += `     \\item \\colorbox{yellow}{${achievementText}}
`
        } else {
          latex += `     \\item ${achievementText}
`
        }
      }
      latex += ` \\end{itemize}
 
`
    }
    latex += `\\end{rSection} 
`
  }

  // === PROJECTS ===
  if (resume.projects && resume.projects.length > 0) {
    latex += `%----------------------------------------------------------------------------------------
%	PROJECTS SECTION
%----------------------------------------------------------------------------------------

\\begin{rSection}{PROJECTS}
\\vspace{-1.25em}
`
    for (const project of resume.projects) {
      const title = escapeLatex(project.title)
      const content = escapeLatex(project.content)
      latex += `\\item \\textbf{${title}.} {${content}}
`
    }
    latex += `\\end{rSection} 
`
  }

  // === CERTIFICATIONS ===
  if (resume.certifications && resume.certifications.length > 0) {
    latex += `%----------------------------------------------------------------------------------------
%	CERTIFICATIONS SECTION
%----------------------------------------------------------------------------------------

\\begin{rSection}{Certifications} 
\\begin{itemize}
`
    for (const cert of resume.certifications) {
      latex += `    \\item ${escapeLatex(cert)}
`
    }
    latex += `\\end{itemize}

\\end{rSection}
`
  }

  latex += `\\end{document}
`

  return latex
}

// Download LaTeX file
export function downloadLatexFile(resume: StructuredResume, filename: string = 'resume.tex', highlightChanges: boolean = false) {
  const content = generateLatexContent(resume, highlightChanges)
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Download resume.cls style file
export function downloadResumeClsFile() {
  const content = generateResumeClsContent()
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'resume.cls'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Delay between downloads to prevent browser blocking multiple simultaneous downloads
const DOWNLOAD_DELAY_MS = 500

// Download both files as a simple bundle (download one after another)
export function downloadLatexBundle(resume: StructuredResume, highlightChanges: boolean = false) {
  // Download the .tex file
  downloadLatexFile(resume, 'resume.tex', highlightChanges)
  
  // Download the .cls file after a short delay to prevent browser download blocking
  setTimeout(() => {
    downloadResumeClsFile()
  }, DOWNLOAD_DELAY_MS)
}

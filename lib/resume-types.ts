// Structured resume data model for easy editing and PDF generation
export interface ResumeSection {
  id: string
  type: 'summary' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects' | 'other'
  title: string
  content: string
  isModified?: boolean
  originalContent?: string
}

export interface ExperienceEntry {
  id: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate: string
  achievements: string[]
  isModified?: boolean
  originalAchievements?: string[]
}

export interface EducationEntry {
  id: string
  degree: string
  school: string
  location?: string
  graduationDate: string
  gpa?: string
  honors?: string[]
}

export interface StructuredResume {
  id: string
  // Contact Info
  name: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  website?: string
  
  // Sections
  summary: string
  originalSummary?: string
  summaryModified?: boolean
  
  skills: string[]
  originalSkills?: string[]
  skillsModified?: boolean
  
  experience: ExperienceEntry[]
  education: EducationEntry[]
  
  certifications?: string[]
  projects?: ResumeSection[]
  
  // Raw text fallback
  rawText?: string
}

// Generate a unique ID (works in all environments)
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// Parse raw text into structured resume
export function parseResumeText(text: string): StructuredResume {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  const resume: StructuredResume = {
    id: generateId(),
    name: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    rawText: text,
  }
  
  // Try to extract name (usually first non-empty line)
  if (lines.length > 0) {
    // Check if first line looks like a name (no special chars, reasonable length)
    const firstLine = lines[0]
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('•')) {
      resume.name = firstLine
    }
  }
  
  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  if (emailMatch) {
    resume.email = emailMatch[0]
  }
  
  // Extract phone
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}/)
  if (phoneMatch) {
    resume.phone = phoneMatch[0]
  }
  
  // Extract LinkedIn
  const linkedInMatch = text.match(/linkedin\.com\/in\/[\w-]+/)
  if (linkedInMatch) {
    resume.linkedin = 'https://' + linkedInMatch[0]
  }
  
  // Find sections by common headers
  const sectionPatterns = {
    summary: /^(summary|profile|objective|about)/i,
    skills: /^(skills|technical skills|core competencies|expertise)/i,
    experience: /^(experience|work experience|employment|professional experience)/i,
    education: /^(education|academic|qualifications)/i,
    certifications: /^(certifications|certificates|licenses)/i,
    projects: /^(projects|portfolio)/i,
  }
  
  let currentSection: string | null = null
  let sectionContent: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let foundSection = false
    
    // Check if this line is a section header
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        // Save previous section
        if (currentSection && sectionContent.length > 0) {
          saveSectionContent(resume, currentSection, sectionContent.join('\n'))
        }
        currentSection = section
        sectionContent = []
        foundSection = true
        break
      }
    }
    
    if (!foundSection && currentSection) {
      sectionContent.push(line)
    }
  }
  
  // Save last section
  if (currentSection && sectionContent.length > 0) {
    saveSectionContent(resume, currentSection, sectionContent.join('\n'))
  }
  
  // If no summary found, try to extract first paragraph as summary
  if (!resume.summary && lines.length > 2) {
    const potentialSummary = lines.slice(1, 5).join(' ')
    if (potentialSummary.length > 50 && potentialSummary.length < 500) {
      resume.summary = potentialSummary
    }
  }
  
  return resume
}

function saveSectionContent(resume: StructuredResume, section: string, content: string) {
  switch (section) {
    case 'summary':
      resume.summary = content
      break
    case 'skills':
      // Parse skills - split by common delimiters
      const skillsList = content
        .split(/[,•|·\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 50)
      resume.skills = skillsList
      break
    case 'experience':
      // Parse experience entries
      resume.experience = parseExperience(content)
      break
    case 'education':
      resume.education = parseEducation(content)
      break
    case 'certifications':
      resume.certifications = content.split('\n').map(s => s.trim()).filter(s => s.length > 0)
      break
  }
}

function parseExperience(content: string): ExperienceEntry[] {
  const entries: ExperienceEntry[] = []
  const lines = content.split('\n').filter(l => l.trim())
  
  let currentEntry: Partial<ExperienceEntry> | null = null
  let achievements: string[] = []
  
  for (const line of lines) {
    // Check if this looks like a job title line (usually contains title and company)
    const titleCompanyMatch = line.match(/^(.+?)\s*(?:at|@|-|–|,)\s*(.+?)(?:\s*\||$)/i)
    const dateMatch = line.match(/(\d{4}|\w+\s+\d{4})\s*[-–]\s*(\d{4}|present|current)/i)
    
    if (titleCompanyMatch || (line.length < 100 && !line.startsWith('•') && !line.startsWith('-'))) {
      // Save previous entry
      if (currentEntry && currentEntry.title) {
        entries.push({
          id: generateId(),
          title: currentEntry.title || '',
          company: currentEntry.company || '',
          location: currentEntry.location,
          startDate: currentEntry.startDate || '',
          endDate: currentEntry.endDate || '',
          achievements: achievements,
        })
        achievements = []
      }
      
      currentEntry = {}
      if (titleCompanyMatch) {
        currentEntry.title = titleCompanyMatch[1].trim()
        currentEntry.company = titleCompanyMatch[2].trim()
      } else {
        currentEntry.title = line
      }
      
      if (dateMatch) {
        currentEntry.startDate = dateMatch[1]
        currentEntry.endDate = dateMatch[2]
      }
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      // This is an achievement bullet
      achievements.push(line.replace(/^[•\-*]\s*/, '').trim())
    } else if (dateMatch && currentEntry) {
      currentEntry.startDate = dateMatch[1]
      currentEntry.endDate = dateMatch[2]
    }
  }
  
  // Save last entry
  if (currentEntry && currentEntry.title) {
    entries.push({
      id: generateId(),
      title: currentEntry.title || '',
      company: currentEntry.company || '',
      location: currentEntry.location,
      startDate: currentEntry.startDate || '',
      endDate: currentEntry.endDate || '',
      achievements: achievements,
    })
  }
  
  return entries
}

function parseEducation(content: string): EducationEntry[] {
  const entries: EducationEntry[] = []
  const lines = content.split('\n').filter(l => l.trim())
  
  // Simple parsing - each significant line could be an education entry
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Look for degree keywords
    if (/bachelor|master|phd|associate|degree|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?b\.?a\.?/i.test(line)) {
      const entry: EducationEntry = {
        id: generateId(),
        degree: line,
        school: lines[i + 1] || '',
        graduationDate: '',
      }
      
      // Try to find graduation date
      const dateMatch = line.match(/\d{4}/) || lines[i + 1]?.match(/\d{4}/)
      if (dateMatch) {
        entry.graduationDate = dateMatch[0]
      }
      
      entries.push(entry)
    }
  }
  
  return entries
}

// Apply improvements to structured resume
export function applyImprovements(
  original: StructuredResume,
  improvements: {
    summary?: string
    skills?: string[]
    experience?: { id: string; achievements: string[] }[]
  }
): StructuredResume {
  const improved: StructuredResume = { ...original }
  
  if (improvements.summary && improvements.summary !== original.summary) {
    improved.originalSummary = original.summary
    improved.summary = improvements.summary
    improved.summaryModified = true
  }
  
  if (improvements.skills) {
    improved.originalSkills = original.skills
    improved.skills = improvements.skills
    improved.skillsModified = true
  }
  
  if (improvements.experience) {
    improved.experience = original.experience.map(exp => {
      const improvement = improvements.experience?.find(i => i.id === exp.id)
      if (improvement) {
        return {
          ...exp,
          originalAchievements: exp.achievements,
          achievements: improvement.achievements,
          isModified: true,
        }
      }
      return exp
    })
  }
  
  return improved
}

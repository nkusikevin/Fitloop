import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

// Clean up extracted PDF text
function cleanPdfText(text: string): string {
  if (!text) return ''
  
  let cleaned = text
  
  // Decode common HTML entities
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
    '&copy;': '©',
    '&reg;': '®',
  }
  
  for (const [entity, char] of Object.entries(htmlEntities)) {
    cleaned = cleaned.replace(new RegExp(entity, 'g'), char)
  }
  
  // Remove common garbage characters from PDF extraction
  // These include control characters and encoding artifacts
  cleaned = cleaned.replace(/[%Ï\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Add spaces between lowercase-uppercase transitions (camelCase fix)
  // e.g., "UniversityOfRwanda" -> "University Of Rwanda"
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2')
  
  // Add spaces after periods followed by uppercase (sentence boundaries)
  // But avoid breaking abbreviations like "Ph.D" or "U.S.A"
  cleaned = cleaned.replace(/\.([A-Z][a-z])/g, '. $1')
  
  // Add spaces after commas if missing
  cleaned = cleaned.replace(/,([^\s])/g, ', $1')
  
  // Fix common PDF extraction issues with bullet points
  cleaned = cleaned.replace(/•([^\s])/g, '• $1')
  cleaned = cleaned.replace(/\*([^\s\*])/g, '* $1')
  
  // Normalize multiple spaces to single space
  cleaned = cleaned.replace(/[ \t]+/g, ' ')
  
  // Normalize multiple newlines to double newline (paragraph break)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  
  // Trim whitespace from each line
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .join('\n')
  
  // Remove empty lines at start and end
  cleaned = cleaned.trim()
  
  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const data = await pdfParse(buffer)
    
    // Clean up the extracted text
    const cleanedText = cleanPdfText(data.text)
    
    return NextResponse.json({ 
      text: cleanedText,
      numPages: data.numpages,
      info: data.info
    })
  } catch (error) {
    console.error('PDF parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    )
  }
}

// Client-side PDF text extraction via API
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Convert ArrayBuffer to File for FormData
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const file = new File([blob], 'resume.pdf', { type: 'application/pdf' })
    
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to parse PDF')
    }
    
    return data.text
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}


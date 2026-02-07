'use server'

import pdfParse from 'pdf-parse'

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const data = await pdfParse(Buffer.from(arrayBuffer))
    return data.text
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

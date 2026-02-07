'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, FileText, Star, Trash2, Loader2 } from 'lucide-react'
import { extractTextFromPDF } from '@/lib/pdf-utils'
import { createClient } from '@/lib/supabase/client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Resume {
    id: string
    file_name: string
    file_path: string
    file_size: number
    resume_text: string
    is_default: boolean
    created_at: string
}

interface ResumeManagerProps {
    onResumeSelect?: (resumeText: string, fileName: string) => void
}

export function ResumeManager({ onResumeSelect }: ResumeManagerProps) {
    const [resumes, setResumes] = useState<Resume[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchResumes()
    }, [])

    const fetchResumes = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/resumes')
            const data = await response.json()

            if (response.ok) {
                setResumes(data.resumes || [])

                // Auto-select default resume if exists
                const defaultResume = data.resumes?.find((r: Resume) => r.is_default)
                if (defaultResume && onResumeSelect) {
                    onResumeSelect(defaultResume.resume_text, defaultResume.file_name)
                }
            } else {
                setError(data.error || 'Failed to fetch resumes')
            }
        } catch (err) {
            setError('Failed to fetch resumes')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.includes('pdf')) {
            setError('Please upload a PDF file')
            return
        }

        setError('')
        setIsUploading(true)

        try {
            // Extract text from PDF
            const arrayBuffer = await file.arrayBuffer()
            const resumeText = await extractTextFromPDF(arrayBuffer)

            // Create form data
            const formData = new FormData()
            formData.append('file', file)
            formData.append('resumeText', resumeText)
            formData.append('isDefault', String(resumes.length === 0)) // First resume is default

            // Upload to API
            const response = await fetch('/api/resumes', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (response.ok) {
                await fetchResumes()
                if (onResumeSelect) {
                    onResumeSelect(resumeText, file.name)
                }
            } else {
                setError(data.error || 'Failed to upload resume')
            }
        } catch (err) {
            setError('Failed to process resume')
            console.error(err)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleSetDefault = async (resumeId: string) => {
        try {
            const response = await fetch('/api/resumes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId, isDefault: true }),
            })

            if (response.ok) {
                await fetchResumes()
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to set default resume')
            }
        } catch (err) {
            setError('Failed to update resume')
            console.error(err)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const response = await fetch(`/api/resumes?id=${deleteId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                await fetchResumes()
                setDeleteId(null)
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to delete resume')
            }
        } catch (err) {
            setError('Failed to delete resume')
            console.error(err)
        }
    }

    const handleSelectResume = (resume: Resume) => {
        if (onResumeSelect) {
            onResumeSelect(resume.resume_text, resume.file_name)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Saved Resumes</h3>
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    size="sm"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Resume
                        </>
                    )}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : resumes.length === 0 ? (
                <Card className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No resumes saved yet</p>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Your First Resume
                    </Button>
                </Card>
            ) : (
                <div className="space-y-2">
                    {resumes.map((resume) => (
                        <Card
                            key={resume.id}
                            className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => handleSelectResume(resume)}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium truncate">{resume.file_name}</p>
                                        {resume.is_default && (
                                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(resume.file_size)} • {formatDate(resume.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {!resume.is_default && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSetDefault(resume.id)}
                                        title="Set as default"
                                    >
                                        <Star className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteId(resume.id)}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this resume? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

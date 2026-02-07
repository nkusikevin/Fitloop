'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, LogOut, TrendingUp, FileText, Target, Calendar, Settings } from 'lucide-react'
import Link from 'next/link'

interface AnalysisStats {
    totalAnalyses: number
    averageScore: number
    lastAnalysisDate: string | null
    topSkills: string[]
    commonGaps: string[]
    recentSessions: any[]
}

export default function ProfilePage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<AnalysisStats>({
        totalAnalyses: 0,
        averageScore: 0,
        lastAnalysisDate: null,
        topSkills: [],
        commonGaps: [],
        recentSessions: [],
    })
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        fetchUserAndStats()
    }, [])

    const fetchUserAndStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }
            setUser(user)

            // Fetch resume sessions
            const { data: sessions, error } = await supabase
                .from('resume_sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching sessions:', error)
                return
            }

            // Calculate statistics
            const totalAnalyses = sessions?.length || 0

            // Calculate average score from gap_analysis JSON
            let totalScore = 0
            let scoreCount = 0
            const allSkills: string[] = []
            const allGaps: string[] = []

            sessions?.forEach((session: any) => {
                if (session.gap_analysis?.overall_score) {
                    totalScore += session.gap_analysis.overall_score
                    scoreCount++
                }
                if (session.gap_analysis?.matched_skills) {
                    allSkills.push(...session.gap_analysis.matched_skills)
                }
                if (session.gap_analysis?.missing_skills) {
                    allGaps.push(...session.gap_analysis.missing_skills)
                }
            })

            const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

            // Get top 5 most common skills
            const skillCounts = allSkills.reduce((acc: any, skill) => {
                acc[skill] = (acc[skill] || 0) + 1
                return acc
            }, {})
            const topSkills = Object.entries(skillCounts)
                .sort(([, a]: any, [, b]: any) => b - a)
                .slice(0, 5)
                .map(([skill]) => skill)

            // Get top 5 most common gaps
            const gapCounts = allGaps.reduce((acc: any, gap) => {
                acc[gap] = (acc[gap] || 0) + 1
                return acc
            }, {})
            const commonGaps = Object.entries(gapCounts)
                .sort(([, a]: any, [, b]: any) => b - a)
                .slice(0, 5)
                .map(([gap]) => gap)

            setStats({
                totalAnalyses,
                averageScore,
                lastAnalysisDate: sessions?.[0]?.created_at || null,
                topSkills,
                commonGaps,
                recentSessions: sessions?.slice(0, 5) || [],
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/50">
                <div className="px-6 md:px-12 py-4 flex items-center justify-between">
                    <Link href="/protected" className="flex items-center gap-3">
                        <span className="font-display text-2xl tracking-wider">FITLOOP</span>
                        <span className="label-mono text-muted-foreground hidden md:inline">PROFILE</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/settings">
                            <Button
                                variant="outline"
                                className="gap-2 bg-transparent border-border/50 hover:border-accent hover:text-accent font-mono uppercase text-[10px] tracking-widest"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                Settings
                            </Button>
                        </Link>
                        <Link href="/protected">
                            <Button
                                variant="outline"
                                className="gap-2 bg-transparent border-border/50 hover:border-accent hover:text-accent font-mono uppercase text-[10px] tracking-widest"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Dashboard
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className="gap-2 bg-transparent border-border/50 hover:border-accent hover:text-accent font-mono uppercase text-[10px] tracking-widest"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container max-w-6xl mx-auto py-10 px-6">
                {loading ? (
                    <div className="text-center py-20">
                        <p className="font-mono text-muted-foreground">Loading profile...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* User Info */}
                        <div className="text-center space-y-2">
                            <h1 className="font-display text-4xl tracking-wider">YOUR PROFILE</h1>
                            <p className="label-mono text-muted-foreground">{user?.email}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription className="label-mono text-accent">TOTAL ANALYSES</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-8 w-8 text-accent" />
                                        <span className="font-display text-4xl">{stats.totalAnalyses}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription className="label-mono text-accent">AVERAGE SCORE</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-8 w-8 text-accent" />
                                        <span className="font-display text-4xl">{stats.averageScore}%</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription className="label-mono text-accent">TOP SKILLS</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <Target className="h-8 w-8 text-accent" />
                                        <span className="font-display text-4xl">{stats.topSkills.length}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription className="label-mono text-accent">LAST ANALYSIS</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-8 w-8 text-accent" />
                                        <span className="font-mono text-sm">
                                            {stats.lastAnalysisDate ? formatDate(stats.lastAnalysisDate) : 'N/A'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Skills */}
                        {stats.topSkills.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-accent" />
                                        Most Matched Skills
                                    </CardTitle>
                                    <CardDescription>Skills that frequently appear in your analyses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {stats.topSkills.map((skill, i) => (
                                            <div key={i} className="bg-accent/5 border border-accent/20 px-4 py-2.5 font-mono text-xs text-accent">
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Common Gaps */}
                        {stats.commonGaps.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-yellow-500" />
                                        Most Common Skill Gaps
                                    </CardTitle>
                                    <CardDescription>Skills you should focus on developing</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {stats.commonGaps.map((gap, i) => (
                                            <div key={i} className="bg-yellow-500/5 border border-yellow-500/20 px-4 py-2.5 font-mono text-xs text-yellow-500">
                                                {gap}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Sessions */}
                        {stats.recentSessions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-accent" />
                                        Recent Analyses
                                    </CardTitle>
                                    <CardDescription>Your latest resume analyses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {stats.recentSessions.map((session: any) => (
                                            <div key={session.id} className="border border-border/50 p-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="label-mono text-accent">
                                                        {formatDate(session.created_at)}
                                                    </span>
                                                    {session.gap_analysis?.overall_score && (
                                                        <span className="font-display text-2xl text-accent">
                                                            {session.gap_analysis.overall_score}%
                                                        </span>
                                                    )}
                                                </div>
                                                {session.fit_summary && (
                                                    <p className="font-mono text-xs text-muted-foreground line-clamp-2">
                                                        {session.fit_summary}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {stats.totalAnalyses === 0 && (
                            <div className="text-center py-20 space-y-4">
                                <p className="font-mono text-muted-foreground">
                                    No analyses yet. Start analyzing your resume to see statistics!
                                </p>
                                <Link href="/protected">
                                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase text-xs tracking-widest">
                                        Start Analysis
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

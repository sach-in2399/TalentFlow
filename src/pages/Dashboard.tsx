import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, ClipboardList, TrendingUp, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const jobs = useLiveQuery(() => db.jobs.where('status').equals('active').toArray());
  const allJobs = useLiveQuery(() => db.jobs.toArray());
  const candidates = useLiveQuery(() => db.candidates.toArray());
  const assessments = useLiveQuery(() => db.assessments.toArray());

  const activeJobsCount = jobs?.length || 0;
  const totalCandidates = candidates?.length || 0;
  const activeCandidates = candidates?.filter(c => !['hired', 'rejected'].includes(c.stage)).length || 0;
  const assessmentsCount = assessments?.length || 0;

  return (
    <div className="gradient-subtle min-h-[calc(100vh-4rem)]">
      <div className="container py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Welcome to TalentFlow
            </h1>
            <p className="text-lg text-muted-foreground">
              Your comprehensive hiring management platform
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-primary/20 shadow-elegant transition-smooth hover:shadow-glow hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{activeJobsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {allJobs?.length || 0} total jobs
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-elegant transition-smooth hover:shadow-glow hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{totalCandidates}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeCandidates} in pipeline
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-elegant transition-smooth hover:shadow-glow hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessments</CardTitle>
                <ClipboardList className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{assessmentsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active assessments
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-elegant transition-smooth hover:shadow-glow hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {totalCandidates > 0 
                    ? Math.round((candidates?.filter(c => c.stage === 'hired').length || 0) / totalCandidates * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Conversion rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/jobs">
                  <Button className="w-full justify-between gradient-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-elegant">
                    Manage Jobs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/candidates">
                  <Button variant="outline" className="w-full justify-between hover:bg-accent transition-smooth">
                    View Candidates
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/assessments">
                  <Button variant="outline" className="w-full justify-between hover:bg-accent transition-smooth">
                    Create Assessment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates in your hiring pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates?.slice(0, 5).map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          Stage: {candidate.stage}
                        </p>
                      </div>
                      <Link to={`/candidates/${candidate.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

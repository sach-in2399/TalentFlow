import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Archive, Users } from 'lucide-react';

export default function JobDetail() {
  const { jobId } = useParams();
  const job = useLiveQuery(() => jobId ? db.jobs.get(jobId) : undefined, [jobId]);
  const candidates = useLiveQuery(
    () => jobId ? db.candidates.where('jobId').equals(jobId).toArray() : [],
    [jobId]
  );

  if (!job) {
    return (
      <div className="gradient-subtle min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job not found</h2>
          <Link to="/jobs">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-subtle min-h-[calc(100vh-4rem)]">
      <div className="container py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/jobs">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>

          <Card className="shadow-elegant mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-10xl">{job.title}</CardTitle>
                    <Badge 
                      variant={job.status === 'active' ? 'default' : 'secondary'}
                      className={job.status === 'active' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Slug: /{job.slug}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    {job.status === 'active' ? 'Archive' : 'Unarchive'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{job.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground pt-4 border-t">
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {new Date(job.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Candidates ({candidates?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidates && candidates.length > 0 ? (
                <div className="space-y-2">
                  {candidates.slice(0, 10).map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-smooth"
                    >
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {candidate.stage}
                      </Badge>
                    </div>
                  ))}
                  {candidates.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{candidates.length - 10} more candidates
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No candidates yet for this job
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

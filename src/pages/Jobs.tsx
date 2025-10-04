// src/components/Jobs.tsx
import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Job , JobStatus} from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Archive, RotateCcw,X } from "lucide-react";
import { Link } from "react-router-dom";

async function toggleArchive(jobId: string) {
  try {
    const current = await db.jobs.get(jobId);
    if (!current) return;

    const newStatus = current.status === "active" ? "archived" : "active";

    await db.jobs.update(jobId, {
      status: newStatus,
      updatedAt: new Date(),
    });
  } catch (err) {
    console.error("Failed to toggle archive", err);
  }
}

function JobListItem({ job }: { job: Job }) {
  const isArchived = job.status === "archived";
  const ActionIcon = isArchived ? RotateCcw : Archive;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-background shadow-sm">
      {isArchived ? (
        <span className="font-medium text-muted-foreground">{job.title}</span>
      ) : (
        <Link to={`/jobs/${job.id}`} className="font-medium hover:underline">
          {job.title}
        </Link>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          toggleArchive(job.id);
        }}
        title={isArchived ? "Restore Job" : "Archive Job"}
      >
        <ActionIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
      </Button>
    </div>
  );
}

export function Jobs() {
  const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [createStatus, setCreateStatus] = useState<JobStatus>("active");
    const [isCreating, setIsCreating] = useState(false);
  // akslfd;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("active");
   const makeSlug = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

   const resetCreateForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setCreateStatus("active");
  };

  // create handler
    const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    setIsCreating(true);
    try {
      let nextOrder = 1;
      const last = await db.jobs.orderBy("order").last();
      if (last?.order != null) nextOrder = last.order + 1;

      const newJob: Job = {
        id: crypto.randomUUID(),
        title: title.trim(),
        slug: makeSlug(title),
        description: description.trim(),
        tags,
        status: createStatus,
        order: nextOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.jobs.add(newJob);

      resetCreateForm();
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create job:", err);
      alert("Failed to create job — check console for details.");
    } finally {
      setIsCreating(false);
    }
  };

  // If schema doesn't have createdAt, this won't throw
  const allJobs =
    useLiveQuery(async () => {
      try {
        if (db.jobs.schema.idxByName["createdAt"]) {
          return await db.jobs.orderBy("createdAt").reverse().toArray();
        }
        return await db.jobs.toArray();
      } catch (err) {
        console.error("Dexie query failed", err);
        return [];
      }
    }, []) ?? [];

  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allJobs, searchTerm, statusFilter]);

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Jobs
              </h1>
              <p className="text-muted-foreground">
                Manage your job postings and hiring pipeline
              </p>
            </div>
            <Button
              onClick={() => setShowCreate((p) => !p)}
              className="gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 transition-smooth"
            >
              {showCreate ? (
                <X className="h-4 w-4 mr-1.5" />
              ) : (
                <Plus className="h-4 w-4 mr-1.5" />
              )}
              {showCreate ? "Cancel" : "Create Job"}
            </Button>
          </div>

      {/* create job form */}
          {showCreate && (
            <Card className="mb-6 shadow-elegant">
              <CardHeader>
                <CardTitle>Create a New Job</CardTitle>
                <CardDescription>Fill in the details below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <Input
                    placeholder="Job title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={tags.join(", ")}
                    onChange={(e) =>
                      setTags(
                        e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={createStatus === "active" ? "default" : "outline"}
                      onClick={() => setCreateStatus("active")}
                      className={
                        createStatus === "active"
                          ? "gradient-primary text-primary-foreground"
                          : ""
                      }
                    >
                      Active
                    </Button>
                    <Button
                      type="button"
                      variant={createStatus === "archived" ? "default" : "outline"}
                      onClick={() => setCreateStatus("archived")}
                      className={
                        createStatus === "archived"
                          ? "gradient-primary text-primary-foreground"
                          : ""
                      }
                    >
                      Archived
                    </Button>
                  </div>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Save Job"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

      {/* Search & Filters */}
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "archived"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                onClick={() => setStatusFilter(s)}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === "archived" ? "Archived Jobs" : "Jobs"}
          </CardTitle>
          <CardDescription>
            {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobListItem key={job.id} job={job} />)
            ) : (
              <p className="text-muted-foreground text-sm">
                No jobs match the current criteria.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
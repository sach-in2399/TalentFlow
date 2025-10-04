// db.ts
import Dexie, { Table } from "dexie";

export type JobStatus = "active" | "archived";
export type CandidateStage =
  | "applied"
  | "screen"
  | "tech"
  | "offer"
  | "hired"
  | "rejected";

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: JobStatus;
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  stage: CandidateStage;
  appliedAt: Date;
  notes: Note[];
  stageHistory: StageChange[];
  updatedAt?: Date;
}

export interface Note {
  id: string;
  content: string;
  mentions: string[];
  createdAt: Date;
  createdBy: string;
}

export interface StageChange {
  id: string;
  from: CandidateStage | null;
  to: CandidateStage;
  changedAt: Date;
  changedBy: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  sections: AssessmentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: Question[];
}

export type QuestionType =
  | "single-choice"
  | "multi-choice"
  | "short-text"
  | "long-text"
  | "numeric"
  | "file-upload";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
  numericRange?: { min: number; max: number };
  maxLength?: number;
  conditionalOn?: { questionId: string; value: string | string[] };
}

export interface CandidateResponse {
  id: string;
  candidateId: string;
  assessmentId: string;
  responses: { [questionId: string]: any };
  submittedAt: Date;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  assessments!: Table<Assessment, string>;
  candidateResponses!: Table<CandidateResponse, string>;

  constructor() {
    super("TalentFlowDB");

    this.version(1).stores({
      jobs: "id, slug, status, order",
      candidates: "id, jobId, stage, email",
      assessments: "id, jobId",
      candidateResponses: "id, candidateId, assessmentId",
    });
  }

  /** Get all assessments with fixed date parsing */
  async getAssessments(): Promise<Assessment[]> {
    const raw = await this.assessments.toArray();
    return raw.map((a) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      updatedAt: new Date(a.updatedAt),
      sections: a.sections.map((s) => ({
        ...s,
        questions: s.questions.map((q) => ({ ...q })),
      })),
    }));
  }

  /** Get assessment by jobId */
  async getAssessmentByJob(jobId: string): Promise<Assessment | undefined> {
    const result = await this.assessments.where("jobId").equals(jobId).first();
    if (!result) return undefined;
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  /** Save a new assessment */
  async saveAssessment(assessment: Assessment): Promise<void> {
    await this.assessments.put(assessment);
  }

  /** Update assessment by ID */
  async updateAssessment(id: string, updates: Partial<Assessment>) {
    const existing = await this.assessments.get(id);
    if (!existing) throw new Error("Assessment not found");

    const updated: Assessment = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    await this.assessments.put(updated);
  }

  /** Submit candidate responses */
  async submitResponse(response: CandidateResponse): Promise<void> {
    await this.candidateResponses.add(response);
  }

  /** Get submissions for an assessment */
  async getResponsesForAssessment(
    assessmentId: string
  ): Promise<CandidateResponse[]> {
    return this.candidateResponses.where("assessmentId").equals(assessmentId).toArray();
  }
}

export const db = new TalentFlowDB();

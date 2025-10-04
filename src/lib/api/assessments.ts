// src/assessments.ts
import { db, Assessment, CandidateResponse } from "../db";
import { v4 as uuidv4 } from "uuid";

/** Get assessment by jobId */
export async function getAssessmentByJobId(
  jobId: string
): Promise<Assessment | null> {
  const assessment = await db.getAssessmentByJob(jobId);
  return assessment ?? null;
}

/** Update assessment (by jobId) */
export async function updateAssessment(
  jobId: string,
  updated: Assessment
): Promise<void> {
  const existing = await getAssessmentByJobId(jobId);
  if (!existing) throw new Error("Assessment not found");

  await db.updateAssessment(existing.id, {
    ...updated,
    updatedAt: new Date(),
  });
}

/** Submit a candidate response to an assessment */
export async function submitAssessmentResponse(
  jobId: string,
  raw: Record<string, any>
): Promise<void> {
  const assessment = await getAssessmentByJobId(jobId);
  if (!assessment) throw new Error("Assessment not found");

  const response: CandidateResponse = {
    id: uuidv4(),
    candidateId: raw.candidateId ?? "unknown",
    assessmentId: assessment.id,
    responses: raw.responses ?? {},
    submittedAt: new Date(),
  };

  await db.submitResponse(response);
}

/** Get all responses for a given job’s assessment */
export async function getResponsesByJobId(
  jobId: string
): Promise<CandidateResponse[]> {
  const assessment = await getAssessmentByJobId(jobId);
  if (!assessment) return [];

  return await db.getResponsesForAssessment(assessment.id);
}

// re-export the type for convenience
export type { Assessment } from "../db";

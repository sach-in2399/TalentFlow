// src/handlers.ts
import { HttpResponse, http as rest } from "msw";
import {
  getAssessmentByJobId,
  updateAssessment,
  submitAssessmentResponse,
  getResponsesByJobId,
  Assessment,
} from "./assessments";

// Define the base URL for your mock API
const API_URL = "/api";
interface REQ{
  name:string
}
export const handlers = [
  // GET /assessments/:jobId
  rest.get(
    `${API_URL}/assessments/:jobId`, ({params})=>{
      const {jobId}=params
    }
  ),
  rest.get(
    `${API_URL}/assessments/:jobId`,
    async (
      {params}
    )=> {
    const jobId = params.jobId as string;
    try {
      console.log('DEV HERE')
      const assessment = await getAssessmentByJobId(jobId);
      if (!assessment) {
        // return res(ctx.status(404), ctx.json({ error: "Assessment not found" }));
        return new HttpResponse('Assement not found', {status: 404})
      }
      // return res(ctx.status(200), ctx.json(assessment));
      return HttpResponse.json(assessment)
    } catch (err: any) {
      // return res(ctx.status(500), ctx.json({ error: err.message }));
      return new HttpResponse('error', { status: 500 })
    }
  }),

  // PUT /assessments/:jobId
  rest.put(`${API_URL}/assessments/:jobId`, async ({params, request}) => {
    const { jobId } = params as { jobId: string };
    const body = await request.json() as Assessment;
    try {
      await updateAssessment(jobId, body);
      // return res(ctx.status(200), ctx.json({ success: true }));
      return new HttpResponse('Successfullt updated', {status:200})
    } catch (err: any) {
      // return res(ctx.status(500), ctx.json({ error: err.message }));
      return new HttpResponse(err.message, { status: 500 })
    }
  }),

  // POST /assessments/:jobId/submit
  rest.post(`${API_URL}/assessments/:jobId/submit`, async ({params, request}) => {
    const { jobId } = params as { jobId: string };
    const body = await request.json()as Assessment;
    try {
      await submitAssessmentResponse(jobId, body);
      // return res(ctx.status(200), ctx.json({ success: true }));
      return new HttpResponse('Success', {status:200} )
    } catch (err: any) {
      // return res(ctx.status(500), ctx.json({ error: err.message }));
      return new HttpResponse('error', { status: 500 })
    }
  }),

  // // GET /assessments/:jobId/responses
  rest.get(`${API_URL}/assessments/:jobId/responses`, async ({params}) => {
    const { jobId } = params as { jobId: string };
    try {
      const responses = await getResponsesByJobId(jobId);
      // return res(ctx.status(200), ctx.json(responses));
      return new HttpResponse('Success', {status:200})
    } catch (err: any) {
      // return res(ctx.status(500), ctx.json({ error: err.message }));
      return new HttpResponse('error', { status: 500 })
    }
  }),
];

// src/pages/AssessmentDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Assessment,
  getAssessmentByJobId,
  updateAssessment,
  submitAssessmentResponse,
} from "../lib/api/assessments";

const AssessmentDetail = () => {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const loadData = async () => {
      if (!jobId) return;
      const data = await getAssessmentByJobId(jobId);
      console.log("DATA",data)
      if (data) setAssessment(data);
    };
    loadData();
  }, [jobId]);

  if (!assessment) return <p>Loading assessment...</p>;

  // Single-choice & short/long/numeric/file input
  const handleChange = (qid: string, value: any) => {
    setResponses((prev) => ({ ...prev, [qid]: value }));
  };

  // Multi-choice checkbox toggle
  const handleMultiChoice = (qid: string, value: string) => {
    setResponses((prev) => {
      const prevValues = prev[qid] || [];
      if (prevValues.includes(value)) {
        return { ...prev, [qid]: prevValues.filter((v: string) => v !== value) };
      } else {
        return { ...prev, [qid]: [...prevValues, value] };
      }
    });
  };

  const handleSave = async () => {
    if (!jobId || !assessment) return;
    await updateAssessment(jobId, assessment);
    alert("Assessment updated!");
  };

  const handleSubmit = async () => {
    if (!jobId || !assessment) return;
    await submitAssessmentResponse(jobId, responses);
    alert("Responses submitted!");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{assessment.title}</h1>

      {assessment.sections.map((section) => (
        <div key={section.id} className="mb-6">
          <h2 className="text-lg font-semibold">{section.title}</h2>
          {section.questions.map((q) => (
            <div key={q.id} className="my-4">
              <label className="block font-medium mb-1">{q.title}</label>

              {q.type === "single-choice" &&
                q.options?.map((opt) => (
                  <div key={opt}>
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={responses[q.id] === opt}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                    <span className="ml-2">{opt}</span>
                  </div>
                ))}

              {q.type === "multi-choice" &&
                q.options?.map((opt) => (
                  <div key={opt}>
                    <input
                      type="checkbox"
                      checked={(responses[q.id] || []).includes(opt)}
                      onChange={() => handleMultiChoice(q.id, opt)}
                    />
                    <span className="ml-2">{opt}</span>
                  </div>
                ))}

              {q.type === "short-text" && (
                <input
                  type="text"
                  className="border p-2 w-full"
                  value={responses[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}

              {q.type === "long-text" && (
                <textarea
                  className="border p-2 w-full"
                  value={responses[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}

              {q.type === "numeric" && (
                <input
                  type="number"
                  className="border p-2 w-full"
                  value={responses[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}

              {q.type === "file-upload" && (
                <input
                  type="file"
                  onChange={(e) =>
                    handleChange(q.id, e.target.files?.[0]?.name || "")
                  }
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Save
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default AssessmentDetail;

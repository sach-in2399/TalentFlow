import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Jobs list
const jobs = [
  { id: "1", title: "Senior Frontend Developer" },
  { id: "2", title: "Backend Engineer" },
  { id: "3", title: "Full Stack Developer" },
  { id: "4", title: "Product Manager" },
  { id: "5", title: "UX/UI Designer" },
  { id: "6", title: "DevOps Engineer" },
  { id: "7", title: "Data Scientist" },
  { id: "8", title: "Mobile Developer (iOS)" },
];

type QuestionType = "single" | "multi" | "short" | "long" | "numeric" | "file";

interface Conditional {
  questionId: string;
  value: any;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  conditional?: Conditional[];
}

interface Assessment {
  id: string;
  jobId: string;
  title: string;
  questions: Question[];
}

export default function Assessments() {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedJobID, setSelectedJobID]=useState<string>();
  const [assessment, setAssessment] = useState<Assessment>({
    id: "a1",
    jobId: "",
    title: "",
    questions: [],
  });
  const [responses, setResponses] = useState<Record<string, any>>({});

  // Load responses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("assessment-responses");
    if (saved) setResponses(JSON.parse(saved));
  }, []);
  // useEffect(()=>{
  //   setSelectedJobID()
  // }, [selectedJob])

  useEffect(() => {
    localStorage.setItem("assessment-responses", JSON.stringify(responses));
  }, [responses]);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: "q" + (assessment.questions.length + 1),
      text: "New Question",
      type,
      options:
        type === "single" || type === "multi"
          ? ["Option 1", "Option 2"]
          : undefined,
    };
    setAssessment((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestionText = (id: string, text: string) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, text } : q
      ),
    }));
  };

  const updateOptionText = (qId: string, idx: number, newText: string) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options?.map((opt, i) =>
                i === idx ? newText : opt
              ),
            }
          : q
      ),
    }));
  };

  const addOption = (qId: string) => {
    setAssessment((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: [...(q.options || []), `Option ${q.options!.length + 1}`],
            }
          : q
      ),
    }));
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const saveAssessment = () => {
    const toSave = { ...assessment, jobId: selectedJob };
    localStorage.setItem("saved-assessment", JSON.stringify(toSave));
    alert("✅ Assessment saved successfully!");
  };

  /**
   * Recursive check for multi-level nested conditional questions
   */
  const showQuestion = (
    question: Question,
    visited: Set<string> = new Set()
  ): boolean => {
    if (!question.conditional || question.conditional.length === 0) return true;

    // Prevent circular dependencies
    if (visited.has(question.id)) return true;
    visited.add(question.id);

    return question.conditional.every((cond) => {
      const parentQuestion = assessment.questions.find(
        (q) => q.id === cond.questionId
      );
      if (!parentQuestion) return false;

      const parentValueMatches = responses[parentQuestion.id] === cond.value;

      return parentValueMatches && showQuestion(parentQuestion, visited);
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Job Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Job</CardTitle>
        </CardHeader>
        <CardContent>
            <Select value={selectedJob} onValueChange={(jobId) => {
              setSelectedJob(jobId);
              setSelectedJobID(jobId);
            }}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            {/* Display the selected Job ID */}
            <div className="mt-4 text-gray-700">
              <strong>JOB ID:</strong> {selectedJobID || "None selected"}
            </div>
        </CardContent>
      </Card>

      {/* Assessment Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" onClick={() => addQuestion("single")}>
              Single Choice
            </Button>
            <Button variant="outline" onClick={() => addQuestion("multi")}>
              Multiple Choice
            </Button>
            <Button variant="outline" onClick={() => addQuestion("short")}>
              Short Text
            </Button>
            <Button variant="outline" onClick={() => addQuestion("long")}>
              Long Text
            </Button>
            <Button variant="outline" onClick={() => addQuestion("numeric")}>
              Numeric
            </Button>
            <Button variant="outline" onClick={() => addQuestion("file")}>
              File Upload
            </Button>
          </div>

          {assessment.questions.map((q) => (
            <Card key={q.id} className="mb-3 border border-gray-700">
              <CardContent className="space-y-3">
                <Input
                  value={q.text}
                  onChange={(e) => updateQuestionText(q.id, e.target.value)}
                  placeholder="Question text"
                />

                {/* Options for single/multi choice */}
                {(q.type === "single" || q.type === "multi") && (
                  <div className="space-y-2">
                    {q.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {q.type === "single" ? (
                          <input
                            type="radio"
                            name={q.id}
                            checked={responses[q.id] === opt}
                            onChange={() => handleResponseChange(q.id, opt)}
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={(responses[q.id] || []).includes(opt)}
                            onChange={(e) =>
                              handleResponseChange(
                                q.id,
                                e.target.checked
                                  ? [...(responses[q.id] || []), opt]
                                  : (responses[q.id] || []).filter(
                                      (v: string) => v !== opt
                                    )
                              )
                            }
                          />
                        )}
                        <Input
                          value={opt}
                          onChange={(e) =>
                            updateOptionText(q.id, idx, e.target.value)
                          }
                          className="w-48"
                        />
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addOption(q.id)}
                    >
                      ➕ Add Option
                    </Button>
                  </div>
                )}

                {q.type === "short" && (
                  <Input
                    value={responses[q.id] || ""}
                    onChange={(e) => handleResponseChange(q.id, e.target.value)}
                  />
                )}

                {q.type === "long" && (
                  <textarea
                    value={responses[q.id] || ""}
                    onChange={(e) => handleResponseChange(q.id, e.target.value)}
                    className="w-full border rounded-md p-2"
                  />
                )}

                {q.type === "numeric" && (
                  <Input
                    type="number"
                    value={responses[q.id] || ""}
                    onChange={(e) => handleResponseChange(q.id, e.target.value)}
                  />
                )}

                {q.type === "file" && (
                  <Input
                    type="file"
                    onChange={(e) =>
                      handleResponseChange(q.id, e.target.files?.[0])
                    }
                  />
                )}
              </CardContent>
            </Card>
          ))}

          {/* Save Assessment */}
          <div className="mt-6">
            <Button onClick={saveAssessment} className="bg-purple-600 text-white">
               Save Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {assessment.questions.map(
            (q) =>
              showQuestion(q) && (
                <div key={q.id} className="mb-4">
                  <strong>{q.text}</strong>
                  <div className="mt-2">
                    {q.type === "single" &&
                      q.options?.map((opt, idx) => (
                        <label key={idx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={q.id}
                            checked={responses[q.id] === opt}
                            onChange={() => handleResponseChange(q.id, opt)}
                          />
                          {opt}
                        </label>
                      ))}

                    {q.type === "multi" &&
                      q.options?.map((opt, idx) => (
                        <label key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(responses[q.id] || []).includes(opt)}
                            onChange={(e) =>
                              handleResponseChange(
                                q.id,
                                e.target.checked
                                  ? [...(responses[q.id] || []), opt]
                                  : (responses[q.id] || []).filter(
                                      (v: string) => v !== opt
                                    )
                              )
                            }
                          />
                          {opt}
                        </label>
                      ))}

                    {q.type === "short" && <p>{responses[q.id]}</p>}
                    {q.type === "long" && <p>{responses[q.id]}</p>}
                    {q.type === "numeric" && <p>{responses[q.id]}</p>}
                    {q.type === "file" && <p>{responses[q.id]?.name}</p>}
                  </div>
                </div>
              )
          )}
        </CardContent>
      </Card>
    </div>
  );
}

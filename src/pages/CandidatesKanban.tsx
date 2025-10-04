// src/components/CandidatesKanban.tsx
import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Candidate, CandidateStage } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  searchTerm?: string;
  stageFilter?: CandidateStage | "all";
}

const stages: CandidateStage[] = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export default function CandidatesKanban({ searchTerm = "", stageFilter = "all" }: Props) {
  const allCandidates = useLiveQuery(() => db.candidates.toArray(), []);
  const sensors = useSensors(useSensor(PointerSensor));

  const filteredCandidates = useMemo(() => {
    if (!allCandidates) return [];
    return allCandidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = stageFilter === "all" || c.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [allCandidates, searchTerm, stageFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    for (const s of stages) map[s] = [];
    filteredCandidates.forEach((c) => {
      const key = c.stage ?? "unknown";
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map as Record<CandidateStage | string, Candidate[]>;
  }, [filteredCandidates]);

  const getStageList = (stageName: string) => grouped[stageName] ?? [];

  const handleDragOver = (event: DragOverEvent) => {
    // optional: highlight column on drag over
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = active.id?.toString();
    const overId = over.id?.toString();
    if (!activeId || !overId) return;

    // Move candidate to column if dropped on column
    if (stages.includes(overId as CandidateStage)) {
      const candidate = await db.candidates.get(activeId);
      if (!candidate) return;
      if (candidate.stage === overId) return;

      const newHistory = [
        ...candidate.stageHistory,
        {
          id: crypto.randomUUID(),
          from: candidate.stage,
          to: overId as CandidateStage,
          changedAt: new Date(),
          changedBy: "User",
        },
      ];

      await db.candidates.update(activeId, { stage: overId as CandidateStage, stageHistory: newHistory });
      return;
    }

    // Reorder or cross-stage move if dropped on another candidate
    const activeCandidate = filteredCandidates.find((c) => c.id === activeId);
    const overCandidate = filteredCandidates.find((c) => c.id === overId);
    if (!activeCandidate || !overCandidate) return;

    // Cross-stage move
    if (activeCandidate.stage !== overCandidate.stage) {
      const candidate = await db.candidates.get(activeId);
      if (!candidate) return;

      const newHistory = [
        ...candidate.stageHistory,
        {
          id: crypto.randomUUID(),
          from: candidate.stage,
          to: overCandidate.stage,
          changedAt: new Date(),
          changedBy: "User",
        },
      ];

      await db.candidates.update(activeId, { stage: overCandidate.stage, stageHistory: newHistory });
      return;
    }

    // Reorder within same stage
    const stageList = getStageList(activeCandidate.stage);
    const oldIndex = stageList.findIndex((c) => c.id === activeId);
    const newIndex = stageList.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(stageList, oldIndex, newIndex);
    for (const item of reordered) {
      await db.candidates.update(item.id, {}); // triggers live query refresh
    }
  };

  if (!allCandidates) return <p className="text-muted-foreground">Loading candidates...</p>;

  // calculate flex class for single-stage filter
  const containerClass =
    stageFilter === "all"
      ? "flex gap-4 overflow-x-auto"
      : "flex gap-4 overflow-x-auto justify-start";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={containerClass}>
        {stages
          .filter((stage) => stageFilter === "all" || stage === stageFilter)
          .map((stage) => {
            const items = grouped[stage] ?? [];
            return (
              <div
                key={stage}
                id={stage}
                className={
                  stageFilter === "all"
                    ? "flex-1 min-w-[250px] bg-blue-50 rounded-lg p-2 shadow-inner"
                    : "flex-[1_1_100%] bg-blue-50 rounded-lg p-2 shadow-inner"
                }
              >
                <h3 className="font-semibold mb-2 capitalize">{stage}</h3>

                <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <div>
                    {items.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">No candidates</div>
                    ) : (
                      items.map((candidate) => <KanbanCard key={candidate.id} candidate={candidate} />)
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
      </div>
    </DndContext>
  );
}

function KanbanCard({ candidate }: { candidate: Candidate }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: candidate.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Link to={`/candidates/${candidate.id}`}>
      <Card
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className="mb-2 shadow-elegant cursor-pointer hover:shadow-glow transition-smooth"
      >
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-sm">{candidate.name}</CardTitle>
          <Badge variant="default" className="text-xs">
            {candidate.stage}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{candidate.email}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

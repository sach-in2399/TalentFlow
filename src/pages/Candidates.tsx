// Candidates.tsx
import { useState, useMemo, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Candidate, CandidateStage } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Columns } from "lucide-react";
import { Link } from "react-router-dom";

// dnd-kit imports
import {
	DndContext,
	closestCenter,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const stages: CandidateStage[] = ["applied", "screen", "tech", "offer", "hired", "rejected"];

function getStageBadgeClass(stage: CandidateStage | string) {
	switch (stage) {
		case "applied": return "bg-sky-100 text-sky-800";
		case "screen": return "bg-yellow-100 text-yellow-800";
		case "tech": return "bg-indigo-100 text-indigo-800";
		case "offer": return "bg-amber-100 text-amber-800";
		case "hired": return "bg-emerald-600 text-white";
		case "rejected": return "bg-red-600 text-white";
		default: return "bg-gray-100 text-gray-800";
	}
}

function SortableCard({ candidate }: { candidate: Candidate }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: candidate.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 50 : "auto",
	} as any;

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<Link to={`/candidates/${candidate.id}`}>
				<Card className="shadow-elegant cursor-pointer hover:shadow-glow transition-smooth mb-2">
					<CardHeader className="flex justify-between items-center">
						<CardTitle className="text-sm">{candidate.name}</CardTitle>
						<Badge variant="default" className={`text-xs ${getStageBadgeClass(candidate.stage)}`}>
							{candidate.stage}
						</Badge>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">{candidate.email}</p>
					</CardContent>
				</Card>
			</Link>
		</div>
	);
}

export default function Candidates() {
	const [searchTerm, setSearchTerm] = useState("");
	const [stageFilter, setStageFilter] = useState<CandidateStage | "all">("all");
	const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
	const allCandidates = useLiveQuery(() => db.candidates.toArray(), []);

	// DnD sensors
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	// --- FIX: Filter candidates globally by search term first ---
	const globallyFilteredCandidates = useMemo(() => {
		const lowerSearch = searchTerm.toLowerCase();
		return (allCandidates || []).filter((c) => {
			return c.name.toLowerCase().includes(lowerSearch) || c.email.toLowerCase().includes(lowerSearch);
		});
	}, [allCandidates, searchTerm]);


	// Group candidates by stage (used for Kanban view)
	const grouped = useMemo(() => {
		const groups: Record<string, Candidate[]> = {};
		stages.forEach((s) => (groups[s] = []));
        
        // Use globallyFilteredCandidates instead of allCandidates
		(globallyFilteredCandidates || []).forEach((c) => {
			if (!groups[c.stage]) groups[c.stage] = [];
			groups[c.stage].push(c);
		});
		
		// Sorting logic remains the same
		Object.keys(groups).forEach((k) => {
			groups[k].sort((a, b) => {
				const ra = (a as any).rank;
				const rb = (b as any).rank;
				if (ra != null && rb != null) return ra - rb;
				const da = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
				const dbt = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
				return da - dbt;
			});
		});
		return groups;
	}, [globallyFilteredCandidates]); // Dependency now includes the search filter

	// Filtered candidates for list view (retains existing list-view filter logic)
	const filteredCandidates = useMemo(() => {
        // Start from globally filtered list
		return (globallyFilteredCandidates || []).filter((c) => {
			const matchesStage = stageFilter === "all" || c.stage === stageFilter;
			return matchesStage; // Search is already handled by globallyFilteredCandidates
		});
	}, [globallyFilteredCandidates, stageFilter]);

	const persistRanksForStage = async (stage: CandidateStage, orderedIds: string[]) => {
		for (let i = 0; i < orderedIds.length; i++) {
			const id = orderedIds[i];
			await db.candidates.update(id, { rank: i } as any);
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;
		const activeId = active.id as string;
		const overId = over.id as string;
		const moved = (allCandidates || []).find((c) => c.id === activeId);
		if (!moved) return;

		if (stages.includes(overId as CandidateStage)) {
			const destStage = overId as CandidateStage;
			if (moved.stage !== destStage) {
				await db.candidates.update(moved.id, { stage: destStage, updatedAt: new Date() } as any);
                // Ensure we use the full list for rank persistence, not the filtered list
				const destList = grouped[destStage] ? [...grouped[destStage].map((c) => c.id), moved.id] : [moved.id];
				await persistRanksForStage(destStage, destList);
			}
			return;
		}

		const destCardId = overId;
		const destCard = (allCandidates || []).find((c) => c.id === destCardId);
		if (!destCard) return;

		const destStage = destCard.stage;
		const stageList = grouped[destStage].map((c) => c.id).filter(Boolean);
		const filtered = stageList.filter((id) => id !== activeId);
		const destIndex = filtered.indexOf(destCardId);
		const insertIndex = destIndex >= 0 ? destIndex : filtered.length;
		filtered.splice(insertIndex, 0, activeId);

		if (moved.stage !== destStage) {
			await db.candidates.update(moved.id, { stage: destStage, updatedAt: new Date() } as any);
		}
		await persistRanksForStage(destStage, filtered);
	};

	useEffect(() => {}, [viewMode]);

	return (
		<div className="gradient-subtle min-h-[calc(100vh-4rem)]">
			<div className="container py-8 px-4 max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
					<div>
						<h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
							Candidates
						</h1>
						<p className="text-muted-foreground">Manage candidate pipeline and track progress</p>
					</div>
					<button
						onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
						className="flex items-center gap-2 px-4 py-2 rounded shadow-elegant bg-primary text-primary-foreground hover:opacity-90 transition-smooth"
					>
						<Columns className="h-4 w-4" />
						{viewMode === "list" ? "Kanban View" : "List View"}
					</button>
				</div>

				{/* Search + Stage Filter */}
				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name or email..."
							className="pl-10"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					{/* Conditional rendering for filters based on viewMode */}
					{viewMode === "list" && (
						<div className="flex gap-2 flex-wrap">
							{["all", ...stages].map((stage) => {
								let baseClass =
									"cursor-pointer transition-all duration-150 px-3 py-1.5 rounded-full font-medium text-sm";
								let selectedClass =
									stageFilter === stage
										? "ring-2 ring-offset-1 ring-primary/50 shadow-lg"
										: "hover:scale-105";
								let stageClass = "";

								if (stage === "all") stageClass = "bg-primary/20 text-primary hover:bg-primary/30";
								else if (stage === "hired") stageClass = "bg-emerald-600 text-white hover:bg-emerald-700";
								else if (stage === "rejected") stageClass = "bg-red-600 text-white hover:bg-red-700";
								else stageClass = getStageBadgeClass(stage);

								return (
									<Badge
										key={stage}
										className={`${baseClass} ${selectedClass} ${stageClass}`}
										onClick={() => setStageFilter(stage as CandidateStage | "all")}
									>
										{stage}
									</Badge>
								);
							})}
						</div>
					)}
				</div>

				{/* Candidate List or Kanban */}
				{viewMode === "list" ? (
					filteredCandidates?.length > 0 ? (
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{filteredCandidates.map((candidate) => (
									<SortableCard key={candidate.id} candidate={candidate} />
								))}
							</div>
						</DndContext>
					) : (
						<Card className="shadow-elegant py-12 text-center">
							<CardContent>
								<Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-semibold mb-2">No candidates found</h3>
								<p className="text-muted-foreground">
									{searchTerm ? "Try adjusting your search" : "No candidates yet"}
								</p>
							</CardContent>
						</Card>
					)
				) : (
					<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
						<div className="flex gap-4 overflow-x-auto pb-4">
							{stages.map((stage) => (
								<div key={stage} id={stage} className="min-w-[280px] bg-white/50 rounded p-3 shadow-inner">
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-sm font-medium">{stage.toUpperCase()}</h3>
										<span className={`text-xs px-2 py-1 rounded ${getStageBadgeClass(stage)}`}>
											{grouped[stage]?.length ?? 0}
										</span>
									</div>

									<SortableContext
										items={(grouped[stage] || []).map((c) => c.id)}
										strategy={verticalListSortingStrategy}
									>
										<div className="min-h-[40px]">
											{(grouped[stage] || []).map((candidate) => (
												<div key={candidate.id} style={{ marginBottom: 8 }}>
													<SortableCard candidate={candidate} />
												</div>
											))}
										</div>
									</SortableContext>
								</div>
							))}
						</div>
					</DndContext>
				)}
			</div>
		</div>
	);
}
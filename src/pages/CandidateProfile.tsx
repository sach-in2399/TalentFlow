// src/pages/CandidateProfile.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams, Link } from "react-router-dom";
import { db, Candidate, Note } from "@/lib/db"; // adjust path if needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users } from "lucide-react";

function MentionSpan({ text }: { text: string }) {
  return <span className="text-primary font-medium">{text}</span>;
}

function renderNoteContent(content: string) {
  // Simple split by spaces and wrap words starting with @
  return content.split(/(\s+)/).map((token, idx) => {
    if (token.startsWith("@")) {
      return (
        <MentionSpan key={idx} text={token} />
      );
    }
    return <span key={idx}>{token}</span>;
  });
}

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const [noteText, setNoteText] = useState("");
  const [mentionIds, setMentionIds] = useState<string[]>([]); // store candidate ids referenced in this new note
  const [query, setQuery] = useState<string | null>(null); // current mention query after '@'
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // fetch candidate being viewed
  const candidate = useLiveQuery(async () => {
    if (!id) return null;
    return await db.candidates.get(id);
  }, [id]);

  // load local candidates to suggest for mentions (exclude current candidate)
  const allCandidates = useLiveQuery(() => db.candidates.toArray(), []);

  const suggestions = useMemo(() => {
    if (!allCandidates || !query) return [];
    const q = query.toLowerCase();
    return allCandidates
      .filter((c) => c.id !== id)
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .slice(0, 6);
  }, [allCandidates, query, id]);

  useEffect(() => {
    // reset keyboard selection when suggestions change
    setSelectedIndex(0);
  }, [suggestions]);

  // helper: insert mention text at cursor position in textarea
  const insertMention = (name: string, mentionId: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      // fallback: append
      setNoteText((t) => (t ? `${t} @${name} ` : `@${name} `));
      setMentionIds((m) => Array.from(new Set([...m, mentionId])));
      return;
    }

    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const before = noteText.slice(0, start);
    const after = noteText.slice(end);
    const insert = `@${name} `; // add trailing space
    const newText = before + insert + after;
    setNoteText(newText);

    // place caret after inserted mention
    requestAnimationFrame(() => {
      const pos = (before + insert).length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });

    setMentionIds((m) => Array.from(new Set([...m, mentionId])));
    // close suggestions
    setShowSuggestions(false);
    setQuery(null);
  };

  // handle typing in textarea to detect mention trigger and query
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteText(value);

    const caret = e.target.selectionStart ?? value.length;
    // find the last '@' before caret that is not followed by a space
    const uptoCaret = value.slice(0, caret);
    const atIndex = uptoCaret.lastIndexOf("@");
    if (atIndex >= 0) {
      // ensure char before '@' is whitespace or start
      const charBefore = atIndex === 0 ? " " : uptoCaret[atIndex - 1];
      if (/\s/.test(charBefore)) {
        const q = uptoCaret.slice(atIndex + 1);
        // show suggestions only if q doesn't contain space
        if (!/\s/.test(q)) {
          setQuery(q);
          setShowSuggestions(true);
          return;
        }
      }
    }
    // otherwise hide suggestions
    setQuery(null);
    setShowSuggestions(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        // choose suggestion
        e.preventDefault();
        const chosen = suggestions[selectedIndex];
        if (chosen) insertMention(chosen.name, chosen.id);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setQuery(null);
      }
    }
  };

  const saveNote = async () => {
    if (!candidate) return;
    const text = noteText.trim();
    if (!text) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      content: text,
      mentions: mentionIds,
      createdAt: new Date(),
      createdBy: "You",
    };

    try {
      const updatedNotes = [...(candidate.notes || []), newNote];
      await db.candidates.update(candidate.id, { notes: updatedNotes });
      setNoteText("");
      setMentionIds([]);
      setShowSuggestions(false);
      setQuery(null);
    } catch (err) {
      console.error("Failed to save note", err);
    }
  };

  if (!candidate) {
    return (
      <div className="gradient-subtle min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Loading candidate...</p>
      </div>
    );
  }

  return (
    <div className="gradient-subtle min-h-[calc(100vh-4rem)]">
      <div className="container py-8 px-4 max-w-3xl mx-auto">
        <Link to="/candidates" className="flex items-center gap-2 text-primary mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Candidates
        </Link>

        <Card className="shadow-elegant mb-6">
          <CardHeader>
            <CardTitle>{candidate.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs">{candidate.stage}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-1"><strong>Email:</strong> {candidate.email}</p>
            <p className="text-muted-foreground mb-1"><strong>Applied At:</strong> {candidate.appliedAt?.toLocaleString?.() ?? String(candidate.appliedAt)}</p>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="shadow-elegant mb-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Add note input */}
              <div>
                <textarea
                  ref={textareaRef}
                  value={noteText}
                  onChange={onTextChange}
                  onKeyDown={onKeyDown}
                  placeholder="Write a note. Type @ to mention someone..."
                  className="w-full p-3 border rounded-md min-h-[80px] resize-y"
                />
                {/* suggestions */}
                {showSuggestions && query && suggestions.length > 0 && (
                  <div className="mt-1 bg-white border rounded shadow-md max-h-40 overflow-auto z-50">
                    {suggestions.map((s, idx) => (
                      <div
                        key={s.id}
                        onMouseDown={(ev) => {
                          // prevent textarea losing focus before click
                          ev.preventDefault();
                          insertMention(s.name, s.id);
                        }}
                        className={`p-2 cursor-pointer ${idx === selectedIndex ? "bg-primary/10" : ""}`}
                      >
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={saveNote}
                    className="px-3 py-1 rounded bg-primary text-primary-foreground"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => { setNoteText(""); setMentionIds([]); setShowSuggestions(false); setQuery(null); }}
                    className="px-3 py-1 rounded border"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Existing notes list */}
              {candidate.notes.length === 0 ? (
                <div className="text-muted-foreground">No notes yet.</div>
              ) : (
                candidate.notes.slice().reverse().map((note) => (
                  <div key={note.id} className="p-3 border rounded bg-muted/10">
                    <div className="text-sm mb-1">{renderNoteContent(note.content)}</div>
                    <div className="text-xs text-muted-foreground">
                      {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
                    </div>
                    {note.mentions && note.mentions.length > 0 && (
                      <div className="mt-2 text-xs">
                        Mentions:{" "}
                        {note.mentions.map((mid, i) => {
                          const mentioned = allCandidates?.find((c) => c.id === mid);
                          return (
                            <span key={mid} className="inline-block mr-2 text-primary">
                              @{mentioned ? mentioned.name : mid}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stage History */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Stage History</CardTitle>
          </CardHeader>
          <CardContent>
            {candidate.stageHistory.length === 0 ? (
              <p className="text-muted-foreground">No stage changes yet.</p>
            ) : (
              candidate.stageHistory
                .slice()
                .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime())
                .map((change) => (
                  <div key={change.id} className="flex justify-between text-sm mb-2">
                    <span>{change.from ? `${change.from} → ` : ""}<strong>{change.to}</strong></span>
                    <span className="text-muted-foreground">
                      {new Date(change.changedAt).toLocaleString()} by {change.changedBy}
                    </span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

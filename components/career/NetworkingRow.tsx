"use client";

import { useState } from "react";
import { isPast, isToday } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { NetworkingForm } from "@/components/career/NetworkingForm";
import { cn } from "@/lib/utils";
import type { NetworkingContact } from "@/types/database.types";

export function NetworkingRow({
  contact,
  onSaved,
  onDeleted,
}: {
  contact: NetworkingContact;
  onSaved: (c: NetworkingContact) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);

  const followUp = contact.next_follow_up ? new Date(contact.next_follow_up) : null;
  const due = followUp ? isPast(followUp) || isToday(followUp) : false;

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${contact.name}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("networking").delete().eq("id", contact.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(contact.id);
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-primary">{contact.name}</p>
        <p className="mt-0.5 truncate text-xs text-ink-tertiary">
          {[contact.role, contact.company].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
      {followUp && (
        <span className={cn("shrink-0 font-mono text-xs", due ? "text-status-atRisk" : "text-ink-secondary")}>
          Follow up {followUp.toLocaleDateString()}
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        aria-label="Edit contact"
        className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleDelete}
        aria-label="Delete contact"
        className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit contact">
        <NetworkingForm
          contact={contact}
          onSaved={(c) => {
            onSaved(c);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </li>
  );
}

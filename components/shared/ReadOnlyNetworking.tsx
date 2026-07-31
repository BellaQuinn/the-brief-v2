import type { NetworkingContact } from "@/types/database.types";

export function ReadOnlyNetworking({ contacts }: { contacts: NetworkingContact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
        <p className="text-sm text-ink-secondary">No contacts yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle rounded-card border border-border bg-surface">
      {contacts.map((contact) => (
        <li key={contact.id} className="px-4 py-3">
          <p className="text-sm text-ink-primary">{contact.name}</p>
          <p className="mt-0.5 text-xs text-ink-tertiary">
            {[contact.role, contact.company].filter(Boolean).join(" · ") || "—"}
          </p>
        </li>
      ))}
    </ul>
  );
}

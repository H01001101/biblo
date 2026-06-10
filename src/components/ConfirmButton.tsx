"use client";

import { useState } from "react";

// Bouton de suppression en deux temps : un premier clic demande confirmation
// ("Confirmer ? Oui / Non") pour éviter les fausses manipulations.
// À placer DANS un <form> ; `formAction` permet de cibler une autre action
// que celle du formulaire (utile quand un formulaire a plusieurs boutons).
export default function ConfirmButton({
  children,
  confirmLabel = "Confirmer ?",
  yesLabel = "Oui, supprimer",
  className = "btn-danger text-sm",
  formAction,
}: {
  children: React.ReactNode;
  confirmLabel?: string;
  yesLabel?: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button type="button" className={className} onClick={() => setArmed(true)}>
        {children}
      </button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-sm text-[var(--color-muted)]">{confirmLabel}</span>
      <button type="submit" formAction={formAction} className="btn-danger text-sm">
        {yesLabel}
      </button>
      <button
        type="button"
        className="btn-secondary text-sm"
        onClick={() => setArmed(false)}
      >
        Annuler
      </button>
    </span>
  );
}

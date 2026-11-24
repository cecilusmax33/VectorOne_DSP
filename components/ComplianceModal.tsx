'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface ComplianceModalProps {
  open: boolean;
  initialScopeNote: string;
  onAcknowledge: (scopeNote: string) => void;
}

export default function ComplianceModal({
  open,
  initialScopeNote,
  onAcknowledge,
}: ComplianceModalProps) {
  const [checked, setChecked] = useState(false);
  const [scopeNote, setScopeNote] = useState(initialScopeNote);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compliance-gate-title"
    >
      <div className="w-full max-w-xl bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] rounded-xs shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--v-border)] bg-[var(--v-bg)] flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#ff4d00] shrink-0" />
          <h2
            id="compliance-gate-title"
            className="font-display text-base font-extrabold uppercase tracking-tight text-[var(--v-ink)]"
          >
            Ethical Use, Privacy Compliance &amp; Liability Disclaimer
          </h2>
        </div>

        <div className="px-6 py-5 space-y-4 text-xs text-[var(--v-ink-dim)] leading-relaxed">
          <p>
            <strong className="text-[var(--v-ink)]">VectorOne_DSP</strong> is designed strictly for authorized
            security auditing, public attack-surface monitoring, data loss
            prevention (DLP), and OSINT research.
          </p>

          <div className="p-3.5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-wider font-bold text-[var(--v-ink)]">
              Mandatory Compliance Requirements
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[var(--v-ink-dim)]">
              <li>
                You must comply with all applicable privacy laws and regulations
                (including GDPR, CCPA, CFAA, and local computer misuse statutes).
              </li>
              <li>
                Only inspect or audit domains, cloud storage references, and
                publicly indexed assets for which you hold ownership or explicit
                written authorization.
              </li>
              <li>
                Do not use sensitive data query filters to harvest, redistribute,
                or exploit personal information or credentials.
              </li>
            </ul>
          </div>

          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xs text-red-900 dark:text-red-200">
            <strong>Disclaimer of Responsibility:</strong> Catalyst Vector AIA
            and its developers in no way take responsibility for any misuse or
            illegal activities performed by the user. All responsibility for
            query execution, scope authorization, and data handling rests solely
            with the operator.
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Authorized Assessment Scope Note (optional, logged locally)
            </label>
            <input
              type="text"
              value={scopeNote}
              onChange={(e) => setScopeNote(e.target.value)}
              placeholder="e.g. Authorized internal DLP audit for example.com"
              className="w-full px-3 py-2 text-xs font-mono bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 rounded-xs border-[var(--v-border)] accent-[#ff4d00]"
            />
            <span className="text-xs font-medium text-[var(--v-ink)]">
              I confirm that I will use VectorOne_DSP ethically, within authorized
              scope, and in full compliance with applicable privacy laws, and I
              acknowledge that Catalyst Vector AIA and its developers bear no
              responsibility for user misuse.
            </span>
          </label>
        </div>

        <div className="px-6 py-3.5 border-t border-[var(--v-border)] bg-[var(--v-bg)] flex justify-end">
          <button
            type="button"
            disabled={!checked}
            onClick={() => onAcknowledge(scopeNote)}
            className="px-4 py-2 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Acknowledge &amp; Enter Workspace
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ComplianceState } from '@/lib/types';

interface ComplianceViewProps {
  compliance: ComplianceState;
  onUpdateScopeNote: (note: string) => void;
}

export default function ComplianceView({
  compliance,
  onUpdateScopeNote,
}: ComplianceViewProps) {
  const [note, setNote] = useState(compliance.authorizedScopeNote);
  const [savedFlag, setSavedFlag] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateScopeNote(note);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1800);
  };

  return (
    <div className="col-span-full bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] divide-y divide-[var(--v-border)]">
      <div className="p-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[var(--v-ink)] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#ff4d00] shrink-0" />
            Ethical Use Policy, Privacy Compliance &amp; Liability Disclaimer
          </h1>
          <p className="text-xs text-[var(--v-ink-dim)]">
            Mandatory operational governance for VectorOne_DSP analysts and researchers.
          </p>
        </div>

        {compliance.acknowledged && compliance.acknowledgedAt && (
          <div className="text-right text-[11px] font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            Acknowledged {new Date(compliance.acknowledgedAt).toLocaleString()}
          </div>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch text-xs text-[var(--v-ink-dim)] leading-relaxed">
        <section className="p-5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs space-y-2.5">
          <h2 className="font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)]">
            01. Authorized Use &amp; Privacy Law Compliance
          </h2>
          <p>
            VectorOne_DSP is engineered to help organizations, defensive
            security teams, and authorized researchers evaluate public search
            engine exposure, verify data loss prevention (DLP) boundaries, and
            audit indexed assets. By operating this software, you agree to
            comply strictly with all applicable local, national, and
            international privacy laws and computer security regulations
            (including GDPR, CCPA, HIPAA, and the Computer Fraud and Abuse Act).
          </p>
          <p>
            Sensitive data query filters are provided exclusively so domain
            owners and authorized auditors can detect and remediate unintended
            public exposure of internal documents, configuration artifacts, or
            regulated records. Never target domains without explicit permission
            or harvest third-party personal data.
          </p>
        </section>

        <section className="p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xs space-y-2.5 text-red-900 dark:text-red-200">
          <h2 className="font-display text-sm font-bold uppercase tracking-tight">
            02. Catalyst Vector AIA Non-Responsibility &amp; Non-Liability Disclaimer
          </h2>
          <p>
            <strong>
              Catalyst Vector AIA or its developers in no way takes
              responsibility for any misuse or illegal activities performed by
              the user.
            </strong>{' '}
            This platform generates search operator syntax and interfaces with
            public search grounding tools strictly at the operator&apos;s
            direction. The user assumes full legal and ethical accountability
            for every query executed, every external URL accessed, and all
            exported findings.
          </p>
        </section>

        <form
          onSubmit={handleSave}
          className="md:col-span-2 xl:col-span-1 p-5 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs flex flex-col justify-between gap-4"
        >
          <div className="space-y-2">
            <label className="block font-display text-sm font-bold uppercase tracking-tight text-[var(--v-ink)]">
              03. Authorized Engagement / Audit Scope Documentation
            </label>
            <p className="text-xs text-[var(--v-ink-dim)]">
              Record the authorized domain scope, engagement ticket, or client authorization reference stored locally for this audit session.
            </p>
          </div>
          <div className="space-y-2.5">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Document authorized target domains or ticket ID..."
              className="w-full px-3 py-2 text-xs font-mono bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs text-[var(--v-ink)] placeholder:text-[var(--v-ink-dim)] focus:outline-none focus:border-[#ff4d00]"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 text-xs font-display font-extrabold uppercase tracking-tight bg-[#ff4d00] text-[#111113] rounded-xs hover:bg-[#ff621f] transition-colors whitespace-nowrap"
            >
              {savedFlag ? 'Saved Scope Note' : 'Save Scope Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Mail, X } from 'lucide-react';

interface GmailConfirmModalProps {
  open: boolean;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  findingsCount: number;
  isSending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function GmailConfirmModal({
  open,
  recipientEmail,
  subject,
  bodyText,
  findingsCount,
  isSending,
  onCancel,
  onConfirm,
}: GmailConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gmail-confirm-title"
    >
      <div className="w-full max-w-xl bg-[var(--v-surface)] border border-[var(--v-border)] border-t-[3px] border-t-[#ff4d00] rounded-xs shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--v-border)] bg-[var(--v-bg)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#ff4d00]" />
            <h2
              id="gmail-confirm-title"
              className="font-display text-sm font-extrabold uppercase tracking-tight text-[var(--v-ink)]"
            >
              Confirm Gmail Alert Dispatch
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSending}
            aria-label="Close confirmation dialog"
            className="p-1 text-[var(--v-ink-dim)] hover:text-[#ff4d00] rounded-xs transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3 text-xs text-[var(--v-ink)]">
          <p className="text-[var(--v-ink-dim)]">
            Review the alert digest below before sending it from your connected
            Gmail account. This action transmits an outbound email immediately.
          </p>

          <div className="border border-[var(--v-border)] rounded-xs divide-y divide-[var(--v-border)] bg-[var(--v-bg)]">
            <div className="px-3 py-2 flex gap-3">
              <span className="w-20 shrink-0 font-mono text-[11px] uppercase tracking-wider text-[var(--v-ink-dim)]">
                Recipient
              </span>
              <span className="font-mono text-[var(--v-ink)] break-all">
                {recipientEmail}
              </span>
            </div>
            <div className="px-3 py-2 flex gap-3">
              <span className="w-20 shrink-0 font-mono text-[11px] uppercase tracking-wider text-[var(--v-ink-dim)]">
                Subject
              </span>
              <span className="font-medium text-[var(--v-ink)]">{subject}</span>
            </div>
            <div className="px-3 py-2 flex gap-3">
              <span className="w-20 shrink-0 font-mono text-[11px] uppercase tracking-wider text-[var(--v-ink-dim)]">
                Findings
              </span>
              <span className="font-mono tabular-nums text-[#ff4d00] font-semibold">
                {findingsCount} record(s) attached in digest
              </span>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--v-ink-dim)] mb-1">
              Message Body Preview
            </span>
            <pre className="p-3 bg-[var(--v-bg)] border border-[var(--v-border)] rounded-xs text-[11px] font-mono text-[var(--v-ink)] max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {bodyText}
            </pre>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-[var(--v-border)] bg-[var(--v-bg)] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSending}
            className="px-3.5 py-2 text-xs font-mono font-medium text-[var(--v-ink)] bg-[var(--v-surface)] border border-[var(--v-border)] rounded-xs hover:border-[#ff4d00] hover:text-[#ff4d00] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending}
            className="px-4 py-2 text-xs font-display font-extrabold uppercase tracking-tight text-[#111113] bg-[#ff4d00] rounded-xs hover:bg-[#ff621f] disabled:opacity-50 transition-colors"
          >
            {isSending ? 'Sending via Gmail...' : 'Confirm & Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

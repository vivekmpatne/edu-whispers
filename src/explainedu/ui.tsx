import type React from 'react';

export const cardClass = 'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]';

export const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

export const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60';

export const secondaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-300/30 disabled:opacity-60';

export function layoutCardClass() {
  return cardClass;
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${cardClass} ${className}`}>{children}</div>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function SectionBadge({ index, label }: { index: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-slate-500">
      <span className="text-blue-600">{index}</span>
      <span className="text-slate-300">/</span>
      {label}
    </span>
  );
}

export function PageHeader({ index, badge, title, subtitle }: { index: string; badge: string; title: string; subtitle?: string }) {
  return (
    <div className="space-y-3">
      <SectionBadge index={index} label={badge} />
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
      {subtitle && <p className="max-w-2xl text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export function riskLevel(category?: string | null): RiskLevel {
  const value = (category ?? '').toLowerCase();
  if (value.includes('high')) return 'high';
  if (value.includes('med')) return 'medium';
  if (value.includes('low')) return 'low';
  return 'unknown';
}

const pillTone: Record<RiskLevel, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  unknown: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function RiskPill({ category }: { category?: string | null }) {
  const level = riskLevel(category);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${pillTone[level]}`}>
      {category || 'No data'}
    </span>
  );
}

const barTone: Record<RiskLevel, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
  unknown: 'bg-blue-600',
};

export function ProbabilityBar({ probability, category }: { probability: number; category?: string | null }) {
  const pct = Math.max(0, Math.min(100, probability * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full transition-all ${barTone[riskLevel(category)]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

type Tone = 'blue' | 'green' | 'purple' | 'amber' | 'red';

const toneClass: Record<Tone, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-rose-50 text-rose-600',
};

export function MetricCard({ icon, label, value, tone, loading = false }: { icon: React.ReactNode; label: string; value: string; tone: Tone; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClass[tone]}`}>{icon}</div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {loading ? <Skeleton className="mt-3 h-8 w-20" /> : <p className="tabular mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>}
    </div>
  );
}

export function InfoLine({ label, value, loading = false }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      {loading ? <Skeleton className="mt-2 h-6 w-16" /> : <p className="tabular mt-2 text-lg font-semibold text-slate-900">{value}</p>}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

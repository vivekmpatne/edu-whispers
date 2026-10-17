import { useState } from 'react';
import type React from 'react';
import { BriefcaseBusiness, LogOut, Menu, Sparkles, X } from 'lucide-react';
import { Link, Outlet } from '@tanstack/react-router';
import type { User } from './api';

type NavItem = { to: string; label: string };

type ShellProps = {
  user: User;
  onLogout: () => void;
  nav: readonly NavItem[];
  workspace: string;
  icon: React.ReactNode;
  iconTone: string;
};

function Shell({ user, onLogout, nav, workspace, icon, iconTone }: ShellProps) {
  const [open, setOpen] = useState(false);
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconTone}`}>{icon}</div>
          <p className="text-sm font-semibold tracking-tight">ExplainEdu</p>
        </div>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white p-5 transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-8 hidden items-center gap-3 lg:flex">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}>{icon}</div>
          <div>
            <p className="font-semibold tracking-tight text-slate-900">ExplainEdu</p>
            <p className="text-xs font-medium text-slate-500">{workspace}</p>
          </div>
        </div>
        <p className="mb-4 mt-10 text-xs font-medium text-slate-500 lg:hidden">{workspace}</p>

        <nav className="flex-1 space-y-1">
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to as never}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm transition-colors"
              activeProps={{ className: 'bg-blue-50 text-blue-700 font-semibold' }}
              inactiveProps={{ className: 'font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">{initial}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:ml-72 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/profile', label: 'Academic Profile' },
  { to: '/student/risk', label: 'Risk Analysis' },
  { to: '/student/history', label: 'Prediction History' },
  { to: '/student/simulate', label: 'What-if Simulator' },
] as const;

const facultyNav = [
  { to: '/faculty/dashboard', label: 'Dashboard' },
  { to: '/faculty/students', label: 'Students' },
  { to: '/faculty/model-metrics', label: 'Model Metrics' },
] as const;

export function StudentApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  return <Shell user={user} onLogout={onLogout} nav={studentNav} workspace="Student workspace" icon={<Sparkles className="h-5 w-5" />} iconTone="bg-blue-50 text-blue-600" />;
}

export function FacultyApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  return <Shell user={user} onLogout={onLogout} nav={facultyNav} workspace="Faculty workspace" icon={<BriefcaseBusiness className="h-5 w-5" />} iconTone="bg-indigo-50 text-indigo-600" />;
}

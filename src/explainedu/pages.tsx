import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { api, setStoredToken, type User, type ProfileForm } from './api';
import {
  Card,
  EmptyState,
  InfoLine,
  MetricCard,
  PageHeader,
  ProbabilityBar,
  RiskPill,
  Skeleton,
  StatCard,
  inputClass,
  layoutCardClass,
  primaryBtn,
  secondaryBtn,
} from './ui';

// Keep every export that routes (or other files) might import from this module.
export { StudentApp, FacultyApp } from './layout';
export { StatCard, MetricCard, InfoLine, layoutCardClass } from './ui';

type Prediction = {
  id?: string;
  riskCategory: string;
  riskProbability: number;
  modelVersion?: string;
  disclaimer?: string;
  createdAt?: string;
  explanation?: { explanation?: string; method?: string };
};

type Simulation = {
  baseline: { riskCategory: string; riskProbability: number };
  hypothetical: { riskCategory: string; riskProbability: number };
  disclaimer?: string;
};

type FacultySummary = { totalStudents?: number; lowRisk?: number; mediumRisk?: number; highRisk?: number };

type FacultyStudent = {
  id: string;
  name: string;
  profile?: { attendance?: number; quizAverage?: number } | null;
  latestRiskCategory?: string | null;
};

const DEFAULT_PROFILE: ProfileForm = {
  attendance: 88,
  assignmentCompletion: 76,
  quizAverage: 72,
  internalAssessment: 68,
  studyHoursPerWeek: 13,
  previousCgpa: 7.8,
};

// Only these fields are editable. Server-side extras (id, userId, createdAt, updatedAt) never reach the form or the PUT body.
const FIELDS: { key: keyof ProfileForm; label: string; max: number; step: number }[] = [
  { key: 'attendance', label: 'Attendance (%)', max: 100, step: 1 },
  { key: 'assignmentCompletion', label: 'Assignment completion (%)', max: 100, step: 1 },
  { key: 'quizAverage', label: 'Quiz average (%)', max: 100, step: 1 },
  { key: 'internalAssessment', label: 'Internal assessment (%)', max: 100, step: 1 },
  { key: 'studyHoursPerWeek', label: 'Study hours per week', max: 100, step: 1 },
  { key: 'previousCgpa', label: 'Previous CGPA (0 to 10)', max: 10, step: 0.1 },
];

function pickProfile(data: Partial<ProfileForm> | null | undefined): ProfileForm {
  const base = { ...DEFAULT_PROFILE };
  if (!data) return base;
  for (const { key } of FIELDS) {
    const value = data[key];
    if (typeof value === 'number' && !Number.isNaN(value)) base[key] = value;
  }
  return base;
}

function pct(probability: number) {
  return `${(probability * 100).toFixed(0)}%`;
}

function NumberField({ label, value, max, step, onChange }: { label: string; value: number; max: number; step: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      <input type="number" min={0} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className={inputClass} />
    </label>
  );
}

export function LandingPage({ user }: { user: User | null }) {
  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-lg font-semibold tracking-tight">ExplainEdu AI</p>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'} className={primaryBtn}>
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className={secondaryBtn}>Login</Link>
                <Link to="/register" className={primaryBtn}>Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            Academic risk analysis demo
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 md:text-6xl">Understand risk early. Act sooner.</h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            ExplainEdu helps students understand their academic performance and gives faculty a clear summary of students who may need support.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className={`${primaryBtn} px-6 py-3`}>Get started <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/login" className={`${secondaryBtn} px-6 py-3`}>Student login</Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ['Risk scoring', 'Synthetic model pipeline'],
              ['Action plan', 'Personalized suggestions'],
              ['Faculty view', 'CSV import + batch review'],
            ].map(([title, value]) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Demo risk overview</p>
              <p className="text-xl font-semibold tracking-tight">Current student profile</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">Illustrative only</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <StatCard label="Attendance" value="88%" />
            <StatCard label="Quiz Avg" value="72%" />
            <StatCard label="CGPA" value="7.8" />
            <StatCard label="Study Hours" value="13/wk" />
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
              <span>Demo preview</span>
              <span className="font-semibold text-blue-600">Synthetic data</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200/70">
              <div className="h-full w-2/5 rounded-full bg-blue-600" />
            </div>
            <p className="mt-3 text-xs text-slate-500">Illustrative visual only. Not a live prediction.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8 text-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">{children}</div>
    </div>
  );
}

export function LoginPage({ onLogin, setToken }: { onLogin: (user: User) => void; setToken: (token: string | null) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email: loginEmail, password: loginPass });
      const nextToken = response.data.token;
      setStoredToken(nextToken);
      setToken(nextToken);
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      onLogin(response.data.user);
      navigate({ to: response.data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard' });
    } catch {
      setError('Login failed. Check the demo credentials or register a new account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await performLogin(email, password);
  };

  return (
    <AuthFrame>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight">Welcome back</p>
          <p className="text-sm text-slate-500">ExplainEdu AI</p>
        </div>
      </div>

      {/* ⚡ 1-Click Quick Demo Login */}
      <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">⚡ 1-Click Quick Login</span>
          <span className="text-[11px] text-blue-600">Instant access</span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => performLogin('student@demo.com', 'student123')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
          >
            <span>👨‍🎓</span> Student Demo
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => performLogin('faculty@demo.com', 'faculty123')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
          >
            <span>👨‍🏫</span> Faculty Demo
          </button>
        </div>
      </div>

      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <span className="relative bg-white px-3 text-[11px] font-medium uppercase text-slate-400">or sign in manually</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
        </label>
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" className={`${primaryBtn} w-full py-3`} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <div className="mt-5 space-y-1 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-500">
        <p>Demo student: <span className="font-medium text-slate-800">student@demo.com / student123</span></p>
        <p>Demo faculty: <span className="font-medium text-slate-800">faculty@demo.com / faculty123</span></p>
      </div>
      <p className="mt-5 text-center text-sm text-slate-500">Need an account? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">Register</Link></p>
    </AuthFrame>
  );
}

export function RegisterPage({ onLogin, setToken }: { onLogin: (user: User) => void; setToken: (token: string | null) => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/register', { name, email, password, role: 'student' });
      setStoredToken(response.data.token);
      setToken(response.data.token);
      api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
      onLogin(response.data.user);
      navigate({ to: '/student/dashboard' });
    } catch {
      setError('Unable to create the student account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame>
      <h2 className="text-2xl font-semibold tracking-tight">Create student account</h2>
      <p className="mt-2 text-sm text-slate-500">This is a demo MVP account for the student workflow.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className={inputClass} />
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className={inputClass} />
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className={inputClass} />
        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={loading} className={`${primaryBtn} w-full py-3`}>{loading ? 'Creating account...' : 'Register'}</button>
      </form>
      <p className="mt-5 text-center text-sm"><Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Already have an account?</Link></p>
    </AuthFrame>
  );
}

export function StudentDashboard({ user }: { user: User }) {
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/student/profile').then((res) => setProfile(res.data.profile)).catch(() => null),
      api.get('/api/student/history').then((res) => setPrediction(res.data.history[0] || null)).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader index="01" badge="Student dashboard" title={`Welcome, ${user.name}`} subtitle="Your latest academic indicators and risk snapshot." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard loading={loading} icon={<Activity className="h-5 w-5" />} label="Current risk" value={prediction ? prediction.riskCategory : 'No prediction'} tone="blue" />
        <MetricCard loading={loading} icon={<BarChart3 className="h-5 w-5" />} label="Risk probability" value={prediction ? pct(prediction.riskProbability) : '-'} tone="green" />
        <MetricCard loading={loading} icon={<BookOpen className="h-5 w-5" />} label="Attendance" value={profile ? `${profile.attendance}%` : '-'} tone="purple" />
        <MetricCard loading={loading} icon={<TrendingUp className="h-5 w-5" />} label="CGPA" value={profile ? profile.previousCgpa.toFixed(1) : '-'} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <p className="text-base font-semibold tracking-tight text-slate-900">Academic overview</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoLine loading={loading} label="Assignment completion" value={`${profile?.assignmentCompletion ?? 0}%`} />
            <InfoLine loading={loading} label="Quiz average" value={`${profile?.quizAverage ?? 0}%`} />
            <InfoLine loading={loading} label="Internal average" value={`${profile?.internalAssessment ?? 0}%`} />
            <InfoLine loading={loading} label="Study hours" value={`${profile?.studyHoursPerWeek ?? 0}/week`} />
          </div>
        </Card>
        <Card>
          <p className="text-base font-semibold tracking-tight text-slate-900">Recommended next actions</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            {[
              'Review weak quiz topics and solve previous crack papers.',
              'Complete pending assignments before the next assessment.',
              'Maintain a consistent study schedule for at least 2 weeks.',
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileForm>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get('/api/student/profile')
      .then((res) => {
        if (res.data.profile) setProfile(pickProfile(res.data.profile));
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field: keyof ProfileForm, value: number) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFailed(false);
    try {
      const response = await api.put('/api/student/profile', profile);
      setMessage(response.data.message);
    } catch {
      setFailed(true);
      setMessage('Unable to save academic profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader index="02" badge="Academic profile" title="Academic profile" subtitle="Enter your latest academic indicators. These values feed the model and the what-if simulator." />
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          {FIELDS.map((field) =>
            loading ? (
              <div key={field.key}>
                <Skeleton className="mb-2 h-3 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <NumberField key={field.key} label={field.label} value={profile[field.key]} max={field.max} step={field.step} onChange={(value) => updateField(field.key, value)} />
            ),
          )}
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button type="submit" disabled={saving || loading} className={primaryBtn}>{saving ? 'Saving...' : 'Save profile'}</button>
            <Link to="/student/risk" className={secondaryBtn}>Analyze My Performance</Link>
          </div>
        </form>
        {message && (
          <p className={`mt-5 rounded-lg border px-3 py-2 text-sm ${failed ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</p>
        )}
      </Card>
    </div>
  );
}

export function RiskAnalysisPage() {
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/student/profile').then(async (res) => {
      const profile = res.data.profile;
      if (!profile) {
        setError('Save your academic profile first to generate a prediction.');
        return;
      }
      try {
        const response = await api.post('/api/student/analyze', {});
        setResult(response.data.prediction);
      } catch {
        setError('Prediction could not be generated.');
      }
    }).catch(() => setError('Prediction could not be generated.'));
  }, []);

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader index="03" badge="Risk assessment" title="Risk analysis" />
        <Card><p className="text-sm text-slate-700">{error}</p></Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-8">
        <PageHeader index="03" badge="Risk assessment" title="Risk analysis" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader index="03" badge="Risk assessment" title="Risk analysis" subtitle="Model output for your saved academic profile." />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Current category" value={result.riskCategory} tone="blue" />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Probability" value={pct(result.riskProbability)} tone="green" />
        <MetricCard icon={<Sparkles className="h-5 w-5" />} label="Model" value={result.modelVersion ?? '-'} tone="purple" />
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <RiskPill category={result.riskCategory} />
          <span className="tabular text-sm font-semibold text-slate-900">{pct(result.riskProbability)}</span>
        </div>
        <ProbabilityBar probability={result.riskProbability} category={result.riskCategory} />
      </Card>
      <Card>
        <h3 className="text-base font-semibold tracking-tight text-slate-900">Individual explanation</h3>
        <p className="mt-2 text-sm text-slate-700">{result.explanation?.explanation}</p>
        <p className="mt-3 text-xs text-slate-500">Explanation method: {result.explanation?.method || 'unavailable'}. Model contributions show association, not causation.</p>
        {result.disclaimer && <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">{result.disclaimer}</p>}
      </Card>
    </div>
  );
}

export function HistoryPage() {
  const [history, setHistory] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/student/history')
      .then((res) => setHistory(res.data.history))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader index="04" badge="Prediction history" title="Prediction history" subtitle="Every prediction generated for your account, newest first." />
      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState title="No predictions yet" hint="Run a risk analysis to see it here." />
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={item.id ?? index} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</p>
                  <div className="mt-1.5"><RiskPill category={item.riskCategory} /></div>
                </div>
                <div className="w-32 text-right">
                  <p className="tabular text-sm font-semibold text-slate-900">{pct(item.riskProbability)}</p>
                  <div className="mt-2"><ProbabilityBar probability={item.riskProbability} category={item.riskCategory} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function SimulationPage() {
  const [profile, setProfile] = useState<ProfileForm>(DEFAULT_PROFILE);
  const [scenario, setScenario] = useState<ProfileForm>(DEFAULT_PROFILE);
  const [result, setResult] = useState<Simulation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/student/profile').then((res) => {
      if (res.data.profile) {
        const clean = pickProfile(res.data.profile);
        setProfile(clean);
        setScenario(clean);
      }
    }).catch(() => null);
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    setError('');
    try {
      const modelFeatures = {
        attendance: profile.attendance,
        assignment_completion: profile.assignmentCompletion,
        quiz_average: profile.quizAverage,
        internal_average: profile.internalAssessment,
        study_hours_per_week: profile.studyHoursPerWeek,
        previous_cgpa: profile.previousCgpa,
      };
      const hypotheticalChanges = {
        attendance: scenario.attendance - profile.attendance,
        assignment_completion: scenario.assignmentCompletion - profile.assignmentCompletion,
        quiz_average: scenario.quizAverage - profile.quizAverage,
        internal_average: scenario.internalAssessment - profile.internalAssessment,
        study_hours_per_week: scenario.studyHoursPerWeek - profile.studyHoursPerWeek,
        previous_cgpa: scenario.previousCgpa - profile.previousCgpa,
      };
      const response = await api.post('/api/student/simulate', { ...modelFeatures, hypothetical_changes: hypotheticalChanges });
      setResult(response.data.simulation);
    } catch {
      setError('Simulation failed. Check your values and make sure the model service is running.');
    } finally {
      setLoading(false);
    }
  };

  const delta = result ? result.hypothetical.riskProbability - result.baseline.riskProbability : 0;

  return (
    <div className="space-y-8">
      <PageHeader index="05" badge="What-if simulator" title="What-if simulator" subtitle="Change a value, run the model, and compare against your saved baseline." />
      <Card>
        <div className="grid gap-5 md:grid-cols-2">
          {FIELDS.map((field) => (
            <NumberField
              key={field.key}
              label={field.label}
              value={scenario[field.key]}
              max={field.max}
              step={field.step}
              onChange={(value) => setScenario((current) => ({ ...current, [field.key]: value }))}
            />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleSimulate} disabled={loading} className={primaryBtn}>{loading ? 'Running...' : 'Run simulation'}</button>
          <button onClick={() => { setScenario(profile); setResult(null); }} className={secondaryBtn}>Reset to saved profile</button>
        </div>
        {error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      </Card>

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard icon={<TrendingUp className="h-5 w-5" />} label={`Baseline, ${result.baseline.riskCategory}`} value={pct(result.baseline.riskProbability)} tone="blue" />
          <MetricCard icon={<Activity className="h-5 w-5" />} label={`Hypothetical, ${result.hypothetical.riskCategory}`} value={pct(result.hypothetical.riskProbability)} tone="green" />
          <p className="text-sm text-slate-600 md:col-span-2">
            Change in risk: <span className={`font-semibold ${delta <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)} points</span>
          </p>
          {result.disclaimer && <p className="text-xs text-slate-500 md:col-span-2">{result.disclaimer}</p>}
        </div>
      )}
    </div>
  );
}

export function FacultyDashboard() {
  const [summary, setSummary] = useState<FacultySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/faculty/dashboard')
      .then((res) => setSummary(res.data.summary))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader index="01" badge="Faculty dashboard" title="Faculty dashboard" subtitle="Cohort level risk distribution." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard loading={loading} icon={<GraduationCap className="h-5 w-5" />} label="Total students" value={String(summary?.totalStudents ?? 0)} tone="blue" />
        <MetricCard loading={loading} icon={<ShieldCheck className="h-5 w-5" />} label="Low risk" value={String(summary?.lowRisk ?? 0)} tone="green" />
        <MetricCard loading={loading} icon={<Activity className="h-5 w-5" />} label="Medium risk" value={String(summary?.mediumRisk ?? 0)} tone="amber" />
        <MetricCard loading={loading} icon={<BookOpen className="h-5 w-5" />} label="High risk" value={String(summary?.highRisk ?? 0)} tone="red" />
      </div>
    </div>
  );
}

export function FacultyStudents() {
  const [students, setStudents] = useState<FacultyStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/faculty/students')
      .then((res) => setStudents(res.data.students))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader index="02" badge="Students" title="Students" subtitle="Latest profile values and risk category per student." />
      <Card className="p-0">
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-5"><EmptyState title="No students found" hint="Students appear here after they register." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/70 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-3 pl-5 font-medium">Student</th>
                  <th className="p-3 font-medium">Attendance</th>
                  <th className="p-3 font-medium">Quiz</th>
                  <th className="p-3 pr-5 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => (
                  <tr key={student.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="p-3 pl-5 font-medium text-slate-900">{student.name}</td>
                    <td className="tabular p-3">{student.profile?.attendance ?? '-'}</td>
                    <td className="tabular p-3">{student.profile?.quizAverage ?? '-'}</td>
                    <td className="p-3 pr-5"><RiskPill category={student.latestRiskCategory ?? null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export function FacultyMetrics() {
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/faculty/model-metrics')
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader index="03" badge="Model metrics" title="Model metrics" subtitle="Evaluation numbers from the latest trained model." />
      <Card>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : metrics ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(metrics).slice(0, 8).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{key}</p>
                <p className="mt-2 break-words text-lg font-semibold text-slate-900">{typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Metrics unavailable" hint="Train the ML model to populate this page." />
        )}
      </Card>
    </div>
  );
}

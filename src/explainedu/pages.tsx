import axios from 'axios';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  LogOut,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type React from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { api, setStoredToken, type User, type ProfileForm } from './api';
import { useAuth } from './auth';

export function layoutCardClass() {
  return 'rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/20';
}

export function LandingPage({ user }: { user: User | null }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">ExplainEdu AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to={user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Go to dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200">Login</Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
            <ShieldCheck className="h-4 w-4" />
            Academic risk analysis demo
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">Understand risk early. Act sooner.</h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            ExplainEdu helps students understand their academic performance and gives faculty a clear summary of students who may need support.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500">Get started <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/login" className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-200">Student login</Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Risk scoring', 'Synthetic model pipeline'],
              ['Action plan', 'Personalized suggestions'],
              ['Faculty view', 'CSV import + batch review'],
            ].map(([title, value]) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm text-slate-400">{title}</p>
                <p className="mt-2 font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-blue-950/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <p className="text-sm text-slate-400">Demo risk overview</p>
              <p className="text-xl font-semibold">Current student profile</p>
            </div>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">Illustrative only</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatCard label="Attendance" value="88%" />
            <StatCard label="Quiz Avg" value="72%" />
            <StatCard label="CGPA" value="7.8" />
            <StatCard label="Study Hours" value="13/wk" />
          </div>
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-4">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Demo preview</span>
              <span className="font-semibold text-blue-300">Synthetic data</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500" />
            </div>
            <p className="mt-3 text-xs text-slate-500">Illustrative visual only — not a live prediction.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function LoginPage({ onLogin, setToken }: { onLogin: (user: User) => void; setToken: (token: string | null) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const nextToken = response.data.token;
      setStoredToken(nextToken);
      setToken(nextToken);
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      onLogin(response.data.user);
      navigate({ to: response.data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard' });
    } catch (err) {
      setError('Login failed. Check the demo credentials or register a new account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/25">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300"><GraduationCap className="h-5 w-5" /></div>
          <div>
            <p className="text-xl font-semibold">Welcome back</p>
            <p className="text-sm text-slate-400">ExplainEdu AI</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
        </form>
        <div className="mt-5 text-sm text-slate-400">
          Demo student: <span className="font-medium text-slate-200">student@demo.com / student123</span>
        </div>
        <div className="mt-3 text-sm text-slate-400">
          Demo faculty: <span className="font-medium text-slate-200">faculty@demo.com / faculty123</span>
        </div>
        <p className="mt-5 text-center text-sm text-slate-400">Need an account? <Link to="/register" className="text-blue-300">Register</Link></p>
      </div>
    </div>
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
    } catch (err) {
      setError('Unable to create the student account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/25">
        <h2 className="text-2xl font-semibold">Create student account</h2>
        <p className="mt-2 text-sm text-slate-400">This is a demo MVP account for the student workflow.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 disabled:opacity-60">{loading ? 'Creating account…' : 'Register'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400"><Link to="/login" className="text-blue-300">Already have an account?</Link></p>
      </div>
    </div>
  );
}

export function StudentApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed inset-y-0 left-0 w-72 border-r border-slate-800 bg-slate-900 p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"><Sparkles className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold">ExplainEdu</p>
            <p className="text-xs text-slate-400">Student workspace</p>
          </div>
        </div>
        <nav className="space-y-2">
          {([['/student/dashboard', 'Dashboard'], ['/student/profile', 'Academic Profile'], ['/student/risk', 'Risk Analysis'], ['/student/history', 'Prediction History'], ['/student/simulate', 'What-if Simulator']] as const).map(([to, label]) => (
            <Link key={to} to={to} className="block rounded-xl px-3 py-2 text-sm font-medium" activeProps={{ className: 'bg-blue-600 text-white' }} inactiveProps={{ className: 'text-slate-300 hover:bg-slate-800' }}>
              {label}
            </Link>
          ))}
        </nav>
        <button onClick={onLogout} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200"><LogOut className="h-4 w-4" /> Logout</button>
      </aside>

      <main className="ml-72 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export function FacultyApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  void user;
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed inset-y-0 left-0 w-72 border-r border-slate-800 bg-slate-900 p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><BriefcaseBusiness className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold">ExplainEdu</p>
            <p className="text-xs text-slate-400">Faculty workspace</p>
          </div>
        </div>
        <nav className="space-y-2">
          {([['/faculty/dashboard', 'Dashboard'], ['/faculty/students', 'Students'], ['/faculty/model-metrics', 'Model Metrics']] as const).map(([to, label]) => (
            <Link key={to} to={to} className="block rounded-xl px-3 py-2 text-sm font-medium" activeProps={{ className: 'bg-blue-600 text-white' }} inactiveProps={{ className: 'text-slate-300 hover:bg-slate-800' }}>
              {label}
            </Link>
          ))}
        </nav>
        <button onClick={onLogout} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200"><LogOut className="h-4 w-4" /> Logout</button>
      </aside>

      <main className="ml-72 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export function StudentDashboard({ user }: { user: User }) {
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    api.get('/api/student/profile').then((res) => setProfile(res.data.profile)).catch(() => null);
    api.get('/api/student/history').then((res) => setPrediction(res.data.history[0] || null)).catch(() => null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Student dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold">Welcome, {user.name}</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<Activity className="h-5 w-5" />} label="Current risk" value={prediction ? prediction.riskCategory : 'No prediction'} tone="blue" />
        <MetricCard icon={<BarChart3 className="h-5 w-5" />} label="Risk probability" value={prediction ? `${(prediction.riskProbability * 100).toFixed(0)}%` : '–'} tone="green" />
        <MetricCard icon={<BookOpen className="h-5 w-5" />} label="Attendance" value={profile ? `${profile.attendance}%` : '–'} tone="purple" />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="CGPA" value={profile ? profile.previousCgpa.toFixed(1) : '–'} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className={layoutCardClass()}>
          <p className="text-lg font-semibold">Academic overview</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoLine label="Assignment completion" value={`${profile?.assignmentCompletion ?? 0}%`} />
            <InfoLine label="Quiz average" value={`${profile?.quizAverage ?? 0}%`} />
            <InfoLine label="Internal average" value={`${profile?.internalAssessment ?? 0}%`} />
            <InfoLine label="Study hours" value={`${profile?.studyHoursPerWeek ?? 0}/week`} />
          </div>
        </div>
        <div className={layoutCardClass()}>
          <p className="text-lg font-semibold">Recommended next actions</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li>• Review weak quiz topics and solve previous crack papers.</li>
            <li>• Complete pending assignments before the next assessment.</li>
            <li>• Maintain a consistent study schedule for at least 2 weeks.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileForm>({ attendance: 88, assignmentCompletion: 76, quizAverage: 72, internalAssessment: 68, studyHoursPerWeek: 13, previousCgpa: 7.8 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/student/profile').then((res) => {
      const data = res.data.profile;
      if (data) setProfile(data);
    });
  }, []);

  const updateField = (field: keyof ProfileForm, value: number) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.put('/api/student/profile', profile);
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Unable to save academic profile.');
    }
  };

  return (
    <div className={layoutCardClass()}>
      <h2 className="text-2xl font-semibold">Academic profile</h2>
      <p className="mt-2 text-sm text-slate-400">Enter your latest academic indicators. These values feed the model and the what-if simulator.</p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        {Object.entries(profile).map(([key, value]) => (
          <label key={key} className="block text-sm text-slate-300">
            <span className="mb-2 block capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input type="number" value={value} onChange={(event) => updateField(key as keyof ProfileForm, Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" />
          </label>
        ))}
        <div className="md:col-span-2">
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">Save profile</button>
          <Link to="/student/risk" className="ml-3 inline-flex items-center rounded-xl border border-slate-700 px-5 py-3 font-medium text-white">Analyze My Performance</Link>
        </div>
      </form>
      {message && <p className="mt-5 text-sm text-emerald-300">{message}</p>}
    </div>
  );
}

export function RiskAnalysisPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/student/profile').then(async (res) => {
      const profile = res.data.profile;
      if (!profile) return;
      try {
        const response = await api.post('/api/student/analyze', {});
        setResult(response.data.prediction);
      } catch {
        setError('Prediction could not be generated.');
      }
    });
  }, []);

  if (error) return <div className={layoutCardClass()}>{error}</div>;
  if (!result) return <div className={layoutCardClass()}>Loading risk analysis…</div>;

  return (
    <div className={layoutCardClass()}>
      <h2 className="text-2xl font-semibold">Risk analysis</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Current category" value={result.riskCategory} tone="blue" />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Probability" value={`${(result.riskProbability * 100).toFixed(0)}%`} tone="green" />
        <MetricCard icon={<Sparkles className="h-5 w-5" />} label="Model" value={result.modelVersion} tone="purple" />
      </div>
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <h3 className="font-semibold">Individual explanation</h3>
        <p className="mt-2 text-sm text-slate-300">{result.explanation?.explanation}</p>
        <p className="mt-2 text-xs text-slate-500">Explanation method: {result.explanation?.method || 'unavailable'}. Model contributions show association, not causation.</p>
      </div>
      <p className="mt-6 text-slate-300">{result.disclaimer}</p>
    </div>
  );
}

export function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/student/history').then((res) => setHistory(res.data.history)).catch(() => setHistory([]));
  }, []);

  return (
    <div className={layoutCardClass()}>
      <h2 className="text-2xl font-semibold">Prediction history</h2>
      {history.length === 0 ? <p className="mt-4 text-slate-400">No predictions yet.</p> : <div className="mt-5 space-y-3">{history.map((item) => (
        <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div>
            <p className="font-medium text-white">{new Date(item.createdAt).toLocaleDateString()}</p>
            <p className="text-sm text-slate-400">{item.riskCategory}</p>
          </div>
          <p className="font-semibold text-blue-300">{(item.riskProbability * 100).toFixed(0)}%</p>
        </div>
      ))}</div>}
    </div>
  );
}

export function SimulationPage() {
  const [profile, setProfile] = useState<ProfileForm>( { attendance: 88, assignmentCompletion: 76, quizAverage: 72, internalAssessment: 68, studyHoursPerWeek: 13, previousCgpa: 7.8 });
  const [scenario, setScenario] = useState<ProfileForm>(profile);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/student/profile').then((res) => {
      if (res.data.profile) {
        setProfile(res.data.profile);
        setScenario(res.data.profile);
      }
    });
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

  return (
    <div className={layoutCardClass()}>
      <h2 className="text-2xl font-semibold">What-if simulator</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Object.entries(scenario).map(([key, value]) => (
          <label key={key} className="block text-sm text-slate-300">
            <span className="mb-2 block capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <input type="number" min={key === 'previousCgpa' ? 0 : 0} max={key === 'previousCgpa' ? 10 : 100} step={key === 'previousCgpa' ? 0.1 : 1} value={value} onChange={(event) => setScenario((current) => ({ ...current, [key]: Number(event.target.value) }))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" />
          </label>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <button onClick={handleSimulate} disabled={loading} className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-slate-950 disabled:opacity-60">{loading ? 'Running…' : 'Run simulation'}</button>
        <button onClick={() => { setScenario(profile); setResult(null); }} className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-white">Reset to saved profile</button>
      </div>
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {result && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <MetricCard icon={<TrendingUp className="h-5 w-5" />} label={`Baseline · ${result.baseline.riskCategory}`} value={`${(result.baseline.riskProbability * 100).toFixed(0)}%`} tone="blue" />
          <MetricCard icon={<Activity className="h-5 w-5" />} label={`Hypothetical · ${result.hypothetical.riskCategory}`} value={`${(result.hypothetical.riskProbability * 100).toFixed(0)}%`} tone="green" />
          <p className="text-sm text-slate-400 md:col-span-2">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}

export function FacultyDashboard() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.get('/api/faculty/dashboard').then((res) => setSummary(res.data.summary)).catch(() => setSummary(null));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold">Faculty dashboard</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<GraduationCap className="h-5 w-5" />} label="Total students" value={String(summary?.totalStudents ?? 0)} tone="blue" />
        <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Low risk" value={String(summary?.lowRisk ?? 0)} tone="green" />
        <MetricCard icon={<Activity className="h-5 w-5" />} label="Medium risk" value={String(summary?.mediumRisk ?? 0)} tone="amber" />
        <MetricCard icon={<BookOpen className="h-5 w-5" />} label="High risk" value={String(summary?.highRisk ?? 0)} tone="red" />
      </div>
    </div>
  );
}

export function FacultyStudents() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/faculty/students').then((res) => setStudents(res.data.students)).catch(() => setStudents([]));
  }, []);

  return (
    <div className={layoutCardClass()}>
      <h2 className="text-2xl font-semibold">Students</h2>
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-300">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Attendance</th>
              <th className="p-3">Quiz</th>
              <th className="p-3">Risk</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-slate-800">
                <td className="p-3">{student.name}</td>
                <td className="p-3">{student.profile?.attendance ?? '–'}</td>
                <td className="p-3">{student.profile?.quizAverage ?? '–'}</td>
                <td className="p-3">{student.latestRiskCategory}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FacultyMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  useEffect(() => {
    api.get('/api/faculty/model-metrics').then((res) => setMetrics(res.data)).catch(() => setMetrics(null));
  }, []);

  return (
    <div className={layoutCardClass()}>
      <h2 className="text-2xl font-semibold">Model metrics</h2>
      {metrics ? <div className="mt-5 grid gap-4 md:grid-cols-2">{Object.entries(metrics).slice(0, 8).map(([key, value]) => (
        <div key={key} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{key}</p>
          <p className="mt-2 text-lg font-semibold text-white">{String(value)}</p>
        </div>
      ))}</div> : <p className="mt-4 text-slate-400">Metrics unavailable. Train the ML model to populate this page.</p>}
    </div>
  );
}

export function MetricCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'blue' | 'green' | 'purple' | 'amber' | 'red' }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-300',
    green: 'bg-emerald-500/10 text-emerald-300',
    purple: 'bg-violet-500/10 text-violet-300',
    amber: 'bg-amber-500/10 text-amber-300',
    red: 'bg-red-500/10 text-red-300',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}



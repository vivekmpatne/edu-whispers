// In-memory demo store, same as the original backend (resets on server restart).
import bcrypt from "bcryptjs";

export type UserRole = "student" | "faculty";
export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  usn?: string;
  branch?: string;
  section?: string;
};
export type DataComment = {
  id: string;
  userId: string;
  field: string;
  comment: string;
  status: "open" | "resolved";
  facultyReply?: string;
  createdAt: string;
};
export type StudentProfile = {
  id: string;
  userId: string;
  attendance: number;
  assignmentCompletion: number;
  quizAverage: number;
  internalAssessment: number;
  studyHoursPerWeek: number;
  previousCgpa: number;
  updatedAt: string;
};
export type PredictionRecord = {
  id: string;
  userId: string;
  profile: StudentProfile;
  riskProbability: number;
  riskCategory: string;
  modelVersion: string;
  disclaimer: string;
  createdAt: string;
};

type Db = { users: User[]; profiles: StudentProfile[]; predictions: PredictionRecord[]; comments: DataComment[]; seeded?: Promise<void> };
const g = globalThis as unknown as { __explainedu?: Db };
const db: Db = (g.__explainedu ??= { users: [], profiles: [], predictions: [], comments: [] });
db.comments ??= [];
export const { users, profiles, predictions } = db;
export const comments = db.comments;

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export function seedDemoUsers(): Promise<void> {
  db.seeded ??= (async () => {
    if (users.length > 0) return;
    const s = await bcrypt.hash("student123", 10);
    const f = await bcrypt.hash("faculty123", 10);
    const now = new Date().toISOString();
    users.push(
      { id: "user-student-demo", name: "Aditi Sharma", email: "student@demo.com", passwordHash: s, role: "student", createdAt: now, usn: "1XE23CS000", branch: "CSE", section: "A" },
      { id: "user-faculty-demo", name: "Dr. Meera Rao", email: "faculty@demo.com", passwordHash: f, role: "faculty", createdAt: now },
    );
    profiles.push({
      id: "profile-demo-student",
      userId: "user-student-demo",
      attendance: 88,
      assignmentCompletion: 76,
      quizAverage: 72,
      internalAssessment: 68,
      studyHoursPerWeek: 13,
      previousCgpa: 7.8,
      updatedAt: now,
    });
    seedSyntheticStudents(s, now);
  })();
  return db.seeded;
}

export const getUserByEmail = (email: string) => users.find((u) => u.email.toLowerCase() === email.toLowerCase());
export const getUserById = (id: string) => users.find((u) => u.id === id);
export const getStudentProfile = (userId: string) => profiles.find((p) => p.userId === userId);

export function setStudentProfile(userId: string, profile: Omit<StudentProfile, "id" | "userId" | "updatedAt">) {
  const existing = getStudentProfile(userId);
  const next: StudentProfile = { id: existing?.id || uid("profile"), userId, ...profile, updatedAt: new Date().toISOString() };
  if (existing) profiles[profiles.findIndex((p) => p.id === existing.id)] = next;
  else profiles.push(next);
  return next;
}

export const addPrediction = (p: PredictionRecord) => (predictions.push(p), p);
export const getUserPredictions = (userId: string) =>
  predictions.filter((p) => p.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export function getAllStudents() {
  return users
    .filter((u) => u.role === "student")
    .map((user) => ({ user, profile: getStudentProfile(user.id), latestPrediction: getUserPredictions(user.id)[0] }));
}

export function buildFacultySummary() {
  const students = getAllStudents();
  const t = { totalStudents: students.length, lowRisk: 0, mediumRisk: 0, highRisk: 0, withoutRecentPrediction: 0 };
  for (const s of students) {
    const c = s.latestPrediction?.riskCategory?.toLowerCase();
    if (c === "low") t.lowRisk += 1;
    if (c === "medium") t.mediumRisk += 1;
    if (c === "high") t.highRisk += 1;
    if (!s.latestPrediction) t.withoutRecentPrediction += 1;
  }
  return t;
}

// ---- 100 synthetic students (deterministic, password "student123")
const FIRST = ["Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Rohan", "Karthik", "Ishaan", "Rahul", "Nikhil", "Ananya", "Diya", "Priya", "Sneha", "Kavya", "Meera", "Pooja", "Riya", "Shreya", "Neha"];
const LAST = ["Sharma", "Patil", "Rao", "Reddy", "Kumar", "Nair", "Joshi", "Hegde", "Shetty", "Gowda", "Iyer", "Kulkarni", "Desai", "Naik", "Bhat"];
const BRANCHES = ["CS", "IS", "EC", "ME", "CV"];
const SECTIONS = ["A", "B", "C"];

function seedSyntheticStudents(passwordHash: string, now: string) {
  let seed = 42;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const between = (lo: number, hi: number, dp = 0) => Number((lo + rand() * (hi - lo)).toFixed(dp));
  for (let i = 1; i <= 100; i++) {
    const n = String(i).padStart(3, "0");
    const branch = BRANCHES[(i - 1) % BRANCHES.length]!;
    const id = `user-syn-${n}`;
    users.push({
      id,
      name: `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`,
      email: `student${n}@explainedu.edu`,
      passwordHash,
      role: "student",
      createdAt: now,
      usn: `1XE23${branch}${n}`,
      branch,
      section: SECTIONS[(i - 1) % SECTIONS.length]!,
    });
    const weak = rand() < 0.2;
    profiles.push({
      id: `profile-syn-${n}`,
      userId: id,
      attendance: weak ? between(45, 75) : between(70, 98),
      assignmentCompletion: weak ? between(30, 70) : between(65, 100),
      quizAverage: weak ? between(25, 60) : between(55, 95),
      internalAssessment: weak ? between(30, 62) : between(58, 95),
      studyHoursPerWeek: weak ? between(2, 8) : between(6, 25),
      previousCgpa: weak ? between(4, 6.5, 1) : between(6, 9.6, 1),
      updatedAt: now,
    });
  }
}

export const getUserByUsn = (usn: string) => users.find((u) => u.usn && u.usn.toLowerCase() === usn.trim().toLowerCase());

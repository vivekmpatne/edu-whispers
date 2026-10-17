// In-memory demo store, same as the original backend (resets on server restart).
import bcrypt from "bcryptjs";

export type UserRole = "student" | "faculty";
export type User = { id: string; name: string; email: string; passwordHash: string; role: UserRole; createdAt: string };
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

type Db = { users: User[]; profiles: StudentProfile[]; predictions: PredictionRecord[]; seeded?: Promise<void> };
const g = globalThis as unknown as { __explainedu?: Db };
const db: Db = (g.__explainedu ??= { users: [], profiles: [], predictions: [] });
export const { users, profiles, predictions } = db;

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export function seedDemoUsers(): Promise<void> {
  db.seeded ??= (async () => {
    if (users.length > 0) return;
    const s = await bcrypt.hash("student123", 10);
    const f = await bcrypt.hash("faculty123", 10);
    const now = new Date().toISOString();
    users.push(
      { id: "user-student-demo", name: "Aditi Sharma", email: "student@demo.com", passwordHash: s, role: "student", createdAt: now },
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

// Port of the original Express backend (auth, student, faculty routes).
import { createFileRoute } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import * as store from "@/server/explainedu/store";
import * as ml from "@/server/explainedu/ml";

const json = (body: unknown, status = 200) => Response.json(body, { status });
const secret = () => new TextEncoder().encode(process.env["JWT_SECRET"] || "development-secret");
const publicUser = (u: store.User) => ({ ...u, passwordHash: undefined });

async function signToken(user: store.User) {
  return new SignJWT({ role: user.role, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(process.env["JWT_EXPIRES_IN"] || "7d")
    .sign(secret());
}

async function authenticate(req: Request): Promise<store.User | Response> {
  const h = req.headers.get("authorization");
  if (!h || !h.startsWith("Bearer ")) return json({ message: "Authentication token missing." }, 401);
  try {
    const { payload } = await jwtVerify(h.replace("Bearer ", ""), secret());
    const user = store.getUserById(String(payload.sub));
    if (!user) return json({ message: "User not found for token." }, 401);
    return user;
  } catch {
    return json({ message: "Invalid or expired token." }, 401);
  }
}

const readJson = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return {};
  }
};

const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const profileSchema = z.object({
  attendance: z.number().min(0).max(100),
  assignmentCompletion: z.number().min(0).max(100),
  quizAverage: z.number().min(0).max(100),
  internalAssessment: z.number().min(0).max(100),
  studyHoursPerWeek: z.number().min(0).max(100),
  previousCgpa: z.number().min(0).max(10),
});

function buildActionPlan(p: z.infer<typeof profileSchema>) {
  const a: Array<{ title: string; detail: string; target: string; current: number }> = [];
  if (p.quizAverage < 60) a.push({ title: "Improve quiz performance", detail: "Review incorrect answers and practice weekly quizzes.", target: "Target 70% or higher", current: p.quizAverage });
  if (p.internalAssessment < 65) a.push({ title: "Reinforce internal assessments", detail: "Solve previous assessment papers and revisit weak topics.", target: "Target 75% or higher", current: p.internalAssessment });
  if (p.assignmentCompletion < 75) a.push({ title: "Submit pending assignments", detail: "Prioritize assignment deadlines and complete unfinished tasks.", target: "Target 90% completion", current: p.assignmentCompletion });
  if (p.attendance < 75) a.push({ title: "Improve attendance", detail: "Attend lectures consistently and make up missed classes when possible.", target: "Target 85%", current: p.attendance });
  return a.slice(0, 3);
}

function toFeatures(p: store.StudentProfile) {
  return {
    attendance: p.attendance,
    assignment_completion: p.assignmentCompletion,
    quiz_average: p.quizAverage,
    internal_average: p.internalAssessment,
    study_hours_per_week: p.studyHoursPerWeek,
    previous_cgpa: p.previousCgpa,
  };
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0]!.split(",").map((s) => s.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((s) => s.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });
}

async function readCsvFile(req: Request): Promise<string | null> {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") return null;
    if (file.size > 2 * 1024 * 1024) return null;
    return await file.text();
  } catch {
    return null;
  }
}

async function handle(req: Request, path: string): Promise<Response> {
  await store.seedDemoUsers();
  const method = req.method;
  const route = `${method} /${path.replace(/\/+$/, "")}`;

  if (route === "GET /health") return json({ status: "ok", service: "ExplainEdu API", environment: process.env["NODE_ENV"] || "development" });

  // ---- auth
  if (route === "POST /auth/register") {
    const parsed = registerSchema.safeParse(await readJson(req));
    if (!parsed.success) return json({ message: "Invalid registration data.", errors: parsed.error.flatten() }, 400);
    const { name, email, password } = parsed.data;
    if (store.getUserByEmail(email)) return json({ message: "A user with this email already exists." }, 409);
    const user: store.User = { id: store.uid("user"), name, email, passwordHash: await bcrypt.hash(password, 10), role: "student", createdAt: new Date().toISOString() };
    store.users.push(user);
    return json({ token: await signToken(user), user: publicUser(user) }, 201);
  }
  if (route === "POST /auth/demo-faculty") {
    if ((process.env["NODE_ENV"] || "development") !== "development") return json({ message: "This route is only available in development mode." }, 403);
    const parsed = registerSchema.safeParse(await readJson(req));
    if (!parsed.success) return json({ message: "Invalid faculty demo account data.", errors: parsed.error.flatten() }, 400);
    if (store.getUserByEmail(parsed.data.email)) return json({ message: "A user with this email already exists." }, 409);
    const user: store.User = { id: store.uid("demo-faculty"), name: parsed.data.name, email: parsed.data.email, passwordHash: await bcrypt.hash(parsed.data.password, 10), role: "faculty", createdAt: new Date().toISOString() };
    store.users.push(user);
    return json({ token: await signToken(user), user: publicUser(user) }, 201);
  }
  if (route === "POST /auth/login") {
    const parsed = loginSchema.safeParse(await readJson(req));
    if (!parsed.success) return json({ message: "Invalid login payload." }, 400);
    const user = store.getUserByEmail(parsed.data.email);
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return json({ message: "Invalid email or password." }, 401);
    return json({ token: await signToken(user), user: publicUser(user) });
  }
  if (route === "GET /auth/me") {
    const user = await authenticate(req);
    if (user instanceof Response) return user;
    return json({ user: publicUser(user) });
  }

  // ---- student
  if (path.startsWith("student")) {
    const user = await authenticate(req);
    if (user instanceof Response) return user;
    if (user.role !== "student") return json({ message: "Access denied for this role." }, 403);

    if (route === "GET /student/profile") return json({ profile: store.getStudentProfile(user.id) || null });
    if (route === "PUT /student/profile") {
      const parsed = profileSchema.safeParse(await readJson(req));
      if (!parsed.success) return json({ message: "Invalid academic profile.", errors: parsed.error.flatten() }, 400);
      return json({ message: "Academic profile saved successfully.", profile: store.setStudentProfile(user.id, parsed.data) });
    }
    if (route === "POST /student/analyze") {
      const profile = store.getStudentProfile(user.id);
      if (!profile) return json({ message: "Save your academic profile before analyzing." }, 404);
      const prediction = ml.predictRisk(toFeatures(profile));
      const explanation = ml.explainPrediction();
      store.addPrediction({
        id: store.uid("prediction"),
        userId: user.id,
        profile,
        riskProbability: prediction.riskProbability,
        riskCategory: prediction.riskCategory,
        modelVersion: prediction.modelVersion,
        disclaimer: prediction.disclaimer,
        createdAt: new Date().toISOString(),
      });
      return json({ prediction: { ...prediction, explanation } });
    }
    if (route === "GET /student/history") return json({ history: store.getUserPredictions(user.id) });
    if (route === "POST /student/simulate") {
      const body = await readJson(req);
      if (ml.validateFeatures(body)) return json({ message: "Simulation could not be completed." }, 502);
      return json({ simulation: ml.simulate(body) });
    }
    if (route === "GET /student/action-plan") {
      const profile = store.getStudentProfile(user.id);
      if (!profile) return json({ message: "No profile found." }, 404);
      return json({ actions: buildActionPlan(profile) });
    }
  }

  // ---- faculty
  if (path.startsWith("faculty")) {
    const user = await authenticate(req);
    if (user instanceof Response) return user;
    if (user.role !== "faculty") return json({ message: "Access denied for this role." }, 403);

    if (route === "GET /faculty/dashboard") return json({ summary: store.buildFacultySummary() });
    if (route === "GET /faculty/students") {
      return json({
        students: store.getAllStudents().map((s) => ({
          id: s.user.id,
          name: s.user.name,
          email: s.user.email,
          profile: s.profile,
          latestRiskCategory: s.latestPrediction?.riskCategory || "Unanalysed",
          lastAnalysis: s.latestPrediction?.createdAt || null,
        })),
      });
    }
    const m = /^GET \/faculty\/students\/([^/]+)$/.exec(route);
    if (m) {
      const student = store.getUserById(decodeURIComponent(m[1]!));
      if (!student || student.role !== "student") return json({ message: "Student not found." }, 404);
      const latest = store.getAllStudents().find((s) => s.user.id === student.id)?.latestPrediction;
      // Matches original: returns the user object as stored.
      return json({ user: student, profile: store.getStudentProfile(student.id), latestPrediction: latest || null });
    }
    if (route === "POST /faculty/import/preview") {
      const text = await readCsvFile(req);
      if (text == null) return json({ message: "No CSV file uploaded." }, 400);
      const rows = parseCsv(text);
      if (rows.length === 0) return json({ message: "The uploaded CSV is empty or malformed." }, 400);
      const required = ["student_id", "student_name", "attendance", "assignment_completion", "quiz_average", "internal_average", "study_hours_per_week", "previous_cgpa"];
      const missing = required.filter((c) => !Object.keys(rows[0]!).includes(c));
      if (missing.length) return json({ message: "CSV is missing required columns.", missing }, 400);
      return json({ preview: rows.slice(0, 5), totalRows: rows.length });
    }
    if (route === "POST /faculty/import/process") {
      const text = await readCsvFile(req);
      if (text == null) return json({ message: "No CSV file uploaded." }, 400);
      const rows = parseCsv(text);
      const valid: Array<{ student_id: string; values: Record<string, number> }> = [];
      const invalidRows: Array<{ row: number; errors: string[] }> = [];
      rows.forEach((row, i) => {
        const values: Record<string, number> = {};
        const errors: string[] = [];
        for (const k of ml.FEATURE_COLUMNS) {
          values[k] = Number(row[k]);
          if (Number.isNaN(values[k])) errors.push(`${k} is not a valid number.`);
        }
        if (errors.length) invalidRows.push({ row: i + 2, errors });
        else valid.push({ student_id: String(row["student_id"]), values });
      });
      const processed = [];
      for (const v of valid) {
        if (ml.validateFeatures(v.values)) return json({ message: "Internal server error." }, 500);
        const p = ml.predictRisk(v.values);
        processed.push({ student_id: v.student_id, riskCategory: p.riskCategory, riskProbability: p.riskProbability });
      }
      return json({ totalRows: rows.length, validRows: valid.length, rejectedRows: invalidRows.length, invalidRows, processed });
    }
    if (route === "GET /faculty/model-metrics") return json(ml.modelMetrics());
  }

  return json({ message: "Not found." }, 404);
}

const handler = async ({ request, params }: { request: Request; params: { _splat?: string } }) => {
  try {
    return await handle(request, params._splat ?? "");
  } catch (err) {
    console.error(err);
    return json({ message: "Internal server error." }, 500);
  }
};

export const Route = createFileRoute("/api/$")({
  server: { handlers: { GET: handler, POST: handler, PUT: handler } },
});

// Port of the original Python FastAPI ML service. The RandomForest (with its
// StandardScaler) was trained with the repo's own scripts and exported to JSON.
import model from "./model.json";
import metrics from "./model_metrics.json";

type Tree = { l: number[]; r: number[]; f: number[]; t: number[]; p: number[] };
const M = model as { mean: number[]; scale: number[]; trees: Tree[] };

export const FEATURE_COLUMNS = [
  "attendance",
  "assignment_completion",
  "quiz_average",
  "internal_average",
  "study_hours_per_week",
  "previous_cgpa",
] as const;

export type Features = Record<string, number>;

function probability(payload: Features): number {
  const x = FEATURE_COLUMNS.map((name, i) => (Number(payload[name] ?? 0) - M.mean[i]!) / M.scale[i]!);
  let sum = 0;
  for (const tree of M.trees) {
    let node = 0;
    while (tree.l[node] !== -1) {
      // sklearn compares float32 features against thresholds
      const v = Math.fround(x[tree.f[node]!]!);
      node = v <= tree.t[node]! ? tree.l[node]! : tree.r[node]!;
    }
    sum += tree.p[node]!;
  }
  return sum / M.trees.length;
}

export function riskThreshold(p: number, low = 0.3, medium = 0.6) {
  if (p < low) return "low";
  if (p < medium) return "medium";
  return "high";
}

export function validateFeatures(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Invalid body";
  for (const name of FEATURE_COLUMNS) {
    const v = (body as Record<string, unknown>)[name];
    const max = name === "previous_cgpa" ? 10 : 100;
    if (typeof v !== "number" || Number.isNaN(v) || v < 0 || v > max) return `${name} invalid`;
  }
  return null;
}

export function predictRisk(payload: Features) {
  const p = probability(payload);
  return {
    riskProbability: Math.round(p * 10000) / 10000,
    riskCategory: riskThreshold(p, metrics.risk_low_threshold, metrics.risk_medium_threshold),
    modelVersion: metrics.modelVersion,
    modelStatus: metrics.status,
    disclaimer: metrics.disclaimer,
  };
}

// The original service calls shap.Explainer on the sklearn Pipeline, which fails
// and always returns this labeled fallback. Kept identical so behavior matches.
export function explainPrediction() {
  return {
    featureImportance: FEATURE_COLUMNS.map((name) => ({ name, value: 0 })),
    topFeatures: FEATURE_COLUMNS.slice(0, 3).map((name) => ({ name, contribution: 0, direction: "positive" })),
    explanation:
      "SHAP could not be generated for this prediction. The model remains available and the fallback explanation is clearly labeled.",
    method: "fallback",
  };
}

export function simulate(body: Features & { hypothetical_changes?: Record<string, number> }) {
  const baselinePayload: Features = {};
  for (const n of FEATURE_COLUMNS) baselinePayload[n] = body[n]!;
  const hypothetical = { ...baselinePayload };
  for (const [field, value] of Object.entries(body.hypothetical_changes ?? {})) {
    if (field in hypothetical) {
      hypothetical[field] = Math.min(field === "previous_cgpa" ? 10 : 100, Math.max(0, hypothetical[field]! + Number(value)));
    }
  }
  const baseline = predictRisk(baselinePayload);
  const hyp = predictRisk(hypothetical);
  return {
    baseline,
    hypothetical: hyp,
    difference: Math.round((hyp.riskProbability - baseline.riskProbability) * 10000) / 10000,
    disclaimer:
      "This is a hypothetical simulation using the same trained demonstration model. It is not a guarantee of an academic outcome.",
  };
}

export function modelMetrics() {
  return metrics;
}

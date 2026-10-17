import { createFileRoute } from "@tanstack/react-router";
import { FacultyMetrics } from "@/explainedu/pages";
export const Route = createFileRoute("/faculty/model-metrics")({
  head: () => ({ meta: [{ title: "Model metrics · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Model metrics" }, { property: "og:title", content: "Model metrics · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Model metrics" }] }),
  component: FacultyMetrics,
});

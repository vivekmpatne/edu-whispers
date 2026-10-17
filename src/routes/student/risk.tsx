import { createFileRoute } from "@tanstack/react-router";
import { RiskAnalysisPage } from "@/explainedu/pages";
export const Route = createFileRoute("/student/risk")({
  head: () => ({ meta: [{ title: "Risk analysis · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Risk analysis" }, { property: "og:title", content: "Risk analysis · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Risk analysis" }] }),
  component: RiskAnalysisPage,
});

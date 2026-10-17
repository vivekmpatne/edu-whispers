import { createFileRoute } from "@tanstack/react-router";
import { HistoryPage } from "@/explainedu/pages";
export const Route = createFileRoute("/student/history")({
  head: () => ({ meta: [{ title: "Prediction history · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Prediction history" }, { property: "og:title", content: "Prediction history · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Prediction history" }] }),
  component: HistoryPage,
});

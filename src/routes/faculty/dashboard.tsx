import { createFileRoute } from "@tanstack/react-router";
import { FacultyDashboard } from "@/explainedu/pages";
export const Route = createFileRoute("/faculty/dashboard")({
  head: () => ({ meta: [{ title: "Faculty dashboard · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Faculty dashboard" }, { property: "og:title", content: "Faculty dashboard · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Faculty dashboard" }] }),
  component: FacultyDashboard,
});

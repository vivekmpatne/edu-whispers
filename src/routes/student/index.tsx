import { createFileRoute, Navigate } from "@tanstack/react-router";
function Page() { return <Navigate to="/student/dashboard" replace />; }
export const Route = createFileRoute("/student/")({
  head: () => ({ meta: [{ title: "Student · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Student" }, { property: "og:title", content: "Student · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Student" }] }),
  component: Page,
});

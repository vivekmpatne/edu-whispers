import { createFileRoute, Navigate } from "@tanstack/react-router";
function Page() { return <Navigate to="/faculty/dashboard" replace />; }
export const Route = createFileRoute("/faculty/")({
  head: () => ({ meta: [{ title: "Faculty · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Faculty" }, { property: "og:title", content: "Faculty · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Faculty" }] }),
  component: Page,
});

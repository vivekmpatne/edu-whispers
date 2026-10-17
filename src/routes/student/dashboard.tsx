import { createFileRoute } from "@tanstack/react-router";
import { StudentDashboard } from "@/explainedu/pages";
import { useAuth } from "@/explainedu/auth";
function Page() { const { user } = useAuth(); return user ? <StudentDashboard user={user} /> : null; }
export const Route = createFileRoute("/student/dashboard")({
  head: () => ({ meta: [{ title: "Student dashboard · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Student dashboard" }, { property: "og:title", content: "Student dashboard · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Student dashboard" }] }),
  component: Page,
});

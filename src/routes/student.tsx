import { createFileRoute, Navigate } from "@tanstack/react-router";
import { StudentApp } from "@/explainedu/pages";
import { useAuth } from "@/explainedu/auth";
function Page() {
  const { user, logout } = useAuth();
  if (!user || user.role !== "student") return <Navigate to="/login" replace />;
  return <StudentApp user={user} onLogout={logout} />;
}
export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Student workspace · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Student workspace" }, { property: "og:title", content: "Student workspace · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Student workspace" }] }),
  component: Page,
});

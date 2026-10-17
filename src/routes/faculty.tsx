import { createFileRoute, Navigate } from "@tanstack/react-router";
import { FacultyApp } from "@/explainedu/pages";
import { useAuth } from "@/explainedu/auth";
function Page() {
  const { user, logout } = useAuth();
  if (!user || user.role !== "faculty") return <Navigate to="/login" replace />;
  return <FacultyApp user={user} onLogout={logout} />;
}
export const Route = createFileRoute("/faculty")({
  head: () => ({ meta: [{ title: "Faculty workspace · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Faculty workspace" }, { property: "og:title", content: "Faculty workspace · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Faculty workspace" }] }),
  component: Page,
});

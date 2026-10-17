import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LoginPage } from "@/explainedu/pages";
import { useAuth } from "@/explainedu/auth";
function Page() {
  const { user, setUser, setToken } = useAuth();
  if (user) return <Navigate to={user.role === "faculty" ? "/faculty/dashboard" : "/student/dashboard"} replace />;
  return <LoginPage onLogin={setUser} setToken={setToken} />;
}
export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Login" }, { property: "og:title", content: "Login · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Login" }] }),
  component: Page,
});

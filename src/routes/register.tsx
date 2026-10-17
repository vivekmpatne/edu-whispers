import { createFileRoute, Navigate } from "@tanstack/react-router";
import { RegisterPage } from "@/explainedu/pages";
import { useAuth } from "@/explainedu/auth";
function Page() {
  const { user, setUser, setToken } = useAuth();
  if (user) return <Navigate to="/student/dashboard" replace />;
  return <RegisterPage onLogin={setUser} setToken={setToken} />;
}
export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Register" }, { property: "og:title", content: "Register · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Register" }] }),
  component: Page,
});

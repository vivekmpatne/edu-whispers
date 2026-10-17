import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/explainedu/pages";
import { useAuth } from "@/explainedu/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExplainEdu AI – Academic risk analysis demo" },
      { name: "description", content: "Students understand academic risk early; faculty see who may need support." },
      { property: "og:title", content: "ExplainEdu AI – Academic risk analysis demo" },
      { property: "og:description", content: "Students understand academic risk early; faculty see who may need support." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAuth();
  return <LandingPage user={user} />;
}

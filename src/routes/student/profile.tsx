import { createFileRoute } from "@tanstack/react-router";
import { StudentProfilePage } from "@/explainedu/pages";
export const Route = createFileRoute("/student/profile")({
  head: () => ({ meta: [{ title: "Academic profile · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Academic profile" }, { property: "og:title", content: "Academic profile · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Academic profile" }] }),
  component: StudentProfilePage,
});

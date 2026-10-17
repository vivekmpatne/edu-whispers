import { createFileRoute } from "@tanstack/react-router";
import { FacultyStudents } from "@/explainedu/pages";
export const Route = createFileRoute("/faculty/students")({
  head: () => ({ meta: [{ title: "Students · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – Students" }, { property: "og:title", content: "Students · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – Students" }] }),
  component: FacultyStudents,
});

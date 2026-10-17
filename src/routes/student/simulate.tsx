import { createFileRoute } from "@tanstack/react-router";
import { SimulationPage } from "@/explainedu/pages";
export const Route = createFileRoute("/student/simulate")({
  head: () => ({ meta: [{ title: "What-if simulator · ExplainEdu AI" }, { name: "description", content: "ExplainEdu AI – What-if simulator" }, { property: "og:title", content: "What-if simulator · ExplainEdu AI" }, { property: "og:description", content: "ExplainEdu AI – What-if simulator" }] }),
  component: SimulationPage,
});

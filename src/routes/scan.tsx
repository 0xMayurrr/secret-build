import { createFileRoute } from "@tanstack/react-router";
import { AdminDeskPage } from "./admin";

export const Route = createFileRoute("/scan")({
  component: AdminDeskPage,
});

import { createFileRoute } from "@tanstack/react-router";
import App from "../App";

export const Route = createFileRoute("/")({
  component: App,
  head: () => ({
    meta: [
      { title: "MoveHub - Stream Movies in 4K" },
      { name: "description", content: "Browse trending, top-rated, and upcoming movies powered by TMDB." },
    ],
  }),
});

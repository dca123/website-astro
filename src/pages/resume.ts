import type { APIRoute } from "astro";
import { readFileSync } from "fs";

export const GET: APIRoute = () => {
  const file = readFileSync("./src/resume.pdf");
  return new Response(file);
};

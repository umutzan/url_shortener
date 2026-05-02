import { getSetting } from "./db";

export async function getSiteUrl(): Promise<string> {
  const dbVal = getSetting("site_url");
  if (dbVal) return dbVal.replace(/\/$/, "");
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  return "http://localhost:3000";
}

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import LinkManager from "./LinkManager";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${proto}://${host}`;

  return <LinkManager username={session.username} baseUrl={baseUrl} />;
}

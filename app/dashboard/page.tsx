import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSiteUrl } from "@/lib/siteUrl";
import LinkManager from "./LinkManager";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <LinkManager username={session.username} baseUrl={getSiteUrl()} />;
}

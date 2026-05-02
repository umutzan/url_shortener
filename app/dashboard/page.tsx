import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSiteUrl } from "@/lib/siteUrl";
import { getSetting } from "@/lib/db";
import LinkManager from "./LinkManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Link Kısalt",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [baseUrl, defaultRedirect, siteUrlSetting] = await Promise.all([
    getSiteUrl(),
    Promise.resolve(getSetting("default_redirect") ?? ""),
    Promise.resolve(getSetting("site_url") ?? ""),
  ]);

  return (
    <LinkManager
      username={session.username}
      baseUrl={baseUrl}
      initialSettings={{ site_url: siteUrlSetting, default_redirect: defaultRedirect }}
    />
  );
}

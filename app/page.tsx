import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSetting } from "@/lib/db";

export default async function Home() {
  const defaultRedirect = getSetting("default_redirect");
  if (defaultRedirect) redirect(defaultRedirect);

  const session = await getSession();
  if (session) redirect("/dashboard");
  redirect("/login");
}

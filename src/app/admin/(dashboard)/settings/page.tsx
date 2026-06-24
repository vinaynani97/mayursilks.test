import { prisma } from "@/lib/db";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting
    .findMany({ orderBy: { key: "asc" } })
    .catch(() => []);
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return <AdminSettingsClient settings={settingsMap} />;
}

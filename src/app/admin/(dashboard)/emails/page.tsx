import { getEmailLogs, getEmailStats } from "@/actions/emails";
import AdminEmailsClient from "./AdminEmailsClient";

export default async function AdminEmailsPage() {
  const [logs, stats] = await Promise.all([
    getEmailLogs({ limit: 100 }),
    getEmailStats(),
  ]);

  return <AdminEmailsClient initialLogs={logs} stats={stats} />;
}

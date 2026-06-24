import { prisma } from "@/lib/db";
import AdminBlogsClient from "./AdminBlogsClient";

export default async function AdminBlogsPage() {
  const blogs = await prisma.blog
    .findMany({
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return <AdminBlogsClient blogs={blogs} />;
}

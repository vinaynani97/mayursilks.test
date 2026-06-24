export const metadata = { title: "Admin — Mayur Silks" };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root admin layout should be public. Route protection is handled
  // inside the (dashboard) route group layout so the login page stays public.
  return <>{children}</>;
}

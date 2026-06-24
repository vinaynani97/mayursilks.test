import AdminCouponsClient from "./AdminCouponsClient";
import { getCoupons, getCouponStats } from "@/actions/coupons";

export const metadata = { title: "Coupons — Admin" };

export default async function AdminCouponsPage() {
  const [coupons, stats] = await Promise.all([getCoupons(), getCouponStats()]);
  return <AdminCouponsClient coupons={coupons} stats={stats} />;
}

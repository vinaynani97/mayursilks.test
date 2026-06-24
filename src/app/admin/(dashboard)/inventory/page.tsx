import { getInventoryStats, getInventoryProducts, getInventoryHistory } from "@/actions/inventory";
import InventoryClient from "./InventoryClient";

export default async function AdminInventoryPage() {
  const [stats, products, history] = await Promise.all([
    getInventoryStats(),
    getInventoryProducts(),
    getInventoryHistory({ limit: 100 }),
  ]);

  return <InventoryClient stats={stats} products={products} history={history} />;
}

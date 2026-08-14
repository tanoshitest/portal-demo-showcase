export const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function stockStatus(qty: number): StockStatus {
  if (qty <= 0) return "out_of_stock";
  if (qty <= 5) return "low_stock";
  return "in_stock";
}

export const stockLabel: Record<StockStatus, string> = {
  in_stock: "Còn hàng",
  low_stock: "Sắp hết hàng",
  out_of_stock: "Hết hàng",
};

export function formatStock(qty: number) {
  return stockLabel[stockStatus(qty)];
}

export function stockBadgeClass(qty: number) {
  const status = stockStatus(qty);
  if (status === "in_stock") return "border-success/40 text-success";
  if (status === "out_of_stock") return "border-destructive/40 text-destructive";
  return "border-highlight/50 text-highlight-foreground";
}

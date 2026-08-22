import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CUSTOMERS_CHANGED_EVENT,
  loadEstimateCustomers,
  type EstimateCustomer,
} from "@/data/customers-store";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MANUAL_VALUE = "__manual__";

export function applyCustomerToEstimate(customer: EstimateCustomer | null) {
  if (!customer) {
    return { customerId: "" };
  }
  return {
    customerId: customer.id,
    customer: customer.name,
    phone: customer.phone,
    address: customer.address,
  };
}

export function EstimateCustomerSelect({
  customerId,
  onSelect,
  className,
  triggerClassName,
}: {
  customerId: string;
  onSelect: (customer: EstimateCustomer | null) => void;
  className?: string;
  triggerClassName?: string;
}) {
  const [customers, setCustomers] = useState<EstimateCustomer[]>(() => loadEstimateCustomers());

  useEffect(() => {
    const refresh = () => setCustomers(loadEstimateCustomers());
    window.addEventListener("focus", refresh);
    window.addEventListener(CUSTOMERS_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener(CUSTOMERS_CHANGED_EVENT, refresh);
    };
  }, []);

  const selected = customers.some((item) => item.id === customerId) ? customerId : MANUAL_VALUE;

  return (
    <div className={cn("grid min-w-0 gap-0.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[10px] font-medium leading-none text-muted-foreground">
          Chọn khách hàng
        </Label>
        <Link
          to="/portal/quan-ly-khach-hang"
          className="text-[10px] font-semibold text-brand hover:underline"
        >
          Quản lý
        </Link>
      </div>
      <Select
        value={selected}
        onValueChange={(value) => {
          if (value === MANUAL_VALUE) {
            onSelect(null);
            return;
          }
          onSelect(customers.find((item) => item.id === value) ?? null);
        }}
      >
        <SelectTrigger className={cn("h-10 min-w-0 px-3 text-sm sm:h-8 sm:px-2 sm:text-xs", triggerClassName)}>
          <SelectValue placeholder="Chọn khách cho báo giá" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={MANUAL_VALUE}>Nhập tay / chưa chọn</SelectItem>
          {customers.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
              {item.phone ? ` · ${item.phone}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultEvnTariffs,
  defaultPricingRules,
  defaultSolarProducts,
  type EvnTariff,
  type PricingRule,
  type Quote,
  type SolarProduct,
} from "@/data/solar";
import { persistLocalAndCloud } from "@/lib/cloud-state-client";

type SolarStore = {
  products: SolarProduct[];
  tariffs: EvnTariff[];
  rules: PricingRule[];
  quotes: Quote[];
  updateProduct: (id: string, patch: Partial<SolarProduct>) => void;
  addProduct: (product: SolarProduct) => void;
  removeProduct: (id: string) => void;
  updateTariff: (tier: number, patch: Partial<EvnTariff>) => void;
  updateRule: (id: string, patch: Partial<PricingRule>) => void;
  addRule: (rule: PricingRule) => void;
  removeRule: (id: string) => void;
  saveQuote: (quote: Quote) => void;
  removeQuote: (id: string) => void;
  resetConfig: () => void;
};

const SolarContext = createContext<SolarStore | null>(null);

const KEY = "hv_solar_v1";

type Persisted = {
  products: SolarProduct[];
  tariffs: EvnTariff[];
  rules: PricingRule[];
  quotes: Quote[];
};

export function SolarProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<SolarProduct[]>(defaultSolarProducts);
  const [tariffs, setTariffs] = useState<EvnTariff[]>(defaultEvnTariffs);
  const [rules, setRules] = useState<PricingRule[]>(defaultPricingRules);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<Persisted>;
        if (data.products?.length) setProducts(data.products);
        if (data.tariffs?.length) setTariffs(data.tariffs);
        if (data.rules?.length) setRules(data.rules);
        if (data.quotes) setQuotes(data.quotes);
      }
    } catch {
      /* bỏ qua dữ liệu lỗi */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistLocalAndCloud(KEY, { products, tariffs, rules, quotes });
  }, [hydrated, products, tariffs, rules, quotes]);

  const value = useMemo<SolarStore>(
    () => ({
      products,
      tariffs,
      rules,
      quotes,
      updateProduct: (id, patch) =>
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      addProduct: (product) => setProducts((prev) => [product, ...prev]),
      removeProduct: (id) => setProducts((prev) => prev.filter((p) => p.id !== id)),
      updateTariff: (tier, patch) =>
        setTariffs((prev) => prev.map((t) => (t.tier === tier ? { ...t, ...patch } : t))),
      updateRule: (id, patch) =>
        setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
      addRule: (rule) => setRules((prev) => [...prev, rule]),
      removeRule: (id) => setRules((prev) => prev.filter((r) => r.id !== id)),
      saveQuote: (quote) => setQuotes((prev) => [quote, ...prev.filter((q) => q.id !== quote.id)]),
      removeQuote: (id) => setQuotes((prev) => prev.filter((q) => q.id !== id)),
      resetConfig: () => {
        setProducts(defaultSolarProducts);
        setTariffs(defaultEvnTariffs);
        setRules(defaultPricingRules);
      },
    }),
    [products, tariffs, rules, quotes],
  );

  return <SolarContext.Provider value={value}>{children}</SolarContext.Provider>;
}

export function useSolar() {
  const ctx = useContext(SolarContext);
  if (!ctx) throw new Error("useSolar phải dùng bên trong SolarProvider");
  return ctx;
}

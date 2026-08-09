import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { portalUsers, products, type PortalUser } from "@/data/mock";

export type CartItem = {
  productSlug: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  createdAt: string;
};

type Store = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  user: PortalUser | null;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
  leads: Lead[];
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
};

const StoreContext = createContext<Store | null>(null);

const CART_KEY = "hv_cart";
const USER_KEY = "hv_portal_user";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<PortalUser | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      if (rawCart) setCart(JSON.parse(rawCart));
      const rawUser = localStorage.getItem(USER_KEY);
      if (rawUser) {
        const email = JSON.parse(rawUser) as string;
        const found = portalUsers.find((u) => u.email === email);
        if (found) setUser(found);
      }
    } catch {
      /* bỏ qua dữ liệu lỗi */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const value = useMemo<Store>(() => {
    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      cart,
      cartCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      cartTotal,
      addToCart: (item) =>
        setCart((prev) => {
          const existing = prev.find((i) => i.sku === item.sku);
          if (existing) {
            return prev.map((i) =>
              i.sku === item.sku ? { ...i, quantity: i.quantity + item.quantity } : i,
            );
          }
          return [...prev, item];
        }),
      updateQuantity: (sku, quantity) =>
        setCart((prev) =>
          prev.map((i) => (i.sku === sku ? { ...i, quantity: Math.max(1, quantity) } : i)),
        ),
      removeFromCart: (sku) => setCart((prev) => prev.filter((i) => i.sku !== sku)),
      clearCart: () => setCart([]),
      user,
      login: (email, password) => {
        const found = portalUsers.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        );
        if (!found) return { ok: false, message: "Email không tồn tại trong hệ thống Portal." };
        if (found.password !== password) return { ok: false, message: "Mật khẩu không đúng." };
        setUser(found);
        localStorage.setItem(USER_KEY, JSON.stringify(found.email));
        return { ok: true };
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem(USER_KEY);
      },
      leads,
      addLead: (lead) =>
        setLeads((prev) => [
          ...prev,
          { ...lead, id: `LEAD-${1000 + prev.length + 1}`, createdAt: new Date().toISOString() },
        ]),
    };
  }, [cart, user, leads]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore phải dùng bên trong StoreProvider");
  return ctx;
}

export const productBySku = (sku: string) =>
  products.find((p) => p.sku === sku || p.variants.some((v) => v.sku === sku));

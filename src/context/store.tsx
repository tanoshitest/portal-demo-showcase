import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type PortalUser } from "@/data/mock";
import { findPortalUser, loadPortalUsers } from "@/data/users-store";

export type CartItem = {
  productSlug: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
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
};

const StoreContext = createContext<Store | null>(null);

const CART_KEY = "hv_cart";
const USER_KEY = "hv_portal_user";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      if (rawCart) setCart(JSON.parse(rawCart));
      const rawUser = localStorage.getItem(USER_KEY);
      if (rawUser) {
        const email = JSON.parse(rawUser) as string;
        const found = loadPortalUsers().find((u) => u.email === email);
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
        const found = findPortalUser(email, password);
        if (!found) {
          const exists = findPortalUser(email);
          if (!exists) return { ok: false, message: "Email không tồn tại trong hệ thống Portal." };
          return { ok: false, message: "Mật khẩu không đúng." };
        }
        setUser(found);
        localStorage.setItem(USER_KEY, JSON.stringify(found.email));
        return { ok: true };
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem(USER_KEY);
      },
    };
  }, [cart, user]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore phải dùng bên trong StoreProvider");
  return ctx;
}

export const productBySku = (sku: string) =>
  products.find((p) => p.sku === sku || p.variants.some((v) => v.sku === sku));

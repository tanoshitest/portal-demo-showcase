import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type PortalUser } from "@/data/mock";
import { migrateLegacyUsersToCloud } from "@/data/users-store";
import {
  clearCloudSyncReloadFlag,
  reloadOnceAfterCloudSync,
  syncCloudStateWithLocal,
} from "@/lib/cloud-state-client";

export type CartItem = {
  productSlug: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
};

type LoginResult = { ok: boolean; message?: string };

type Store = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  user: PortalUser | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const StoreContext = createContext<Store | null>(null);

const CART_KEY = "hv_cart";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      if (rawCart) setCart(JSON.parse(rawCart));
    } catch {
      // Ignore malformed browser cache and let the cloud session restore it.
    }

    void fetch("/api/auth/session", { credentials: "include" })
      .then(async (response) => {
        if (response.status === 503) return;
        if (!response.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const result = (await response.json()) as { user?: PortalUser };
        if (!result.user || cancelled) return;
        setUser(result.user);
        if (result.user.role === "admin") await migrateLegacyUsersToCloud();
        const syncResult = await syncCloudStateWithLocal();
        if (syncResult === "changed") reloadOnceAfterCloudSync();
        else clearCloudSyncReloadFlag();
      })
      .catch(() => {
        // Keep using the browser cache while the Worker is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!user) return;
    let syncing = false;
    const sync = async () => {
      if (syncing) return;
      syncing = true;
      const result = await syncCloudStateWithLocal();
      syncing = false;
      if (result === "changed") reloadOnceAfterCloudSync();
      else if (result === "unchanged") clearCloudSyncReloadFlag();
    };
    const handleFocus = () => void sync();
    const interval = window.setInterval(() => void sync(), 60_000);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  const value = useMemo<Store>(() => {
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      cart,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      cartTotal,
      addToCart: (item) =>
        setCart((previous) => {
          const existing = previous.find((entry) => entry.sku === item.sku);
          if (existing) {
            return previous.map((entry) =>
              entry.sku === item.sku
                ? { ...entry, quantity: entry.quantity + item.quantity }
                : entry,
            );
          }
          return [...previous, item];
        }),
      updateQuantity: (sku, quantity) =>
        setCart((previous) =>
          previous.map((item) =>
            item.sku === sku ? { ...item, quantity: Math.max(1, quantity) } : item,
          ),
        ),
      removeFromCart: (sku) => setCart((previous) => previous.filter((item) => item.sku !== sku)),
      clearCart: () => setCart([]),
      user,
      login: async (email, password) => {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (response.ok) {
            const result = (await response.json()) as { user: PortalUser };
            if (result.user.role === "admin") await migrateLegacyUsersToCloud();
            const syncResult = await syncCloudStateWithLocal();
            if (syncResult === "changed") reloadOnceAfterCloudSync();
            else clearCloudSyncReloadFlag();
            setUser(result.user);
            return { ok: true };
          }
          if (response.status !== 503) {
            const result = (await response.json().catch(() => null)) as {
              message?: string;
            } | null;
            return { ok: false, message: result?.message ?? "Đăng nhập không thành công." };
          }
        } catch {
          return { ok: false, message: "Không thể kết nối Cloudflare. Vui lòng thử lại." };
        }
        return { ok: false, message: "Cloudflare D1 chưa được cấu hình cho môi trường này." };
      },
      logout: () => {
        setUser(null);
        clearCloudSyncReloadFlag();
        void fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
      },
    };
  }, [cart, user]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore phải dùng bên trong StoreProvider");
  return context;
}

export const productBySku = (sku: string) =>
  products.find(
    (product) => product.sku === sku || product.variants.some((variant) => variant.sku === sku),
  );

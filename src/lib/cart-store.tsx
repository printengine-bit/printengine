"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cartTotals, COUPONS, type CartLine } from "@/lib/pricing";

export {
  COUPONS,
  EXPRESS_FEE,
  FREE_SHIPPING_THRESHOLD,
  lineDecoration,
  lineTotal,
  METHOD_PRICE,
  productFor,
  SHIPPING_FEE,
  type CartLine,
} from "@/lib/pricing";

const STORAGE_KEY = "printengine.cart.v2";
const WISHLIST_KEY = "printengine.wishlist.v2";
const COUPON_KEY = "printengine.coupon.v2";

type Ctx = {
  hydrated: boolean;
  lines: CartLine[];
  wishlist: string[];
  itemCount: number;
  addLine: (line: Omit<CartLine, "id">) => string;
  setQty: (id: string, delta: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  inWishlist: (slug: string) => boolean;
  coupon: string | null;
  applyCoupon: (code: string) => { ok: boolean; message?: string };
  clearCoupon: () => void;
  totals: {
    subtotal: number;
    decoration: number;
    discount: number;
    adjustments: { id: string; label: string; amount: number; kind: "automatic" | "code" }[];
    shipping: number;
    total: number;
    freeShipping: boolean;
    remainingForFree: number;
  };
  express: boolean;
  setExpress: (v: boolean) => void;
};

const CartContext = createContext<Ctx | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [express, setExpress] = useState(false);

  // localStorage is unavailable during SSR, so the cart must be read after mount.
  // Reading it during render would make the server and client HTML disagree, so the
  // provider renders an empty cart on the server and fills it once mounted.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setLines(stored ? read<CartLine[]>(STORAGE_KEY, []) : []);
    setWishlist(read<string[]>(WISHLIST_KEY, []));
    setCoupon(localStorage.getItem(COUPON_KEY));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (coupon) localStorage.setItem(COUPON_KEY, coupon);
    else localStorage.removeItem(COUPON_KEY);
  }, [coupon, hydrated]);

  const addLine = useCallback((line: Omit<CartLine, "id">) => {
    const id = "l" + Math.abs(hashLine(line)).toString(36) + "-" + line.size + line.colour;
    setLines((prev) => {
      const match = prev.find((l) => l.id === id);
      if (match) {
        return prev.map((l) => (l.id === id ? { ...l, qty: Math.min(10, l.qty + line.qty) } : l));
      }
      return [...prev, { ...line, id }];
    });
    return id;
  }, []);

  const setQty = useCallback((id: string, delta: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(10, l.qty + delta)) } : l))
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const toggleWishlist = useCallback((slug: string) => {
    setWishlist((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }, []);

  const totals = useMemo(
    () => cartTotals(lines, { coupon, express }),
    [lines, coupon, express]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const key = code.trim().toUpperCase();
      if (!key) return { ok: false, message: "Enter a coupon code." };
      const c = COUPONS[key];
      if (!c) return { ok: false, message: "That code is not valid." };
      if (c.minimum && totals.subtotal + totals.decoration < c.minimum) {
        return {
          ok: false,
          message: `This code needs an order of ₹${c.minimum.toLocaleString("en-IN")} or more.`,
        };
      }
      setCoupon(key);
      return { ok: true };
    },
    [totals.subtotal, totals.decoration]
  );

  const value: Ctx = {
    hydrated,
    lines,
    wishlist,
    itemCount: lines.reduce((s, l) => s + l.qty, 0),
    addLine,
    setQty,
    removeLine,
    clearCart,
    toggleWishlist,
    inWishlist: (slug) => wishlist.includes(slug),
    coupon,
    applyCoupon,
    clearCoupon: () => setCoupon(null),
    totals,
    express,
    setExpress,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function hashLine(line: Omit<CartLine, "id">) {
  const key =
    line.slug +
    line.colour +
    line.size +
    line.method +
    line.designs.map((d) => d.area + JSON.stringify(d.design)).join("|");
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "./types";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  notes: string;
  setNotes: (s: string) => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

const KEY = "autopecas-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items ?? []);
        setNotes(parsed.notes ?? "");
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ items, notes }));
  }, [items, notes, hydrated]);

  const add: CartCtx["add"] = (p, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === p.id);
      if (found) {
        return prev.map((i) => (i.product.id === p.id ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...prev, { product: p, quantity: qty }];
    });
  };

  const remove: CartCtx["remove"] = (id) =>
    setItems((prev) => prev.filter((i) => i.product.id !== id));

  const setQty: CartCtx["setQty"] = (id, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, quantity: Math.max(1, qty) } : i)),
    );

  const clear = () => {
    setItems([]);
    setNotes("");
  };

  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, notes, setNotes, total, count }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

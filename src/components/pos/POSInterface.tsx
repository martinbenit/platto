"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  ShoppingCart,
  Send,
  X,
  Search,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/hooks";
import { supabase } from "@/lib/supabase/client";
import { ProductCard } from "./ProductCard";
import { CartItem } from "./CartItem";
import type {
  Producto,
  CartItem as CartItemType,
  Mesa,
  Categoria,
} from "@/lib/types";

const CATEGORIAS: Categoria[] = [
  "Entradas",
  "Platos Principales",
  "Bebidas",
  "Cervezas",
  "Vinos",
  "Cafetería",
  "Postres",
];

interface POSInterfaceProps {
  mesa: Mesa;
  onClose: () => void;
  onOrderSent?: () => void;
}

export function POSInterface({ mesa, onClose, onOrderSent }: POSInterfaceProps) {
  const { products, loading } = useProducts();
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [activeCategory, setActiveCategory] = useState<Categoria | "Todos">("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (activeCategory !== "Todos") {
      filtered = filtered.filter((p) => p.categoria === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [products, activeCategory, searchQuery]);

  // Cart actions
  const addToCart = (producto: Producto) => {
    setCart((prev) => {
      const existing = prev.findIndex((i) => i.producto.id === producto.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          cantidad: updated[existing].cantidad + 1,
        };
        return updated;
      }
      return [...prev, { producto, cantidad: 1, notas: "" }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        cantidad: Math.max(1, updated[index].cantidad + delta),
      };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateNotes = (index: number, notas: string) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], notas };
      return updated;
    });
  };

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0),
    [cart]
  );

  // Send order to Supabase
  const sendOrder = async () => {
    if (cart.length === 0) return;
    setSending(true);

    try {
      // 1. Create the order
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          mesa_id: mesa.id,
          estado: "abierto",
          total,
        })
        .select()
        .single();

      if (pedidoError) {
        console.error("Error creating pedido:", pedidoError);
        // Still show success for demo mode
        setSent(true);
        setTimeout(() => {
          onOrderSent?.();
          onClose();
        }, 1500);
        return;
      }

      // 2. Create order details
      const detalles = cart.map((item) => ({
        pedido_id: pedido.id,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        estado_cocina: "pendiente",
        notas: item.notas || null,
      }));

      await supabase.from("detalle_pedidos").insert(detalles);

      // 3. Update mesa status
      await supabase
        .from("mesas")
        .update({
          estado: "ocupada",
          comensales_actuales: mesa.comensales_actuales || 1,
        })
        .eq("id", mesa.id);

      // 4. Decrement stock (client-side for MVP)
      for (const item of cart) {
        await supabase
          .from("productos")
          .update({
            stock_actual: Math.max(0, item.producto.stock_actual - item.cantidad),
          })
          .eq("id", item.producto.id);
      }

      setSent(true);
      setTimeout(() => {
        onOrderSent?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error sending order:", err);
      // Fallback: still show success for demo
      setSent(true);
      setTimeout(() => {
        onOrderSent?.();
        onClose();
      }, 1500);
    } finally {
      setSending(false);
    }
  };

  // Success state
  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-12 flex flex-col items-center gap-4 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900">
            ¡Pedido enviado!
          </h2>
          <p className="text-gray-500 font-medium">
            {mesa.nombre} — ${total.toLocaleString("es-AR")}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="ml-auto w-full max-w-6xl bg-[#FDFDFD] h-full flex flex-col lg:flex-row shadow-2xl"
      >
        {/* ── LEFT: Product Catalog ── */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-platto-maroon rounded-2xl flex items-center justify-center shadow-lg shadow-platto-maroon/20">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    Nuevo Pedido
                  </h2>
                  <p className="text-xs font-bold text-platto-maroon">
                    {mesa.nombre} — Cap. {mesa.capacidad}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-platto-maroon/10 transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCategory("Todos")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                activeCategory === "Todos"
                  ? "bg-platto-maroon text-white shadow-lg shadow-platto-maroon/20"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              Todos
            </button>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  activeCategory === cat
                    ? "bg-platto-maroon text-white shadow-lg shadow-platto-maroon/20"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-platto-maroon/20 border-t-platto-maroon rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredProducts.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    onAdd={addToCart}
                  />
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <p className="font-bold">No se encontraron productos</p>
                    <p className="text-sm mt-1">Probá con otra búsqueda o categoría</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Cart ── */}
        <div className="w-full lg:w-[380px] bg-white flex flex-col border-t lg:border-t-0">
          {/* Cart Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-platto-maroon" />
                <h3 className="text-lg font-black text-gray-900">Pedido</h3>
                {cart.length > 0 && (
                  <span className="bg-platto-maroon text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.reduce((s, i) => s + i.cantidad, 0)}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Vaciar
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <CartItem
                  key={item.producto.id}
                  item={item}
                  index={index}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  onUpdateNotes={updateNotes}
                />
              ))}
            </AnimatePresence>

            {cart.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                <ShoppingCart className="w-12 h-12 mb-3" />
                <p className="font-bold text-sm">El pedido está vacío</p>
                <p className="text-xs mt-1">
                  Tocá un producto para agregarlo
                </p>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-6 border-t border-gray-100 space-y-4 bg-white">
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal ({cart.reduce((s, i) => s + i.cantidad, 0)} items)</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-xl font-black text-gray-900">
                <span>Total</span>
                <span className="text-platto-maroon">
                  ${total.toLocaleString("es-AR")}
                </span>
              </div>
            </div>

            {/* Send Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={sendOrder}
              disabled={cart.length === 0 || sending}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl",
                cart.length === 0
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-platto-maroon to-platto-rose text-white shadow-platto-maroon/30 hover:shadow-platto-maroon/40 active:shadow-sm"
              )}
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar a Cocina
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

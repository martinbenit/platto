"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Utensils, Plus, Search, Grid3X3, List, Edit3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/hooks";
import { ProductModal } from "@/components/productos/ProductModal";
import { StockAlert } from "@/components/productos/StockAlert";
import type { Producto, Categoria } from "@/lib/types";

const CATEGORIAS: (Categoria | "Todos")[] = ["Todos", "Entradas", "Platos Principales", "Bebidas", "Cervezas", "Vinos", "Cafetería", "Postres"];

export default function ProductosPage() {
  const { products, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState<Categoria | "Todos">("Todos");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== "Todos") result = result.filter((p) => p.categoria === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q));
    }
    return result;
  }, [products, activeCategory, search]);

  const stats = useMemo(() => ({
    total: products.length,
    disponibles: products.filter((p) => p.disponible).length,
    lowStock: products.filter((p) => p.stock_actual <= p.stock_minimo).length,
  }), [products]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Utensils className="w-8 h-8 text-platto-olive" />
              Productos
            </h1>
            <p className="text-gray-500 font-medium mt-1">Gestioná la carta y el stock de tu restaurante</p>
          </div>
          <button onClick={() => { setEditingProduct(null); setShowModal(true); }} className="flex items-center gap-2 bg-platto-olive hover:bg-platto-olive/90 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-platto-olive/25 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Productos</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Disponibles</p>
            <p className="text-2xl font-black text-platto-olive mt-1">{stats.disponibles}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-platto-gold" /> Stock Bajo
            </p>
            <p className="text-2xl font-black text-platto-gold mt-1">{stats.lowStock}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIAS.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all", activeCategory === cat ? "bg-platto-olive text-white shadow-lg shadow-platto-olive/20" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-platto-olive/30 focus:ring-2 focus:ring-platto-olive/5 transition-all w-48" />
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded-lg transition-colors", viewMode === "grid" ? "bg-white shadow-sm text-platto-olive" : "text-gray-400")}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={cn("p-2 rounded-lg transition-colors", viewMode === "list" ? "bg-white shadow-sm text-platto-olive" : "text-gray-400")}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-platto-olive/20 border-t-platto-olive rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-300">
            <Utensils className="w-16 h-16 mx-auto mb-4" />
            <p className="font-bold text-lg">No hay productos</p>
            <p className="text-sm mt-1">Creá tu primer producto para empezar</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((producto) => {
              const isLowStock = producto.stock_actual <= producto.stock_minimo;
              return (
                <div key={producto.id} onClick={() => { setEditingProduct(producto); setShowModal(true); }} className={cn("relative bg-white rounded-2xl border p-5 cursor-pointer group transition-all hover:shadow-lg", !producto.disponible ? "opacity-50 border-gray-200" : isLowStock ? "border-platto-gold/30" : "border-gray-100 hover:border-platto-olive/30")}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-platto-olive bg-platto-olive/10 px-2 py-0.5 rounded-md">{producto.categoria}</span>
                  <h3 className="text-base font-bold text-gray-900 mt-3 mb-1">{producto.nombre}</h3>
                  {producto.descripcion && <p className="text-xs text-gray-400 line-clamp-2 mb-3">{producto.descripcion}</p>}
                  <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-50">
                    <span className="text-xl font-black text-platto-maroon">${producto.precio.toLocaleString("es-AR")}</span>
                    <div className="w-24"><StockAlert producto={producto} compact /></div>
                  </div>
                  {!producto.disponible && <div className="absolute inset-0 rounded-2xl bg-white/60 flex items-center justify-center"><span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-xl">No Disponible</span></div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((producto) => (
              <div key={producto.id} onClick={() => { setEditingProduct(producto); setShowModal(true); }} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-platto-olive/10 flex items-center justify-center shrink-0"><Utensils className="w-5 h-5 text-platto-olive" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{producto.nombre}</h3>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{producto.categoria}</span>
                  </div>
                  {producto.descripcion && <p className="text-xs text-gray-400 truncate mt-0.5">{producto.descripcion}</p>}
                </div>
                <div className="w-24 shrink-0"><StockAlert producto={producto} compact /></div>
                <span className="text-base font-black text-platto-maroon shrink-0">${producto.precio.toLocaleString("es-AR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <ProductModal producto={editingProduct} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/types";

interface ProductCardProps {
  producto: Producto;
  onAdd: (producto: Producto) => void;
}

export function ProductCard({ producto, onAdd }: ProductCardProps) {
  const isLowStock = producto.stock_actual <= producto.stock_minimo;
  const isOutOfStock = producto.stock_actual <= 0 || !producto.disponible;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={() => !isOutOfStock && onAdd(producto)}
      disabled={isOutOfStock}
      className={cn(
        "relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all duration-300 group w-full",
        isOutOfStock
          ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
          : "bg-white border-gray-100 hover:border-platto-maroon/30 hover:shadow-lg hover:shadow-platto-maroon/5 cursor-pointer active:bg-platto-maroon/5"
      )}
    >
      {/* Category badge */}
      <span className="text-[10px] font-black uppercase tracking-widest text-platto-olive bg-platto-olive/10 px-2 py-0.5 rounded-md w-fit mb-2">
        {producto.categoria}
      </span>

      {/* Name */}
      <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">
        {producto.nombre}
      </h4>

      {/* Description */}
      {producto.descripcion && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {producto.descripcion}
        </p>
      )}

      {/* Bottom row: Price + Stock */}
      <div className="mt-auto flex items-end justify-between">
        <span className="text-lg font-black text-platto-maroon">
          ${producto.precio.toLocaleString("es-AR")}
        </span>

        <div className="flex items-center gap-2">
          {isLowStock && !isOutOfStock && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-platto-orange bg-platto-orange/10 px-1.5 py-0.5 rounded-md">
              <AlertTriangle className="w-3 h-3" />
              Bajo
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
              Sin stock
            </span>
          )}
        </div>
      </div>

      {/* Add overlay on hover */}
      {!isOutOfStock && (
        <div className="absolute inset-0 rounded-2xl bg-platto-maroon/0 group-hover:bg-platto-maroon/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-platto-maroon text-white p-2 rounded-xl shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300">
            <Plus className="w-5 h-5" />
          </div>
        </div>
      )}
    </motion.button>
  );
}

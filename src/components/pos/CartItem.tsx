"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/lib/types";

interface CartItemProps {
  item: CartItemType;
  index: number;
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
  onUpdateNotes: (index: number, notas: string) => void;
}

export function CartItem({
  item,
  index,
  onUpdateQuantity,
  onRemove,
  onUpdateNotes,
}: CartItemProps) {
  const [showNotes, setShowNotes] = React.useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 p-4 group"
    >
      <div className="flex items-start gap-3">
        {/* Quantity controls */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => onUpdateQuantity(index, 1)}
            className="w-7 h-7 rounded-lg bg-platto-maroon/10 hover:bg-platto-maroon/20 text-platto-maroon flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <span className="text-base font-black text-gray-900 w-7 text-center">
            {item.cantidad}
          </span>
          <button
            onClick={() =>
              item.cantidad > 1
                ? onUpdateQuantity(index, -1)
                : onRemove(index)
            }
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              item.cantidad > 1
                ? "bg-gray-100 hover:bg-gray-200 text-gray-500"
                : "bg-red-50 hover:bg-red-100 text-red-500"
            )}
          >
            {item.cantidad > 1 ? (
              <Minus className="w-3.5 h-3.5" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 truncate">
            {item.producto.nombre}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            ${item.producto.precio.toLocaleString("es-AR")} c/u
          </p>

          {/* Notes */}
          {item.notas && (
            <p className="text-xs text-platto-orange bg-platto-orange/5 px-2 py-1 rounded-lg mt-2 italic">
              📝 {item.notas}
            </p>
          )}
        </div>

        {/* Subtotal + actions */}
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-black text-gray-900">
            ${(item.producto.precio * item.cantidad).toLocaleString("es-AR")}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-1.5 rounded-lg hover:bg-platto-gold/10 text-gray-400 hover:text-platto-gold transition-colors"
              title="Agregar nota"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRemove(index)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes input (expandable) */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-gray-50">
              <input
                type="text"
                placeholder="Ej: sin cebolla, bien cocida..."
                value={item.notas}
                onChange={(e) => onUpdateNotes(index, e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border-transparent focus:border-platto-gold/30 focus:ring-2 focus:ring-platto-gold/10 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

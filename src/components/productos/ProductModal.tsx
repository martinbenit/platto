"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import type { Producto, Categoria } from "@/lib/types";

const CATEGORIAS: Categoria[] = [
  "Entradas",
  "Platos Principales",
  "Bebidas",
  "Cervezas",
  "Vinos",
  "Cafetería",
  "Postres",
];

interface ProductModalProps {
  producto?: Producto | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function ProductModal({ producto, onClose, onSaved }: ProductModalProps) {
  const isEditing = !!producto;

  const [form, setForm] = useState({
    nombre: producto?.nombre || "",
    descripcion: producto?.descripcion || "",
    precio: producto?.precio?.toString() || "",
    stock_actual: producto?.stock_actual?.toString() || "0",
    stock_minimo: producto?.stock_minimo?.toString() || "0",
    categoria: producto?.categoria || "Platos Principales",
    disponible: producto?.disponible ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = "Nombre requerido";
    if (!form.precio || parseFloat(form.precio) <= 0) errs.precio = "Precio inválido";
    if (form.stock_actual && parseInt(form.stock_actual) < 0) errs.stock_actual = "Stock inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: parseFloat(form.precio),
      stock_actual: parseInt(form.stock_actual) || 0,
      stock_minimo: parseInt(form.stock_minimo) || 0,
      categoria: form.categoria,
      disponible: form.disponible,
    };

    try {
      if (isEditing && producto) {
        await supabase.from("productos").update(payload).eq("id", producto.id);
      } else {
        await supabase.from("productos").insert(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Error saving product:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-platto-olive/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-platto-olive rounded-2xl flex items-center justify-center shadow-lg shadow-platto-olive/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-gray-900">
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Milanesa Napolitana"
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all",
                errors.nombre
                  ? "border-red-300 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-platto-olive focus:ring-2 focus:ring-platto-olive/10"
              )}
            />
            {errors.nombre && (
              <p className="text-xs text-red-500 font-bold mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Breve descripción del producto..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-platto-olive focus:ring-2 focus:ring-platto-olive/10 transition-all resize-none"
            />
          </div>

          {/* Precio + Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Precio ($) *
              </label>
              <input
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                placeholder="0"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all",
                  errors.precio
                    ? "border-red-300 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-platto-olive focus:ring-2 focus:ring-platto-olive/10"
                )}
              />
              {errors.precio && (
                <p className="text-xs text-red-500 font-bold mt-1">{errors.precio}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Categoría
              </label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-platto-olive focus:ring-2 focus:ring-platto-olive/10 transition-all bg-white"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Stock Actual
              </label>
              <input
                type="number"
                value={form.stock_actual}
                onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-platto-olive focus:ring-2 focus:ring-platto-olive/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Stock Mínimo (alerta)
              </label>
              <input
                type="number"
                value={form.stock_minimo}
                onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-platto-olive focus:ring-2 focus:ring-platto-olive/10 transition-all"
              />
            </div>
          </div>

          {/* Disponible toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="text-sm font-bold text-gray-900">Disponible</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Se mostrará en la carta del POS
              </p>
            </div>
            <button
              onClick={() => setForm({ ...form, disponible: !form.disponible })}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors duration-300",
                form.disponible ? "bg-green-500" : "bg-gray-300"
              )}
            >
              <motion.div
                animate={{ x: form.disponible ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-platto-olive to-platto-olive/80 text-white shadow-lg shadow-platto-olive/20 hover:shadow-platto-olive/30 transition-shadow flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? "Guardar Cambios" : "Crear Producto"}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

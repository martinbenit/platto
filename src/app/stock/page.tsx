"use client";

import React, { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Package, AlertTriangle, TrendingDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/hooks";
import { StockAlert } from "@/components/productos/StockAlert";

export default function StockPage() {
  const { products, loading } = useProducts();

  const { critical, warning, ok } = useMemo(() => {
    const critical: typeof products = [];
    const warning: typeof products = [];
    const ok: typeof products = [];

    products.forEach((p) => {
      const ratio = p.stock_minimo > 0 ? p.stock_actual / p.stock_minimo : p.stock_actual > 0 ? 2 : 0;
      if (ratio <= 0.5) critical.push(p);
      else if (ratio <= 1) warning.push(p);
      else ok.push(p);
    });

    return { critical, warning, ok };
  }, [products]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-platto-gold" />
            Control de Stock
          </h1>
          <p className="text-gray-500 font-medium mt-1">Monitoreo de inventario y alertas en tiempo real</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Crítico</p>
            </div>
            <p className="text-3xl font-black text-red-600">{critical.length}</p>
            <p className="text-xs text-red-400 mt-1">Requieren reposición urgente</p>
          </div>
          <div className="bg-platto-gold/5 rounded-2xl p-5 border border-platto-gold/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-platto-gold" />
              <p className="text-xs font-bold text-platto-gold uppercase tracking-wider">Bajo</p>
            </div>
            <p className="text-3xl font-black text-platto-gold">{warning.length}</p>
            <p className="text-xs text-platto-gold/70 mt-1">Cerca del mínimo</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">OK</p>
            </div>
            <p className="text-3xl font-black text-green-600">{ok.length}</p>
            <p className="text-xs text-green-500 mt-1">Stock saludable</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-platto-gold/20 border-t-platto-gold rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Critical section */}
            {critical.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Crítico — Reponer Urgente
                </h2>
                <div className="space-y-3">
                  {critical.map((p) => <StockAlert key={p.id} producto={p} />)}
                </div>
              </div>
            )}

            {/* Warning section */}
            {warning.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-platto-gold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Stock Bajo — Planificar Reposición
                </h2>
                <div className="space-y-3">
                  {warning.map((p) => <StockAlert key={p.id} producto={p} />)}
                </div>
              </div>
            )}

            {/* OK section */}
            {ok.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Stock Saludable
                </h2>
                <div className="space-y-3">
                  {ok.map((p) => <StockAlert key={p.id} producto={p} />)}
                </div>
              </div>
            )}

            {products.length === 0 && (
              <div className="text-center py-20 text-gray-300">
                <Package className="w-16 h-16 mx-auto mb-4" />
                <p className="font-bold text-lg">Sin productos</p>
                <p className="text-sm mt-1">Agregá productos para ver el stock</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

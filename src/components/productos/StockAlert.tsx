"use client";

import React from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/types";

interface StockAlertProps {
  producto: Producto;
  compact?: boolean;
}

export function StockAlert({ producto, compact = false }: StockAlertProps) {
  const ratio = producto.stock_minimo > 0
    ? producto.stock_actual / producto.stock_minimo
    : producto.stock_actual > 0
    ? 1
    : 0;

  const isCritical = ratio <= 0.5;
  const isWarning = ratio > 0.5 && ratio <= 1;
  const isOk = ratio > 1;

  const barColor = isCritical
    ? "bg-red-500"
    : isWarning
    ? "bg-platto-gold"
    : "bg-green-500";

  const barWidth = Math.min(100, Math.max(5, (ratio / 2) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span
          className={cn(
            "text-[10px] font-black",
            isCritical ? "text-red-500" : isWarning ? "text-platto-gold" : "text-green-600"
          )}
        >
          {producto.stock_actual}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition-all",
        isCritical
          ? "bg-red-50 border-red-200"
          : isWarning
          ? "bg-platto-gold/5 border-platto-gold/20"
          : "bg-green-50 border-green-200"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isCritical ? "bg-red-100" : isWarning ? "bg-platto-gold/10" : "bg-green-100"
        )}
      >
        {isCritical ? (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        ) : isWarning ? (
          <TrendingDown className="w-5 h-5 text-platto-gold" />
        ) : (
          <TrendingDown className="w-5 h-5 text-green-600 rotate-180" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate">
          {producto.nombre}
        </h4>
        <p className="text-xs text-gray-400 mt-0.5">
          {producto.categoria}
        </p>

        {/* Stock bar */}
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", barColor)}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <span className="text-xs font-black text-gray-500 whitespace-nowrap">
            {producto.stock_actual} / {producto.stock_minimo}
          </span>
        </div>
      </div>
    </div>
  );
}

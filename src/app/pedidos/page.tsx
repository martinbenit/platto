"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  ClipboardList,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders } from "@/lib/hooks";
import type { EstadoPedido } from "@/lib/types";

const ESTADO_FILTERS: { label: string; value: EstadoPedido | "todos" }[] = [
  { label: "Todos", value: "todos" },
  { label: "Abiertos", value: "abierto" },
  { label: "Cerrados", value: "cerrado" },
  { label: "Cancelados", value: "cancelado" },
];

const ESTADO_BADGE: Record<
  EstadoPedido,
  { icon: React.ElementType; color: string; bg: string }
> = {
  abierto: { icon: Clock, color: "text-green-600", bg: "bg-green-50" },
  cerrado: { icon: CheckCircle2, color: "text-gray-500", bg: "bg-gray-100" },
  cancelado: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

export default function PedidosPage() {
  const { orders, loading } = useOrders();
  const [filter, setFilter] = useState<EstadoPedido | "todos">("todos");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = orders;
    if (filter !== "todos") {
      result = result.filter((o) => o.estado === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.mesa?.nombre?.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, filter, search]);

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
      if (diffMin < 60) return `${diffMin}m`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h`;
      return `${Math.floor(diffHrs / 24)}d`;
    } catch {
      return "";
    }
  };

  const stats = useMemo(() => {
    const abiertos = orders.filter((o) => o.estado === "abierto").length;
    const totalVentas = orders
      .filter((o) => o.estado === "cerrado")
      .reduce((sum, o) => sum + o.total, 0);
    return { abiertos, totalVentas, total: orders.length };
  }, [orders]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-platto-maroon" />
              Pedidos
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Gestioná los pedidos activos y el historial
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Pedidos Abiertos
            </p>
            <p className="text-2xl font-black text-platto-maroon mt-1">
              {stats.abiertos}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Pedidos
            </p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Ventas Cerradas
            </p>
            <p className="text-2xl font-black text-platto-olive mt-1">
              ${stats.totalVentas.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2">
            {ESTADO_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  filter === f.value
                    ? "bg-platto-maroon text-white shadow-lg shadow-platto-maroon/20"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por mesa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-platto-maroon/30 focus:ring-2 focus:ring-platto-maroon/5 transition-all"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-platto-maroon/20 border-t-platto-maroon rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <ClipboardList className="w-16 h-16 mx-auto mb-4" />
              <p className="font-bold text-lg">No hay pedidos</p>
              <p className="text-sm mt-1">
                Los pedidos aparecerán cuando se creen desde el POS
              </p>
            </div>
          ) : (
            filtered.map((order) => {
              const badge = ESTADO_BADGE[order.estado];
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-black/[0.02] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Mesa badge */}
                    <div className="w-14 h-14 rounded-2xl bg-platto-rose/10 flex items-center justify-center shrink-0">
                      <span className="text-lg font-black text-platto-rose">
                        {order.mesa?.nombre || "—"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">
                          Pedido #{order.id.slice(0, 8)}
                        </h3>
                        <div
                          className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase",
                            badge.bg,
                            badge.color
                          )}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {order.estado}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(order.created_at)} · {order.detalles?.length || 0} items
                      </p>
                    </div>

                    {/* Total + Time */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-gray-900">
                        ${order.total.toLocaleString("es-AR")}
                      </p>
                      <p className="text-xs text-gray-400 font-bold">
                        {formatTimeAgo(order.created_at)}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-platto-maroon group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

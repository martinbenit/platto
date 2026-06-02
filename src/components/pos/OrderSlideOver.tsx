"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  ChefHat,
  CheckCircle2,
  Truck,
  AlertCircle,
  Plus,
  CreditCard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders } from "@/lib/hooks";
import { supabase } from "@/lib/supabase/client";
import type { Mesa, EstadoCocina } from "@/lib/types";

const COCINA_CONFIG: Record<
  EstadoCocina,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  pendiente: { icon: Clock, color: "text-gray-500", bg: "bg-gray-100", label: "Pendiente" },
  en_preparacion: { icon: ChefHat, color: "text-platto-orange", bg: "bg-platto-orange/10", label: "En Preparación" },
  listo: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Listo" },
  entregado: { icon: Truck, color: "text-platto-olive", bg: "bg-platto-olive/10", label: "Entregado" },
};

interface OrderSlideOverProps {
  mesa: Mesa;
  onClose: () => void;
  onNewOrder: () => void;
}

export function OrderSlideOver({ mesa, onClose, onNewOrder }: OrderSlideOverProps) {
  const { orders, loading } = useOrders(mesa.id);
  const [closingOrder, setClosingOrder] = useState<string | null>(null);

  const activeOrder = orders.find((o) => o.estado === "abierto");

  const closeOrder = async (orderId: string) => {
    setClosingOrder(orderId);
    try {
      await supabase
        .from("pedidos")
        .update({ estado: "cerrado" })
        .eq("id", orderId);

      await supabase
        .from("mesas")
        .update({ estado: "sucia", comensales_actuales: 0 })
        .eq("id", mesa.id);
    } catch (err) {
      console.error("Error closing order:", err);
    }
    setClosingOrder(null);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    return `Hace ${diffHrs}h ${diffMin % 60}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-platto-maroon to-platto-rose">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-black text-white">{mesa.nombre}</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  Detalle de Mesa
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-sm text-white/70 font-bold">
                    {mesa.comensales_actuales}/{mesa.capacidad} comensales
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-platto-maroon/20 border-t-platto-maroon rounded-full animate-spin" />
            </div>
          ) : activeOrder ? (
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Pedido Activo
                  </p>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    {formatTime(activeOrder.created_at)}
                  </p>
                </div>
                <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Abierto
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                  Items del Pedido
                </h3>

                {activeOrder.detalles && activeOrder.detalles.length > 0 ? (
                  activeOrder.detalles.map((detalle) => {
                    const cocinaConfig =
                      COCINA_CONFIG[detalle.estado_cocina] || COCINA_CONFIG.pendiente;
                    const CocinaIcon = cocinaConfig.icon;

                    return (
                      <motion.div
                        key={detalle.id}
                        layout
                        className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900">
                              {detalle.producto?.nombre || "Producto"}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {detalle.cantidad}x $
                              {detalle.precio_unitario.toLocaleString("es-AR")}
                            </p>
                            {detalle.notas && (
                              <p className="text-xs text-platto-orange italic mt-1">
                                📝 {detalle.notas}
                              </p>
                            )}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                              cocinaConfig.bg,
                              cocinaConfig.color
                            )}
                          >
                            <CocinaIcon className="w-3 h-3" />
                            {cocinaConfig.label}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-300">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm font-bold">Sin detalles cargados</p>
                    <p className="text-xs mt-1">
                      Los items aparecerán cuando se confirmen
                    </p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-500">
                    Total del pedido
                  </span>
                  <span className="text-xl font-black text-platto-maroon">
                    ${activeOrder.total.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-300">
              <AlertCircle className="w-12 h-12 mb-3" />
              <p className="font-bold">No hay pedidos activos</p>
              <p className="text-sm mt-1">
                Creá un nuevo pedido para esta mesa
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 space-y-3 bg-white">
          <button
            onClick={onNewOrder}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-platto-maroon to-platto-rose text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-platto-maroon/20 hover:shadow-platto-maroon/30 transition-shadow active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            {activeOrder ? "Agregar al Pedido" : "Nuevo Pedido"}
          </button>

          {activeOrder && (
            <button
              onClick={() => closeOrder(activeOrder.id)}
              disabled={closingOrder === activeOrder.id}
              className="w-full py-3.5 rounded-2xl border-2 border-platto-gold text-platto-gold font-bold flex items-center justify-center gap-2 hover:bg-platto-gold/5 transition-all active:scale-[0.98]"
            >
              {closingOrder === activeOrder.id ? (
                <div className="w-5 h-5 border-2 border-platto-gold/30 border-t-platto-gold rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Cerrar y Cobrar
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

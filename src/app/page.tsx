"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TableMap } from "@/components/dashboard/TableMap";
import { POSInterface } from "@/components/pos/POSInterface";
import { OrderSlideOver } from "@/components/pos/OrderSlideOver";
import { TrendingUp, Users, LayoutDashboard, Package, ArrowUpRight, Clock, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mesa } from "@/lib/types";

export default function Home() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [showPOS, setShowPOS] = useState(false);

  const stats = [
    { name: "Ventas de Hoy", value: "$128.450", change: "+12.5%", icon: TrendingUp, color: "bg-platto-maroon" },
    { name: "Tickets", value: "56", change: "+8.2%", icon: Clock, color: "bg-platto-orange" },
    { name: "Mesas Ocupadas", value: "8/12", change: "Activo", icon: LayoutDashboard, color: "bg-platto-olive" },
    { name: "Alertas de Stock", value: "3", change: "Atención", icon: Package, color: "bg-platto-gold" },
  ];

  const handleMesaClick = (mesa: Mesa) => {
    if (mesa.estado === "libre") {
      setSelectedMesa(mesa);
      setShowPOS(true);
    } else {
      setSelectedMesa(mesa);
      setShowPOS(false);
    }
  };

  const handleNewOrderFromSlideOver = () => {
    if (selectedMesa) {
      setShowPOS(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">¡Hola, Juan! 👋</h1>
            <p className="text-gray-500 font-medium mt-1">
              Acá tenés un resumen de lo que está pasando en <span className="text-platto-maroon font-bold">Palermo</span> hoy.
            </p>
          </div>
          <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider hidden sm:block">
            {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/[0.03] transition-all duration-500 border-b-4 hover:border-b-platto-maroon relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-50" />
              <div className="flex items-start justify-between relative z-10">
                <div className={`${stat.color} p-3 rounded-2xl shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter", stat.change.startsWith("+") ? "bg-green-100 text-green-600" : "bg-platto-gold/10 text-platto-gold")}>
                  {stat.change.startsWith("+") && <ArrowUpRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{stat.name}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Map + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-platto-olive rounded-full" />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Mapa de Mesas (Tiempo Real)</h2>
              </div>
              <button onClick={() => setIsEditMode(!isEditMode)} className={cn("text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all", isEditMode ? "bg-platto-orange text-white shadow-md shadow-platto-orange/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                <Edit3 className="w-4 h-4" />
                {isEditMode ? "Guardar Mapa" : "Editar Salón"}
              </button>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[400px]">
              <TableMap isEditMode={isEditMode} onMesaClick={handleMesaClick} />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Users className="w-6 h-6 text-platto-rose" />
              Últimos Pedidos
            </h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-platto-rose/10 flex items-center justify-center font-black text-platto-rose group-hover:scale-110 transition-transform">
                    M{i * 2 + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">Sándwich de Bondiola + IPA</h4>
                    <p className="text-xs text-gray-500 font-medium">Hace {i * 3} mins</p>
                  </div>
                  <div className="text-sm font-black text-gray-900">$12.400</div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm hover:border-platto-maroon hover:text-platto-maroon transition-all">
              Ver todo el historial
            </button>
          </div>
        </div>
      </div>

      {/* POS Interface (Full screen overlay) */}
      <AnimatePresence>
        {showPOS && selectedMesa && (
          <POSInterface mesa={selectedMesa} onClose={() => { setShowPOS(false); setSelectedMesa(null); }} onOrderSent={() => setSelectedMesa(null)} />
        )}
      </AnimatePresence>

      {/* Order Slide-Over (for occupied tables) */}
      <AnimatePresence>
        {selectedMesa && !showPOS && selectedMesa.estado !== "libre" && (
          <OrderSlideOver mesa={selectedMesa} onClose={() => setSelectedMesa(null)} onNewOrder={handleNewOrderFromSlideOver} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

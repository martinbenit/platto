"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMesas } from "@/lib/hooks";
import type { Mesa, EstadoMesa } from "@/lib/types";

const ESTADOS_CONFIG: Record<EstadoMesa, { color: string; border: string; text: string; label: string }> = {
  libre: {
    color: "bg-green-100",
    border: "border-green-500",
    text: "text-green-700",
    label: "Libre",
  },
  ocupada: {
    color: "bg-platto-maroon/10",
    border: "border-platto-maroon",
    text: "text-platto-maroon",
    label: "Ocupada",
  },
  reserva: {
    color: "bg-platto-gold/10",
    border: "border-platto-gold",
    text: "text-platto-gold",
    label: "Reserva",
  },
  sucia: {
    color: "bg-platto-orange/10",
    border: "border-platto-orange",
    text: "text-platto-orange",
    label: "Sucia",
  },
};

interface TableMapProps {
  isEditMode?: boolean;
  onMesaClick?: (mesa: Mesa) => void;
}

export function TableMap({ isEditMode = false, onMesaClick }: TableMapProps) {
  const { mesas, loading } = useMesas();
  const containerRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50/50 rounded-3xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-platto-maroon/20 border-t-platto-maroon rounded-full animate-spin" />
          <span className="text-platto-maroon font-bold text-sm">Cargando mapa de mesas...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[600px] bg-slate-50 rounded-3xl border-2 overflow-hidden",
        isEditMode
          ? "border-dashed border-platto-orange bg-platto-orange/5"
          : "border-gray-100"
      )}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-gray-100 z-20">
        <div className="flex flex-wrap gap-3 text-xs font-bold">
          {Object.entries(ESTADOS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-full border-2", cfg.color, cfg.border)} />
              <span className="text-gray-600">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {mesas.map((mesa) => {
        const config = ESTADOS_CONFIG[mesa.estado];

        return (
          <motion.div
            key={mesa.id}
            drag={isEditMode}
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ x: mesa.pos_x, y: mesa.pos_y, opacity: 0, scale: 0.8 }}
            animate={{ x: mesa.pos_x, y: mesa.pos_y, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => !isEditMode && onMesaClick?.(mesa)}
            className={cn(
              "absolute flex flex-col items-center justify-center p-2 rounded-2xl border-2 shadow-sm transition-shadow",
              "w-24 h-24 sm:w-28 sm:h-28 select-none",
              config.color,
              config.border,
              isEditMode &&
                "hover:shadow-lg hover:ring-4 hover:ring-platto-orange/30 cursor-grab active:cursor-grabbing",
              !isEditMode &&
                "hover:scale-105 hover:shadow-lg cursor-pointer"
            )}
            style={{ touchAction: "none" }}
          >
            <span className={cn("text-xl font-black mb-1", config.text)}>
              {mesa.nombre}
            </span>

            <div className="flex items-center gap-1 bg-white/60 px-2 py-0.5 rounded-full text-xs font-bold text-gray-700">
              <Users className="w-3 h-3" />
              <span>
                {mesa.estado === "ocupada" ? mesa.comensales_actuales : 0}/
                {mesa.capacidad}
              </span>
            </div>

            {mesa.estado === "reserva" && (
              <div className="absolute -top-2 -right-2 bg-platto-gold text-white rounded-full p-1 shadow-md">
                <Clock className="w-4 h-4" />
              </div>
            )}

            {mesa.estado === "ocupada" && (
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-platto-maroon rounded-full animate-pulse shadow-md" />
            )}
          </motion.div>
        );
      })}

      {isEditMode && (
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-xl shadow-lg border border-platto-orange text-sm font-bold text-platto-orange flex items-center gap-2">
          <div className="w-2 h-2 bg-platto-orange rounded-full animate-pulse" />
          Modo Edición — Arrastrá las mesas
        </div>
      )}
    </div>
  );
}

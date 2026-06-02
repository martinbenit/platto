"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Utensils, 
  ClipboardList, 
  Package, 
  Users, 
  PieChart, 
  Bell, 
  Settings, 
  Wallet,
  Store,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: TrendingUp },
  { name: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { name: "Productos", href: "/productos", icon: Utensils },
  { name: "Stock", href: "/stock", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Reportes", href: "/reportes", icon: PieChart },
  { name: "Alertas", href: "/alertas", icon: Bell },
  { name: "Cobros", href: "/cobros", icon: Wallet },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-100 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-gray-50">
        <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-platto-maroon to-platto-rose flex items-center justify-center shadow-lg shadow-platto-maroon/20">
                <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-2xl font-title font-black text-platto-maroon leading-none tracking-tighter">PLATTO</span>
                <span className="text-[10px] uppercase tracking-widest text-platto-rose font-bold">Gestión PRO</span>
            </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-platto-maroon text-white shadow-xl shadow-platto-maroon/25 scale-[1.02]" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-platto-maroon hover:translate-x-1"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-white" : "text-gray-400 group-hover:text-platto-maroon"
              )} />
              {item.name}
              {item.name === "Alertas" && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-platto-orange animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="p-4 border-t border-gray-50">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-platto-orange/10 flex items-center justify-center border-2 border-white shadow-sm">
                    <span className="text-platto-orange font-bold text-sm">JD</span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">Juan De Arriba</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Admin | Sucursal Central</span>
              </div>
          </div>
      </div>
    </div>
  );
}

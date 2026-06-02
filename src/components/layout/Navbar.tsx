"use client";

import React from "react";
import { 
  Search, 
  Bell, 
  Settings, 
  Plus, 
  Calendar,
  ChevronDown,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-black/[0.01]">
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-platto-maroon transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar pedido, mesa o cliente..." 
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white focus:border-platto-maroon/20 focus:ring-4 focus:ring-platto-maroon/5 rounded-xl text-sm w-[360px] outline-none transition-all duration-300 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Action */}
        <button className="flex items-center gap-2 bg-platto-orange hover:bg-platto-orange/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-platto-orange/25 transition-all active:scale-95 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Nuevo Pedido</span>
        </button>

        <div className="h-8 w-[1px] bg-gray-100 mx-2" />

        {/* Action Icons */}
        <div className="flex items-center gap-2">
            <button className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-platto-maroon rounded-xl transition-all relative group">
                <Calendar className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-platto-gold rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-platto-maroon rounded-xl transition-all group">
                <Bell className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-gray-500 hover:bg-gray-50 hover:text-platto-maroon rounded-xl transition-all group">
                <Sun className="w-5 h-5" />
            </button>
        </div>

        {/* Branch Selector */}
        <button className="flex items-center gap-2 px-3 py-2 bg-platto-olive/5 text-platto-olive rounded-xl hover:bg-platto-olive/10 transition-all border border-platto-olive/10">
            <div className="w-2 h-2 rounded-full bg-platto-olive animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wide">Sucursal: Palermo</span>
            <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

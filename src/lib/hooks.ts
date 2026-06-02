"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Producto, Pedido, DetallePedido, Mesa } from "@/lib/types";

// ═══════════════════════════════════════════
// Hook: useProducts — Fetch + Realtime products
// ═══════════════════════════════════════════
export function useProducts() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("categoria", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        // Fallback demo data
        setProducts(getDemoProducts());
      } else if (data && data.length > 0) {
        setProducts(data as Producto[]);
      } else {
        setProducts(getDemoProducts());
      }
      setLoading(false);
    };
    fetch();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("productos_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "productos" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProducts((prev) => [...prev, payload.new as Producto]);
          } else if (payload.eventType === "UPDATE") {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? (payload.new as Producto) : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            setProducts((prev) =>
              prev.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, loading };
}

// ═══════════════════════════════════════════
// Hook: useOrders — Fetch + Realtime orders
// ═══════════════════════════════════════════
export function useOrders(mesaId?: string) {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    let query = supabase
      .from("pedidos")
      .select("*, mesa:mesas(*), detalles:detalle_pedidos(*, producto:productos(*))")
      .order("created_at", { ascending: false });

    if (mesaId) {
      query = query.eq("mesa_id", mesaId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
      setOrders(getDemoOrders());
    } else if (data && data.length > 0) {
      setOrders(data as unknown as Pedido[]);
    } else {
      if (!mesaId) setOrders(getDemoOrders());
      else setOrders([]);
    }
    setLoading(false);
  }, [mesaId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("pedidos_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          // Refetch to get joined data
          fetchOrders();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "detalle_pedidos" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  return { orders, loading, refetch: fetchOrders };
}

// ═══════════════════════════════════════════
// Hook: useMesas — Fetch + Realtime mesas
// ═══════════════════════════════════════════
export function useMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("mesas")
        .select("*")
        .order("nombre", { ascending: true });

      if (error || !data || data.length === 0) {
        setMesas(getDemoMesas());
      } else {
        setMesas(data as Mesa[]);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("mesas_hook_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mesas" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setMesas((prev) =>
              prev.map((m) =>
                m.id === payload.new.id ? (payload.new as Mesa) : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { mesas, setMesas, loading };
}

// ═══════════════════════════════════════════
// Hook: useStockAlerts
// ═══════════════════════════════════════════
export function useStockAlerts() {
  const [alerts, setAlerts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .filter("stock_actual", "lte", "stock_minimo" as unknown as number);

      // The above filter may not work with column references in Supabase REST API,
      // so we also do client-side filtering as fallback
      if (error) {
        console.error("Error fetching stock alerts:", error);
        setAlerts([]);
      } else if (data) {
        const filtered = (data as Producto[]).filter(
          (p) => p.stock_actual <= p.stock_minimo
        );
        setAlerts(filtered);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { alerts, loading };
}

// ═══════════════════════════════════════════
// Demo Data Fallbacks
// ═══════════════════════════════════════════
function getDemoProducts(): Producto[] {
  return [
    { id: "p1", sucursal_id: null, nombre: "Bondiola Braseada", descripcion: "Con pan de masa madre y chimichurri", precio: 8500, stock_actual: 25, stock_minimo: 5, categoria: "Platos Principales", disponible: true, created_at: "", updated_at: "" },
    { id: "p2", sucursal_id: null, nombre: "Empanadas (x3)", descripcion: "Carne cortada a cuchillo", precio: 4200, stock_actual: 40, stock_minimo: 10, categoria: "Entradas", disponible: true, created_at: "", updated_at: "" },
    { id: "p3", sucursal_id: null, nombre: "Provoleta", descripcion: "Con orégano y pimentón ahumado", precio: 5100, stock_actual: 15, stock_minimo: 5, categoria: "Entradas", disponible: true, created_at: "", updated_at: "" },
    { id: "p4", sucursal_id: null, nombre: "Milanesa Napolitana", descripcion: "Con papas fritas y ensalada", precio: 9800, stock_actual: 18, stock_minimo: 5, categoria: "Platos Principales", disponible: true, created_at: "", updated_at: "" },
    { id: "p5", sucursal_id: null, nombre: "Pasta del Día", descripcion: "Consulte con el mozo", precio: 7600, stock_actual: 12, stock_minimo: 5, categoria: "Platos Principales", disponible: true, created_at: "", updated_at: "" },
    { id: "p6", sucursal_id: null, nombre: "IPA Artesanal", descripcion: "Pinta 500ml", precio: 3800, stock_actual: 50, stock_minimo: 10, categoria: "Cervezas", disponible: true, created_at: "", updated_at: "" },
    { id: "p7", sucursal_id: null, nombre: "Quilmes Cristal", descripcion: "Pinta 500ml", precio: 2800, stock_actual: 60, stock_minimo: 10, categoria: "Cervezas", disponible: true, created_at: "", updated_at: "" },
    { id: "p8", sucursal_id: null, nombre: "Agua Mineral", descripcion: "500ml", precio: 1500, stock_actual: 80, stock_minimo: 20, categoria: "Bebidas", disponible: true, created_at: "", updated_at: "" },
    { id: "p9", sucursal_id: null, nombre: "Coca-Cola", descripcion: "Línea completa", precio: 2200, stock_actual: 45, stock_minimo: 15, categoria: "Bebidas", disponible: true, created_at: "", updated_at: "" },
    { id: "p10", sucursal_id: null, nombre: "Flan Casero", descripcion: "Con dulce de leche y crema", precio: 3500, stock_actual: 8, stock_minimo: 5, categoria: "Postres", disponible: true, created_at: "", updated_at: "" },
    { id: "p11", sucursal_id: null, nombre: "Brownie con Helado", descripcion: "Chocolate belga con helado de vainilla", precio: 4800, stock_actual: 3, stock_minimo: 5, categoria: "Postres", disponible: false, created_at: "", updated_at: "" },
    { id: "p12", sucursal_id: null, nombre: "Café Espresso", descripcion: "Doble", precio: 1800, stock_actual: 100, stock_minimo: 20, categoria: "Cafetería", disponible: true, created_at: "", updated_at: "" },
    { id: "p13", sucursal_id: null, nombre: "Malbec Reserva", descripcion: "Bodega Norton, copa", precio: 4500, stock_actual: 20, stock_minimo: 5, categoria: "Vinos", disponible: true, created_at: "", updated_at: "" },
    { id: "p14", sucursal_id: null, nombre: "Tabla de Fiambres", descripcion: "Selección de quesos y embutidos", precio: 7200, stock_actual: 10, stock_minimo: 3, categoria: "Entradas", disponible: true, created_at: "", updated_at: "" },
    { id: "p15", sucursal_id: null, nombre: "Ensalada Caesar", descripcion: "Pollo grillado, parmesano, croutons", precio: 6200, stock_actual: 15, stock_minimo: 5, categoria: "Entradas", disponible: true, created_at: "", updated_at: "" },
  ];
}

function getDemoOrders(): Pedido[] {
  return [
    { id: "o1", sucursal_id: null, mesa_id: "2", estado: "abierto", total: 21100, created_at: new Date(Date.now() - 45 * 60000).toISOString(), updated_at: "", detalles: [] },
    { id: "o2", sucursal_id: null, mesa_id: "5", estado: "abierto", total: 8700, created_at: new Date(Date.now() - 20 * 60000).toISOString(), updated_at: "", detalles: [] },
    { id: "o3", sucursal_id: null, mesa_id: "1", estado: "cerrado", total: 15400, created_at: new Date(Date.now() - 120 * 60000).toISOString(), updated_at: "", detalles: [] },
  ];
}

function getDemoMesas(): Mesa[] {
  return [
    { id: "1", sucursal_id: null, nombre: "M1", capacidad: 2, comensales_actuales: 0, estado: "libre", pos_x: 50, pos_y: 50, created_at: "", updated_at: "" },
    { id: "2", sucursal_id: null, nombre: "M2", capacidad: 4, comensales_actuales: 3, estado: "ocupada", pos_x: 200, pos_y: 50, created_at: "", updated_at: "" },
    { id: "3", sucursal_id: null, nombre: "M3", capacidad: 2, comensales_actuales: 0, estado: "sucia", pos_x: 350, pos_y: 50, created_at: "", updated_at: "" },
    { id: "4", sucursal_id: null, nombre: "M4", capacidad: 6, comensales_actuales: 0, estado: "reserva", pos_x: 50, pos_y: 200, created_at: "", updated_at: "" },
    { id: "5", sucursal_id: null, nombre: "M5", capacidad: 4, comensales_actuales: 2, estado: "ocupada", pos_x: 200, pos_y: 200, created_at: "", updated_at: "" },
    { id: "6", sucursal_id: null, nombre: "M6", capacidad: 2, comensales_actuales: 0, estado: "libre", pos_x: 350, pos_y: 200, created_at: "", updated_at: "" },
    { id: "7", sucursal_id: null, nombre: "M7", capacidad: 8, comensales_actuales: 0, estado: "libre", pos_x: 50, pos_y: 350, created_at: "", updated_at: "" },
    { id: "8", sucursal_id: null, nombre: "M8", capacidad: 4, comensales_actuales: 4, estado: "ocupada", pos_x: 200, pos_y: 350, created_at: "", updated_at: "" },
  ];
}

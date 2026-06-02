// ═══════════════════════════════════════════
// PLATTO — Tipos centralizados del sistema
// ═══════════════════════════════════════════

// ── Estados ──
export type EstadoMesa = "libre" | "ocupada" | "sucia" | "reserva";
export type EstadoPedido = "abierto" | "cerrado" | "cancelado";
export type EstadoCocina = "pendiente" | "en_preparacion" | "listo" | "entregado";
export type EstadoReserva = "pendiente" | "confirmada" | "cancelada" | "completada";

// ── Categorías de productos ──
export type Categoria =
  | "Entradas"
  | "Platos Principales"
  | "Bebidas"
  | "Postres"
  | "Cafetería"
  | "Vinos"
  | "Cervezas";

// ── Entidades ──
export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string | null;
  configuracion: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Mesa {
  id: string;
  sucursal_id: string | null;
  nombre: string;
  capacidad: number;
  comensales_actuales: number;
  estado: EstadoMesa;
  pos_x: number;
  pos_y: number;
  created_at: string;
  updated_at: string;
}

export interface Producto {
  id: string;
  sucursal_id: string | null;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  categoria: Categoria | string;
  disponible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: string;
  sucursal_id: string | null;
  mesa_id: string | null;
  estado: EstadoPedido;
  total: number;
  created_at: string;
  updated_at: string;
  // Joined
  mesa?: Mesa;
  detalles?: DetallePedido[];
}

export interface DetallePedido {
  id: string;
  pedido_id: string;
  producto_id: string | null;
  cantidad: number;
  precio_unitario: number;
  estado_cocina: EstadoCocina;
  notas: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  producto?: Producto;
}

export interface Reserva {
  id: string;
  sucursal_id: string | null;
  mesa_id: string | null;
  nombre_cliente: string;
  telefono_cliente: string | null;
  fecha_hora: string;
  comensales: number;
  estado: EstadoReserva;
  origen: string;
  created_at: string;
  updated_at: string;
}

// ── POS Cart types ──
export interface CartItem {
  producto: Producto;
  cantidad: number;
  notas: string;
}

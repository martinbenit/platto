-- SCHEMA INICIAL PARA PLATTO

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla: sucursales
CREATE TABLE sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    configuracion JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla: mesas
CREATE TABLE mesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    capacidad INT DEFAULT 2,
    comensales_actuales INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'libre' CHECK (estado IN ('libre', 'ocupada', 'sucia', 'reserva')),
    pos_x FLOAT DEFAULT 0,
    pos_y FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla: productos (Inventario y Carta)
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    categoria VARCHAR(100),
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla: pedidos (Cabecera de consumo)
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE CASCADE,
    mesa_id UUID REFERENCES mesas(id) ON DELETE SET NULL,
    estado VARCHAR(50) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado', 'cancelado')),
    total DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla: detalle_pedidos (Items consumidos)
CREATE TABLE detalle_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    estado_cocina VARCHAR(50) DEFAULT 'pendiente' CHECK (estado_cocina IN ('pendiente', 'en_preparacion', 'listo', 'entregado')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla: reservas
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE CASCADE,
    mesa_id UUID REFERENCES mesas(id) ON DELETE SET NULL,
    nombre_cliente VARCHAR(255) NOT NULL,
    telefono_cliente VARCHAR(50),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    comensales INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'confirmada' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
    origen VARCHAR(50) DEFAULT 'manual', -- manual, whatsapp, instagram, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Configuración de Supabase Realtime
-- Habilitar realtime para las tablas core (para ver cambios sin recargar)
ALTER PUBLICATION supabase_realtime ADD TABLE mesas;
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE detalle_pedidos;

-- Row Level Security (RLS) - Bases
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Políticas temporales para MVP (Permitir todo a usuarios autenticados)
CREATE POLICY "Permitir todo a usuarios autenticados en sucursales" ON sucursales FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en mesas" ON mesas FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en productos" ON productos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en pedidos" ON pedidos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en detalle_pedidos" ON detalle_pedidos FOR ALL TO authenticated USING (true);
CREATE POLICY "Permitir todo a usuarios autenticados en reservas" ON reservas FOR ALL TO authenticated USING (true);

-- Política para que anon pueda leer (si es necesario para webhooks/login)
CREATE POLICY "Permitir lectura anonima a sucursales" ON sucursales FOR SELECT TO anon USING (true);

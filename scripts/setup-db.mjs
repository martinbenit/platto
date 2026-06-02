import pg from "pg";
const { Client } = pg;

const connectionString = "postgresql://postgres:4O1JowvOKYEQhaMv@db.zcwnqdhdoskujfppxpxt.supabase.co:5432/postgres";

const SCHEMA = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    configuracion JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
CREATE TABLE IF NOT EXISTS mesas (
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
CREATE TABLE IF NOT EXISTS productos (
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
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE CASCADE,
    mesa_id UUID REFERENCES mesas(id) ON DELETE SET NULL,
    estado VARCHAR(50) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'cerrado', 'cancelado')),
    total DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
CREATE TABLE IF NOT EXISTS detalle_pedidos (
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
CREATE TABLE IF NOT EXISTS reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE CASCADE,
    mesa_id UUID REFERENCES mesas(id) ON DELETE SET NULL,
    nombre_cliente VARCHAR(255) NOT NULL,
    telefono_cliente VARCHAR(50),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    comensales INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'confirmada' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
    origen VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
`;

const REALTIME_AND_RLS = `
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE mesas; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE pedidos; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE detalle_pedidos; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "allow_all_sucursales" ON sucursales FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_mesas" ON mesas FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_productos" ON productos FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_pedidos" ON pedidos FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_detalle_pedidos" ON detalle_pedidos FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "allow_all_reservas" ON reservas FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

const SEED = `
INSERT INTO sucursales (id, nombre, direccion, configuracion)
SELECT 'a1b2c3d4-0000-0000-0000-000000000001', 'Palermo', 'Av. Santa Fe 3200, CABA', '{"moneda":"ARS"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM sucursales WHERE id = 'a1b2c3d4-0000-0000-0000-000000000001');

DELETE FROM mesas WHERE sucursal_id = 'a1b2c3d4-0000-0000-0000-000000000001';
INSERT INTO mesas (nombre, capacidad, comensales_actuales, estado, pos_x, pos_y, sucursal_id) VALUES
  ('M1',2,0,'libre',50,50,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M2',4,3,'ocupada',200,50,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M3',2,0,'sucia',350,50,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M4',6,0,'reserva',50,200,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M5',4,2,'ocupada',200,200,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M6',2,0,'libre',350,200,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M7',8,0,'libre',50,350,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M8',4,4,'ocupada',200,350,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M9',2,0,'libre',350,350,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M10',6,0,'libre',500,50,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M11',4,0,'libre',500,200,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M12',2,0,'libre',500,350,'a1b2c3d4-0000-0000-0000-000000000001');

DELETE FROM productos WHERE sucursal_id = 'a1b2c3d4-0000-0000-0000-000000000001';
INSERT INTO productos (nombre,descripcion,precio,stock_actual,stock_minimo,categoria,disponible,sucursal_id) VALUES
  ('Empanadas (x3)','Carne cortada a cuchillo',4200,40,10,'Entradas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Provoleta','Con orégano y pimentón ahumado',5100,15,5,'Entradas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Tabla de Fiambres','Selección de quesos y embutidos',7200,10,3,'Entradas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Ensalada Caesar','Pollo grillado, parmesano, croutons',6200,15,5,'Entradas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Hummus con Crudités','Garbanzos, tahini, bastones de zanahoria',3800,20,5,'Entradas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Bondiola Braseada','Con pan de masa madre y chimichurri',8500,25,5,'Platos Principales',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Milanesa Napolitana','Con papas fritas y ensalada',9800,18,5,'Platos Principales',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Pasta del Día','Consulte con el mozo',7600,12,5,'Platos Principales',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Bife de Chorizo','400g, con guarnición a elección',12500,15,5,'Platos Principales',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Salmón Grillado','Con puré de batata y espárragos',11800,8,3,'Platos Principales',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Agua Mineral','500ml',1500,80,20,'Bebidas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Coca-Cola','Línea completa',2200,45,15,'Bebidas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Limonada Casera','Con menta y jengibre',2800,30,10,'Bebidas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Jugo Natural','Naranja exprimida',2500,25,10,'Bebidas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('IPA Artesanal','Pinta 500ml',3800,50,10,'Cervezas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Quilmes Cristal','Pinta 500ml',2800,60,10,'Cervezas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Stout','Pinta 500ml, cervecería local',4200,30,8,'Cervezas',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Malbec Reserva','Bodega Norton, copa',4500,20,5,'Vinos',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Torrontés','Bodega Colomé, copa',3800,18,5,'Vinos',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Café Espresso','Doble',1800,100,20,'Cafetería',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Café con Leche','Grande',2200,80,20,'Cafetería',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Té Premium','Selección de hebras',2000,50,10,'Cafetería',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Flan Casero','Con dulce de leche y crema',3500,8,5,'Postres',true,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Brownie con Helado','Chocolate belga con helado de vainilla',4800,3,5,'Postres',false,'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Tiramisú','Receta italiana tradicional',4200,10,5,'Postres',true,'a1b2c3d4-0000-0000-0000-000000000001');
`;

async function main() {
  console.log("🍽️  PLATTO — Database Setup via Direct Connection\n");
  
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log("✅ Connected to Supabase PostgreSQL\n");

    console.log("📐 Creating schema...");
    await client.query(SCHEMA);
    console.log("✅ Schema created\n");

    console.log("🔒 Setting up RLS & Realtime...");
    await client.query(REALTIME_AND_RLS);
    console.log("✅ RLS & Realtime configured\n");

    console.log("🌱 Seeding data...");
    await client.query(SEED);
    console.log("✅ Seed data inserted\n");

    // Verify
    const { rows: mesaCount } = await client.query("SELECT COUNT(*) FROM mesas");
    const { rows: prodCount } = await client.query("SELECT COUNT(*) FROM productos");
    console.log(`📊 Verification: ${mesaCount[0].count} mesas, ${prodCount[0].count} productos`);
    
    console.log("\n🎉 Database setup complete!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

main();

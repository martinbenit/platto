-- ═══════════════════════════════════════════
-- PLATTO — Seed Data para desarrollo
-- ═══════════════════════════════════════════

-- 1. Sucursal demo
INSERT INTO sucursales (id, nombre, direccion, configuracion) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Palermo', 'Av. Santa Fe 3200, CABA', '{"moneda": "ARS", "zona_horaria": "America/Argentina/Buenos_Aires"}'::jsonb);

-- 2. Mesas
INSERT INTO mesas (nombre, capacidad, comensales_actuales, estado, pos_x, pos_y, sucursal_id) VALUES
  ('M1', 2, 0, 'libre',  50,  50,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M2', 4, 3, 'ocupada', 200, 50,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M3', 2, 0, 'sucia',  350, 50,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M4', 6, 0, 'reserva', 50,  200, 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M5', 4, 2, 'ocupada', 200, 200, 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M6', 2, 0, 'libre',  350, 200, 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M7', 8, 0, 'libre',  50,  350, 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M8', 4, 4, 'ocupada', 200, 350, 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M9', 2, 0, 'libre',  350, 350, 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M10', 6, 0, 'libre', 500, 50,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M11', 4, 0, 'libre', 500, 200, 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('M12', 2, 0, 'libre', 500, 350, 'a1b2c3d4-0000-0000-0000-000000000001');

-- 3. Productos
INSERT INTO productos (nombre, descripcion, precio, stock_actual, stock_minimo, categoria, disponible, sucursal_id) VALUES
  -- Entradas
  ('Empanadas (x3)',        'Carne cortada a cuchillo',                    4200, 40, 10, 'Entradas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Provoleta',             'Con orégano y pimentón ahumado',              5100, 15,  5, 'Entradas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Tabla de Fiambres',     'Selección de quesos y embutidos',             7200, 10,  3, 'Entradas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Ensalada Caesar',       'Pollo grillado, parmesano, croutons',         6200, 15,  5, 'Entradas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Hummus con Crudités',   'Garbanzos, tahini, bastones de zanahoria',    3800, 20,  5, 'Entradas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  -- Platos principales
  ('Bondiola Braseada',     'Con pan de masa madre y chimichurri',         8500, 25,  5, 'Platos Principales', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Milanesa Napolitana',   'Con papas fritas y ensalada',                 9800, 18,  5, 'Platos Principales', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Pasta del Día',         'Consulte con el mozo',                        7600, 12,  5, 'Platos Principales', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Bife de Chorizo',       '400g, con guarnición a elección',            12500, 15,  5, 'Platos Principales', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Salmón Grillado',       'Con puré de batata y espárragos',            11800,  8,  3, 'Platos Principales', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  -- Bebidas
  ('Agua Mineral',          '500ml',                                       1500, 80, 20, 'Bebidas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Coca-Cola',             'Línea completa',                              2200, 45, 15, 'Bebidas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Limonada Casera',       'Con menta y jengibre',                        2800, 30, 10, 'Bebidas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Jugo Natural',          'Naranja exprimida',                           2500, 25, 10, 'Bebidas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  -- Cervezas
  ('IPA Artesanal',         'Pinta 500ml',                                 3800, 50, 10, 'Cervezas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Quilmes Cristal',       'Pinta 500ml',                                 2800, 60, 10, 'Cervezas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Stout',                 'Pinta 500ml, cervecería local',               4200, 30,  8, 'Cervezas', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  -- Vinos
  ('Malbec Reserva',        'Bodega Norton, copa',                         4500, 20,  5, 'Vinos', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Torrontés',             'Bodega Colomé, copa',                         3800, 18,  5, 'Vinos', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  -- Cafetería
  ('Café Espresso',         'Doble',                                       1800, 100, 20, 'Cafetería', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Café con Leche',        'Grande',                                      2200, 80, 20, 'Cafetería', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Té Premium',            'Selección de hebras',                         2000, 50, 10, 'Cafetería', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  -- Postres
  ('Flan Casero',           'Con dulce de leche y crema',                  3500,  8,  5, 'Postres', true,  'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Brownie con Helado',    'Chocolate belga con helado de vainilla',      4800,  3,  5, 'Postres', false, 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('Tiramisú',              'Receta italiana tradicional',                  4200, 10,  5, 'Postres', true,  'a1b2c3d4-0000-0000-0000-000000000001');

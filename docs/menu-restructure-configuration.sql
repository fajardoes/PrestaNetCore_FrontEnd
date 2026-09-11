-- PrestaNet - Reestructuración del menú de configuración
--
-- Este script parte del estado generado por la primera reestructuración:
--   * "Sistema" es actualmente la raíz del menú de sistema.
--   * Productos, políticas, contabilidad y pagos ya tienen contenedores.
--
-- Resultado:
--   La raíz visible "Configuración" concentra las entradas configurables.
--   Los módulos operativos conservan únicamente sus accesos de operación.
--
-- No se eliminan registros, no se modifican rutas y no se alteran las
-- asignaciones existentes de security.menu_item_roles.
--
-- Ejecutar el archivo completo en una sesión PostgreSQL autorizada, con
-- respaldo o punto de recuperación confirmado. No se ejecuta desde este agente.

BEGIN;

LOCK TABLE security.menu_items IN SHARE ROW EXCLUSIVE MODE;

DO $preconditions$
DECLARE
    missing_count integer;
    required_ids uuid[] := ARRAY[
        -- Raíces
        'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid, -- Sistema
        'dab6cbbc-d7d1-4367-babe-9906a9746744'::uuid, -- Créditos
        '0291dc23-15f1-4acb-a7c8-5acffe8da779'::uuid, -- Contabilidad
        '0251cadd-689a-4750-b621-870da12daca6'::uuid, -- Clientes
        '54c0265c-f0ec-44a9-8022-37d1e46bdecd'::uuid, -- Organización
        '222c8b3f-465d-49ed-9772-177dfb7ab94e'::uuid, -- Catálogos
        '34fbaea8-7159-4921-be3a-8f47e5e0de59'::uuid, -- Pagos y recaudación

        -- Contenedores existentes
        '8b1b1e12-a9a7-4d1b-9444-18e7f2d6a68a'::uuid, -- Configuración del sistema
        '7103b63d-5194-4115-af31-50d00e44f76f'::uuid, -- Configuración de pagos
        '8394077a-8124-44ed-a074-6c013e3f0311'::uuid, -- Productos
        'f14d6bd1-9f55-49db-962c-6448322f5dfe'::uuid, -- Políticas de mora
        '89ed77bc-10ae-438d-bd6e-e1a9f214999b'::uuid, -- Calendario operativo
        '358126f8-560d-4e88-a83a-4ddde7dcbe27'::uuid, -- Operación contable
        '7cdd3150-caed-4f12-af69-d530c24f1449'::uuid, -- Originación
        'ed8e0dca-b5ad-4e5e-8ac4-e896cb5d17b0'::uuid, -- Cartera y cierres

        -- Elementos configurables que cambiarán de padre
        'd62f3c8f-6576-46e3-a325-45e07c2e8c9e'::uuid, -- Cuota anticipada
        '4d1edf5f-2005-479b-a957-5d8af74fc6e1'::uuid, -- Catálogos de clientes
        '34095ee1-875d-4947-bf32-5ca7bc75c856'::uuid, -- Canales de recaudación
        '330f7d8a-c90b-4e2b-8a17-4806a419b12d'::uuid, -- Plan de cuentas
        '9134aa90-a281-41c0-9aca-a016867e68f5'::uuid, -- Centros de costo
        '779c90ea-391f-491f-b918-128cf6d471f3'::uuid  -- Períodos
    ];
BEGIN
    SELECT COUNT(*)
    INTO missing_count
    FROM unnest(required_ids) AS required(id)
    LEFT JOIN security.menu_items AS item
        ON item.id = required.id
       AND item.is_active
       AND NOT item.is_deleted
    WHERE item.id IS NULL;

    IF missing_count <> 0 THEN
        RAISE EXCEPTION
            'Reestructuración cancelada: existen % menús requeridos ausentes, inactivos o eliminados.',
            missing_count;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM security.menu_items AS item
        WHERE item.slug IN (
            'configuracion-creditos',
            'configuracion-clientes',
            'configuracion-contabilidad'
        )
          AND item.id NOT IN (
              '74b706e2-bda7-440e-b034-6183c1699e59'::uuid,
              '430ae1d0-10a3-461d-b694-f9fe2e8d3ff2'::uuid,
              'f1493a4f-10eb-4b0f-b4fa-87e50165acfc'::uuid
          )
    ) THEN
        RAISE EXCEPTION
            'Reestructuración cancelada: uno de los nuevos slugs ya existe en otro menú.';
    END IF;
END;
$preconditions$;

-- Agrupación de configuración de créditos.
INSERT INTO security.menu_items (
    id, title, slug, route, icon, "order", is_active, parent_id,
    created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, is_deleted
)
VALUES (
    '74b706e2-bda7-440e-b034-6183c1699e59'::uuid,
    'Créditos',
    'configuracion-creditos',
    NULL,
    'Briefcase',
    1,
    TRUE,
    'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    NULL,
    NULL,
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    route = EXCLUDED.route,
    icon = EXCLUDED.icon,
    "order" = EXCLUDED."order",
    is_active = EXCLUDED.is_active,
    parent_id = EXCLUDED.parent_id,
    is_deleted = EXCLUDED.is_deleted,
    deleted_by = NULL,
    deleted_at = NULL;

-- Agrupación de configuración de clientes.
INSERT INTO security.menu_items (
    id, title, slug, route, icon, "order", is_active, parent_id,
    created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, is_deleted
)
VALUES (
    '430ae1d0-10a3-461d-b694-f9fe2e8d3ff2'::uuid,
    'Clientes',
    'configuracion-clientes',
    NULL,
    'Users',
    4,
    TRUE,
    'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    NULL,
    NULL,
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    route = EXCLUDED.route,
    icon = EXCLUDED.icon,
    "order" = EXCLUDED."order",
    is_active = EXCLUDED.is_active,
    parent_id = EXCLUDED.parent_id,
    is_deleted = EXCLUDED.is_deleted,
    deleted_by = NULL,
    deleted_at = NULL;

-- Agrupación de configuración contable.
INSERT INTO security.menu_items (
    id, title, slug, route, icon, "order", is_active, parent_id,
    created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, is_deleted
)
VALUES (
    'f1493a4f-10eb-4b0f-b4fa-87e50165acfc'::uuid,
    'Estructura contable',
    'configuracion-contabilidad',
    NULL,
    'Calculator',
    3,
    TRUE,
    'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    NULL,
    NULL,
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    slug = EXCLUDED.slug,
    route = EXCLUDED.route,
    icon = EXCLUDED.icon,
    "order" = EXCLUDED."order",
    is_active = EXCLUDED.is_active,
    parent_id = EXCLUDED.parent_id,
    is_deleted = EXCLUDED.is_deleted,
    deleted_by = NULL,
    deleted_at = NULL;

-- La raíz anterior Sistema pasa a llamarse Configuración.
-- Se conserva el slug "sistema" por compatibilidad histórica.
UPDATE security.menu_items
SET
    title = 'Configuración',
    route = NULL,
    icon = 'Settings',
    "order" = 7,
    is_active = TRUE,
    parent_id = NULL
WHERE id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid;

-- Categorías que pasan a depender de Configuración.
UPDATE security.menu_items
SET parent_id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    "order" = 0,
    title = 'Sistema'
WHERE id = '8b1b1e12-a9a7-4d1b-9444-18e7f2d6a68a'::uuid;

UPDATE security.menu_items
SET parent_id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    "order" = 1,
    title = 'Créditos'
WHERE id = '74b706e2-bda7-440e-b034-6183c1699e59'::uuid;

UPDATE security.menu_items
SET parent_id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    "order" = 2,
    title = 'Pagos y recaudación'
WHERE id = '7103b63d-5194-4115-af31-50d00e44f76f'::uuid;

UPDATE security.menu_items
SET parent_id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    "order" = 3,
    title = 'Estructura contable'
WHERE id = 'f1493a4f-10eb-4b0f-b4fa-87e50165acfc'::uuid;

UPDATE security.menu_items
SET parent_id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    "order" = 4,
    title = 'Clientes'
WHERE id = '430ae1d0-10a3-461d-b694-f9fe2e8d3ff2'::uuid;

UPDATE security.menu_items
SET parent_id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    "order" = 5,
    title = 'Catálogos'
WHERE id = '222c8b3f-465d-49ed-9772-177dfb7ab94e'::uuid;

UPDATE security.menu_items
SET parent_id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid,
    "order" = 6,
    title = 'Calendario operativo'
WHERE id = '89ed77bc-10ae-438d-bd6e-e1a9f214999b'::uuid;

-- Configuración específica de créditos.
UPDATE security.menu_items
SET parent_id = '74b706e2-bda7-440e-b034-6183c1699e59'::uuid,
    "order" = 0
WHERE id = '8394077a-8124-44ed-a074-6c013e3f0311'::uuid;

UPDATE security.menu_items
SET parent_id = '74b706e2-bda7-440e-b034-6183c1699e59'::uuid,
    "order" = 1
WHERE id = 'f14d6bd1-9f55-49db-962c-6448322f5dfe'::uuid;

UPDATE security.menu_items
SET parent_id = '74b706e2-bda7-440e-b034-6183c1699e59'::uuid,
    "order" = 2
WHERE id = 'd62f3c8f-6576-46e3-a325-45e07c2e8c9e'::uuid;

-- Configuración específica de clientes.
UPDATE security.menu_items
SET parent_id = '430ae1d0-10a3-461d-b694-f9fe2e8d3ff2'::uuid,
    "order" = 0
WHERE id = '4d1edf5f-2005-479b-a957-5d8af74fc6e1'::uuid;

-- Configuración específica de contabilidad.
UPDATE security.menu_items
SET parent_id = 'f1493a4f-10eb-4b0f-b4fa-87e50165acfc'::uuid,
    "order" = 0
WHERE id = '330f7d8a-c90b-4e2b-8a17-4806a419b12d'::uuid;

UPDATE security.menu_items
SET parent_id = 'f1493a4f-10eb-4b0f-b4fa-87e50165acfc'::uuid,
    "order" = 1
WHERE id = '9134aa90-a281-41c0-9aca-a016867e68f5'::uuid;

UPDATE security.menu_items
SET parent_id = 'f1493a4f-10eb-4b0f-b4fa-87e50165acfc'::uuid,
    "order" = 2
WHERE id = '779c90ea-391f-491f-b918-128cf6d471f3'::uuid;

UPDATE security.menu_items
SET title = 'Registro contable',
    parent_id = '0291dc23-15f1-4acb-a7c8-5acffe8da779'::uuid,
    "order" = 0
WHERE id = '358126f8-560d-4e88-a83a-4ddde7dcbe27'::uuid;

UPDATE security.menu_items
SET "order" = 1
WHERE id = 'cc22b07f-18f1-4d66-a84d-09937a79bd40'::uuid;

-- Canales y reglas de recaudo son configuración; pagos permanece operativo.
UPDATE security.menu_items
SET parent_id = '7103b63d-5194-4115-af31-50d00e44f76f'::uuid,
    "order" = 0
WHERE id = 'bfd02ca6-27b4-4fa9-9ff1-0630f7d8f1fc'::uuid;

UPDATE security.menu_items
SET parent_id = '7103b63d-5194-4115-af31-50d00e44f76f'::uuid,
    "order" = 1
WHERE id = '34095ee1-875d-4947-bf32-5ca7bc75c856'::uuid;

UPDATE security.menu_items
SET parent_id = '7103b63d-5194-4115-af31-50d00e44f76f'::uuid,
    "order" = 2
WHERE id = 'cc6d0e32-b418-4e84-b656-19a45b3d6343'::uuid;

UPDATE security.menu_items
SET parent_id = '7103b63d-5194-4115-af31-50d00e44f76f'::uuid,
    "order" = 3
WHERE id = '754cd404-3775-4f60-9728-64a544d2acb5'::uuid;

-- Normalizar el módulo operativo de créditos después de extraer configuración.
UPDATE security.menu_items
SET parent_id = 'dab6cbbc-d7d1-4367-babe-9906a9746744'::uuid,
    "order" = 0
WHERE id = '7cdd3150-caed-4f12-af69-d530c24f1449'::uuid;

UPDATE security.menu_items
SET parent_id = 'dab6cbbc-d7d1-4367-babe-9906a9746744'::uuid,
    "order" = 1
WHERE id = 'ed8e0dca-b5ad-4e5e-8ac4-e896cb5d17b0'::uuid;

-- Verificación estructural antes de confirmar.
DO $verification$
DECLARE
    mismatch_count integer;
BEGIN
    SELECT COUNT(*)
    INTO mismatch_count
    FROM security.menu_items AS item
    WHERE
        (item.id = 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid
         AND (item.parent_id IS NOT NULL OR item.title <> 'Configuración'))
        OR
        (item.id = '8b1b1e12-a9a7-4d1b-9444-18e7f2d6a68a'::uuid
         AND item.parent_id IS DISTINCT FROM 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid)
        OR
        (item.id = '8394077a-8124-44ed-a074-6c013e3f0311'::uuid
         AND item.parent_id IS DISTINCT FROM '74b706e2-bda7-440e-b034-6183c1699e59'::uuid)
        OR
        (item.id = 'f14d6bd1-9f55-49db-962c-6448322f5dfe'::uuid
         AND item.parent_id IS DISTINCT FROM '74b706e2-bda7-440e-b034-6183c1699e59'::uuid)
        OR
        (item.id = 'd62f3c8f-6576-46e3-a325-45e07c2e8c9e'::uuid
         AND item.parent_id IS DISTINCT FROM '74b706e2-bda7-440e-b034-6183c1699e59'::uuid)
        OR
        (item.id = '4d1edf5f-2005-479b-a957-5d8af74fc6e1'::uuid
         AND item.parent_id IS DISTINCT FROM '430ae1d0-10a3-461d-b694-f9fe2e8d3ff2'::uuid)
        OR
        (item.id = '330f7d8a-c90b-4e2b-8a17-4806a419b12d'::uuid
         AND item.parent_id IS DISTINCT FROM 'f1493a4f-10eb-4b0f-b4fa-87e50165acfc'::uuid)
        OR
        (item.id = '34095ee1-875d-4947-bf32-5ca7bc75c856'::uuid
         AND item.parent_id IS DISTINCT FROM '7103b63d-5194-4115-af31-50d00e44f76f'::uuid)
        OR
        (item.id = '222c8b3f-465d-49ed-9772-177dfb7ab94e'::uuid
         AND item.parent_id IS DISTINCT FROM 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid)
        OR
        (item.id = '89ed77bc-10ae-438d-bd6e-e1a9f214999b'::uuid
         AND item.parent_id IS DISTINCT FROM 'c331148a-8d7f-47e4-ba19-fc2d7fac319e'::uuid);

    IF mismatch_count <> 0 THEN
        RAISE EXCEPTION
            'Reestructuración cancelada: se detectaron % relaciones incorrectas.',
            mismatch_count;
    END IF;
END;
$verification$;

-- Las asignaciones de roles existentes se conservan. Los contenedores nuevos
-- son ancestros y el servicio los incluye cuando un hijo está autorizado.

COMMIT;

-- Verificación posterior sugerida:
-- SELECT child.title, child.slug, child."order", parent.title AS parent_title
-- FROM security.menu_items AS child
-- LEFT JOIN security.menu_items AS parent ON parent.id = child.parent_id
-- WHERE parent.title = 'Configuración'
-- ORDER BY child."order", child.title;

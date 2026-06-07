-- =========================================================
-- MIGRACIÓN: eliminar fotos exclusivas, unificar todo en `photos`
-- =========================================================
-- Contexto: la app ya no distingue fotos públicas vs exclusivas.
-- Tope unificado: 12 fotos por perfil.
--
-- ORDEN DE EJECUCIÓN:
--   1) Paso A (Dashboard Supabase) — hacer público el bucket exclusive-photos
--      para que las URLs de las fotos migradas funcionen.
--   2) Paso B (SQL Editor) — correr este archivo.
--   3) Paso C (opcional, después de confirmar que todo se ve bien)
--      — borrar el bucket exclusive-photos y la columna exclusive_photos.
--
-- Si saltás el Paso A, las fotos migradas seguirán siendo paths privados
-- inalcanzables como URL pública. Hacelo PRIMERO.
-- =========================================================


-- ---------------------------------------------------------
-- PASO A — en el Dashboard de Supabase (NO es SQL, es UI):
--   Storage → exclusive-photos → Settings → Make bucket public
--   (o cambiar policy: bucket público de lectura).
--
-- También podés hacerlo por SQL:
UPDATE storage.buckets
SET public = true
WHERE id = 'exclusive-photos';
-- ---------------------------------------------------------


-- ---------------------------------------------------------
-- PASO B — migrar paths del array exclusive_photos al array photos
-- como URLs públicas completas, respetando el tope de 12.
-- ---------------------------------------------------------

-- Tu project ref de Supabase (sacalo de la URL del dashboard).
-- Si tu proyecto es https://yjwfxlszftrniynurnju.supabase.co
-- entonces ref = 'yjwfxlszftrniynurnju'. Ajustá si cambió.
DO $$
DECLARE
  v_project_ref text := 'yjwfxlszftrniynurnju';
  v_base_url text;
BEGIN
  v_base_url := 'https://' || v_project_ref || '.supabase.co/storage/v1/object/public/exclusive-photos/';

  -- Para cada perfil con fotos exclusivas, concatenar al array photos
  -- las URLs públicas de las exclusivas, truncar a 12.
  UPDATE public.profiles AS p
  SET photos = (
    SELECT (
      COALESCE(p.photos, '{}'::text[])
      || ARRAY(
        SELECT v_base_url || path
        FROM unnest(COALESCE(p.exclusive_photos, '{}'::text[])) AS path
      )
    )[1:12]
  )
  WHERE p.exclusive_photos IS NOT NULL
    AND array_length(p.exclusive_photos, 1) > 0;
END $$;


-- Vaciar la columna exclusive_photos (los datos ya fueron migrados).
UPDATE public.profiles
SET exclusive_photos = '{}'::text[]
WHERE exclusive_photos IS NOT NULL
  AND array_length(exclusive_photos, 1) > 0;


-- ---------------------------------------------------------
-- PASO C (OPCIONAL) — limpieza final, sólo cuando estés seguro
-- que las fotos migradas se ven correctamente en la app.
-- DESCOMENTAR a mano para correrlo.
-- ---------------------------------------------------------

-- 1) Borrar la columna exclusive_photos de la tabla profiles
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS exclusive_photos;

-- 2) Vaciar el bucket exclusive-photos (cada fila apunta a un archivo)
-- DELETE FROM storage.objects WHERE bucket_id = 'exclusive-photos';

-- 3) Borrar el bucket
-- DELETE FROM storage.buckets WHERE id = 'exclusive-photos';

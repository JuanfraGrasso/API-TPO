# TPO Plataforma Web para Pequenos Comercios

Estructura inicial del proyecto con:
- Frontend: React + Vite con Vercel
- Backend: Node.js + Express con Render
- BD objetivo: Supabase

## Estructura
- apps/frontend
- apps/backend
- docs
- scripts

## Comentarios internos de consultas

Para habilitar el historial de comentarios, ejecutá el esquema
[schema.sql](apps/backend/src/database/sql/schema.sql) en el editor SQL de Supabase y
configurá `SUPABASE_SERVICE_ROLE_KEY` en el backend. La tabla de comentarios
tiene RLS habilitado y no permite acceso directo con la clave anónima.
Los comentarios solo se consultan y agregan desde el panel autenticado; al
eliminar una consulta también se elimina su historial.

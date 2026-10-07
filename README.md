# The Rose Holding | Portal Jurídico & Gestión de Expedientes

Aplicación web ágil y de alto rendimiento orientada al sector legal de **The Rose Holding**. Ofrece una landing page pública con experiencia 3D interactiva y un portal privado seguro con aislamiento de datos estricto mediante **Row Level Security (RLS)** en Supabase.

---

## 🌟 Características Principales

1. **Landing Page Corporativa en Dark Mode:**
   - **Hero 3D Interactivo:** Lienzo WebGL con Three.js renderizando una red nodal poligonal que reacciona suavemente al movimiento del ratón.
   - **Ciclo de Vida WebGL Seguro:** Limpieza garantizada de geometrías, materiales, renderers y escuchadores de eventos al desmontarse para prevenir fugas de memoria.
   - **Tarjetas de Propuesta de Valor:** Iconografía animada en hover representando Seguridad RLS, Velocidad Realtime y Taxonomía Jurídica.

2. **Autenticación Directa (Supabase Auth):**
   - Registro e inicio de sesión con correo y contraseña.
   - Auto-confirmación directa para acceso inmediato sin bloqueos de confirmación.
   - Protección de rutas privadas mediante `AuthContext` y `ProtectedRoute`.

3. **Gestión y Registro de Expedientes Jurídicos:**
   - Creación ágil mediante diálogo modal centrado.
   - Campos obligatorios validados: Título del Caso, Nombre del Cliente, Categoría (*Corporativo*, *Litigio*, *Laboral*) y Notas.
   - **Aislamiento Multitenant con RLS:** Toda consulta o mutación (`select`, `insert`, `delete`) valida estrictamente `auth.uid() = user_id`.

4. **Sincronización en Tiempo Real & Filtros:**
   - Suscripción reactiva mediante canales de Supabase Realtime (`postgres_changes`).
   - Filtros instantáneos por área jurídica con contadores dinámicos.
   - Búsqueda en vivo por caso, cliente o notas procesales.
   - Eliminación segura con modal de confirmación previa.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, Vite, Tailwind CSS (Dark Mode).
- **Gráficos 3D:** Three.js.
- **Iconos:** Lucide React.
- **BaaS & Base de Datos:** Supabase (PostgreSQL 15+, Supabase Auth, Supabase Realtime).
- **Arquitectura:** Cero APIs o servidores intermedios; consumo BaaS directo con `@supabase/supabase-js`.

---

## 🚀 Puesta en Marcha Local

### 1. Requisitos Previos
- Node.js >= 18
- Proyecto de Supabase activo (Cloud o CLI local)

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 3. Migración de Base de Datos
Ejecuta el script SQL ubicado en `supabase/migrations/20261006_init_legal_records.sql` en el SQL Editor de tu proyecto Supabase:

```sql
create table if not exists public.legal_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  case_title text not null check (char_length(trim(case_title)) > 0),
  client_name text not null check (char_length(trim(client_name)) > 0),
  category text not null check (category in ('Corporativo', 'Litigio', 'Laboral')),
  notes text default '',
  created_at timestamptz default now() not null
);

alter table public.legal_records enable row level security;

create policy "Users can select own records"
  on public.legal_records for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own records"
  on public.legal_records for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own records"
  on public.legal_records for delete
  to authenticated
  using (auth.uid() = user_id);

alter publication supabase_realtime add table public.legal_records;
```

### 4. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

El servidor local se iniciará en `http://localhost:5173`.

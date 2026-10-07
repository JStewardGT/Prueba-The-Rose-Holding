### Proyecto

Aplicación web moderna para la gestión de expedientes y registros legales de The Rose Holding. Consta de una landing page pública de alto impacto visual con Canvas 3D interactivo (Three.js) e iconografía animada (Morphicons), conectada a un panel privado protegido con autenticación de usuarios y persistencia de base de datos en Supabase (Auth + PostgreSQL con Row Level Security). Arquitectura frontend modular con React + Vite + Tailwind CSS.

### Comandos

* Servidor de desarrollo: `npm run dev`
* Compilación a producción: `npm run build`
* Validación de código / linter: `npm run lint`
* Vista previa de build local: `npm run preview`

### Estilo

* React funcional moderno con hooks (`useRef`, `useEffect`, `useState`, Context API).
* Estética dark mode corporativa con Tailwind CSS (fondos oscuros, tipografía sans limpia, contrastes en cian/oro).
* **Three.js seguro:** Control estricto del ciclo de vida en componentes 3D. Es obligatorio incluir limpieza (`renderer.dispose()`, liberación de geometrías/materiales y remoción de event listeners en el `return` del hook) para prevenir fugas de memoria o canvas duplicados.
* Nombres de archivos, componentes, funciones y variables en inglés; interfaz, formularios y mensajes al usuario en español.
* Separación limpia de capas: componentes presentacionales (`src/components/`), páginas/rutas (`src/pages/`), contexto global (`src/context/`) y cliente Supabase (`src/lib/supabase.js`).

### Reglas

* Lee el archivo maestro `SPEC.md` (y cualquier documentación en `specs/`) antes de proponer, modificar o generar código.
* Sigue el flujo de *spec-driven development* con spec-kit: no agregues dependencias `npm`, rutas nuevas ni modifiques el esquema de tablas SQL sin actualizar previamente la spec.
* No modifiques archivos dentro de `specs/` ni alteres `SPEC.md` a menos que se te indique explícitamente.
* Todo acceso a datos en Supabase debe respetar las directivas de seguridad Row Level Security (RLS) y vincular las operaciones de inserción/consulta al `auth.uid()` del usuario con sesión activa.


* Nunca incluyas credenciales en duro (*hardcoded*); utiliza exclusivamente variables de entorno mediante `import.meta.env.VITE_SUPABASE_*`.

### Al terminar cualquier tarea

* Ejecuta internamente la validación o simulación de `npm run build` para certificar que no existan errores de sintaxis, imports rotos o dependencias faltantes.
* Confirma en tu respuesta los archivos creados o editados y valida que el cambio cumple con lo definido en `SPEC.md`.
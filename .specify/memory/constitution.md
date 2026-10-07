<!--
Sync Impact Report:
- Version change: Uninitialized ([CONSTITUTION_VERSION]) → 1.0.0
- Bump rationale: Initial adoption and ratification of the project constitution based on specification for PruebaTheRoseHolding.
- Added sections:
  * Core Principles (I. Row Level Security Estricto, II. BaaS Directo y Cero APIs Intermedias, III. Control del Ciclo de Vida 3D, IV. Autenticación y Autorización para CRUD, V. Categorización Estructurada Obligatoria, VI. Cero Código Sombra y SDD)
  * Stack Tecnológico y Reglas de Implementación
  * Estructura, Estilo y Manejo de Errores
  * Governance
- Removed sections: None
- Deferred TODOs: None
-->

# PruebaTheRoseHolding Constitution

## Core Principles

### I. Seguridad Multitenant con Row Level Security (RLS) Estricto (NO NEGOCIABLE)
Ninguna consulta o mutación a la base de datos PostgreSQL en Supabase puede eludir RLS. Cada usuario autenticado únicamente puede leer, crear y eliminar sus propios expedientes mediante la validación estricta de `auth.uid() = user_id`. Todas las tablas del dominio deben tener RLS habilitado y políticas declarativas explícitas antes de cualquier operación.

### II. Consumo BaaS Directo y Cero APIs Intermedias
La arquitectura de backend se basa exclusivamente en Supabase (PostgreSQL y Supabase Auth). Queda estrictamente prohibido construir APIs intermedias, microservicios o servidores backend adicionales (Node.js/Express). Las consultas y mutaciones deben realizarse directamente desde el frontend utilizando el cliente `@supabase/supabase-js`.

### III. Control del Ciclo de Vida 3D y Gestión de Recursos
El canvas interactivo de Three.js en la sección Hero debe limpiar rigurosamente sus recursos en el desmontaje del componente (función de retorno de `useEffect` en React). Esto incluye invocar `renderer.dispose()`, liberar geometrías y materiales, y remover listeners de eventos para prevenir fugas de memoria o lienzos WebGL duplicados.

### IV. Sesión Requerida para Operaciones CRUD y Protección de Rutas
La landing page y las visualizaciones 3D son de acceso público para prospectos. El acceso al dashboard privado y cualquier interacción con la tabla `legal_records` exige obligatoriamente una sesión activa verificada por el contexto global de autenticación (`AuthContext` respaldado por Supabase Auth).

### V. Categorización Estructurada Obligatoria
Todo expediente jurídico registrado en el sistema debe pertenecer obligatoriamente a una de las categorías predefinidas de negocio: *Corporativo*, *Litigio* o *Laboral*. No se permitirán registros con categorías nulas o no catalogadas.

### VI. Cero Código Sombra (Shadow Code) y Fidelidad a SPEC.md
El desarrollo se rige por Spec-Driven Development (SDD). El agente y los desarrolladores deben construir estrictamente lo documentado en `SPEC.md`. No se añadirán dependencias npm no autorizadas, pasarelas de pago ni herramientas pesadas fuera de alcance. Cualquier cambio en esquema, autenticación o UI crítica exige actualizar primero la especificación.

## Stack Tecnológico y Reglas de Implementación

- **Frontend / UI:** React con Vite y Tailwind CSS, implementando un diseño en *dark mode* corporativo.
- **Gráficos 3D y Multimedia:** Three.js para la experiencia 3D en el Hero y Morphicons para iconografía animada de funcionalidades.
- **BaaS & Base de Datos:** Supabase (PostgreSQL y Supabase Auth con Email/Contraseña y Magic Link).
- **Lenguaje:** JavaScript moderno (ES6+) con JSX.
- **Paradigma:** Programación funcional con Hooks estándar de React (`useState`, `useEffect`, `useRef`, `useContext`). Cero clases.

## Estructura, Estilo y Manejo de Errores

### Estructura Modular y Plana
La base de código frontend debe mantener una jerarquía limpia sin abstracciones prematuras:
- `/src/components`: Componentes reutilizables de UI, Hero 3D y tarjetas.
- `/src/pages`: Landing page pública y Dashboard privado.
- `/src/context`: `AuthContext` para el estado global de la sesión.
- `/src/lib`: Inicialización y configuración del cliente Supabase (`supabase.js`).

### Nomenclatura
- **Inglés:** Nombres de archivos, componentes, funciones, variables y tablas/columnas de base de datos.
- **Español:** Textos de interfaz de usuario, formularios, mensajes de confirmación y feedback visual.

### Manejo de Errores y Validaciones
- **Interfaz de Usuario:** Prohibido mostrar excepciones crudas de JavaScript o errores técnicos del motor SQL en pantalla. Todos los errores deben ser traducidos a mensajes comprensibles para el usuario (ej: *"Credenciales incorrectas"*, *"No se pudo guardar el expediente"*, *"Verifique su conexión"*).
- **Cliente Supabase:** Toda llamada asíncrona a Supabase debe desestructurar `{ data, error }` y validar exhaustivamente el estado de error antes de mutar el estado local o confirmar acciones al usuario.

## Governance

Esta constitución define las directrices y reglas inmutables de desarrollo para el proyecto PruebaTheRoseHolding. Prevalece sobre cualquier decisión de implementación improvisada.

1. **Cumplimiento:** Toda modificación del código debe apegarse a los principios centrales aquí definidos.
2. **Procedimiento de Enmienda:** Cualquier cambio en la arquitectura base, políticas de seguridad o principios rectores requiere documentación formal previa, consenso del equipo y actualización del número de versión semántica.
3. **Versionado:**
   - **MAJOR:** Remoción o cambio retrocompatible incompatible en los principios rectores o en el stack central.
   - **MINOR:** Inclusión de nuevos principios rectores o secciones de políticas de desarrollo.
   - **PATCH:** Correcciones tipográficas, refinamientos de redacción o aclaraciones no semánticas.

**Version**: 1.0.0 | **Ratified**: 2026-10-06 | **Last Amended**: 2026-10-06

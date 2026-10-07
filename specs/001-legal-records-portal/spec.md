# Feature Specification: Legal Records Portal & Public Landing Experience

**Feature Branch**: `001-legal-records-portal`

**Created**: 2026-10-06

**Status**: Ready for Planning

**Input**: User description: "## Features principales: Landing Page Pública y Experiencia Visual (Hero 3D, Morphicons, CTA), Autenticación de Usuarios (Supabase Auth), Registro y Creación de Expedientes (RLS, validación), Gestión y Visualización de Mis Expedientes (filtros, eliminación segura) + Non-Goals"

## Clarifications

### Session 2026-10-06
- Q: ¿Cómo debe ser el flujo de confirmación de correo tras registrarse con Supabase Auth? → A: Registro con auto-confirmación directa, permitiendo iniciar sesión y crear expedientes de inmediato sin esperar correo de verificación.
- Q: ¿En qué componente o vista debe presentarse el formulario de creación de expedientes dentro del portal privado? → A: Modal / Diálogo emergente centrado para mantener el contexto visual del dashboard y permitir registrar casos ágilmente.
- Q: ¿Cómo debe gestionarse la actualización en tiempo real del listado de expedientes al crear o eliminar casos? → A: Suscripción a Supabase Realtime (postgres_changes) combinada con actualización del estado local de React tras mutaciones.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exploración Pública de Servicios y Propuesta Legal (Priority: P1)

Como prospecto o cliente de The Rose Holding, quiero acceder a una página de aterrizaje interactiva y visualmente atractiva con ambientación corporativa oscura, para comprender los servicios de la firma y acceder directamente al portal mediante llamados a la acción claros.

**Why this priority**: Es el punto de contacto inicial y la carta de presentación de la firma que genera confianza y captura prospectos antes de cualquier flujo transaccional.

**Independent Test**: Puede probarse accediendo a la URL raíz sin sesión activa; el usuario puede interactuar con el lienzo visual 3D, explorar las tarjetas de características con iconografía animada y pulsar el botón para iniciar sesión o registrarse.

**Acceptance Scenarios**:

1. **Given** un visitante anónimo que ingresa al sitio web, **When** navega por la sección principal, **Then** visualiza una escena visual 3D interactiva que responde suavemente a los movimientos del ratón sin degradar el rendimiento del navegador.
2. **Given** un usuario que interactúa con la sección de características, **When** pasa el cursor sobre las tarjetas de beneficios, **Then** observa transiciones animadas en la iconografía representando seguridad, velocidad y automatización.
3. **Given** un visitante que decide autenticarse, **When** hace clic en el llamado a la acción de ingreso o registro, **Then** se le presentan las opciones de autenticación para acceder al espacio de trabajo.
4. **Given** un visitante que navega y luego abandona o recarga la página, **When** se desmonta la vista visual, **Then** todos los recursos gráficos y escuchadores de eventos se liberan completamente sin provocar fugas de memoria ni duplicaciones.

---

### User Story 2 - Autenticación Segura y Control de Acceso (Priority: P1)

Como abogado o usuario del despacho, quiero registrarme e iniciar sesión de forma segura con mi correo electrónico y contraseña, y poder cerrar mi sesión cuando termine, para proteger la confidencialidad de la información jurídica.

**Why this priority**: Es la base de seguridad que garantiza el aislamiento de datos entre usuarios y protege las rutas privadas del portal.

**Independent Test**: Puede probarse registrando una cuenta nueva (con auto-confirmación directa), cerrando sesión, intentando acceder directamente a la URL del panel privado sin sesión (debe redirigir a login), e iniciando sesión nuevamente para verificar la persistencia de la sesión.

**Acceptance Scenarios**:

1. **Given** un usuario no registrado, **When** completa el formulario de registro con correo válido y contraseña, **Then** se crea su cuenta con auto-confirmación inmediata, queda autenticado y es dirigido a su panel de expedientes sin pasos intermedios de verificación por correo.
2. **Given** un usuario registrado, **When** ingresa sus credenciales válidas en el formulario de inicio de sesión, **Then** obtiene acceso a su espacio de trabajo privado.
3. **Given** un usuario que ingresa credenciales erróneas o campos en blanco, **When** envía el formulario, **Then** recibe un mensaje de error claro en español explicando el problema sin revelar información sensible ni errores técnicos crudos.
4. **Given** un usuario autenticado dentro del panel, **When** hace clic en el botón de cerrar sesión, **Then** su sesión local queda invalidada y es redirigido a la página pública de inicio.
5. **Given** un usuario no autenticado, **When** intenta ingresar directamente a la dirección del panel privado, **Then** el sistema le bloquea el paso y lo redirecciona a la pantalla de acceso público.

---

### User Story 3 - Creación y Clasificación Estructurada de Expedientes (Priority: P2)

Como abogado autenticado, quiero registrar un nuevo expediente abriendo un modal emergente e ingresando el título del caso, cliente, categoría y notas, para mantener un inventario estructurado de mis asuntos legales sin perder mi contexto en el panel.

**Why this priority**: Permite la captura del activo principal del negocio (los casos jurídicos) bajo reglas de validación y clasificación obligatorias de forma ágil y enfocada.

**Independent Test**: Con sesión iniciada, presionar el botón "Nuevo Expediente" en el dashboard para abrir el modal, intentar enviarlo en blanco (debe advertir campos obligatorios), completar todos los datos seleccionando una categoría válida y verificar que el modal se cierra y el nuevo expediente aparece inmediatamente en el panel.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado en su panel, **When** presiona el botón de acción principal para crear expediente, **Then** se despliega un modal emergente centrado con el formulario correspondiente preservando de fondo el estado del panel.
2. **Given** un usuario con el modal abierto, **When** completa el formulario con título del caso, nombre de cliente, notas y una categoría obligatoria (*Corporativo*, *Litigio* o *Laboral*), **Then** el expediente queda guardado, asociado exclusivamente a su identidad, el modal se cierra y la lista se actualiza al instante.
3. **Given** un usuario en el formulario modal de creación, **When** intenta enviar el formulario sin título o sin nombre de cliente, **Then** la interfaz detiene el envío y muestra un mensaje de validación destacando los campos requeridos.
4. **Given** un usuario creando un caso, **When** revisa las categorías disponibles en el modal, **Then** únicamente puede seleccionar entre *Corporativo*, *Litigio* y *Laboral*, impidiéndose valores arbitrarios o nulos.

---

### User Story 4 - Consulta, Filtrado y Eliminación Segura en Tiempo Real (Priority: P2)

Como abogado autenticado, quiero ver exclusivamente mis expedientes creados, filtrarlos por categoría y eliminar los casos que ya no correspondan, recibiendo actualizaciones reactivas en tiempo real y con la certeza de que ningún otro usuario puede ver o borrar mi información.

**Why this priority**: Garantiza la operatividad diaria de consulta, orden y depuración de expedientes con sincronización reactiva y aislamiento estricto por usuario (Row Level Security).

**Independent Test**: Abrir dos pestañas con el mismo usuario; crear o eliminar un expediente en una pestaña y verificar que la otra pestaña refleja el cambio automáticamente vía Realtime; además verificar que un Usuario B en otra sesión no recibe ni visualiza eventos de Usuario A.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado con expedientes previos, **When** carga su panel principal, **Then** visualiza la lista de sus expedientes mostrando título, cliente, etiqueta de categoría estilizada, fecha de creación y notas, activando un canal de suscripción reactivo a cambios en tiempo real.
2. **Given** un usuario con expedientes de diversas áreas, **When** selecciona un filtro de categoría (*Corporativo*, *Litigio*, *Laboral* o *Todas*), **Then** la vista filtra instantáneamente los ítems visibles según el criterio seleccionado.
3. **Given** un usuario que realiza una acción de creación o eliminación en cualquier pestaña o dispositivo, **When** la base de datos registra el cambio, **Then** la lista de expedientes se sincroniza en tiempo real reflejando la adición o remoción.
4. **Given** un usuario que desea remover un expediente, **When** presiona la opción de eliminar, **Then** el sistema solicita confirmación explícita antes de ejecutar el borrado permanente.
5. **Given** un expediente eliminado tras confirmación, **When** concluye la operación, **Then** el ítem desaparece de la lista y se confirma la acción al usuario.
6. **Given** cualquier intento de consulta o mutación, **When** se evalúa la operación en la base de datos, **Then** las políticas de seguridad a nivel de fila aseguran que ningún usuario pueda consultar ni eliminar expedientes ajenos.

---

### Edge Cases

- ¿Qué sucede si el usuario pierde la conexión a internet mientras intenta crear o eliminar un expediente? La interfaz debe detectar la falla en la operación y mostrar un mensaje amable notificando que verifique su conexión sin perder los datos digitados en el modal de creación.
- ¿Qué ocurre si un usuario intenta ingresar cadenas extremadamente largas o caracteres especiales en el título o notas? La interfaz y la base de datos deben admitir texto enriquecido/UTF-8 y truncar visualmente con elipsis en el listado para preservar la legibilidad.
- ¿Qué sucede si el usuario no tiene ningún expediente registrado aún? El panel debe mostrar un estado vacío informativo con un llamado claro a abrir el modal y registrar su primer expediente.
- ¿Qué ocurre si se interrumpe temporalmente la conexión WebSocket de tiempo real? La interfaz debe mantener visibles los datos locales y sincronizarse silenciosamente al restablecer la conexión o mediante actualización optimista tras mutaciones locales.
- ¿Qué ocurre si el usuario intenta manipular el identificador de usuario en las peticiones cliente? Las reglas de seguridad en la base de datos deben rechazar automáticamente la operación basándose estrictamente en el token de sesión autenticado (`auth.uid()`).
- ¿Qué pasa si el usuario cambia el tamaño de la ventana o rota el dispositivo en la landing page? El lienzo 3D debe recalcular su relación de aspecto y redimensionar el renderizado sin reiniciar el estado de la aplicación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer una landing page pública con estética corporativa en tema oscuro accesible para cualquier visitante sin necesidad de autenticación.
- **FR-002**: La landing page DEBE integrar una experiencia visual interactiva 3D que responda al movimiento del ratón y libere completamente sus recursos gráficos en su desmontaje.
- **FR-003**: La landing page DEBE presentar una sección informativa de características con iconografía animada que reaccione visualmente ante la interacción del usuario.
- **FR-004**: El sistema DEBE permitir a los usuarios registrarse e iniciar sesión utilizando correo electrónico y contraseña bajo un esquema de auto-confirmación directa sin requerir verificación por correo para el acceso inmediato.
- **FR-005**: El sistema DEBE mantener el estado de sesión activa del usuario y permitir el cierre de sesión voluntario, invalidando las credenciales locales.
- **FR-006**: El sistema DEBE restringir el acceso al panel privado y a la gestión de expedientes únicamente a usuarios con sesión activa, redirigiendo a los usuarios no autenticados a la vista de ingreso.
- **FR-007**: El sistema DEBE proveer un modal emergente accesible desde el panel privado para el registro ágil de expedientes jurídicos que contenga obligatoriamente: Título del Caso, Nombre del Cliente, Categoría (*Corporativo*, *Litigio* o *Laboral*) y campo para Notas.
- **FR-008**: El sistema DEBE validar que el título del caso y el nombre del cliente no estén vacíos ni compuestos únicamente por espacios en blanco antes de registrar el expediente.
- **FR-009**: El sistema DEBE asociar cada expediente creado exclusivamente al identificador del usuario que inició la sesión de manera obligatoria e inmutable.
- **FR-010**: El sistema DEBE aplicar políticas de seguridad a nivel de fila (Row Level Security) que impidan estrictamente a cualquier usuario leer, listar o eliminar expedientes pertenecientes a otros usuarios.
- **FR-011**: El sistema DEBE permitir al usuario autenticado visualizar su lista personal de expedientes, presentando título, cliente, distintivo visual de categoría, fecha de registro y notas.
- **FR-012**: El sistema DEBE mantener sincronizado el listado de expedientes en tiempo real suscribiéndose al canal de cambios de la base de datos de Supabase Realtime, combinándolo con actualización reactiva tras mutaciones locales.
- **FR-013**: El sistema DEBE permitir filtrar la lista de expedientes por las categorías predefinidas (*Todas*, *Corporativo*, *Litigio*, *Laboral*).
- **FR-014**: El sistema DEBE permitir la eliminación de expedientes propios, exigiendo un paso de confirmación previo en la interfaz para prevenir borrados accidentales.
- **FR-015**: El sistema DEBE presentar todos los mensajes de error, validaciones y confirmaciones en español con tono profesional y comprensible, sin exponer mensajes técnicos crudos ni trazas internas de error.

### Key Entities *(include if feature involves data)*

- **Usuario (User Profile / Auth Identity)**: Representa la cuenta del profesional jurídico en la plataforma. Posee identificador único (`id`), correo electrónico (`email`) y fecha de creación.
- **Expediente Jurídico (Legal Record)**: Asunto o caso legal administrado por un profesional. Posee:
  - `id`: Identificador único del expediente.
  - `user_id`: Identificador del usuario propietario (referencia estricta a la identidad autenticada).
  - `case_title`: Título o asunto del caso (texto obligatorio).
  - `client_name`: Nombre de la persona física o moral representada (texto obligatorio).
  - `category`: Clasificación jurídica fija obligatoria, con valores restringidos a: `Corporativo`, `Litigio` o `Laboral`.
  - `notes`: Descripción, resumen procesal o anotaciones del caso (texto).
  - `created_at`: Fecha y hora de registro en el sistema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario nuevo puede completar el registro e iniciar sesión en menos de 60 segundos con acceso directo inmediato sin bloqueos de confirmación.
- **SC-002**: El 100% de las consultas y operaciones sobre expedientes jurídicos garantizan aislamiento estricto por usuario mediante políticas a nivel de fila, con 0% de filtración de datos cruzados entre usuarios distintos.
- **SC-003**: El registro de un nuevo expediente válido vía modal se refleja en el panel del usuario en menos de 1 segundo tras la confirmación de envío.
- **SC-004**: Los eventos de adición y eliminación de expedientes se propagan y actualizan en la interfaz en tiempo real en menos de 500 ms a través de la suscripción reactiva.
- **SC-005**: El filtrado por categoría en la lista de expedientes responde de forma inmediata (en menos de 200 ms) sin requerir recargas completas de la página.
- **SC-006**: Al desmontar o abandonar la vista 3D interactiva, el 100% de los lienzos gráficos, geometrías y escuchadores de eventos se limpian adecuadamente, registrando 0 fugas de contextos WebGL en auditorías de memoria.
- **SC-007**: El 100% de los errores presentados al usuario final se expresan en lenguaje claro en español sin trazas técnicas crudas.

## Assumptions

- Los usuarios disponen de un navegador web moderno con soporte para aceleración gráfica estándar (WebGL) y JavaScript habilitado.
- El alcance de la presente versión está estrictamente acotado al ciclo de 48 horas de la prueba técnica, por lo que se asumen y ratifican los siguientes **Non-Goals**:
  - No se incluyen pasarelas de pago ni planes de suscripción.
  - No se incluye panel de superadministrador multitenant global.
  - No se incluye almacenamiento de archivos físicos o documentos PDF en buckets de almacenamiento.
  - No se implementan notificaciones externas (correos transaccionales automáticos, SMS o WhatsApp).
  - No se integran servicios de inteligencia artificial generativa o LLMs externos que demanden servidores intermedios.
- Los expedientes jurídicos se categorizan de forma estricta y excluyente en una sola de las tres categorías soportadas (*Corporativo*, *Litigio*, *Laboral*).

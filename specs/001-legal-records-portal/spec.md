# Feature Specification: Legal Records Portal & Public Landing Experience

**Feature Branch**: `001-legal-records-portal`

**Created**: 2026-10-06

**Status**: Ready for Planning

**Input**: User description: "## Features principales: Landing Page Pública y Experiencia Visual (Hero 3D, Morphicons, CTA), Autenticación de Usuarios (Supabase Auth), Registro y Creación de Expedientes (RLS, validación), Gestión y Visualización de Mis Expedientes (filtros, eliminación segura), Seguimiento de Procesos / Historial de Novedades por Caso + Non-Goals"

## Clarifications

### Session 2026-10-06
- Q: ¿Cómo debe ser el flujo de confirmación de correo tras registrarse con Supabase Auth? → A: Registro con auto-confirmación directa, permitiendo iniciar sesión y crear expedientes de inmediato sin esperar correo de verificación.
- Q: ¿En qué componente o vista debe presentarse el formulario de creación de expedientes dentro del portal privado? → A: Modal / Diálogo emergente centrado para mantener el contexto visual del dashboard y permitir registrar casos ágilmente.
- Q: ¿Cómo debe gestionarse la actualización en tiempo real del listado de expedientes al crear o eliminar casos? → A: Suscripción a Supabase Realtime (postgres_changes) combinada con actualización del estado local de React tras mutaciones.

### Session 2026-10-07
- Q: ¿Cómo debe capturarse y almacenarse el "tiempo para responder" en una novedad procesal? → A: Número entero opcional de días para responder ingresado manualmente junto con la fecha del suceso (ej. 3 días hábiles).
- Q: ¿Las novedades procesales registradas deben poder eliminarse o editarse individualmente por el usuario? → A: Sí, cada novedad puede ser eliminada individualmente por su creador con confirmación de seguridad protegiendo contra borrados accidentales y garantizado por RLS.
- Q: ¿Cómo debe la interfaz manejar y comunicar las restricciones de validación en la fecha del suceso y los días para responder? → A: Restricción preventiva y validación visual: bloqueo estricto en inputs (atributo max en fecha hoy, filtrado en tiempo real de teclas no numéricas como '-', 'e', '+', '.') junto con mensajes de error en línea claros en español al intentar guardar (días de respuesta > 0 si se especifica y fecha del suceso <= hoy).

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

### User Story 5 - Seguimiento Procesal, Cronología y Novedades por Caso (Priority: P2)

Como abogado autenticado, quiero hacer clic en la tarjeta de un caso para abrir una pantalla dedicada de detalle con el contexto completo y una cronología de novedades procesales, pudiendo añadir nuevas actualizaciones (título, fecha, descripción y días para responder) mediante un modal, para no perder ningún término legal ni fecha crítica de respuesta.

**Why this priority**: Convierte al expediente en una herramienta viva de gestión procesal y seguimiento procesal integral, garantizando que el usuario tenga la trazabilidad cronológica de cada paso y los plazos vigentes.

**Independent Test**: Hacer clic en la tarjeta de un caso existente en el dashboard para navegar a su vista de detalle; verificar que se muestran los datos del caso; presionar "Nueva Novedad" para desplegar el modal; registrar una novedad con fecha del suceso, título, descripción y plazo de respuesta (ej. 3 días); verificar que aparece en la línea de tiempo en orden cronológico; y verificar que la eliminación de la novedad requiere confirmación y solo funciona para el dueño del expediente (RLS).

**Acceptance Scenarios**:

1. **Given** un usuario en el dashboard de expedientes, **When** hace clic en la tarjeta de un expediente, **Then** el sistema navega a una pantalla dedicada de detalle del caso mostrando sus datos generales y el historial cronológico de novedades.
2. **Given** un usuario en la vista de detalle de un expediente, **When** presiona el botón "Nueva Novedad", **Then** se abre un modal emergente centrado para registrar la actualización del caso.
3. **Given** un usuario completando el modal de nueva novedad, **When** ingresa el título, fecha del suceso, descripción detallada y opcionalmente los días para responder (ej. 3 días hábiles/calendario), **Then** la novedad se persiste vinculada al caso y al usuario autenticado, el modal se cierra y la cronología se actualiza de inmediato.
4. **Given** una novedad con días para responder registrados, **When** se renderiza en la lista de seguimiento, **Then** resalta de manera visual y clara el plazo de respuesta para evitar vencimientos de términos procesales.
5. **Given** un usuario que desea suprimir una novedad registrada erróneamente, **When** solicita eliminarla, **Then** la interfaz exige confirmación previa y elimina el registro asegurando que las políticas RLS restrinjan la operación a su legítimo autor.
6. **Given** un usuario en la pantalla de detalle del caso, **When** presiona el botón para regresar, **Then** vuelve al dashboard conservando su estado y filtros previos.
7. **Given** un usuario diligenciando el modal de nueva novedad, **When** intenta ingresar caracteres no numéricos ('-', 'e', '+', '.') en el campo de días para responder, un valor menor o igual a 0, o una fecha del suceso futura posterior a la fecha local actual, **Then** el formulario bloquea la pulsación de teclas no numéricas en tiempo real, restringe el calendario a la fecha máxima de hoy (`max={hoy}`) y muestra retroalimentación de error en línea en español impidiendo el envío.

---

### Edge Cases

- ¿Qué sucede si el usuario intenta ingresar una fecha futura en la fecha del suceso? El campo de fecha restringe su atributo `max` a la fecha local actual y la validación detiene el guardado mostrando el mensaje "La fecha del suceso no puede ser futura".
- ¿Qué sucede si el usuario intenta escribir caracteres no numéricos o valores no positivos en días para responder? El control numérico intercepta el teclado impidiendo signos negativos ('-'), signos positivos ('+'), notación científica ('e', 'E') y puntos; y al enviar valida que sea estrictamente un entero mayor a 0 si fue diligenciado.
- ¿Qué sucede si el usuario pierde la conexión a internet mientras intenta crear o eliminar un expediente o novedad? La interfaz debe detectar la falla en la operación y mostrar un mensaje amable notificando que verifique su conexión sin perder los datos digitados en el modal de creación.
- ¿Qué ocurre si un caso no tiene ninguna novedad registrada todavía? La vista de detalle debe presentar un estado vacío amigable invitando a registrar la primera novedad procesal del expediente.
- ¿Qué sucede si el usuario no especifica días para responder en una novedad? El campo es opcional; si no aplica, la novedad se registra como un hito informativo sin advertencia de plazo de respuesta.
- ¿Qué ocurre si un usuario intenta ingresar cadenas extremadamente largas o caracteres especiales en el título o notas? La interfaz y la base de datos deben admitir texto enriquecido/UTF-8 y truncar visualmente con elipsis en el listado para preservar la legibilidad.
- ¿Qué ocurre si un usuario intenta navegar directamente a la URL o detalle de un caso ajeno? Las reglas de seguridad RLS de PostgreSQL devuelven cero registros, y la interfaz debe mostrar una pantalla de caso no encontrado o acceso denegado redirigiendo al dashboard.
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
- **FR-015**: El sistema DEBE permitir navegar a una vista de detalle dedicada del caso al hacer clic en la tarjeta del expediente, mostrando su encabezado con datos completos y un botón para volver al dashboard.
- **FR-016**: La vista de detalle del caso DEBE mostrar la cronología de novedades procesales (historial de actualizaciones) asociadas a dicho expediente en orden cronológico.
- **FR-017**: La vista de detalle DEBE incluir un botón para abrir un modal emergente de creación de novedades con campos obligatorios para: Título de la novedad, Fecha del suceso y Descripción procesal, junto a un campo opcional para Días de respuesta (plazo).
- **FR-018**: El sistema DEBE persistir las novedades en la tabla `public.case_updates` vinculadas a `case_id` y al `auth.uid() = user_id` del usuario autenticado bajo directivas estrictas de Row Level Security (RLS).
- **FR-019**: El sistema DEBE permitir la eliminación individual de novedades por parte del usuario propietario con confirmación previa de seguridad en la UI.
- **FR-020**: El sistema DEBE presentar todos los mensajes de error, validaciones y confirmaciones en español con tono profesional y comprensible, sin exponer mensajes técnicos crudos ni trazas internas de error.
- **FR-021**: El formulario de novedades procesales DEBE aplicar validación estricta en sus campos: el campo de fecha del suceso no debe admitir fechas futuras (máximo la fecha local actual), y los campos numéricos (como días para responder) deben restringir la entrada exclusivamente a dígitos del 0 al 9 (bloqueando teclas no numéricas como '-', '+', 'e', 'E', '.'), validando además que de suministrarse un plazo, este sea estrictamente un número entero mayor a 0 días.

### Key Entities *(include if feature involves data)*

- **Usuario (User Profile / Auth Identity)**: Cuenta del profesional jurídico en la plataforma. Posee identificador único (`id`), correo electrónico (`email`) y fecha de creación.
- **Expediente Jurídico (Legal Record)**: Asunto o caso legal administrado por un profesional. Posee:
  - `id`: Identificador único del expediente (UUID).
  - `user_id`: Identificador del usuario propietario (referencia estricta a la identidad autenticada).
  - `case_title`: Título o asunto del caso (texto obligatorio).
  - `client_name`: Nombre de la persona física o moral representada (texto obligatorio).
  - `category`: Clasificación jurídica fija obligatoria (`Corporativo`, `Litigio`, `Laboral`).
  - `notes`: Descripción o anotaciones iniciales del caso.
  - `created_at`: Fecha y hora de creación.
- **Novedad Procesal (Case Update / Novedad)**: Actualización o hito de seguimiento de un proceso judicial o trámite. Posee:
  - `id`: Identificador único de la novedad (UUID).
  - `case_id`: Identificador del expediente vinculado (`REFERENCES public.legal_records(id) ON DELETE CASCADE`).
  - `user_id`: Identificador del usuario propietario (`REFERENCES auth.users(id) ON DELETE CASCADE`).
  - `title`: Título o hito de la actuación procesal (texto obligatorio).
  - `event_date`: Fecha en que ocurrió el suceso procesal (fecha obligatoria, `date`, restricción `event_date <= CURRENT_DATE`).
  - `description`: Detalle y contexto de la actuación judicial o administrativa (texto obligatorio).
  - `response_days`: Número entero opcional de días hábiles/calendario concedidos para responder o actuar (restricción `response_days > 0` cuando es especificado).
  - `created_at`: Fecha y hora de registro de la novedad.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario nuevo puede completar el registro e iniciar sesión en menos de 60 segundos con acceso directo inmediato sin bloqueos de confirmación.
- **SC-002**: El 100% de las consultas y operaciones sobre expedientes y novedades garantizan aislamiento estricto por usuario mediante políticas a nivel de fila (RLS), con 0% de filtración de datos cruzados entre usuarios distintos.
- **SC-003**: El registro de un nuevo expediente válido vía modal se refleja en el panel del usuario en menos de 1 segundo tras la confirmación de envío.
- **SC-004**: Los eventos de adición y eliminación de expedientes y novedades se propagan y actualizan en la interfaz en tiempo real en menos de 500 ms.
- **SC-005**: Al hacer clic en un caso, la transición a la vista de detalle y la carga de su historial de novedades toma menos de 300 ms.
- **SC-006**: Las novedades con plazo para responder destacan visualmente indicando de forma explícita el tiempo restante o asignado para responder.
- **SC-007**: Al desmontar o abandonar la vista 3D interactiva, el 100% de los lienzos gráficos, geometrías y escuchadores de eventos se limpian adecuadamente, registrando 0 fugas de contextos WebGL en auditorías de memoria.
- **SC-008**: El 100% de los errores presentados al usuario final se expresan en lenguaje claro en español sin trazas técnicas crudas.

## Assumptions

- Los usuarios disponen de un navegador web moderno con soporte para aceleración gráfica estándar (WebGL) y JavaScript habilitado.
- El tiempo para responder en cada novedad se define como un número entero de días (ej. 3) configurado por el abogado según los términos de ley procesal.
- El alcance de la presente versión mantiene los siguientes **Non-Goals**:
  - No se incluyen pasarelas de pago ni planes de suscripción.
  - No se incluye panel de superadministrador multitenant global.
  - No se incluye almacenamiento de archivos físicos o documentos PDF en buckets de almacenamiento.
  - No se implementan notificaciones externas (correos transaccionales automáticos, SMS o WhatsApp).
  - No se integran servicios de inteligencia artificial generativa o LLMs externos que demanden servidores intermedios.

# Contexto de Negocio y Procesos Operativos (Black Silver)

**Black Silver** es un sistema ERP (Enterprise Resource Planning) diseñado específicamente para resolver los desafíos logísticos y de abastecimiento en la industria minera.

El sistema digitaliza y conecta lo que ocurre en el corporativo (compras, finanzas) con lo que ocurre en el campo (almacenes remotos, distribución de insumos). A continuación, se detalla **qué hace el sistema por los usuarios** y la lógica de negocio que resuelve.

---

## 1. Estructura Organizativa y Operativa

El sistema necesita mapear quién opera, dónde está el inventario y dónde se consumen los recursos:

- **Empresas y Empleados**: Gestiona las entidades corporativas. El personal administrativo y logístico que usa el software (usuarios con cuentas de acceso y roles) se vincula a una **Empresa** matriz.
- **Concesiones y Minas**: Permite registrar el territorio legal y las operaciones físicas principales.
- **Labores y Contratistas**: Las minas se dividen en "Labores" (los frentes de trabajo específicos). Todo material despachado en el sistema debe apuntar a una Labor activa para saber exactamente a dónde van los recursos. Los **Contratistas** (el personal minero de campo) no interactúan con el software, pero se les ancla a estas labores operativas.
- **Almacenes**: Los puntos físicos de control de inventario. Tienen responsables designados y actúan como el puente entre la compra externa y el consumo real en la mina.

---

## 2. El Estandarte Logístico: Normalización de Unidades (Cantidad Base)

**El Problema Operativo**: Un proveedor vende explosivos en "Cajas de 50", el almacén despacha en "Paquetes de 10" y el operador pide en "Unidades". En un sistema tradicional, el inventario se rompe, se duplican productos o el stock cuadra mal.

**La Solución Black Silver**:
El sistema implementa una regla universal y matemática. Todo movimiento logístico (pedidos, recepciones, transferencias) se convierte automáticamente a su **Unidad de Medida Base** multiplicando la `Cantidad Solicitada` por el `Contenido por Presentación`.

- **Impacto de Negocio**: Esto garantiza que el almacenero siempre sepa exactamente cuántas unidades individuales tiene en stock, permitiendo entregar fracciones de caja (despachos parciales) sin generar huecos en el inventario ni dolores de cabeza contables.

---

## 3. Control de Inventario Nivel Auditoría (Lotes y Kardex)

En la industria, perder el rastro de un material sensible es un riesgo operativo grave.

- **Trazabilidad por Lotes**: Los insumos críticos no entran a una bolsa común de stock. Se registran como "Lotes" con fecha de vencimiento, proveedor de origen y fecha de ingreso. Si un lote falla o caduca, el sistema permite rastrear hacia atrás de dónde vino y a quién se le despachó.
- **Kardex Inmutable (Doble Saldo)**: El Kardex es el "notario" de la empresa. Ningún registro de movimiento se puede borrar o editar manualmente. Ante un error humano, se exige hacer un documento de "Ajuste de Stock". Además, el sistema guarda siempre el "Stock Anterior" y el "Nuevo Stock" por cada movimiento, permitiendo reconstruir la foto exacta del almacén en cualquier segundo de la historia.

---

## 4. Ciclo de Compras Blindado (Cero "Typos" y Auto-PO)

El proceso de compra está diseñado para automatizar el trabajo tedioso y evitar errores de digitación que cuestan dinero.

- **Cotizaciones Matemáticas**: El área de Logística ingresa las ofertas de los proveedores. El sistema calcula los netos automáticamente, sumando fletes y descontando si el precio traía o no impuestos (IGV). El usuario ve un comparativo exacto de costos reales.
- **Auto-Generación de Órdenes (Auto-PO)**: Cuando la gerencia aprueba una cotización, **el sistema prohíbe que el comprador tipee la Orden de Compra (OC) a mano**. La OC se genera sola, heredando exactamente los precios, unidades, e impuestos aprobados en el comparativo. Esto agiliza la compra y cierra la puerta a alteraciones no autorizadas posteriores a la aprobación.

---

## 5. El Flujo de la Necesidad: Requerimientos y Despachos

Resuelve el día a día: _"El operador necesita herramientas o insumos para trabajar hoy"_.

- **Auditoría Granular (Ítem por Ítem)**: Cuando se piden 10 tipos de productos distintos en un solo documento (Requerimiento), el almacenero no aprueba o rechaza "el documento entero". El sistema exige auditar **producto por producto**. El almacenero puede despachar 5, rechazar 2 por falta de stock y dejar 3 pendientes.
- **Trazabilidad de Decisiones**: Por cada ítem, el sistema guarda su propia línea de tiempo: _quién lo pidió, quién lo aprobó, cuándo se despachó y qué comentario o justificación dejó en caso de rechazo_.

---

## 6. Logística de Desvíos: Las Transferencias

En el mundo logístico real, los camiones de los proveedores no siempre llegan al almacén correcto. A veces descargan todo en un almacén central en la ciudad en lugar de subir a la operación remota.

- **Almacenes Puente**: En lugar de obligar al usuario a anular la Orden de Compra porque el proveedor la dejó en el lugar equivocado, el sistema permite recepcionar la mercadería en el Almacén Central y usar el módulo de **Transferencias de OC** para enviar la carga en un vehículo interno hacia su destino final. Esto mantiene el rastro de que la mercadería ya es propiedad de la empresa, pero está en "tránsito interno", salvaguardando la integridad del pago al proveedor y del inventario.

## 📦 Módulos del Sistema

### Configuración y Operaciones

- `almacenes`
- `concesiones`
- `contratistas` (API)
- `empresas`
- `minas-labores`

### Inventarios y Maestros

- `productos`
- `categorias`
- `lotes-productos`
- `kardex-productos`

### Gestión de Compras

- `proveedores`
- `cotizaciones`
- `ordenes-compra`
- `ordenes-compra-recepcion-transferencias`

### Flujos de Almacén (Salidas)

- `requerimientos-almacen` & `atencion`
- `solicitudes-reabastecimiento` & `atencion`
- `prestamos-almacen` & `atencion`

### Personal y Accesos

- `personal` (Empleados y Contratistas)
- `organigrama`
- `login`
- `perfil`
- `cuentas`
- `roles`

---

## 🚀 Stack Tecnológico

### Core & Framework

- **React 19** (con Babel React Compiler) y **Vite 7**.
- **Zustand v5**: Gestión de estado global atómica.
- **React Router v7**: Enrutamiento jerárquico.
- **Zod**: Validación de esquemas y contratos de datos.
- **Axios**: Comunicación con la API mediante instancia centralizada e interceptores.

### Interfaz de Usuario (Mantine v8)

- **Componentes**: Core, Dates, Notifications, Modals, Charts, Carousel, Spotlight, Dropzone, Tiptap, NProgress.
- **Iconografía**: Tabler Icons, Lucide, Heroicons.
- **Estilos**: Tailwind CSS v4.

### Visuales & Multimedia

- **Animaciones**: Motion v12, GSAP, Anime.js.
- **Multimedia**: Lottie (JSON animations), Howler y use-sound (Feedback sonoro operativo).

### Herramientas de Reporte y Búsqueda

- **Documentos y Exportación**: `@react-pdf/renderer` (Generación de PDF en cliente), `exceljs` (Generación asíncrona de reportes Excel estilizados), `react-to-print`, `html-to-image`.
- **Motores de Búsqueda**: FlexSearch (Tokenización) y Fuse.js (Fuzzy search).
- **Utilidades**: Dayjs (Fechas), QRCode, Pluralize.

---

## 📂 Estructura del Proyecto

### `/src` - Directorios Globales

#### 1. Hooks Globales (`/src/hooks`)

- **`useAuthUser`**: Gestión de sesión y permisos.
- **`useNotify`**: Alertas y feedback visual.
- **`usePrint`**: Integración con cola de impresión.
- **`useExcel`**: Cola asíncrona global para la generación estructurada de archivos Excel sin bloquear la interfaz del usuario.
- **`useJsonScanner`**: Procesamiento de datos de hardware externo.
- **`useBlackcito`**: Asistente virtual de estados del sistema.

#### 2. Componentes de UI (`/src/presentation/utils`)

- **`DataTableEstandar`**: Grilla con filtros avanzados y carga perezosa.
- **`ModalEstandar`**: Base para formularios.
- **`JsonScanner`**: Captura visual de datos.

#### 3. State Management (`/src/stores`)

- **`auth.store`**, **`ui.store`**, **`menu.store`**.

#### 4. Servicios (`/src/service`)

- **`_api.ts`**: Interceptor de red.
- **`auxiliar.service.ts`**: **Hub de Datos Maestros.** Centraliza catálogos de Almacenes, Unidades, Personal y Productos para optimizar el tráfico de red.

#### 5. Utilidades y Funciones Compartidas (`/src/shared/functions`)

Colección de funciones puras, algoritmos y formateadores usados de forma transversal en el ERP:

- **`cn.ts`**: Combinador dinámico de clases de Tailwind CSS sin conflictos (`twMerge`). Elimina propiedades `undefined/false` de forma limpia. Sustituye el uso básico de `clsx`.
- **`en-plural.ts`**: Motor avanzado de pluralización y singularización en idioma español. Maneja excepciones gramaticales nativas (ej. "lápiz" -> "lápices", pérdida/ganancia de tildes como "joven" -> "jóvenes") e ignora palabras incontables o invariables.
- **`formatNumber.ts`**: Formatea valores numéricos utilizando separadores de miles y limpia los ceros decimales innecesarios (ej. previene que un entero limpio se vea como `10.00`), utilizando `Intl.NumberFormat`.
- **`get-coincidencias.ts`**: Motor de búsqueda robusto y unificado que combina distancia de caracteres para tolerar errores ortográficos y "typos" (**Fuse.js**), junto con tokenización para buscar palabras desordenadas (**FlexSearch**).
- **`get-duracion-periodo.ts`**: Calculadora matemática para estandarizar lapsos de tiempo. Convierte valores entre diferentes periodos (Diario, Semanal, Mensual, Anual). Vital para alinear las estimaciones de entrega de los proveedores a una sola escala (ej. transformar 2 Semanas a 14 Días).
- **`get-nombre-periodo.ts`**: Mapeador visual que traduce los valores técnicos del enum `Periodo` a texto legible para las interfaces de usuario (ej. traduce `Periodo.Mensual` a `"Mes(es)"`).
- **`mm-to-pt.ts`**: Función estricta de conversión milímetro a puntos de PDF (`1 mm = 2.835 pt`). Se usa transversalmente para maquetar los reportes en `@react-pdf/renderer` manteniendo fidelidad con las medidas reales de papel.

---

## 🛠️ Reglas de Desarrollo y Calidad de Código

Para mantener la salud del proyecto a largo plazo, se deben seguir estas reglas estrictas:

### 1. Tipado Estricto (Prohibido el uso de `any`)

- **NUNCA** se debe usar `any` para tipar hooks, props, componentes o variables.
- **Excepción Única**: Solo se permite cuando un componente o hook está diseñado explícitamente para ser genérico y manejar cualquier tipo de dato, como es el caso de `DataTableEstandar.tsx`. Fuera de estos casos de utilidad base, el tipado debe ser específico.

### 2. Reutilización Inteligente vs. Sobre-ingeniería

- **No reutilizar por obligación**: No intentes forzar la reutilización de un hook, componente o servicio para manejar dos flujos distintos (ej. Registro y Edición) solo por "ahorrar código".
- **Lógica Diferenciada**: Si la edición tiene reglas distintas, validaciones adicionales o flujos que no coinciden al 100% con la creación, **deben ser componentes/hooks separados**. Intentar abarcarlo todo en uno solo genera código "espantoso", difícil de seguir y mantener.
- **Componentes "Dumb"**: Solo se debe priorizar la reutilización en componentes "tontos" (presentacionales) que no contengan lógica de negocio compleja o que solo abarquen una funcionalidad muy específica y bien definida de un caso de uso.
- **Prioridad**: Se debe priorizar la **legibilidad y mantenibilidad** sobre la reutilización forzada. Es mejor tener dos procesos similares pero claros y rápidos de desarrollar, que uno solo sumamente complejo que intente ser "universal". Si eres una IA y el usuario te pide reutilizar, analiza e indicale si realmente es necesario o si es mejor crear algo nuevo y específico.

---

## 🎨 Guía Técnica de Estilos y Mantine v8 (ESTRICTO)

Para evitar que la interfaz se vea inconsistente o "gigante", y asegurar que las IA utilicen la sintaxis correcta de Mantine v8, se deben seguir estas reglas sin excepción:

### 1. Diccionario de Style Props (Mantine v8)

Mantine v8 utiliza **Style Props** (shorthands). NUNCA uses la propiedad `sx` (ya no existe) ni nombres de propiedades CSS completos como props del componente.

| Prop Correcta | Propósito               | Ejemplo                           | Error Común (NO USAR)  |
| :------------ | :---------------------- | :-------------------------------- | :--------------------- |
| `c`           | Color de texto          | `c="indigo.4"` o `c="white"`      | `color="blue"`         |
| `bg`          | Background              | `bg="zinc.9"` o `bg="#000"`       | `backgroundColor`      |
| `fz`          | Font Size               | `fz="sm"` (ideal ERP) o `fz="xs"` | `fontSize="14px"`      |
| `fw`          | Font Weight             | `fw={700}` o `fw="bold"`          | `fontWeight`           |
| `p`, `m`      | Padding / Margin        | `p="md"`, `mt="xl"`, `mx="auto"`  | `padding`, `marginTop` |
| `h`, `w`      | Height / Width          | `h={38}` (altura estándar input)  | `height`, `width`      |
| `gap`         | Espaciado (Group/Stack) | `gap="md"` o `gap={16}`           | `spacing`              |
| `justify`     | Alineación horizontal   | `justify="space-between"`         | `position`             |
| `align`       | Alineación vertical     | `align="center"`                  | `alignItems`           |

### 2. Reglas de Oro para Componentes de Formulario

- **Look Dark & Premium**: Los inputs deben integrarse con el tema oscuro. Usa siempre un objeto de clases (ej. `fieldClasses`) para el prop `classNames`:
  ```tsx
  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };
  ```
- **Tamaño ERP**: Usa **siempre** `size="xs"` y `radius="lg"` para `TextInput`, `Select`, `NumberInput` y `Button`. Esto evita que la UI se vea tosca.
- **Selects / MultiSelect**:
  - Añade siempre `searchable`.
  - Si el componente está dentro de un `Modal`, añade `popoverProps={{ withinPortal: true }}` para evitar que el menú se corte.
- **NumberInput**:
  - Usa `hideControls` cuando el input esté dentro de una tabla o espacio reducido.
  - Para montos, no uses `decimalScale={2}` pero si `fixedDecimalScale`.

### 3. Estética "Black & Silver" (Recomendaciones Visuales)

- **Flexibilidad Cromática**: La IA tiene **libertad total** para elegir colores según el contexto (colores vibrantes, gradientes, dark mode). No estás limitado a los colores de ejemplo.
- **Calidad Visual**: Los componentes deben sentirse premium. Usa sombras de Tailwind (ej. `shadow-lg shadow-indigo-900/20`), efectos de cristal (`backdrop-blur`) y bordes sutiles.
- **Badges**: Prefiere `variant="light"` o `variant="filled"`. Evita colores planos aburridos.

### 4. Arquitectura de Estado y Notificaciones

- **Notificaciones**: **PROHIBIDO** usar `@mantine/notifications` directamente. Debes usar el hook personalizado `useNotify()` del proyecto:
  ```tsx
  const { notifySuccess, notifyError } = useNotify();
  notifySuccess("Operación exitosa");
  ```
- **Manejo de Formularios**: El proyecto prefiere `useState` con una función `setField` y validación manual con `Zod` (`Schema.safeParse(form)`) en lugar de `useForm` de Mantine, a menos que el módulo ya use `useForm`.

### 5. Catálogo de Referencia para la IA

Utiliza este catálogo para seleccionar los componentes y hooks más adecuados para cada tarea.

#### Componentes Disponibles

- **Layout**: `AppShell`, `AspectRatio`, `Center`, `Container`, `Flex`, `Grid`, `Group`, `SimpleGrid`, `Space`, `Stack`.
- **Inputs**: `AngleSlider`, `Checkbox`, `Chip`, `ColorInput`, `ColorPicker`, `Fieldset`, `FileInput`, `Input`, `JsonInput`, `NativeSelect`, `NumberInput`, `PasswordInput`, `PinInput`, `Radio`, `RangeSlider`, `Rating`, `SegmentedControl`, `Slider`, `Switch`, `Textarea`, `TextInput`.
- **Combobox**: `Autocomplete`, `MultiSelect`, `Pill`, `PillsInput`, `Select`, `TagsInput`.
- **Buttons**: `ActionIcon`, `Button`, `CloseButton`, `CopyButton`, `FileButton`, `UnstyledButton`.
- **Navigation**: `Anchor`, `Breadcrumbs`, `Burger`, `NavLink`, `Pagination`, `Stepper`, `TableOfContents`, `Tabs`, `Tree`.
- **Feedback**: `Alert`, `Loader`, `Notification`, `Progress`, `RingProgress`, `SemiCircleProgress`, `Skeleton`.
- **Overlays**: `Affix`, `Dialog`, `Drawer`, `FloatingIndicator`, `HoverCard`, `LoadingOverlay`, `Menu`, `Modal`, `Overlay`, `Popover`, `Tooltip`.
- **Data display**: `Accordion`, `Avatar`, `BackgroundImage`, `Badge`, `Card`, `ColorSwatch`, `Image`, `Indicator`, `Kbd`, `NumberFormatter`, `Spoiler`, `ThemeIcon`, `Timeline`.
- **Typography**: `Blockquote`, `Code`, `Highlight`, `List`, `Mark`, `Table`, `Text`, `Title`.
- **Miscellaneous**: `Box`, `Collapse`, `Divider`, `FocusTrap`, `Paper`, `Portal`, `ScrollArea`, `Transition`, `VisuallyHidden`.

#### Extensiones de Mantine (Instaladas)

- **Dates**: `MiniCalendar`, `Calendar`, `DateTimePicker`, `DatePicker`, `DatePickerInput`, `DateInput`, `MonthPicker`, `MonthPickerInput`, `YearPicker`, `YearPickerInput`, `TimeInput`, `TimePicker`, `TimeGrid`, `TimeValue`.
- **Charts**: `AreaChart`, `BarChart`, `LineChart`, `CompositeChart`, `DonutChart`, `PieChart`, `FunnelChart`, `RadarChart`, `ScatterChart`, `BubbleChart`, `RadialBarChart`, `Sparkline`, `Heatmap`.
- **Otras**: `CodeHighlight`, `Notifications`, `Spotlight`, `Carousel`, `Dropzone`, `NavigationProgress`, `Modals manager`, `Rich text editor`.

#### Hooks Disponibles (@mantine/hooks)

- **UI and Dom**: `use-click-outside`, `use-color-scheme`, `use-element-size`, `use-event-listener`, `use-file-dialog`, `use-focus-return`, `use-focus-trap`, `use-focus-within`, `use-fullscreen`, `use-hotkeys`, `use-hover`, `use-in-viewport`, `use-intersection`, `use-long-press`, `use-media-query`, `use-mouse`, `use-move`, `use-mutation-observer`, `use-orientation`, `use-radial-move`, `use-reduced-motion`, `use-resize-observer`, `use-scroll-into-view`, `use-scroll-spy`, `use-viewport-size`, `use-window-event`, `use-window-scroll`.
- **State management**: `use-counter`, `use-debounced-callback`, `use-debounced-state`, `use-debounced-value`, `use-disclosure`, `use-id`, `use-input-state`, `use-list-state`, `use-local-storage`, `use-map`, `use-pagination`, `use-previous`, `use-queue`, `use-selection`, `use-set`, `use-set-state`, `use-state-history`, `use-throttled-callback`, `use-throttled-state`, `use-throttled-value`, `use-toggle`, `use-uncontrolled`, `use-validated-state`.
- **Utilities**: `use-clipboard`, `use-document-title`, `use-document-visibility`, `use-eye-dropper`, `use-favicon`, `use-fetch`, `use-hash`, `use-headroom`, `use-idle`, `use-interval`, `use-merged-ref`, `use-network`, `use-os`, `use-page-leave`, `use-text-selection`, `use-timeout`.
- **Lifecycle**: `use-did-update`, `use-force-update`, `use-is-first-render`, `use-isomorphic-effect`, `use-logger`, `use-mounted`, `use-shallow-effect`.

---

## 🏛️ Arquitectura de Módulos

### Estructura de un Dominio (`/src/modules/`)

```text
module-name/
├── hooks/        # Lógica de estado y validaciones.
├── presentation/ # Página y componentes de vista.
└── service/      # Servicios de API.
    ├── requests.ts  # DTOs de envío a la API.
    ├── responses.ts # DTOs de respuesta de la API.
    └── service.ts   # Métodos para interactuar con la API.
```

---

## ⚙️ Ejecución

1. Configurar el archivo `.env`
2. `npm install`
3. `npm run dev`

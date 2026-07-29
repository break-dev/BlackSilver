# Contexto de Negocio y Procesos Operativos (Cupper & Hannia)

**Cupper & Hannia** es un sistema ERP (Enterprise Resource Planning) diseñado específicamente para resolver los desafíos logísticos y de abastecimiento en la industria minera.

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

**La Solución Cupper & Hannia**:
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

## Módulos del Sistema

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

## Stack Tecnológico

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

## Estructura del Proyecto

### `/src` - Directorios Globales

#### 1. Hooks Globales (`/src/hooks`)

Ganchos personalizados que proveen estado y lógica de comportamiento transversal en todo el ERP.

- **`useAuthUser.ts`**: Gestión de estado de sesión, inicio/cierre de sesión, y comprobación reactiva de permisos del usuario.
- **`useNotify.ts`**: Envoltorio de notificaciones nativas Mantine v8 unificado. Ofrece `notifySuccess` y `notifyError` asegurando la estética visual consistente.
- **`usePrint.ts` / `useDownloadFile.ts`**: Utilidades para descarga asíncrona de reportes y cola de impresión local.
- **`useExcel.ts`**: Manejo asíncrono y en segundo plano de generación de archivos de cálculo Excel.
- **`useJsonScanner.tsx`**: Hook integrado para el procesamiento e interpretación de datos capturados por hardware externo (lectores de código de barras).
- **`useMenuNav.ts`**: Administra la carga y filtrado de enlaces de navegación en base al rol autenticado.
- **`useTitlePage.ts`**: Mantiene sincronizado el título de la pestaña del navegador con el módulo activo.
- **`useBlackcito.ts`**: Gancho dinámico para el asistente animado del ERP (Blackcito).

#### 2. Componentes de UI Reutilizables (`/src/presentation/utils`)

Componentes visuales puros y layouts genéricos de alta calidad Mantine v8.

- **`DataTableEstandar.tsx`**: Grilla maestra unificada para visualización de registros con ordenamiento, paginación reactiva, filtros y modo auditoría integrado.
  - **Props**: `idAccessor?: string`, `columns: DataTableColumn[]`, `records: any[]`, `loading: boolean`, `initialPageSize?: number` (default `25`). Acepta y propaga cualquier prop extra de `mantine-datatable` (`minHeight`, `onRowClick`, `rowExpansion`, etc.).
  - **Indexado automático `#`**: declarar una columna con `accessor: "index"` y `title: "#"` hace que el componente calcule el número absoluto `(página - 1) * pageSize + index + 1` sin necesidad de un `render` manual.
  - **Reset de página reactivo**: cuando cambia la referencia de `records` (ej. tras un refetch/filtro), vuelve automáticamente a `page=1`.
  - **Estilo dark consistente**: `bg-zinc-900/50`, header `bg-zinc-900/80`, paginación `bg-zinc-900/50 border-t border-zinc-800`, `striped` + `highlightOnHover`.
  - **Tipado flexible**: única excepción permitida al uso de `any` (ver regla §1), porque su API es genérica por diseño.
  - **Identificadores opcionales (auto-UUID)**: para tablas de solo lectura no es obligatorio declarar `id` / `accessor`. El componente los genera con `uuid` y los mantiene estables por instancia/referencia:
    - `idAccessor` omitido → se genera `dt-<uuid>` una sola vez al montar la tabla (con `useState(() => …)`).
    - `accessor` omitido en una columna → se asigna `c-<uuid>` (estable mientras la referencia de `columns` no cambie). **La columna debe traer `render` propio**, porque la librería no puede mapear el record sin accessor y la celda quedaría vacía.
    - `id` omitido en un grupo (raíz o anidado) → se asigna `g-<uuid>` (estable mientras la referencia de `columnGroups` no cambie). El `id` solo se usa como React key del `<th>`, así que un UUID es válido.
    - **Cuándo SÍ hay que pasar `idAccessor`**: si la tabla usa selección, expansión de filas, o cualquier feature que dependa de identificar records únicos. En esos casos el `idAccessor` debe apuntar al campo real del record (ej. `"id"`).
  - **Cabeceras agrupadas (multi-nivel) — `columnGroups?`**: prop opcional del tipo `DataTableColumnGroup[]` de `mantine-datatable`. Permite definir cabeceras que agrupan otras (estilo `<th colspan>` / `<th rowspan>`), con soporte para anidamiento recursivo (un grupo puede contener sub-grupos vía `groups: [...]`). Cada `title` se envuelve automáticamente en un layout centrado `text-xs font-bold uppercase tracking-wider text-zinc-100`.
    - Cuando se proporciona, el componente activa `withColumnBorders` en el `DataTable` (internamente).
    - **Caveat del library**: las columnas referenciadas en `groups[*].columns` (de forma recursiva) son las que aparecen en el cuerpo. Por eso toda columna que deba renderizarse en `<tbody>` debe estar referenciada desde algún grupo (incluso las que no quieras agrupar visualmente deben ir en un grupo "single-column").
  - **Ejemplo mínimo (sin IDs/accessors explícitos)**:
    ```tsx
    <DataTableEstandar
      columns={[
        { title: "Código",      render: r => r.codigo },
        { title: "Fechas",      render: r => r.fechas },
        { title: "NewAu",       render: r => r.new_au },
        { title: "Promedio",    render: r => r.promedio },
        { title: "NewAg",       render: r => r.new_ag },
        { title: "Estado",      render: r => r.estado },
        { title: "Acción",      render: r => r.accion },
      ]}
      columnGroups={[
        { title: "LOTE",  columns: [<ref col 0>, <ref col 1>] },
        {
          title: "Leyes Consolidadas",
          groups: [
            { title: "NewAu", columns: [<ref col 2>, <ref col 3>, <ref col 4>] },
            { title: "NewAg", columns: [<ref col 5>] },
          ],
        },
        { title: "Cierre", columns: [<ref col 6>, <ref col 7>] },
      ]}
      records={records}
      loading={loading}
    />
    ```
  - **Ejemplo con IDs explícitos (cuando se necesita selección o control total)**:

    ```tsx
    const columns: DataTableColumn<LeyRow>[] = [
      /* ...con accessors explícitos... */
    ];

    <DataTableEstandar
      idAccessor="id"
      columns={columns}
      columnGroups={[
        { id: "lote", title: "LOTE", columns: [columns[0], columns[1]] },
        {
          id: "leyes",
          title: "Leyes Consolidadas",
          groups: [
            { id: "newAu", title: "NewAu", columns: [columns[2], columns[3]] },
            { id: "newAg", title: "NewAg", columns: [columns[4], columns[5]] },
          ],
        },
        { id: "cierre", title: "Cierre", columns: [columns[8], columns[9]] },
      ]}
      records={records}
      loading={loading}
    />;
    ```

- **`ModalEstandar.tsx`**: Componente contenedor para modales de edición o registro dinámico de formularios. Extiende `Partial<ModalProps>` de Mantine v8, por lo que acepta cualquier prop adicional del `Modal` base (`size`, `zIndex`, `withCloseButton`, etc.).
  - **Props estándar**:
    - `opened: boolean` — estado de apertura del modal.
    - `close: () => void` — callback que el consumer controla para cerrar.
    - `title: React.ReactNode` — título con el layout premium (barra dorada lateral + gradiente).
    - `children: React.ReactNode` — contenido del modal.
    - `rightSection?: React.ReactNode` — slot opcional alineado a la derecha del header (ej. botón de ayuda, badge de estado).
  - **Confirmación al cerrar (opt-in, sin providers globales)**:
    - `validateClose?: boolean` — default `false`. Si es `true`, cualquier intento de cerrar (X del header, tecla `Escape`, click en el overlay) abre un diálogo de confirmación encima (estilo "warning dialog" diferenciado: icono `IconAlertCircle` en `ThemeIcon` con gradiente `red.6 → orange.6`, fondo `bg-zinc-900` con borde `yellow.500/30`, `radius="lg"`, sin barra dorada del modal base).
    - `closeConfirmationTitle?: string` — título del diálogo (solo texto). Default: `¿Cerrar sin guardar?`.
    - `closeConfirmationMessage?: React.ReactNode` — mensaje/cuerpo del diálogo (texto o JSX). Default genérico recordando que se perderán los cambios.
    - El botón **"Cancelar"** queda con foco automático (`data-autofocus`) para que `Enter` mantenga el modal padre abierto (acción segura por default).
    - "Sí, cerrar" en `color="red"` confirma; "Cancelar" simplemente descarta la confirmación.
  - **Ejemplo de uso**:
    ```tsx
    <ModalEstandar
      opened={abierto}
      close={() => setAbierto(false)}
      title="Editar producto"
      validateClose
      closeConfirmationTitle="¿Abandonar edición?"
      closeConfirmationMessage="Vas a descartar los cambios no guardados del producto."
    >
      {/* formulario */}
    </ModalEstandar>
    ```
- **`JsonScanner.tsx`**: Interfaz de escaneo de códigos de barra para ingreso masivo de ítems.
  - **Props**: `fields: string[]` (claves a extraer del JSON), `onScanned: (values) => void`, `isFiltering: boolean`, `onClearFilter: () => void`, `filteredCount?: number`.
  - **Funcionamiento**: input compacto (`radius="xl"`, `size="xs"`) que recibe texto crudo (pegado o desde lector USB/Bluetooth); el parsing lo hace el hook `useJsonScanner` (`parseQrFields`) tolerando corrupción. Tras una lectura exitosa se limpia el input a los 300 ms.
  - **Estado de filtro**: muestra un badge `indigo` con el conteo (`filteredCount`) cuando `isFiltering` es `true`, con botón `ActionIcon` (`color="red"`) para limpiar el filtro.
- **`date-picker-input.tsx`**: Selector de fechas unificado (`CustomDatePicker`) alineado al diseño de inputs ERP.
- **`form-marca.tsx` / `form-personal-externo.tsx`**: Formularios modulares auto-contenidos para creación rápida de catálogos en procesos concurrentes.
- **`archivo/` (`archivo-card.tsx`, `multifile-picker.tsx`)**: Utilidades visuales para visualización, carga drag & drop y borrado de documentos adjuntos.
- **`excel/` (`GlobalExcelPortal.tsx`)**: Portal flotante global que gestiona colas de exportación pesadas sin congelar el hilo principal.
- **`printer/` (`GlobalPrinterPortal.tsx`)**: Servicio global que administra la cola de impresión de documentos y vales físicos.
- **Plantillas PDF (`orden-compra-pdf.tsx`, `ticket-lote-pdf.tsx`, etc.)**: Generadores de comprobantes en el cliente estructurados mediante `@react-pdf/renderer`.

#### 3. Capa de Servicios de Red (`/src/service`)

Instancia de comunicación REST y servicios auxiliares con el backend.

- **`_api.ts`**: Interceptor maestro de Axios. Inyecta tokens Bearer JWT de forma automática y normaliza las respuestas en base a la interfaz de éxito o fallo corporativo.
- **`_socket.ts`**: Cliente WebSocket unificado (Laravel Echo + Pusher) para canalizar eventos en tiempo real como el cambio global del Modo Auditoría.
- **`auxiliar.service.ts`**: **Hub de Datos Maestros.** Cachea y provee catálogos compartidos de productos, lotes, marcas, personal y almacenes optimizando las llamadas de red.
- **`archivo.service.ts` / `menu-nav.service.ts`**: Gestión física de adjuntos y descarga de árbol de menús estructurados.
- **Subcarpeta `responses/`**: Contratos e interfaces TypeScript (`.ts`) que mapean al 100% de tipado estricto las respuestas HTTP devueltas por la API de Laravel módulo por módulo (ej. `activo-fijo.ts`, `lote-producto.ts`, `requerimiento-almacen.ts`).

#### 4. Recursos Compartidos (`/src/shared`)

Estructura fundacional, tipos globales, constantes y algoritmos lógicos puros del ERP.

- **`enums/`**: Mapeo completo de Backed Enums de PHP a enums TypeScript, divididos de forma estricta (ej. `solicitud-reabastecimiento`, `orden-compra`, `requerimiento-almacen`).
- **`enums/_generic/`**: Enums base y transversales (`tipo-bien.ts`, `moneda.ts`, `premura.ts`, `periodo.ts`).
- **`interfaces/`**: Interfaces genéricas de formato de API (`_response.ts`) e información de archivos.
- **`variables/`**: Mapeadores y arrays estáticos de soporte visual (`meses.ts`, `monedas.ts`, `iconos-menu-navegacion.ts`).
- **`functions/` (Algoritmos Genéricos)**:
  - **`cn.ts`**: Combinador inteligente de clases Tailwind CSS (`tailwind-merge`).
  - **`en-plural.ts`**: Algoritmo avanzado de pluralización en español (excepciones de tildes y terminaciones).
  - **`formatNumber.ts`**: Formateador decimal de precisión financiera.
  - **`get-coincidencias.ts`**: Buscador difuso (Fuzzy Search con Fuse.js) y tokenizado por palabras (FlexSearch).
  - **`get-duracion-periodo.ts` / `get-nombre-periodo.ts`**: Estandarización y visualización matemática de lapsos temporales.
  - **`mm-to-pt.ts`**: Conversión estricta milímetros a puntos PDF.
  - **`get-url-barcode.ts`**: Genera la representación del código de barras en base64 para reportes PDF.

---

## Reglas de Desarrollo y Calidad de Código

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

## Guía Técnica de Estilos y Mantine v8 (ESTRICTO)

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

> [!IMPORTANT]
> **`ActionIcon` y el tamaño del ícono**: la prop `size` controla `width`/`min-width`/`min-height`/`height` del botón vía CSS vars `--ai-size-{x}`, **pero NO** controla el tamaño del ícono hijo. Tamaños válidos: `xs`, `sm`, `md`, `lg`, `xl`, numérico (px→rem), o `input-sm`/`input-md`/`input-lg` para igualar inputs. **`size="sm"` deja los botones pequeños — no es bug, es el tamaño real.** Para acciones visibles en filas/listas usa `size="md"` o mayor, y define el tamaño del ícono manualmente (`className="w-4 h-4"` en Heroicons o `size={16}` en Tabler).

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

### 4. Paleta de Colores Válida (Mantine v8)

Los siguientes son los **únicos** nombres de color válidos en el tema default de Mantine v8. Cualquier otro nombre (ej. `amber`, `gold`, `crimson`, `purple`, `navy`, `silver`) será **ignorado silenciosamente** y el componente renderizará sin color (monocromático/gris). Esto aplica a la prop `color` de componentes (`Switch`, `Button`, `Badge`, `Alert`, etc.) y a Style Props de color (`c`, `bg`, `borderColor`).

Cada color tiene **10 niveles de tinte** numerados del `0` al `9`. El nivel **`6` es el default**. Para usar otro nivel, aplica la notación `color.nivel`, por ejemplo `teal.4` o `indigo.9`.

| Color    | Uso sugerido                                            |
| :------- | :------------------------------------------------------ |
| `dark`   | Negro puro, contrastes fuertes sobre fondos claros      |
| `gray`   | Neutros, textos secundarios, disabled states            |
| `red`    | Errores, alertas críticas, acciones destructivas        |
| `pink`   | Acentos decorativos                                     |
| `grape`  | Acentos decorativos                                     |
| `violet` | Acentos decorativos                                     |
| `indigo` | **Color primario del ERP** (botones principales, focus) |
| `blue`   | Información, links                                      |
| `cyan`   | Información alternativa                                 |
| `teal`   | Éxito, confirmaciones, monedas PEN                      |
| `green`  | Éxito alternativo, validación                           |
| `lime`   | Acentos positivos                                       |
| `yellow` | **Detracción y advertencias** (reemplaza a "amber")     |
| `orange` | Advertencias, llamadas a la atención                    |

**Ejemplos correctos:**

```tsx
<Switch color="yellow" />
<Badge color="teal.4" />
<Button color="indigo">Guardar</Button>
<Alert color="red" variant="filled" />
```

**Ejemplos incorrectos (no renderizan color):**

```tsx
<Switch color="amber" />      // Ignorado: usa "yellow" en su lugar
<Button color="crimson" />    // Ignorado: no existe en el tema
<Badge color="silver" />      // Ignorado: usa "gray.5" o "gray.6"
```

Ante cualquier duda, consultar la documentación oficial de Mantine v8: https://v8.mantine.dev

### 5. Arquitectura de Estado y Notificaciones

- **Notificaciones**: **PROHIBIDO** usar `@mantine/notifications` directamente. Debes usar el hook personalizado `useNotify()` del proyecto:
  ```tsx
  const { notifySuccess, notifyError } = useNotify();
  notifySuccess("Operación exitosa");
  ```
- **Manejo de Formularios**: El proyecto prefiere `useState` con una función `setField` y validación manual con `Zod` (`Schema.safeParse(form)`) en lugar de `useForm` de Mantine, a menos que el módulo ya use `useForm`.

### 6. Reglas de DataTableEstandar (Índices automáticos de paginación)

- **Índice Automático (#)**: **NUNCA** implementes un método `render` manual para la columna de numeración correlativa (`#`). Si necesitas mostrar el número de fila absoluto (que tiene en cuenta la página y el tamaño de página actual), define el objeto de la columna con el `accessor: "index"` de forma simple:
  ```tsx
  {
    accessor: "index",
    title: "#",
    textAlign: "center",
    width: 50,
  }
  ```
  `DataTableEstandar` intercepta automáticamente esta clave y calcula el índice correspondiente. No ensucies la definición del módulo con funciones de render redundantes.

### 7. Catálogo de Referencia para la IA

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

## Arquitectura de Módulos

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

## Ejecución

1. Configurar el archivo `.env`
2. `npm install`
3. `npm run dev`

---

## Comandos Obligatorios para IA

> [!IMPORTANT]
> Después de realizar cualquier cambio en el código del Frontend, es **OBLIGATORIO** ejecutar el siguiente comando para verificar la integridad de los tipos y el empaquetado:
>
> ```bash
> npm run build
> ```
>
> No confíes únicamente en `tsc --noEmit`. El proceso de build completo es la única garantía de que el código es correcto y está listo para producción.

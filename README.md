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

Resuelve el día a día: *"El operador necesita herramientas o insumos para trabajar hoy"*.

- **Auditoría Granular (Ítem por Ítem)**: Cuando se piden 10 tipos de productos distintos en un solo documento (Requerimiento), el almacenero no aprueba o rechaza "el documento entero". El sistema exige auditar **producto por producto**. El almacenero puede despachar 5, rechazar 2 por falta de stock y dejar 3 pendientes. 
- **Trazabilidad de Decisiones**: Por cada ítem, el sistema guarda su propia línea de tiempo: *quién lo pidió, quién lo aprobó, cuándo se despachó y qué comentario o justificación dejó en caso de rechazo*.

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

- **Documentos**: @react-pdf/renderer (Generación de PDF), jsPDF, react-to-print, html-to-image.
- **Motores de Búsqueda**: FlexSearch (Tokenización) y Fuse.js (Fuzzy search).
- **Utilidades**: Dayjs (Fechas), QRCode, Pluralize.

---

## 📂 Estructura del Proyecto

### `/src` - Directorios Globales

#### 1. Hooks Globales (`/src/hooks`)

- **`useAuthUser`**: Gestión de sesión y permisos.
- **`useNotify`**: Alertas y feedback visual.
- **`usePrint`**: Integración con cola de impresión.
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
- **`aux.service.ts`**: **Hub de Datos Maestros.** Centraliza catálogos de Almacenes, Unidades, Personal y Productos para optimizar el tráfico de red.

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

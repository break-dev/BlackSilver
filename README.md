# Black Silver - Frontend

Este es el frontend del sistema **Black Silver**, una plataforma integral de gestión empresarial (ERP) especializada en operaciones mineras y logística.

## 🚀 Stack Tecnológico

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilos**:
  - [Tailwind CSS v4](https://tailwindcss.com/) (Utilidades y diseño fluido)
  - [Mantine v8](https://mantine.dev/) (Biblioteca de componentes UI y hooks)
- **Estado Global**: [Zustand](https://zustand-demo.pmnd.rs/) (Arquitectura ligera y escalable)
- **Enrutamiento**: [React Router DOM v7](https://reactrouter.com/)
- **Validación**: [Zod](https://zod.dev/)
- **Comunicación API**: [Axios](https://axios-http.com/)
- **Animaciones**:
  - [Motion](https://motion.dev/)
  - [GSAP](https://gsap.com/)
  - [Anime.js](https://animejs.com/)
- **Gestión de Fechas**: [Dayjs](https://day.js.org/)

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura **Modular** y **Orientada a Dominios**.

### `/src` - Diccionario de Recursos Globales

#### 1. Hooks Globales (`/src/hooks`)

Lógica reutilizable en toda la aplicación:

- **`useAuthUser`**: Gestiona la sesión del usuario, el logout y la validación de autorización basada en el menú dinámico.
- **`useNotify`**: Interfaz simplificada para disparar notificaciones de éxito, error e información mediante Mantine Notifications.
- **`usePrint`**: Facilita la lógica de impresión de documentos (PDFs, tickets) integrándose con el portal de impresión global.
- **`useJsonScanner`**: Hook especializado para manejar la entrada de datos desde scanners de códigos QR/Barra que envían información en formato JSON.
- **`useDownloadFile`**: Utilidad para gestionar la descarga de archivos desde el servidor o mediante blobs locales.
- **`useTitlePage`**: Sincroniza el título de la pestaña del navegador con la página actual.

#### 2. Componentes Base de UI (`/src/presentation/utils`)

Componentes altamente configurables que definen el lenguaje visual del sistema:

- **`DataTableEstandar`**: Envoltura de `mantine-datatable` con estilos preconfigurados, paginación automática y manejo de estados de carga.
- **`ModalEstandar`**: Componente de ventana modal con animaciones de entrada y estructura definida para formularios.
- **`DatePickerInput`**: Input de fecha personalizado y estilizado.
- **`JsonScanner`**: Componente visual para la captura de datos mediante scanner.
- **`BlackcitoPet`**: Mascota virtual/asistente que proporciona feedback visual y saludos dinámicos al usuario.

#### 3. State Management (`/src/stores`)

Estados persistentes mediante Zustand:

- **`auth.store`**: Almacena el token JWT y la información básica del usuario logueado.
- **`ui.store`**: Controla el estado de la interfaz (sidebar abierto/cerrado) y la cola de notificaciones globales.
- **`menu.store`**: Almacena la estructura del menú de navegación obtenida desde la API tras el login.
- **`printer.store`**: Gestiona la cola de impresión y la visibilidad de los portales de impresión.

#### 4. Servicios Centrales (`/src/service`)

- **`_api.ts`**: Configuración de Axios con interceptores. Inyecta el token de autorización y maneja automáticamente los errores 401 (Unauthorized) limpiando la sesión.
- **`archivo.service.ts`**: Gestión de subida y visualización de documentos en el servidor.
- **`menu-nav.service.ts`**: Servicio para obtener la estructura jerárquica del menú según el rol.

#### 5. Shared (`/src/shared`)

- **`cn.ts`**: Utilidad para combinar clases de Tailwind de forma limpia (usando `clsx` y `tailwind-merge`).
- **`formatNumber.ts`**: Funciones para formatear moneda y números según el estándar local.
- **`interfaces/`**: Contiene contratos de datos globales como `IResponse` y `IArchivo`.
- **`enums/`**: Definiciones de constantes para estados de requerimientos, órdenes de compra, tipos de movimiento, etc.

## 🏛️ Convenciones y Patrones

### 🛠️ Reglas de Oro Arquitectónicas

1. **Aislamiento de Módulos (Frontend <-> API)**: Un módulo en el frontend (ej. `src/modules/ordenes-compra`) **SÓLO** puede comunicarse con su equivalente en la API. Está terminantemente prohibido llamar a servicios de otros módulos (ej. no llamar a `AlmacenesService` desde el módulo de OC).
2. **Endpoints Específicos**: Si un módulo requiere datos que otro módulo ya provee, el controlador del módulo actual en la API debe proveer su propio endpoint para dicha información, incluso si internamente consume lógica compartida. El Frontend **NUNCA** debe realizar "saltos" entre módulos de la API.
3. **Centralización de Responses**: Las interfaces de respuesta (`Responses`) se centralizan en `src/service/responses` cuando la estructura es idéntica entre dominios, permitiendo la reutilización de tipos pero manteniendo los puntos de acceso (endpoints) aislados.

### 1. Estructura de Módulos

Cada módulo en `src/modules` es autocontenido:

```text
module-name/
├── hooks/        # Hooks de estado local y lógica de negocio específica.
├── presentation/ # Páginas, componentes y sub-formularios.
├── service/      # requests.ts (llamadas axios), service.ts (transformaciones).
└── README.md     # Documentación técnica profunda del módulo.
```

### 2. Flujo de Datos Estándar

1.  **Vista (`.page.tsx`)**: Define el layout y usa el Hook de Módulo.
2.  **Hook (`useX.ts`)**: Maneja el estado local (ej. carga, datos), validaciones con Zod y llama al Servicio.
3.  **Servicio (`X.service.ts`)**: Orquestador que puede combinar múltiples peticiones o transformar datos para la UI.
4.  **Request (`X.requests.ts`)**: Peticiones atómicas a la API usando la instancia global `api`.

### 3. Layouts Anidados

El sistema usa `react-router-dom` para manejar layouts jerárquicos:

- **`PublicLayout`**: Para el Login.
- **`AuthLayout`**: El contenedor principal con Sidebar y Header.
- **Layouts Secundarios**: Como `LogisticaLayout`, que añaden sub-navegación lateral o pestañas específicas.

## 📦 Módulos del Sistema

| Categoría         | Módulos                                                                    |
| :---------------- | :------------------------------------------------------------------------- |
| **Acceso**        | Login, Perfil                                                              |
| **Configuración** | Empresas, Almacenes, Concesiones, Minas                                    |
| **Personal**      | Empleados (Trabajadores), Organigrama (Áreas/Cargos)                       |
| **Usuarios**      | Cuentas, Roles                                                             |
| **Inventario**    | Productos, Categorías, Lotes, Kardex                                       |
| **Logística**     | Requerimientos, Reabastecimiento, Préstamos (y sus respectivas Atenciones) |
| **Compras**       | Proveedores, Cotizaciones, Órdenes de Compra                               |

> [!TIP]
> Cada módulo cuenta con su propio `README.md` detallado. Es obligatorio actualizarlos al realizar cambios significativos en la lógica del dominio.

## ⚙️ Configuración del Env

Asegúrate de tener un archivo `.env` en la raíz:

```env
VITE_API_URL=http://tu-api-url/api
```

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Compila el proyecto para producción.
- `npm run lint`: Ejecuta el linter para asegurar la calidad del código.

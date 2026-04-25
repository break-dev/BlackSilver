# Black Silver - Frontend (React + Vite)

Este es el repositorio del frontend de **Black Silver**, una plataforma SaaS diseñada para la gestión integral de operaciones mineras. Este proyecto utiliza un stack moderno y una arquitectura de **Aislamiento por Modulo** para garantizar la escalabilidad y mantenibilidad.

---

## 💎 Librerías Relevantes

### Desarrollo y Core
- **React 19 & Vite 7:** Base del proyecto y herramienta de construcción ultra-rápida.
- **TypeScript:** Tipado estricto para prevenir errores y mejorar la legibilidad.
- **Axios:** Cliente HTTP para comunicación con la API.
- **Zustand 5:** Gestión de estado global simple y escalable.
- **React Router 7:** Enrutamiento dinámico y manejo de navegación.

### Diseño y UI/UX
- **Mantine 8:** Framework de componentes UI completo y accesible.
- **Tailwind CSS 4:** Estilado rápido y consistente mediante utilidades.
- **Motion 12 (Framer Motion) & GSAP:** Orquestación de animaciones suaves, micro-interacciones y animaciones complejas (como GSAP timelines).
- **HeroIcons, Tabler Icons & Lucide React:** Sets de iconos vectoriales para una interfaz limpia y moderna.
- **Lottie React:** Integración de animaciones JSON exportadas desde After Effects/Lottie para interacciones premium.
- **Use Sound:** Hooks para integrar efectos de sonido y retroalimentación auditiva a las micro-interacciones.

### Funcionalidad Avanzada
- **Mantine DataTable:** Tablas de alto rendimiento con soporte para ordenamiento y filtrado.
- **Recharts & Mantine Charts:** Visualización de datos y analíticas.
- **@react-pdf/renderer:** Generación de documentos PDF complejos directamente en el cliente.
- **Zod:** Validación de esquemas de datos integrada con formularios.
- **Day.js:** Manipulación y formateo de fechas de forma ligera.
- **QRCode.react:** Generación dinámica de códigos QR para trazabilidad.

---

## 🏗️ Arquitectura: Aislamiento por Modulo

El proyecto sigue estrictamente el principio de **Aislamiento por Modulo**. Cada modulo de la aplicación reside en su propio directorio y debe ser autosuficiente.

### Ubicación: `src/modules/[nombre-modulo-kebab-case]`

Cada modulo se divide obligatoriamente en tres capas para separar responsabilidades:

#### 1. Presentation (`components/` y `.page.tsx`)

- **Responsabilidad:** UI/UX y renderizado.
- **Regla:** No debe contener lógica compleja, cálculos pesados ni manejo de estado de negocio.
- **Archivos:** El componente principal es `[nombre-modulo].page.tsx`. Los sub-componentes son `[nombre-componente].tsx`.
- **Escalabilidad:** Si un componente se vuelve complejo, crea una carpeta con su nombre, coloca el `.tsx` ahí dentro, y crea una subcarpeta `components/` para los elementos que lo integran.

#### 2. Hooks (`hooks/`)

- **Responsabilidad:** El "Cerebro" del componente. Maneja el estado local, efectos y validaciones.
- **Regla:** Los hooks son **por cada componente complejo de la modulo**, no uno general por modulo. (Ej: `useRegistroEntregaLogistica.ts`).

#### 3. Service (`service/`)

- **Responsabilidad:** Comunicación con la API y definición de modelos de datos.
- **Regla:** Solo deben existir **3 archivos** nombrados con el nombre de la modulo:
  1. `[nombre-modulo].service.ts`
  2. `[nombre-modulo].requests.ts`
  3. `[nombre-modulo].responses.ts` (Debe ser **exactamente** lo que la API envía).

> [!IMPORTANT]
> **Reglas de Oro:**
>
> 1. **Prohibido reutilizar componentes de negocio** entre diferentes modulos (ej. entregas de requerimientos vs. entregas de préstamos), aunque se parezcan. Se debe tomar como referencia y crear uno nuevo en la modulo correspondiente.
> 2. **Componentes Abstractos:** Solo se reutilizan componentes sin lógica de procesos específicos (Modal, Datatable, CustomDatePicker, FileUpload) desde `src/presentation` o `src/shared`.

---

## 📂 Estructura de Directorios

- `src/hooks`: Hooks de utilidad global transversales. Destacan `useTitlePage` (para nombre en header y pestaña) y `useNotify` (para alertas UI). **No existe useTheme.**
- `src/presentation`: Componentes de UI globales y abstractos.
- `src/service`: Instancia de Axios y servicios core del sistema.
- `src/shared`: Constantes, utilidades, tipos globales y **Enums** (que deben mantener similitud estricta con los de la API).
- `src/stores`: Stores globales (ej. sesión de usuario, configuración).
- `src/modules`: Modulos de la aplicación organizadas por funcionalidad.

---

## 📝 Reglas de Desarrollo

### 1. Convenciones de Nombres

- **Página Principal:** `kebab-case.page.tsx`
- **Sub-Componentes:** `kebab-case.tsx`
- **Hooks:** `camelCase.ts` empezando con 'use' (ej. `useRegistroEntrega.ts`).
- **Servicios:** `kebab-case.service.ts`
- **Carpetas:** `kebab-case`.

### 2. Tipado Estrictamente Obligatorio

Está prohibido el uso de `any`. Todas las respuestas y requests de la API deben tener una interfaz definida en el respectivo archivo de la capa de servicio.

### 3. Flujo de Datos

El flujo debe ser siempre unidireccional:
`Componente (UI) -> Hook (Lógica) -> Service (API/Store) -> Backend`.

---

## 🚀 Workflow: Crear una Nueva Modulo

1. **Crear Carpeta:** En `src/modules/nueva-modulo`.
2. **Definir Service:** Crea `nueva-modulo.responses.ts`, `nueva-modulo.requests.ts` y `nueva-modulo.service.ts`.
3. **Crear Hook:** Implementa los hooks necesarios para cada componente complejo de la modulo en la carpeta `hooks/`.
4. **Implementar Modulo:** Crea `nueva-modulo.page.tsx` y sus sub-componentes. Usa `useTitlePage` y `useNotify`.
5. **Registrar Ruta:** Añade la nueva ruta en el enrutador principal.

---

## 🔧 Comandos Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar Linter
npm run lint
```

---

## 💎 Estética y Diseño

- Mantén la consistencia visual usando los tokens de Mantine.
- Usa **Motion** para transiciones suaves, animaciones y traslaciones entre estados o navegación.
- Prioriza la experiencia del usuario (UX) con colores, gradientes y estados de carga en pro de mostrar un sistema moderno, genial y estupendo.

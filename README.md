# Black Silver - Frontend (React + Vite)

Este es el repositorio del frontend de **Black Silver**, una plataforma SaaS diseñada para la gestión integral de operaciones mineras. Este proyecto utiliza un stack moderno y una arquitectura de **Aislamiento por Vista** para garantizar la escalabilidad y mantenibilidad.

---

## 🛠️ Stack Tecnológico

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 7](https://vitejs.dev/)
- **Languaje:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [Mantine 8](https://mantine.dev/)
- **Icons:** [HeroIcons](https://heroicons.com/)
- **Icons:** [Tabler Icons](https://tabler.io/icons)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs/) (Ligero y eficiente)
- **Animations:** [Motion 12](https://motion.dev/) (Framer Motion)
- **Forms & Validation:** [Zod](https://zod.dev/) + [Mantine Form](https://mantine.dev/form/use-form/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)

---

## 🏗️ Arquitectura: Aislamiento por Vista

El proyecto sigue estrictamente el principio de **Aislamiento por Vista**. Cada vista de la aplicación reside en su propio directorio y debe ser autosuficiente.

### Ubicación: `src/views/[nombre-vista-kebab-case]`

Cada vista se divide obligatoriamente en tres capas para separar responsabilidades:

#### 1. Presentation (`components/` y `.page.tsx`)

- **Responsabilidad:** UI/UX y renderizado.
- **Regla:** No debe contener lógica compleja, cálculos pesados ni manejo de estado de negocio.
- **Archivos:** El componente principal es `[nombre-vista].page.tsx`. Los sub-componentes son `[nombre-componente].component.tsx`.
- **Escalabilidad:** Si un componente se vuelve complejo, crea una carpeta con su nombre, coloca el `.tsx` ahí dentro, y crea una subcarpeta `components/` para los elementos que lo integran.

#### 2. Hooks (`hooks/`)

- **Responsabilidad:** El "Cerebro" del componente. Maneja el estado local, efectos y validaciones.
- **Regla:** Los hooks son **por cada componente complejo de la vista**, no uno general por vista. (Ej: `useRegistroEntregaLogistica.ts`).

#### 3. Service (`service/`)

- **Responsabilidad:** Comunicación con la API y definición de modelos de datos.
- **Regla:** Solo deben existir **3 archivos** nombrados con el nombre de la vista:
  1. `[nombre-vista].service.ts`
  2. `[nombre-vista].requests.ts`
  3. `[nombre-vista].responses.ts` (Debe ser **exactamente** lo que la API envía).

> [!IMPORTANT]
> **Reglas de Oro:**
>
> 1. **Prohibido reutilizar componentes de negocio** entre diferentes vistas (ej. entregas de requerimientos vs. entregas de préstamos), aunque se parezcan. Se debe tomar como referencia y crear uno nuevo en la vista correspondiente.
> 2. **Componentes Abstractos:** Solo se reutilizan componentes sin lógica de procesos específicos (Modal, Datatable, CustomDatePicker, FileUpload) desde `src/presentation` o `src/shared`.

---

## 📂 Estructura de Directorios

- `src/hooks`: Hooks de utilidad global transversales. Destacan `useTitlePage` (para nombre en header y pestaña) y `useNotify` (para alertas UI). **No existe useTheme.**
- `src/presentation`: Componentes de UI globales y abstractos.
- `src/service`: Instancia de Axios y servicios core del sistema.
- `src/shared`: Constantes, utilidades, tipos globales y **Enums** (que deben mantener similitud estricta con los de la API).
- `src/stores`: Stores globales (ej. sesión de usuario, configuración).
- `src/views`: Vistas de la aplicación organizadas por funcionalidad.

---

## 📝 Reglas de Desarrollo

### 1. Convenciones de Nombres

- **Página Principal:** `kebab-case.page.tsx`
- **Sub-Componentes:** `kebab-case.component.tsx`
- **Hooks:** `camelCase.ts` empezando con 'use' (ej. `useRegistroEntrega.ts`).
- **Servicios:** `kebab-case.service.ts`
- **Carpetas:** `kebab-case`.

### 2. Tipado Estrictamente Obligatorio

Está prohibido el uso de `any`. Todas las respuestas y requests de la API deben tener una interfaz definida en el respectivo archivo de la capa de servicio.

### 3. Flujo de Datos

El flujo debe ser siempre unidireccional:
`Componente (UI) -> Hook (Lógica) -> Service (API/Store) -> Backend`.

---

## 🚀 Workflow: Crear una Nueva Vista

1. **Crear Carpeta:** En `src/views/nueva-vista`.
2. **Definir Service:** Crea `nueva-vista.responses.ts`, `nueva-vista.requests.ts` y `nueva-vista.service.ts`.
3. **Crear Hook:** Implementa los hooks necesarios para cada componente complejo de la vista en la carpeta `hooks/`.
4. **Implementar Vista:** Crea `nueva-vista.page.tsx` y sus sub-componentes. Usa `useTitlePage` y `useNotify`.
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

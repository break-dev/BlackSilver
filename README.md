# Black Silver - Frontend (React + Vite)

Este es el repositorio del frontend de **Black Silver**, una plataforma SaaS diseñada para la gestión integral de operaciones mineras. Este proyecto utiliza un stack moderno y una arquitectura de **Aislamiento por Vista** para garantizar la escalabilidad y mantenibilidad.

---

## 🛠️ Stack Tecnológico

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 7](https://vitejs.dev/)
- **Languaje:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [Mantine 8](https://mantine.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs/) (Ligero y eficiente)
- **Animations:** [Motion 12](https://motion.dev/) (Framer Motion)
- **Forms & Validation:** [Zod](https://zod.dev/) + [Mantine Form](https://mantine.dev/form/use-form/)
- **Routing:** [React Router 7](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)

---

## 🏗️ Arquitectura: Aislamiento por Vista

El proyecto sigue estrictamente el principio de **Aislamiento por Vista**. Cada módulo o funcionalidad importante reside en su propio directorio y debe ser autosuficiente.

### Ubicación: `src/views/[nombre-modulo]`

Cada vista se divide obligatoriamente en tres capas para separar responsabilidades:

#### 1. Presentation (`components/` y `.page.tsx`)
- **Responsabilidad:** UI/UX y renderizado.
- **Regla:** No debe contener lógica compleja, cálculos pesados ni manejo de estado de negocio.
- **Interacción:** Consume datos del **Hook** y emite eventos (clics, envíos).
- **Archivos:** `Index.page.tsx` y sub-componentes en carpetas locales.

#### 2. Hooks (`hooks/`)
- **Responsabilidad:** El "Cerebro" de la vista. Maneja el estado local, efectos (`useEffect`), validaciones y **cálculos derivados** (usando `useMemo`).
- **Regla:** Toda transformación de datos para la UI debe ocurrir aquí.
- **Archivos:** `use[Modulo].ts`.

#### 3. Service (`service/`)
- **Responsabilidad:** Comunicación con la API y definición de modelos de datos.
- **Regla:** Aquí se definen las **Interfaces** de TypeScript y los **Stores de Zustand** para estados globales (ej. formularios que persisten entre pasos).
- **Archivos:** `[Modulo].service.ts`, `responses.ts`, `requests.ts`.

> [!IMPORTANT]
> **Regla de Oro:** Ninguna vista debe importar lógica, servicios o componentes de otra vista hermana. Si necesitas algo compartido, debe moverse a `src/shared`.

---

## 📂 Estructura de Directorios

- `src/hooks`: Hooks de utilidad global (ej. `useAuth`, `useTheme`).
- `src/presentation`: Componentes de UI globales y Layouts principales.
- `src/service`: Instancia de Axios y servicios core del sistema.
- `src/shared`: Constantes, utilidades, tipos globales y componentes reutilizables.
- `src/stores`: Stores globales (ej. sesión de usuario, configuración).
- `src/views`: Módulos de la aplicación organizados por funcionalidad.

---

## 📝 Reglas de Desarrollo

### 1. Convenciones de Nombres
- **Componentes:** `PascalCase.tsx` (ej. `BotonEnvio.tsx`).
- **Hooks:** `camelCase.ts` empezando con 'use' (ej. `useFormulario.ts`).
- **Servicios/Utilidades:** `camelCase.ts`.
- **Carpetas:** `kebab-case`.

### 2. Tipado Estrictamente Obligatorio
Está prohibido el uso de `any`. Todas las respuestas y requests de la API deben tener una interfaz definida en el `service/responses.ts`, `service/requests.ts` del módulo.

### 3. Flujo de Datos
El flujo debe ser siempre unidireccional:
`Componente (UI) -> Hook (Lógica) -> Service (API/Store) -> Backend`.

---

## 🚀 Workflow: Crear un Nuevo Módulo

1. **Crear Carpeta:** En `src/views/nuevo-modulo`.
2. **Definir Service:** Crea `responses.ts` y `requests.ts` con los tipos de la API y `nuevo-modulo.service.ts` para las peticiones.
3. **Crear Hook:** Implementa `useNuevoModulo.ts` para manejar el estado y la lógica de negocio por cada componente que este modulo posea segun criterio propio.
4. **Implementar Vista:** Crea `NuevoModulo.page.tsx` y sus componentes usando componentes de Mantine y Tailwind.
5. **Registrar Ruta:** Añade la nueva ruta en el enrutador principal (usualmente en `App.tsx` o un archivo de rutas centralizado).

---

## 🔧 Comandos Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar Linter
npm run lint

# Previsualizar build local
npm run preview
```

---

## 💎 Estética y Diseño
- Mantén la consistencia visual usando los tokens de Mantine.
- Usa **Motion** para transiciones suaves entre estados o navegación.
- Prioriza la experiencia del usuario (UX) y el diseño (UI) con estados de carga (`Loader`) y notificaciones simples pero efectivas.
 siempre: `Componente -> Hook -> Servicio -> API`.
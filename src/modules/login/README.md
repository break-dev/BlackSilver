# Módulo: Login

El módulo de Login es el componente de seguridad inicial. Gestiona la autenticación de usuarios y la preparación del entorno de trabajo personalizado para cada perfil.

## 📝 Funcionalidades Detalladas

- **Autenticación Segura**: Validación de credenciales mediante el backend.
- **Preparación de Sesión**: Tras un login exitoso, el módulo orquestador dispara la carga de los stores globales:
  - Obtención del **Token JWT**.
  - Carga del **Perfil del Usuario**.
  - Descarga del **Menú de Navegación** dinámico según el rol.
- **Gestión de Errores**: Feedback visual claro en caso de credenciales incorrectas o cuentas bloqueadas.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `login.page.tsx`: Pantalla de inicio con estética premium (modo oscuro, mesh gradients). Utiliza animaciones de GSAP/Motion para una entrada fluida.

### Hooks (Lógica)

- `useLogin.ts`: (Contenido en `login.page.tsx` o local) Orquestador que realiza la llamada a la API y distribuye la respuesta a los stores de Zustand (`authStore`, `menuStore`).

## ⚙️ Lógica de Negocio

- **Persistencia**: La sesión se mantiene mediante el almacenamiento del token en el estado global (Zustand con persistencia en localStorage/sessionStorage).
- **Seguridad en Tránsito**: Todas las peticiones posteriores utilizarán el token obtenido en este módulo mediante interceptores de Axios.
- **Redirección Inteligente**: El sistema detecta si el usuario ya tiene una sesión activa y lo redirige automáticamente al `/home`.

## 🔒 Reglas de Negocio

- Máximo de intentos fallidos antes del bloqueo temporal (gestionado por backend).
- El token tiene una vigencia limitada; su expiración disparará un logout automático gestionado por el interceptor global de API.

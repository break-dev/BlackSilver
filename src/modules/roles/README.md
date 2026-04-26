# Módulo: Roles y Permisos

Administra la matriz de permisos de la aplicación. Define qué puede hacer cada usuario basándose en su perfil funcional, garantizando la seguridad y la segregación de funciones.

## 📝 Funcionalidades Detalladas

- **Gestión de Perfiles**: Creación de roles genéricos (ej. Almacenero, Comprador, Administrador de Sistema).
- **Matriz de Permisos**: Configuración granular por módulo (ej. El Almacenero puede Ver y Atender Requerimientos, pero no Crear Órdenes de Compra).
- **Control de Navegación**: Los permisos definidos aquí determinan qué opciones del menú principal serán visibles para el usuario.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `roles.page.tsx`: Listado de roles del sistema.
- `registro-rol.tsx`: Formulario complejo que despliega todas las capacidades del sistema para ser activadas o desactivadas para el rol.

### Hooks (Lógica)

- `useRoles.ts`: Gestiona la persistencia de la matriz de permisos y la carga de los roles existentes.

## ⚙️ Lógica de Negocio

- **RBAC (Role-Based Access Control)**: La aplicación utiliza este modelo para proteger tanto las rutas en el frontend como los endpoints en el backend.
- **Dinamicidad**: Los cambios en los permisos de un rol se reflejan inmediatamente en la sesión de los usuarios asociados tras un nuevo login.

## 🔒 Reglas de Negocio

- El rol "Super Administrador" no puede ser eliminado ni sus permisos restringidos, para evitar el bloqueo del sistema.
- Un rol no puede ser eliminado si tiene usuarios activos vinculados.

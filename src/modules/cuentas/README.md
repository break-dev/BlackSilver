# Módulo: Cuentas de Usuario

Gestiona el acceso digital a la plataforma. Este módulo vincula la identidad física (Empleado) con la identidad digital (Usuario), permitiendo el control de ingresos y seguridad.

## 📝 Funcionalidades Detalladas

- **Gestión de Credenciales**: Creación de nombres de usuario y gestión inicial de contraseñas.
- **Vinculación de Personal**: Cada cuenta debe estar asociada a un único registro del módulo de **Empleados**.
- **Control de Acceso**: Habilitación o suspensión inmediata de cuentas de usuario.
- **Asignación de Roles**: Definición de qué perfil de permisos tendrá el usuario dentro del sistema.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `cuentas.page.tsx`: Bandeja de gestión de usuarios con indicadores de estado (Activo/Inactivo).
- `registro-cuenta.tsx`: Formulario de creación que incluye la búsqueda de empleados que aún no tienen cuenta asignada.

### Hooks (Lógica)

- `useCuentas.ts`: Maneja la recuperación de la lista de usuarios y las acciones de cambio de estado.

## ⚙️ Lógica de Negocio

- **Seguridad**: El sistema utiliza este módulo para validar quién puede entrar y qué token JWT se le asignará.
- **Auditoría**: El ID de cuenta es el que se graba en cada transacción para saber exactamente quién realizó un movimiento.

## 🔒 Reglas de Negocio

- El nombre de usuario (username) debe ser único en todo el sistema.
- Un empleado no puede tener más de una cuenta de usuario activa.
- Para crear una cuenta, el empleado debe estar en estado "Activo" en su módulo correspondiente.

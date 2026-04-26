# Módulo: Perfil de Usuario

Espacio personal del usuario donde puede visualizar su información corporativa y gestionar sus ajustes de seguridad individuales.

## 📝 Funcionalidades Detalladas

- **Información del Usuario**: Visualización centralizada de datos como Nombre, DNI, Área, Cargo y Almacén actual asignado.
- **Seguridad Personal**: Interfaz para el cambio de contraseña.
- **Resumen de Actividad**: Información sobre el último acceso y estado de la cuenta.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `perfil.page.tsx`: Página principal organizada en tarjetas de información (Datos Personales, Seguridad, Configuración).
- `components/`: Componentes para la edición de datos específicos y el modal de cambio de contraseña.

### Hooks (Lógica)

- `usePerfilStore.ts`: (Zustand) Almacena y sincroniza la información del perfil del usuario logueado en toda la aplicación.

## ⚙️ Lógica de Negocio

- **Fuente de Verdad**: Los datos aquí mostrados provienen directamente de la base de datos de personal y son los que se utilizan para personalizar la experiencia del usuario (ej. el saludo inicial de "Blackcito").
- **Autoservicio**: Permite al usuario mantener su seguridad sin depender del administrador para cambios de clave rutinarios.

## 🔒 Reglas de Negocio

- El cambio de contraseña requiere la validación de la contraseña actual.
- Ciertos datos (como Área o Cargo) son de solo lectura para el usuario, ya que deben ser gestionados por Recursos Humanos/Administración.

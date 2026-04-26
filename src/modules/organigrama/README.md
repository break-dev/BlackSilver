# Módulo: Organigrama

Define la estructura jerárquica y funcional de la empresa. Este módulo organiza a la organización en Áreas y Cargos, lo que facilita la gestión de personal y el flujo de autorizaciones.

## 📝 Funcionalidades Detalladas

- **Gestión de Áreas**: Registro de departamentos operativos y administrativos (ej. Planta, Mina, Geología, Logística, Administración).
- **Diccionario de Cargos**: Definición de todos los puestos de trabajo existentes en la organización.
- **Relación Funcional**: Vinculación de cargos a áreas específicas para mantener el orden jerárquico.
- **Control de Dotación**: Permite visualizar qué cargos están definidos para cada área.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `organigrama.page.tsx`: Vista principal que muestra la estructura de la empresa en un formato de lista jerárquica o tablas.
- `registro-area.tsx`: Modal para el alta de nuevas unidades organizativas.
- `registro-cargo.tsx`: Formulario para definir las propiedades de un puesto de trabajo.
- `lista-cargos.tsx`: Mantenimiento de los cargos existentes, permitiendo su edición y categorización.

### Hooks (Lógica)

- `useOrganigrama.ts`: Gestiona la recuperación de la estructura completa y la lógica de refresco de datos.

## ⚙️ Lógica de Negocio

- **Estructura de Permisos**: Las áreas definen grupos lógicos para reportes y filtros en otros módulos (ej. ver requerimientos solo de mi área).
- **Flujos de Trabajo**: Los cargos son utilizados para definir quién tiene autoridad de aprobación (ej. solo el "Jefe de Almacén" puede aprobar un préstamo).
- **Consistencia**: Asegura que el registro de personal sea uniforme y basado en una estructura predefinida.

## 🔒 Reglas de Negocio

- Un área no puede ser eliminada si tiene cargos asociados con personal activo.
- Los nombres de áreas y cargos dentro de una misma rama deben ser únicos.

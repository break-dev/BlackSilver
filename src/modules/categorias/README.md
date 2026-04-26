# Módulo: Categorías

Este módulo establece la taxonomía de los productos en el sistema. Una correcta categorización es vital para la generación de reportes y la automatización de flujos logísticos.

## 📝 Funcionalidades Detalladas

- **Gestión de Categorías**: Registro de nombres, códigos y descripciones para clasificar el inventario.
- **Configuración de Destinos**: Define hacia qué áreas o tipos de labor pueden ser despachados los productos de una categoría específica.
- **Jerarquía de Inventario**: Actúa como el nivel superior de organización, permitiendo agrupar familias de productos.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `categorias.page.tsx`: Bandeja de gestión con el listado de categorías.
- `registro-categoria.tsx`: Modal para la creación y edición de categorías.
- `categorias-destinos.tsx`: Interfaz para configurar las reglas de destino por categoría.

### Hooks (Lógica)

- `useCategorias.ts`: Maneja la recuperación de datos y el estado de los formularios.

## ⚙️ Lógica de Negocio

- **Filtrado Operativo**: Las categorías permiten que en los requerimientos el usuario pueda encontrar productos de forma más rápida.
- **Seguridad Logística**: Al definir "Destinos" por categoría, el sistema puede prevenir que se soliciten materiales para áreas donde no corresponden (ej. explosivos para administración).

## 🔒 Reglas de Negocio

- No se puede eliminar una categoría que tenga productos asociados.
- El código de categoría debe ser alfanumérico y único.

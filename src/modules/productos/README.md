# Módulo: Productos

Administración del catálogo maestro de items. Este módulo define las propiedades base de todo lo que fluye a través de la logística de la empresa.

## 📝 Funcionalidades Detalladas

- **Maestro de Artículos**: Definición de SKU, nombres, marcas, modelos y unidades de medida.
- **Configuración Logística**: Clasificación por categorías y familias, y definición de stock mínimo de seguridad.
- **Propiedades Especiales**: Marcado de productos como "Auditables" (sujetos a control estatal), "Perecederos" o que requieren "Control por Lote".
- **Gestión Documental**: Posibilidad de adjuntar fichas técnicas o imágenes al producto.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `productos.page.tsx`: Listado central con búsqueda global por nombre, código o categoría.
- `registro-producto.tsx`: Formulario robusto con validaciones de Zod para asegurar que los datos obligatorios (ej. unidad de medida) estén presentes.
- `components/`: Elementos reutilizables como selectores de categorías o visualizadores de stock.

### Hooks (Lógica)

- `useProductos.ts`: Gestiona la recuperación del catálogo, la paginación y la sincronización con la API.
- `useRegistroProducto.ts`: Lógica de creación/edición, incluyendo el manejo de carga de archivos adjuntos.

### Service (API)

- `productos.service.ts`: Interactúa con `/productos` para realizar el mantenimiento del catálogo.

## ⚙️ Lógica de Negocio

- **Unicidad**: El sistema valida que no existan códigos de producto duplicados.
- **Dependencias**: Un producto no puede ser eliminado si ya tiene movimientos en el Kardex o está asociado a un Requerimiento/Orden de Compra.
- **Clasificación**: La categoría asignada determina el flujo contable y logístico del item.

## 🔒 Reglas de Negocio

- La unidad de medida es un campo obligatorio y crítico para los cálculos de stock.
- Los productos auditables seran ocultados tras colocar al sistema en "Modo Auditoria".

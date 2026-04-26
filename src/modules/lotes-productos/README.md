# Módulo: Lotes de Productos

Este módulo proporciona una capa de granularidad adicional al inventario, permitiendo rastrear grupos específicos de un mismo producto que comparten características temporales o de fabricación.

## 📝 Funcionalidades Detalladas

- **Gestión de Lotes**: Creación de identificadores de lote con fecha de fabricación, fecha de vencimiento y serie.
- **Control de Vencimientos**: Monitoreo de productos próximos a expirar para evitar pérdidas de inventario.
- **Ajustes de Inventario**: Herramienta para corregir el stock de un lote específico tras inventarios cíclicos.
- **Etiquetado**: Generación de etiquetas o tickets por lote para identificación física en anaquel.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `lotes-page/lotes.page.tsx`: Vista que agrupa los lotes existentes, permitiendo filtrar por almacén y estado (Vencido/Vigente).
- `registro-lote.tsx`: Interfaz para dar de alta nuevos lotes vinculados a un producto.
- `ajuste-stock.tsx`: Formulario de auditoría para igualar el stock del sistema con el conteo físico.

### Hooks (Lógica)

- `useLotes.ts`: Recupera la información de lotes y calcula los tiempos de vida útil restantes para alertas visuales.
- `useRegistroLote.ts`: Valida que las fechas de vencimiento sean coherentes y que las series no estén duplicadas para un mismo producto.

## ⚙️ Lógica de Negocio

- **Trazabilidad FIFO/FEFO**: Permite al almacenero priorizar la entrega de lotes próximos a vencer.
- **Integración con Almacenes**: Los lotes están vinculados a almacenes específicos; mover un producto de almacén implica mover sus lotes correspondientes.
- **Afectación de Kardex**: Cualquier ajuste de stock en este módulo genera un registro automático de entrada o salida por ajuste.

## 🔒 Reglas de Negocio

- No se puede asignar stock a un lote que pertenezca a un producto que no tiene habilitada la opción "Control por Lote".
- La fecha de vencimiento debe ser posterior a la fecha de fabricación.
- Los ajustes de stock negativos requieren un motivo de ajuste obligatorio.

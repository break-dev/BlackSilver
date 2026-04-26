# Módulo: Kardex de Productos

El Kardex es el registro maestro de movimientos de almacén. Proporciona una auditoría completa y detallada de cada entrada y salida física, asegurando la transparencia y exactitud del inventario.

## 📝 Funcionalidades Detalladas

- **Visualización de Movimientos**: Listado cronológico de transacciones, indicando tipo de movimiento (Entrada/Salida), cantidad, costo (si aplica) y saldo resultante.
- **Filtros de Auditoría**: Capacidad de rastrear movimientos por Almacén, Producto, Rango de Fechas y Responsable.
- **Trazabilidad de Documento**: Cada línea del Kardex está vinculada a un documento de sustento (ej. Vale de Salida, Guía de Remisión, Orden de Compra).
- **Control de Saldos**: Cálculo en tiempo real del stock actual basado en la sumatoria histórica de movimientos.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `kardex.page.tsx`: Vista única de reporte dinámico que utiliza una `DataTableEstandar` optimizada para grandes volúmenes de datos. Incluye selectores rápidos para cambiar entre productos y almacenes.

### Hooks (Lógica)

- `useKardex.ts`: Gestiona la lógica de consulta pesada hacia el servidor y la integración con los filtros de la interfaz.

## ⚙️ Lógica de Negocio

- **Inmutabilidad**: Los registros del Kardex no se editan. Si hay un error, se debe realizar un movimiento de ajuste que también queda registrado.
- **Automatización**: El Kardex no recibe ingresos manuales directos; se alimenta automáticamente de las acciones realizadas en los módulos de **Atención de Requerimientos**, **Reabastecimiento**, **Préstamos** y **Lotes**.
- **Valorización**: Sirve de base para calcular el costo promedio ponderado de los productos en almacén.

## 🔒 Reglas de Negocio

- El saldo del Kardex debe coincidir siempre con el stock físico reportado en el módulo de Productos.
- Cada registro de Kardex debe tener obligatoriamente un ID de transacción vinculado al módulo origen.

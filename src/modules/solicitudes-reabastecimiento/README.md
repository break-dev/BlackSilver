# Módulo: Solicitudes de Reabastecimiento

Gestiona la necesidad de reposición de inventario en los almacenes. A diferencia de un requerimiento de área, estas solicitudes nacen de la logística interna para mantener los niveles de stock óptimos.

## 📝 Funcionalidades Detalladas

- **Planificación de Stock**: Creación de solicitudes basadas en el análisis de faltantes o puntos de pedido.
- **Trazabilidad de Recepción**: Control de qué items han sido despachados desde el proveedor o desde otro almacén y su estado de llegada.
- **Gestión de Saldos**: Visualización en tiempo real de cantidades solicitadas vs. recibidas.
- **Historial de Movimientos**: Registro de todas las entregas parciales asociadas a una misma solicitud.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `solicitudes-reabastecimiento.page.tsx`: Panel de control con el listado de solicitudes por almacén.
- `registro-solicitud.tsx`: Formulario para definir qué items y cantidades se necesitan reponer.
- `detalle-solicitud.tsx`: Vista técnica que desglosa el estado de cada item (Pendiente, Recibido Parcial, Recibido Total).
- `ResumenRecepciones.tsx`: Componente especializado para consolidar la información de múltiples ingresos de mercadería.
- `trazabilidad-solicitud.tsx`: Línea de tiempo de la solicitud.

### Hooks (Lógica)

- `useSolicitudesReabastecimiento.ts`: Orquestador de la carga de datos y estados de la interfaz.

## ⚙️ Lógica de Negocio

- **Origen de la Demanda**: Una solicitud puede nacer manualmente o ser disparada por una falta de stock detectada en la **Atención de Requerimientos**.
- **Satisfacción de la Demanda**: La solicitud puede ser atendida mediante una **Orden de Compra** (proveedor externo) o un **Préstamo entre Almacenes** (movimiento interno).
- **Cierre de Solicitud**: Se considera cerrada solo cuando el 100% de los items han sido ingresados físicamente al almacén.

## 🔒 Reglas de Negocio

- No se permite solicitar items que no existan en el catálogo maestro de productos.
- La solicitud debe indicar obligatoriamente el almacén de destino.
- Las recepciones deben estar respaldadas por una guía de remisión o documento de transporte.

# Módulo: Préstamos entre Almacenes

Este módulo gestiona la movilidad interna de stock. Permite que un almacén solicite items a otro de forma temporal o definitiva, optimizando la disponibilidad de recursos sin recurrir a compras externas.

## 📝 Funcionalidades Detalladas

- **Solicitud de Préstamo**: Registro del pedido indicando el almacén de origen (quien provee) y el almacén de destino (quien recibe).
- **Control de Trazabilidad**: Seguimiento del estado del préstamo: Solicitado -> En Tránsito -> Recibido -> (Opcional) Devuelto.
- **Detalle Técnico**: Visualización de los items, cantidades y el propósito del préstamo.
- **Gestión de Devoluciones**: Registro de si el item debe retornar al almacén origen tras su uso.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `prestamos-almacen.page.tsx`: Bandeja central de préstamos con filtros por almacén de origen/destino y estado.
- `detalle-prestamo.tsx`: Vista detallada que muestra el avance de la atención y la recepción de los items.
- `trazabilidad-detalle.tsx`: Línea de tiempo visual de los hitos del préstamo.
- `components/`: Elementos reutilizables como selectores de almacenes y estados de préstamo.
- `utils/`: Funciones de utilidad para el cálculo de saldos pendientes en el préstamo.

### Hooks (Lógica)

- `usePrestamosAlmacen.ts`: Controla la carga de datos, estados de carga y la comunicación con el servicio de préstamos.

## ⚙️ Lógica de Negocio

- **Optimización de Stock**: Facilita el uso de excedentes de un almacén para cubrir urgencias en otro.
- **Doble Registro**: Un préstamo implica una salida en el origen y una entrada en el destino, manteniendo el balance global de la empresa.
- **Responsabilidad**: El sistema registra a los responsables de ambos almacenes involucrados en la transacción.

## 🔒 Reglas de Negocio

- No se puede solicitar un préstamo a un almacén que no tenga stock disponible del item requerido.
- El préstamo debe ser aprobado por el responsable del almacén origen antes de iniciar el tránsito.
- Si el préstamo es con devolución, el sistema mantendrá el registro como "Pendiente de Retorno" hasta que se complete el flujo inverso.

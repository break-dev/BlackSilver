# Módulo: Atención de Préstamos

Módulo operativo para la ejecución física de las transferencias entre almacenes. Es la interfaz utilizada por los almaceneros para despachar y recibir los items prestados.

## 📝 Funcionalidades Detalladas

- **Gestión de Entregas**: Registro de la salida física del item desde el almacén origen (quien presta).
- **Control de Recepciones**: Confirmación del ingreso físico en el almacén destino.
- **Historial de Reposiciones**: Registro del retorno físico de los materiales al almacén original (si el préstamo fue temporal).
- **Trazabilidad Detallada**: Seguimiento de cada despacho realizado, incluyendo quién transportó y quién recibió.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `atencion-prestamos.page.tsx`: Bandeja de trabajo que muestra los préstamos pendientes de despacho o recepción.
- `detalle-prestamo.tsx`: Interfaz operativa para realizar las acciones de entrega y recepción de items.
- `historial-entregas-prestamo.tsx`: Vista histórica de todos los despachos realizados en el marco de un préstamo.
- `historial-reposiciones-prestamo.tsx`: Registro de los retornos físicos de materiales al origen.
- `trazabilidad-prestamo.tsx`: Visualización de los hitos logísticos.
- `registro-entrega/` y `registro-recepcion/`: Componentes y formularios para las transacciones físicas.

### Hooks (Lógica)

- `useAtencionPrestamos.ts`: Gestiona la lógica de despacho, validando stocks en origen y cantidades pendientes de recibir en destino.

## ⚙️ Lógica de Negocio

- **Movimiento Contable**: Genera automáticamente registros de salida en el **Kardex** del almacén origen y entrada en el del destino.
- **Validación Cruzada**: El almacén destino no puede recibir más de lo que el almacén origen ha marcado como "Enviado".
- **Cierre Operativo**: El préstamo se considera finalizado cuando las cantidades enviadas, recibidas y (si aplica) devueltas están en equilibrio.

## 🔒 Reglas de Negocio

- Toda entrega debe estar respaldada por el responsable del almacén origen.
- Es obligatorio registrar la fecha y hora real de la entrega y recepción física.
- No se pueden recibir items que no hayan sido previamente marcados como enviados por el origen.

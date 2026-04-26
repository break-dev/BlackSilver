# Módulo: Atención de Solicitudes de Reabastecimiento

Este módulo operativo es donde se materializa el ingreso de mercadería al almacén para satisfacer las necesidades de stock previamente solicitadas.

## 📝 Funcionalidades Detalladas

- **Registro de Recepciones**: Entrada física de mercadería al sistema, validando contra la solicitud de reabastecimiento.
- **Atención Mediante Préstamos**: Interfaz para registrar que la solicitud será atendida por otro almacén de la empresa, disparando un flujo de préstamo automático.
- **Trazabilidad de Despachos**: Seguimiento detallado de cada envío realizado desde el origen hasta el destino.
- **Historial de Entregas**: Registro de quién realizó la entrega física y quién la recibió en el almacén de destino.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `atencion-solicitudes.page.tsx`: Bandeja de trabajo para el personal logístico encargado de la distribución.
- `detalle-solicitud.tsx`: Vista operativa para marcar items como "Enviados" o "Recibidos".
- `registrar-prestamo-almacen.tsx`: Flujo integrado que convierte una necesidad de reabastecimiento en un préstamo interno.
- `registro-entrega/`: Lógica y componentes para documentar la salida física desde el proveedor o almacén origen.
- `trazabilidad-detalle.tsx`: Visualización de los hitos logísticos del proceso de atención.

### Hooks (Lógica)

- `useAtencionReabastecimiento.ts`: Gestiona la lógica de despacho y recepción, asegurando que las cantidades coincidan con los documentos de transporte.

## ⚙️ Lógica de Negocio

- **Dualidad de Origen**: Permite atender la necesidad comprando a un tercero o moviendo stock interno, optimizando el uso de recursos existentes.
- **Validación de Cantidades**: El sistema no permite recibir más items de los originalmente solicitados en el reabastecimiento.
- **Impacto en Inventario**: La recepción final marca el incremento real del stock en el almacén de destino y genera el registro en el **Kardex**.

## 🔒 Reglas de Negocio

- Toda recepción debe estar vinculada a una solicitud de reabastecimiento activa.
- Si se utiliza la opción de préstamo, el almacén origen debe contar con stock suficiente para cubrir la transferencia.
- Es obligatorio registrar el número de guía o documento de sustento en cada recepción.

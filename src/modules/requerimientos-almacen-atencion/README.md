# Módulo: Atención de Requerimientos

Este es el módulo operativo donde el personal de almacén ejecuta la entrega física de los materiales solicitados por los responsables de mina.

## 📝 Funcionalidades Detalladas

- **Procesamiento de Salidas**: Registro de la cantidad entregada físicamente al solicitante.
- **Validación de Saldo**: El sistema impide entregar más de lo solicitado o más de lo que hay en stock físico.
- **Gestión de Entregas Parciales**: Soporte para atender un requerimiento en múltiples despachos según disponibilidad.
- **Generación de Vale de Salida**: Documento PDF legal que debe ser firmado por quien recibe el material.
- **Integración con Reabastecimiento**: Capacidad de generar una solicitud de reabastecimiento interna si el stock es insuficiente para completar el requerimiento.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `atencion-requerimientos.page.tsx`: Bandeja de entrada de requerimientos pendientes de atención.
- `info-requerimiento/`: Desglose de qué items se necesitan y cuánto se ha entregado a la fecha.
- `entregas/`: Componentes para realizar el registro de la transacción física.
- `requerimiento-pdf.tsx`: Generador del Vale de Salida de Almacén.
- `registrar-requerimiento/`: Sub-flujo para el cierre administrativo del requerimiento.
- `solicitud-reabastecimiento/`: Interfaz para derivar la falta de stock al área de compras.

### Hooks (Lógica)

- `useAtencionRequerimientos.ts`: Gestiona la lógica de despacho, asegurando que las cantidades ingresadas sean válidas respecto al stock actual.

## ⚙️ Lógica de Negocio

- **Afectación de Stock**: Cada entrega registrada rebaja automáticamente el saldo del almacén donde se realiza el despacho.
- **Trazabilidad**: Se registra el usuario (almacenero) que realiza la entrega y el momento exacto.
- **Estado de Atención**: Un requerimiento cambia a "Atendido Total" solo cuando todos sus items han sido entregados al 100%.

## 🔒 Reglas de Negocio

- Solo se pueden atender requerimientos que estén en estado "Aprobado".
- Es obligatorio generar y adjuntar el Vale de Salida para finalizar el proceso.
- La atención está restringida al stock del almacén asignado al usuario logueado.

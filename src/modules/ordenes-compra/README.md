# Módulo: Órdenes de Compra

Formaliza la adquisición de bienes y servicios. Es el documento contractual que cierra el proceso de procura y autoriza la recepción de mercadería y el posterior pago.

## 📝 Funcionalidades Detalladas

- **Emisión de Órdenes**: Generación de documentos basados en una **Cotización Ganadora**.
- **Control de Totales**: Cálculo automático de bases imponibles, IGV, retenciones y montos netos a pagar.
- **Seguimiento de Entrega**: Monitoreo de si la orden ha sido atendida total o parcialmente por el almacén.
- **Aprobaciones**: Flujo de estados (Pendiente -> Aprobada -> Emitida) según los niveles de jerarquía definidos.
- **Formatos de Impresión**: Generación de la Orden de Compra oficial en PDF para envío al proveedor.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `ordenes-compra-page.tsx`: Bandeja de control con estados visuales claros (colores por estado).
- `detalle-orden-compra/`: Vista exhaustiva que muestra items, cronograma de entrega, términos y condiciones.
- `orden-compra-page/`: Lógica de visualización y filtrado por proveedor, fecha o centro de costos.
- `src/presentation/utils/orden-compra-pdf.tsx`: (Global) Plantilla técnica para el renderizado del documento PDF.

### Hooks (Lógica)

- `useOrdenesCompra.ts`: Controla el ciclo de vida de las órdenes y las transiciones de estado.
- `useDetalleOrdenCompra.ts`: Lógica para procesar la información detallada y prepararla para la impresión.

## ⚙️ Lógica de Negocio

- **Cierre de Ciclo**: Al emitir una Orden de Compra, el requerimiento origen queda vinculado permanentemente, cerrando el flujo logístico.
- **Compromiso de Gasto**: La orden aprobada afecta el presupuesto del área/labor correspondiente.
- **Autorización de Ingreso**: El módulo de **Reabastecimiento** utiliza la Orden de Compra como referencia obligatoria para permitir el ingreso de mercadería al almacén.

## 🔒 Reglas de Negocio

- No se puede generar una orden de compra sin una cotización previa aprobada.
- Los precios y cantidades no pueden exceder lo estipulado en la cotización sin una re-aprobación del flujo.
- La anulación de una orden de compra requiere una justificación técnica y libera el requerimiento asociado.

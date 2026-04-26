# Módulo: Cotizaciones

El módulo de Cotizaciones es una herramienta crítica en el proceso de procura, permitiendo la comparación técnica y económica de ofertas de proveedores para optimizar los costos de la empresa.

## 📝 Funcionalidades Detalladas

- **Gestión de Ofertas**: Registro detallado de precios, tiempos de entrega, formas de pago y observaciones de proveedores.
- **Cuadro Comparativo**: Herramienta avanzada para visualizar lado a lado múltiples cotizaciones, resaltando automáticamente la mejor oferta (menor precio/mejor tiempo).
- **Control de Estado**: Ciclo de vida de la cotización: Pendiente -> Enviada -> Comparada -> Ganadora/Perdedora.
- **Selección Inteligente**: Permite asociar items de un requerimiento de almacén a una cotización de forma parcial o total.
- **Exportación Documental**: Generación de reportes PDF estilizados para aprobación interna.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `cotizaciones.page.tsx`: Vista principal con el listado de cotizaciones activas.
- `registro-cotizacion.tsx`: Formulario complejo para ingresar datos de cabecera y detalle de items.
- `listado-comparativos.tsx`: Interfaz para seleccionar qué cotizaciones entrarán al cuadro comparativo.
- `comparativo/`: Carpeta con componentes especializados para la visualización del cuadro comparativo.
- `detalle/`: Componentes para ver el desglose de una cotización específica (items, totales).
- `cotizacion-pdf.tsx`: Componente que utiliza `@react-pdf/renderer` para renderizar el documento legal.
- `modal-seleccion-productos.tsx`: Buscador y selector de productos vinculados al requerimiento origen.

### Hooks (Lógica)

- `useCotizaciones.ts`: Controla el listado, filtros por proveedor/fecha y estados de carga.
- `useRegistroCotizacion.ts`: Contiene la lógica pesada de cálculos de totales, impuestos, descuentos y validaciones de formulario.
- `useComparativo.ts`: Lógica algorítmica para determinar qué proveedor ofrece las mejores condiciones en el cuadro comparativo.

### Service (API)

- `cotizaciones.requests.ts`: Endpoints para el CRUD de cotizaciones y obtención de datos de comparación.
- `cotizaciones.service.ts`: Orquestador que valida la integridad de la cotización antes del envío.

## ⚙️ Flujo de Trabajo Típico

1.  Se recibe un requerimiento. Se invita a proveedores a cotizar.
2.  Se registran las ofertas en **Registro de Cotización**.
3.  Se seleccionan las ofertas recibidas y se genera el **Cuadro Comparativo**.
4.  La gerencia revisa el comparativo y marca una cotización como **Ganadora**.
5.  Este estado permite la generación automática de la **Orden de Compra**.

## 🔒 Reglas de Negocio

- No se puede comparar cotizaciones que no pertenezcan al mismo requerimiento origen.
- Las cotizaciones ganadoras no pueden ser editadas ni anuladas si ya tienen una orden de compra asociada.
- El cálculo de impuestos (IGV) se aplica según la configuración del proveedor y del item.

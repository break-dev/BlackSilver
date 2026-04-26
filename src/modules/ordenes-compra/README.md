# Módulo: Órdenes de Compra (OC)

Este módulo gestiona la formalización técnica y legal de las adquisiciones. Transforma una cotización adjudicada en un compromiso de compra, vinculando las condiciones comerciales con la ejecución logística y financiera.

## ⚙️ Proceso Técnico

1.  **Origen de Datos**: La OC se genera exclusivamente a partir de una **Cotización Ganadora** (`RES_Cotizacion`). Hereda precios, proveedores y especificaciones técnicas.
2.  **Estructura del Documento**:
    -   **Cabecera**: Datos fiscales de la empresa emisora y proveedor, moneda, método de pago y totales.
    -   **Detalle de Ítems**: Relación de productos con sus unidades de medida (Compra vs Base), tiempos de entrega y almacenes de destino.
    -   **Costos Adicionales**: Gestión de fletes y otros gastos operativos no incluidos en el precio unitario.
3.  **Flujo de Estados**:
    -   `Generada`: Documento creado, pendiente de envío o inicio de recepción.
    -   `En Recepción`: El almacén ha comenzado a registrar ingresos vinculados a esta OC.
    -   `Completada`: Todos los ítems han sido recibidos al 100%.
    -   `Cerrada`: Finalización administrativa (pago procesado o cierre forzado).
    -   `Anulada`: Invalidación técnica del documento.

## 🏗️ Arquitectura de Componentes

### Presentación (`/presentation`)
-   `OrdenesCompraPage`: Contenedor principal. Gestiona el estado global de la vista y la apertura de modales.
-   `Filtros`: Implementa búsqueda por correlativos, rangos de fecha y filtrado por estado.
-   `GroupByEmpresa`: Agrupación lógica de órdenes por entidad compradora para facilitar la gestión multicliente.
-   `DetalleOrdenCompra`: Vista técnica exhaustiva. Desglosa costos, cronogramas de entrega por ítem y trazabilidad de ingresos.

### Servicios & Hooks (`/service`, `/hooks`)
-   `OrdenCompraService`: Abstracción de la API. Métodos para listado, obtención de detalles y seguimiento de trazabilidad.
-   `useOrdenesCompra`: Hook de control para la lógica de la bandeja (paginación, filtros, agrupamiento).

## 📊 Reglas de Negocio Aplicadas

-   **Integridad de Precios**: No se permiten modificaciones de precios unitarios respecto a la cotización origen sin un flujo de rectificación.
-   **Conversión de Unidades**: Soporta discrepancias entre la unidad de compra (ej. Caja) y la unidad de inventario (ej. Unidades), realizando el cálculo de `cantidad_requerida_base` automáticamente.
-   **Impacto Logístico**: Una OC activa autoriza al módulo de **Almacén** a generar Notas de Ingreso referenciadas.
-   **Visibilidad Financiera**: Diferenciación clara entre montos Antes de IGV, IGV y Total Final, incluyendo el flag de `incluye_igv`.

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
-   `HistorialRecepcionesOC`: Visualización de ingresos agrupados por destino final y disparador de transferencias.

### Servicios & Hooks (`/service`, `/hooks`)
-   `OrdenCompraService`: Abstracción de la API. Métodos para listado, obtención de detalles y seguimiento de trazabilidad.
-   `useOrdenesCompra`: Hook de control para la lógica de la bandeja (paginación, filtros, agrupamiento).
-   `useRegistroTransferenciaOC`: Hook especializado para la gestión de envíos entre almacenes.

## 📊 Reglas de Negocio Aplicadas

-   **Integridad de Precios**: No se permiten modificaciones de precios unitarios respecto a la cotización origen sin un flujo de rectificación.
-   **Conversión de Unidades**: Soporta discrepancias entre la unidad de compra (ej. Caja) y la unidad de inventario (ej. Unidades), realizando el cálculo de `cantidad_requerida_base` automáticamente.
-   **Impacto Logístico**: Una OC activa autoriza al módulo de **Almacén** a generar Notas de Ingreso referenciadas.
-   **Visibilidad Financiera**: Diferenciación clara entre montos Antes de IGV, IGV y Total Final, incluyendo el flag de `incluye_igv`.

## 🔄 Gestión de Transferencias (Logística Correctiva)

Este sub-proceso resuelve la discrepancia cuando un material es recepcionado en un almacén distinto al destino final pactado en la OC.

### Lógica de Identificación
En el **Historial de Recepciones**, el sistema agrupa los productos recibidos por su `almacen_destino`. Si el `id_almacen_recepcionista` (donde llegó físicamente) es diferente al `id_almacen_destino` (donde debería estar), se habilita automáticamente la opción **"Transferir Stock"**.

### Componentes del Flujo
1.  **Agrupamiento Dinámico**: El frontend procesa la respuesta de `getHistorialRecepciones` y genera sub-bloques lógicos basados en el destino final.
2.  **Modal de Transferencia**:
    -   **Selección de Lotes**: Permite elegir de qué lotes específicos del almacén de origen saldrá el stock.
    -   **Receptor Externo**: Permite registrar o seleccionar personal (transportistas/terceros) que se llevará el material.
    -   **Evidencias**: Obliga a la carga de fotos o documentos que respalden la salida física del material.
3.  **Cálculo de Ratios**: Realiza la conversión automática entre unidades de medida base y unidades de presentación para asegurar que se transfiera la cantidad exacta recibida.

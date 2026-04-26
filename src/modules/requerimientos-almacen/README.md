# Módulo: Requerimientos de Almacén

Este módulo es el punto de partida de toda la cadena logística interna. Permite a los responsables de las áreas y labores mineras solicitar los materiales necesarios para su operación diaria.

## 📝 Funcionalidades Detalladas

- **Solicitud de Materiales**: Registro de items indicando cantidad solicitada, unidad de medida y prioridad (Baja, Media, Alta, Urgente).
- **Asignación Operativa**: Vinculación obligatoria del requerimiento con una **Mina** y una **Labor** específica para el control de costos por frente de trabajo.
- **Trazabilidad de Estados**: Seguimiento en tiempo real desde la solicitud hasta la atención final o rechazo.
- **Detalle Técnico**: Visualización de las especificaciones de cada item solicitado y el estado parcial de su atención.

## 🏗 Estructura de Archivos

### Presentation (UI)
- `requerimientos-almacen.page.tsx`: Lista maestra de requerimientos con filtros avanzados por estado y prioridad.
- `registro-requerimiento.tsx`: Formulario dinámico que permite buscar productos, validar stocks referenciales y añadir múltiples items por solicitud.
- `detalle-requerimiento.tsx`: Vista expandida para consultar el avance de la atención de cada item.
- `trazabilidad-requerimiento.tsx`: Componente visual que muestra la línea de tiempo de aprobaciones y movimientos.
- `labores-requerimiento.tsx`: Selector especializado para filtrar labores según la mina seleccionada.

### Hooks (Lógica)
- `useRequerimientos.ts`: Gestiona el estado de los listados y la comunicación con el servicio de datos.
- `useRegistroRequerimiento.ts`: Maneja el estado complejo del formulario (drafts, validación de cantidades positivas, duplicados de items).

### Service (API)
- `requerimientos.service.ts`: Centraliza las operaciones de lectura y escritura, manejando la lógica de "Requerimiento -> Item Requerimiento".

## ⚙️ Lógica de Negocio

- **Flujo de Aprobación**: Los requerimientos pasan por estados de revisión antes de ser visibles para el almacenero.
- **Control de Gasto**: Cada requerimiento "consume" el presupuesto o la cuota asignada a la labor minera.
- **Conexión Logística**: Un requerimiento puede ser atendido mediante el stock actual (Atención) o generar una necesidad de compra (Cotización).

## 🔒 Reglas de Negocio
- Un requerimiento no puede ser editado una vez que ha iniciado su proceso de atención en almacén.
- Los items marcados como "Urgente" disparan notificaciones prioritarias al área de logística.
- No se permiten requerimientos sin una labor minera asociada.

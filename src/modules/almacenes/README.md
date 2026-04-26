# Módulo: Almacenes

Este módulo gestiona la infraestructura física de almacenamiento de la empresa, controlando no solo los locales sino también el personal responsable y el flujo de salida hacia las operaciones mineras.

## 📝 Funcionalidades Detalladas

- **Gestión de Locales**: Registro de almacenes con sus datos de ubicación y tipo.
- **Trazabilidad de Responsables**: Control de quién está a cargo de cada almacén en un momento dado, con un historial completo de cambios para auditorías.
- **Despacho Operativo (Abastecer Mina)**: Interfaz para registrar la salida de productos destinados a labores mineras específicas.
- **Monitoreo de Consumo**: Visualización de qué minas han sido abastecidas y qué materiales han consumido.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `almacenes.page.tsx`: Punto de entrada que muestra el listado de almacenes en una `DataTableEstandar`.
- `registro-almacen.tsx`: Modal para el alta y edición de datos del almacén.
- `historial-responsables.tsx`: Vista dedicada a consultar la línea de tiempo de encargados por almacén.
- `nuevo-responsable.tsx`: Interfaz para asignar un nuevo trabajador como responsable de almacén.
- `abastecer-mina.tsx`: Formulario para registrar despachos hacia las unidades mineras.
- `minas-abastecidas.tsx`: Reporte visual de las operaciones de abastecimiento realizadas.

### Hooks (Lógica)

- `useAlmacenes.ts`: Gestiona el listado global de almacenes, estados de carga y lógica de filtrado.
- `useHistorialResponsables.ts`: Maneja la recuperación y paginación de la trazabilidad de personal.
- `useNuevoResponsable.ts`: Lógica de validación para asegurar que el trabajador asignado cumple con los requisitos.
- `useAbastecerMina.ts`: Orquestador del proceso de despacho, validando stocks disponibles antes de permitir la salida.

### Service (API)

- `almacenes.requests.ts`: Peticiones Axios para GET (listado), POST (crear), PUT (actualizar) y DELETE.
- `almacenes.service.ts`: Transforma los objetos de respuesta de la API (`IAlmacenResponse`) a interfaces amigables para los componentes.
- `almacenes.responses.ts`: Definición de interfaces y tipos de datos que devuelve el servidor.

## ⚙️ Flujo de Trabajo Típico

1.  El usuario accede a **Almacenes**. `almacenes.page.tsx` dispara `useAlmacenes.ts`.
2.  El Hook llama a `AlmacenService.getAlmacenes()`.
3.  El Servicio utiliza `api.get()` desde `almacenes.requests.ts`.
4.  Los datos retornan, se transforman y se inyectan en la `DataTableEstandar`.

## 🔒 Reglas de Negocio

- Un almacén no puede quedar sin responsable asignado.
- El abastecimiento a mina requiere la selección obligatoria de una **Mina** y una **Labor** activa.
- Todas las salidas registradas en este módulo afectan el stock en tiempo real y generan un asiento en el **Kardex**.

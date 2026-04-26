# Módulo: Proveedores

Administra la base de datos de proveedores de bienes y servicios. Este módulo es clave para asegurar que las compras se realicen a entidades autorizadas y con información financiera válida.

## 📝 Funcionalidades Detalladas

- **Padrón de Proveedores**: Registro de RUC, razón social, dirección fiscal y contactos comerciales.
- **Información Financiera**: Gestión de múltiples cuentas bancarias por proveedor (Dólares, Soles, Detracciones).
- **Categorización**: Clasificación de proveedores por tipo de servicio o producto que ofrecen.
- **Validación de Datos**: Integración lógica para asegurar la veracidad de los datos fiscales.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `proveedores-page/`: Carpeta con el listado maestro y los componentes de filtrado por rubro o estado.
- `registro-proveedor/`: Formulario dividido en secciones (Datos Generales, Contactos, Documentación).
- `cuentas-bancarias/`: Sub-módulo para el mantenimiento de datos de pago, con validación de CCI.

### Hooks (Lógica)

- `useProveedores.ts`: Maneja la comunicación con el servicio y el estado de los listados.
- `useRegistroProveedor.ts`: Gestiona la lógica de validación de RUC y la carga de datos bancarios asociados.

### Service (API)

- `proveedores.service.ts`: Interactúa con el backend para el mantenimiento del padrón de proveedores.

## ⚙️ Lógica de Negocio

- **Trazabilidad de Pagos**: La información bancaria aquí registrada es la fuente de verdad para la generación de pagos desde el área de finanzas.
- **Relación con Compras**: Un proveedor debe estar "Activo" para poder recibir **Cotizaciones** u **Órdenes de Compra**.
- **Evaluación**: El sistema permite rastrear el desempeño del proveedor basándose en el cumplimiento de las órdenes de compra.

## 🔒 Reglas de Negocio

- El RUC debe ser único y válido.
- No se puede eliminar un proveedor que tenga transacciones (Órdenes de Compra) registradas.
- Es obligatorio registrar al menos una cuenta de detracciones para proveedores de servicios sujetos a este régimen.

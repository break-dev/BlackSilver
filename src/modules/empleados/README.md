# Módulo: Empleados (Trabajadores)

Gestiona el padrón completo del personal de la empresa. Este módulo es el punto de referencia para asignar responsabilidades en toda la plataforma (almacenes, minas, aprobaciones).

## 📝 Funcionalidades Detalladas

- **Ficha del Trabajador**: Registro de datos personales, contacto, documentos de identidad (DNI/CE) y fotografía.
- **Asignación Organizativa**: Vinculación obligatoria del empleado con un **Área** y un **Cargo** del organigrama.
- **Gestión Operativa**: Asignación de trabajadores a labores mineras específicas o como responsables de locales físicos.
- **Control de Estado**: Administración de personal activo, de baja o en vacaciones.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `empleados.page.tsx`: Listado maestro de personal con búsqueda por nombre, DNI o área.
- `registro-empleado.tsx`: Formulario extenso que incluye validaciones de formato para documentos de identidad y datos de contacto.
- `asignacion-labores.tsx`: Interfaz para definir en qué frentes de trabajo opera el trabajador.

### Hooks (Lógica)

- `useEmpleados.ts`: Gestiona la recuperación de la planilla y los filtros de búsqueda.
- `useRegistroEmpleado.ts`: Lógica de validación de negocio para evitar duplicidad de registros por DNI.

## ⚙️ Lógica de Negocio

- **Eje Central**: Casi todos los documentos del sistema (Requerimientos, Órdenes, Vales) requieren la firma o asociación de un **Empleado**.
- **Seguridad**: El registro de un empleado es el paso previo para crearle una **Cuenta de Usuario**.
- **Trazabilidad**: Permite auditar qué trabajador realizó cada acción operativa en la mina o el almacén.

## 🔒 Reglas de Negocio

- El DNI/Documento de Identidad debe ser único en el sistema.
- Un empleado no puede ser eliminado si tiene historial de responsable en almacenes o minas.
- La asignación de área y cargo es obligatoria para completar el registro.

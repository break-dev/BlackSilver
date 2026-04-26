# Módulo: Minas y Labores

Define la geografía operativa de la empresa. Este módulo es el cimiento para el control de costos y la asignación de recursos, ya que permite mapear dónde se realiza exactamente el trabajo minero.

## 📝 Funcionalidades Detalladas

- **Maestro de Minas**: Registro de las unidades mineras principales.
- **Jerarquía de Labores**: Definición de los frentes de trabajo (tajos, galerías, cruceros, chimeneas) asociados a cada mina.
- **Asignación de Responsables**: Control de los ingenieros o encargados responsables de cada frente operativo.
- **Gestión de Terceros**: Registro de las Empresas Ejecutoras (contratistas) que operan en cada labor.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `minas.page.tsx`: Vista integral con el listado de minas. Al seleccionar una mina, se despliegan sus labores asociadas.
- `registro-mina.tsx`: Modal para crear nuevas unidades mineras.
- `labores/`: Carpeta con componentes para la gestión granular de los frentes de trabajo.
- `responsables/`: Lógica para asignar y rotar personal a cargo de las operaciones.
- `empresas-ejecutoras/`: Gestión de la relación entre la labor minera y el contratista.

### Hooks (Lógica)

- `useMinas.ts`: Gestiona la carga de la estructura minera y los filtros por estado operativo.
- `useLabores.ts`: Maneja la creación y desactivación de frentes de trabajo según el avance de la explotación.

## ⚙️ Lógica de Negocio

- **Centro de Costos**: Cada labor actúa como un centro de costos. Todo material solicitado por un requerimiento debe estar imputado a una labor específica.
- **Vigencia**: Las labores pueden ser activadas o cerradas (paralizadas). El sistema solo permite generar requerimientos para labores activas.
- **Vinculación Legal**: Las minas deben estar asociadas a una **Concesión** minera legalmente registrada.

## 🔒 Reglas de Negocio

- No se puede eliminar una mina que tenga labores activas o historial de consumos.
- La labor debe pertenecer obligatoriamente a una unidad minera.
- Un responsable de labor debe ser un empleado activo en el sistema.

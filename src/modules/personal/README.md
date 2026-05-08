# Módulo: Personal (Trabajadores)

Este módulo es el núcleo de gestión del capital humano, dividido en dos grandes frentes: **Empleados de Empresa** (Administrativos/Corporativos) y **Contratistas Mineros** (Operativos).

## 📝 Estructura de Navegación

La interfaz utiliza un sistema de **Tabs** para separar los dos universos de personal:

### 1. Empleados (Corporativos)
- **Ficha**: Vinculación a una **Empresa** específica, Área y Cargo.
- **Propósito**: Personal que gestiona la plataforma, aprueba documentos o trabaja en oficinas/logística.
- **Acceso**: Este personal suele tener cuentas de usuario asociadas.

### 2. Contratistas (Mineros)
- **Ficha**: Vinculación directa a una **Mina** y múltiples **Labores**.
- **Propósito**: Personal operativo en campo. Su gestión se centra en la ubicación física (frente de trabajo).
- **Acceso**: No suelen poseer cuentas de usuario; su actividad se registra por terceros.

## 🏗 Estructura de Archivos

### Presentation (UI)
- `personal.page.tsx`: Punto de entrada que orquesta las pestañas de Empleados y Contratistas.
- `tab-empleados.tsx` / `tab-contratistas.tsx`: Vistas de listado y filtros específicos.
- `registro-empleado.tsx` / `registro-contratista.tsx`: Formularios adaptados a los campos requeridos por cada entidad.

### Hooks (Lógica)
- `useEmpleados.ts`: Gestión de planilla corporativa y filtros por empresa.
- `useContratistas.ts`: Gestión de personal minero y filtros por unidad minera.
- `useRegistroContratista.ts`: Lógica para validación de labores y minas.

## ⚙️ Reglas de Negocio Unificadas

- **Unicidad**: El DNI es el identificador único universal para ambos tipos de personal.
- **Desacoplamiento**: Un empleado corporativo no puede tener asignadas labores mineras directas, y un contratista no se vincula a la estructura jerárquica de cargos/áreas de la empresa.

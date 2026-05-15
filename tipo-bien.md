### 1. Suministro (El Consumible)

Es todo bien que **desaparece, se agota o se transforma** con su primer uso. No tiene sentido pedir su devolución.

- **Ejemplos**: Combustible (Diesel), explosivos, reactivos químicos, útiles de oficina (cuaderno, tajador), aceites.
- **Lógica de Negocio**:
- **Salida**: Es definitiva. Una vez que sale de almacén, el stock disminuye y el valor se carga como un **gasto** al centro de costos.
- **Control**: Se controla por cantidad y, en minería, es crítico el manejo de **Lotes** (especialmente para vencimiento de explosivos o químicos).

### 2. Repuesto (Componente de Mantenimiento)

Es una pieza destinada a ser **instalada** dentro de un equipo o maquinaria para que este recupere o mantenga su funcionalidad.

- **Ejemplos**: Filtros de aire, neumáticos, mangueras hidráulicas, pernos de molino.
- **Lógica de Negocio**:
- **Vínculo**: El sistema debería permitir asociar el despacho de un repuesto a un **Activo Fijo** específico (ej. "Este filtro se instaló en el Camión CAT-01").
- **Control**: A diferencia del suministro, el repuesto genera una historial de mantenimiento para la máquina.

### 3. Herramienta (Equipo Menor)

Bienes que se usan para realizar un trabajo, pero que **no se consumen**. Tienen una vida útil prolongada y deben retornar al almacén.

- **Ejemplos**: Taladros, llaves de impacto, escaleras, multímetros.
- **Lógica de Negocio**:
- **Flujo**: No es un despacho, es un **Préstamo**. El sistema debe registrar "quién lo tiene" y "cuándo debe devolverlo".
- **Auditoría**: El stock físico en almacén se divide en "Disponible" y "Prestado".

### 4. EPP (Equipo de Protección Personal)

Bienes diseñados para la seguridad del trabajador. Aunque parecen suministros (porque se desgastan), su gestión es **legal y de cumplimiento**.

- **Ejemplos**: Cascos, botas punta de acero, respiradores, guantes.
- **Lógica de Negocio**:
- **Trazabilidad**: Es obligatorio saber a qué **Empleado** (ID) se le entregó. En caso de accidente, el ERP es la prueba de que la empresa entregó el equipo adecuado.
- **Frecuencia**: El sistema suele controlar "topes" (ej. un par de botas cada 6 meses).

### 5. Activo Fijo (Capital de la Empresa)

Bienes de alto valor monetario que forman parte del patrimonio y se **deprecian** con el tiempo.

- **Ejemplos**: Camiones mineros, plantas de beneficio, generadores eléctricos, contenedores oficina.
- **Lógica de Negocio**:
- **Identificación**: Cada unidad es única y tiene un código de inventario o "Tag".
- **Finanzas**: El sistema debe calcular su pérdida de valor anual (depreciación). No son "productos" que se compran por docenas, se gestionan como unidades individuales.

---

### Matriz Comparativa para Programación

| Tipo de Bien    | ¿Retorna al Almacén? | ¿Se asigna a Persona? | ¿Se asocia a Lote? | Impacto Contable           |
| --------------- | -------------------- | --------------------- | ------------------ | -------------------------- |
| **Suministro**  | No                   | No (se carga a área)  | **Sí**             | Gasto Operativo (OPEX)     |
| **Repuesto**    | No (se instala)      | No                    | Opcional           | Gasto / Mantenimiento      |
| **Herramienta** | **Sí**               | Sí (Responsable)      | No                 | Control de Activos Menores |
| **EPP**         | No                   | **Sí (Obligatorio)**  | No                 | Cumplimiento Legal / SST   |
| **Activo Fijo** | N/A                  | Sí (Custodio)         | No                 | Inversión (CAPEX)          |

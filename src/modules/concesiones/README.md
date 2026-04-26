# Módulo: Concesiones

Gestión de la base legal territorial de las operaciones mineras. Controla las concesiones otorgadas por el estado y los contratos que permiten la actividad minera en dichas áreas.

## 📝 Funcionalidades Detalladas

- **Registro de Concesiones**: Captura de datos técnicos (código de concesión, hectáreas, titular) y legales.
- **Administración de Contratos**: Gestión de los acuerdos legales (contratos de explotación, servidumbre, etc.) vinculados a la concesión.
- **Vencimientos y Renovaciones**: Historial completo de vigencias contractuales para evitar vacíos legales en la operación.
- **Mantenimiento Documental**: Almacenamiento de versiones digitales de los títulos de concesión y contratos.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `concesiones.page.tsx`: Listado de concesiones con indicadores visuales de vigencia.
- `registro-concesion.tsx`: Formulario de alta para nuevas unidades territoriales.
- `nuevo-contrato.tsx`: Interfaz para formalizar la relación legal sobre una concesión.
- `historial-contratos.tsx`: Trazabilidad cronológica de todos los acuerdos firmados.

### Hooks (Lógica)

- `useConcesiones.ts`: Controla la recuperación de datos y la lógica de alertas por vencimiento de contratos.

## ⚙️ Lógica de Negocio

- **Sustento Legal**: Todas las **Minas** registradas en el sistema deben estar geográficamente dentro de una **Concesión** válida.
- **Relación Contractual**: Una concesión puede tener múltiples contratos a lo largo del tiempo, pero solo uno puede estar vigente para un propósito específico.
- **Cumplimiento**: El módulo facilita la auditoría de cumplimiento de plazos legales ante entidades reguladoras.

## 🔒 Reglas de Negocio

- No se permite el registro de operaciones en minas cuya concesión o contrato asociado haya expirado.
- Los documentos adjuntos son obligatorios para formalizar el registro de un nuevo contrato.

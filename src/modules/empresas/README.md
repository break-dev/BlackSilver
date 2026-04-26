# Módulo: Empresas

Gestión de las entidades legales que conforman el grupo empresarial o que interactúan formalmente con el sistema. Permite configurar la identidad corporativa que sustenta los documentos legales emitidos.

## 📝 Funcionalidades Detalladas

- **Registro de Entidades**: Captura de RUC, Razón Social, Dirección Fiscal y Logotipo.
- **Configuración de Cabeceras**: Los datos registrados aquí se utilizan para personalizar los encabezados de los PDFs (Órdenes de Compra, Vales, Reportes).
- **Control Multi-Empresa**: Capacidad de gestionar los datos de diferentes empresas si el sistema opera bajo un modelo de consorcio o grupo.

## 🏗 Estructura de Archivos

### Presentation (UI)

- `empresas.page.tsx`: Bandeja de visualización de las empresas configuradas.
- `registro-empresa.tsx`: Formulario de edición de datos maestros y carga de archivos de imagen (logos).

### Hooks (Lógica)

- `useEmpresas.ts`: Maneja la recuperación de datos y la lógica de actualización.

## ⚙️ Lógica de Negocio

- **Identidad**: Este módulo define "quién" emite el documento. Es vital para la validez legal de las Órdenes de Compra y otros formatos.
- **Globalidad**: Los datos de empresa son accesibles desde cualquier módulo que requiera generar documentos impresos.

## 🔒 Reglas de Negocio

- El RUC debe ser válido según el formato local.
- Se recomienda subir logotipos en alta resolución y fondo transparente para una correcta visualización en los documentos PDF.

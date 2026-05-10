import type ExcelJS from "exceljs";
import dayjs from "dayjs";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra";

export const buildOrdenesCompraExcel = async (
  workbook: ExcelJS.Workbook,
  ordenes: RES_OrdenCompra[],
  detalles: RES_OrdenCompraDetalle[],
) => {
  const sheet = workbook.addWorksheet("Órdenes de Compra", {
    views: [{ showGridLines: false }],
  });

  // 1. Configurar columnas (coloca los headers en la fila 1)
  sheet.columns = [
    { header: "Correlativo OC", key: "correlativo", width: 18 },
    { header: "Fecha OC", key: "fecha", width: 15 },
    { header: "Estado OC", key: "estado_oc", width: 15 },
    { header: "Proveedor", key: "proveedor", width: 35 },
    { header: "Producto", key: "producto", width: 45 },
    { header: "Cant. Requerida", key: "requerida", width: 16 },
    { header: "Cant. Recepc.", key: "recepcionada", width: 16 },
    { header: "U.M.", key: "um", width: 10 },
    { header: "Almacén Destino", key: "almacen", width: 25 },
    { header: "Estado Detalle", key: "estado_det", width: 18 },
  ];

  // 2. Mover cabeceras a la fila 5 insertando 4 filas en blanco
  sheet.spliceRows(1, 0, [], [], [], []);

  // 3. Estilizar Cabecera Principal (Fila 5)
  const headerRow = sheet.getRow(5);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Arial" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF166534" }, // Emerald 800 - como en el PDF
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF15803D" } },
      bottom: { style: "thin", color: { argb: "FF15803D" } },
      left: { style: "thin", color: { argb: "FF15803D" } },
      right: { style: "thin", color: { argb: "FF15803D" } },
    };
  });

  // 4. Escribir Título y Logo
  sheet.mergeCells("A1:J2");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "REPORTE DE ÓRDENES DE COMPRA";
  titleCell.font = { bold: true, size: 16, color: { argb: "FF166534" }, name: "Arial" };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  sheet.mergeCells("A3:J3");
  const subtitleCell = sheet.getCell("A3");
  subtitleCell.value = `Generado el: ${dayjs().format("DD/MM/YYYY HH:mm")} | Total OCs: ${ordenes.length}`;
  subtitleCell.font = { size: 10, color: { argb: "FF52525B" }, italic: true, name: "Arial" };
  subtitleCell.alignment = { vertical: "middle", horizontal: "center" };

  // Agregar Logo de la primera empresa (si existe)
  if (ordenes.length > 0 && ordenes[0].empresa_logo) {
    try {
      const base64Data = ordenes[0].empresa_logo.split("base64,")[1];
      if (base64Data) {
        const imageId = workbook.addImage({
          base64: base64Data,
          extension: "png", 
        });
        sheet.addImage(imageId, {
          tl: { col: 0.2, row: 0.2 },
          ext: { width: 120, height: 50 },
        });
      }
    } catch (e) {
      console.error("Error al procesar logo en excel", e);
    }
  }

  // 5. Agregar Datos con Merge por OC
  let rowIndex = 6;
  const borderStyle: Partial<ExcelJS.Borders> = {
    bottom: { style: "thin", color: { argb: "FFE4E4E7" } }, // Zinc 200
  };

  ordenes.forEach((orden, index) => {
    const detallesOc = detalles.filter((d) => d.id_orden_compra === orden.id_orden_compra);
    
    const rowCount = Math.max(1, detallesOc.length);
    const startRow = rowIndex;
    const endRow = rowIndex + rowCount - 1;

    // Color alternado (Cebra) por cada OC completa
    const bgColor = index % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC"; // Blanco y Slate 50

    if (detallesOc.length === 0) {
      const row = sheet.addRow({
        correlativo: orden.correlativo || "-",
        fecha: orden.fecha_hora_orden ? dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY") : "-",
        estado_oc: orden.estado || "-",
        proveedor: orden.proveedor || "-",
        producto: "-",
        requerida: "-",
        recepcionada: "-",
        um: "-",
        almacen: "-",
        estado_det: "-",
      });
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.border = borderStyle;
        cell.font = { size: 9, name: "Arial", color: { argb: "FF3F3F46" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      rowIndex++;
    } else {
      detallesOc.forEach((det, i) => {
        const isFirst = i === 0;
        const row = sheet.addRow({
          correlativo: isFirst ? orden.correlativo || "-" : "",
          fecha: isFirst ? dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY") : "",
          estado_oc: isFirst ? orden.estado || "-" : "",
          proveedor: isFirst ? orden.proveedor || "-" : "",
          producto: det.producto,
          requerida: det.cantidad_requerida_base,
          recepcionada: det.cantidad_recepcionada_base,
          um: det.unidad_medida_base_abv,
          almacen: det.almacen_recepcionista,
          estado_det: det.estado,
        });

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
          cell.font = { size: 9, name: "Arial", color: { argb: "FF3F3F46" } }; // Zinc 700
          
          // Solo poner borde inferior si es el último detalle de esta OC
          const isLast = i === detallesOc.length - 1;
          if (isLast) {
             cell.border = { bottom: borderStyle.bottom };
          }
          
          // Alineación específica
          if (colNumber === 5) { // Producto
            cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          } else if (colNumber === 6 || colNumber === 7) { // Cantidades
            cell.alignment = { vertical: "middle", horizontal: "right" };
          } else {
            cell.alignment = { vertical: "middle", horizontal: "center" };
          }
        });
        rowIndex++;
      });
    }

    // Merge de columnas A, B, C, D
    if (rowCount > 1) {
      sheet.mergeCells(`A${startRow}:A${endRow}`);
      sheet.mergeCells(`B${startRow}:B${endRow}`);
      sheet.mergeCells(`C${startRow}:C${endRow}`);
      sheet.mergeCells(`D${startRow}:D${endRow}`);
      
      ['A', 'B', 'C', 'D'].forEach(col => {
         const cell = sheet.getCell(`${col}${startRow}`);
         cell.alignment = { vertical: 'middle', horizontal: 'center' };
         cell.border = { 
           bottom: borderStyle.bottom, 
           right: { style: "thin", color: { argb: "FFE4E4E7" } } 
         };
      });
    } else {
      ['A', 'B', 'C', 'D'].forEach(col => {
         const cell = sheet.getCell(`${col}${startRow}`);
         cell.border = { 
           bottom: borderStyle.bottom, 
           right: { style: "thin", color: { argb: "FFE4E4E7" } } 
         };
      });
    }
  });

  // Ajustar alto de las filas de datos
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 5) {
      row.height = 25; 
    }
  });
};

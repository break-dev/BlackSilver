import type ExcelJS from "exceljs";
import dayjs from "dayjs";
import type { RES_ControlUsoLog } from "../service/control-uso.responses";

export const buildControlUsoExcel = async (
  workbook: ExcelJS.Workbook,
  logs: RES_ControlUsoLog[],
  nombreActivo: string
) => {
  const sheet = workbook.addWorksheet("Control de Uso", {
    views: [{ showGridLines: false }],
  });

  // 1. Configurar columnas
  sheet.columns = [
    { header: "Periodo", key: "periodo", width: 20 },
    { header: "Tipo Control", key: "tipo_control", width: 15 },
    { header: "Inicio (H/O)", key: "inicio", width: 15 },
    { header: "Fin (H/O)", key: "fin", width: 15 },
    { header: "Total Vueltas", key: "vueltas", width: 15 },
    { header: "Total", key: "total", width: 15 },
    { header: "Destino", key: "destino", width: 35 },
    { header: "Tipo Carga", key: "tipo_carga", width: 25 },
    { header: "Tarifa", key: "tarifa", width: 25 },
    { header: "Precio Unit.", key: "precio_unit", width: 15 },
    { header: "Costo Total", key: "costo_total", width: 15 },
    { header: "Observaciones", key: "observaciones", width: 40 },
  ];

  // 2. Mover cabeceras a la fila 5
  sheet.spliceRows(1, 0, [], [], [], []);

  // 3. Estilizar Cabecera Principal (Fila 5)
  const headerRow = sheet.getRow(5);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Arial" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // Indigo 600
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF4338CA" } },
      bottom: { style: "thin", color: { argb: "FF4338CA" } },
      left: { style: "thin", color: { argb: "FF4338CA" } },
      right: { style: "thin", color: { argb: "FF4338CA" } },
    };
  });

  // 4. Escribir Título
  sheet.mergeCells("A1:L2");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "REPORTE DE CONTROL DE USO - " + nombreActivo;
  titleCell.font = { bold: true, size: 16, color: { argb: "FF3730A3" }, name: "Arial" }; // Indigo 800
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  sheet.mergeCells("A3:L3");
  const subtitleCell = sheet.getCell("A3");
  subtitleCell.value = `Generado el: ${dayjs().format("DD/MM/YYYY HH:mm")} | Total Registros: ${logs.length}`;
  subtitleCell.font = { size: 10, color: { argb: "FF52525B" }, italic: true, name: "Arial" };
  subtitleCell.alignment = { vertical: "middle", horizontal: "center" };

  // 5. Agregar Datos
  const borderStyle: Partial<ExcelJS.Borders> = {
    bottom: { style: "thin", color: { argb: "FFE4E4E7" } }, 
  };

  logs.forEach((log, index) => {
    const bgColor = index % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC"; // Blanco y Slate 50

    const isVueltas = log.cantidad_vueltas !== null && log.cantidad_vueltas !== undefined && Number(log.cantidad_vueltas) > 0;
    const destinoStr = log.es_para_mina 
      ? `Mina: ${log.mina || '-'} / Labor: ${log.labor || '-'}`
      : `Terceros: ${log.cliente || '-'}`;

    const row = sheet.addRow({
      periodo: dayjs(log.fecha_hora_inicio_control).format("DD/MM/YYYY HH:mm"),
      tipo_control: isVueltas ? 'Vueltas' : (log.odometro_inicio !== null ? 'Odómetro' : 'Horómetro'),
      inicio: isVueltas ? '-' : (log.horometro_inicio ?? log.odometro_inicio ?? '-'),
      fin: isVueltas ? '-' : (log.horometro_fin ?? log.odometro_fin ?? '-'),
      vueltas: log.cantidad_vueltas || '-',
      total: isVueltas ? log.cantidad_vueltas : log.total_horas,
      destino: destinoStr,
      tipo_carga: log.tipo_carga || '-',
      tarifa: log.tarifa_desc || '-',
      precio_unit: log.precio_unitario,
      costo_total: log.costo_total,
      observaciones: log.observacion || '-',
    });

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      cell.font = { size: 9, name: "Arial", color: { argb: "FF3F3F46" } }; 
      cell.border = borderStyle;

      if (colNumber >= 10 && colNumber <= 11) { // Precios y Costos
        cell.numFmt = '"S/."#,##0.00';
      }

      cell.alignment = { vertical: "middle", horizontal: colNumber >= 3 && colNumber <= 6 ? "right" : "left" };
    });
  });

  // Ajustar alto
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 5) {
      row.height = 20; 
    }
  });
};

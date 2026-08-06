import type ExcelJS from "exceljs";
import dayjs from "dayjs";
import type { RES_ControlUsoLog } from "../service/control-uso.responses";
import { MESES } from "../../../shared/variables/meses";

export const buildControlVueltasExcel = async (
  workbook: ExcelJS.Workbook,
  logs: RES_ControlUsoLog[],
  mes: number,
  anio: number
) => {
  const mesNombre = (MESES.find((m) => m.value === String(mes))?.label || String(mes)).toUpperCase();

  const COLOR_HEADER_BG = "FF1E3A8A";
  const COLOR_HEADER_TEXT = "FFFFFFFF";
  const COLOR_BORDER = "FFCBD5E1";

  const daysInMonth = dayjs(`${anio}-${mes}-01`).daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const vueltasLogs = logs.filter((l) => l.cantidad_vueltas !== null && l.cantidad_vueltas !== undefined);

  if (vueltasLogs.length === 0) {
    const sheet = workbook.addWorksheet("Sin Registros", { views: [{ showGridLines: true }] });
    sheet.addRow(["No existen registros por vueltas para el período seleccionado."]);
    return;
  }

  const sheet = workbook.addWorksheet("Registro de Vueltas", { views: [{ showGridLines: false }] });

  const columns: Partial<ExcelJS.Column>[] = [
    { header: "", key: "item", width: 6 },
    { header: "", key: "area", width: 16 },
    { header: "", key: "equipo", width: 18 },
    { header: "", key: "detalle", width: 22 },
    { header: "", key: "material", width: 22 },
  ];

  daysArray.forEach((d) => {
    columns.push({ header: "", key: `d${d}`, width: 5 });
  });

  columns.push({ header: "", key: "total_qty", width: 14 });
  columns.push({ header: "", key: "total_sacos", width: 14 });
  columns.push({ header: "", key: "p_unit", width: 12 });
  columns.push({ header: "", key: "costo_total", width: 16 });

  sheet.columns = columns;

  // Header Title
  let rIdx = 1;
  sheet.mergeCells(`A${rIdx}:AJ${rIdx}`);
  const titleVueltas = sheet.getCell(`A${rIdx}`);
  titleVueltas.value = `REGISTRO CONTROL DE VUELTAS - ${mesNombre} ${anio}`;
  titleVueltas.font = { bold: true, size: 14, color: { argb: "FF0F172A" } };
  titleVueltas.alignment = { horizontal: "center", vertical: "middle" };
  rIdx += 3;

  // Table Headers
  const hRow = sheet.getRow(rIdx);
  const headerValues: Record<string, string | number> = {
    item: "ITEM",
    area: "ÁREA / MINA",
    equipo: "EQUIPO",
    detalle: "LABOR",
    material: "TIPO MATERIAL",
    total_qty: "TOTAL VUELTAS",
    total_sacos: "TOTAL SACOS",
    p_unit: "P.UNIT",
    costo_total: "TOTAL S/.",
  };

  daysArray.forEach((d) => {
    headerValues[`d${d}`] = String(d);
  });

  hRow.values = headerValues;
  hRow.height = 22;

  hRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR_HEADER_BG } };
    cell.font = { bold: true, color: { argb: COLOR_HEADER_TEXT }, size: 9, name: "Arial" };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: COLOR_BORDER } },
      bottom: { style: "thin", color: { argb: COLOR_BORDER } },
      left: { style: "thin", color: { argb: COLOR_BORDER } },
      right: { style: "thin", color: { argb: COLOR_BORDER } },
    };
  });

  rIdx++;

  vueltasLogs.forEach((log, idx) => {
    const row = sheet.getRow(rIdx);
    row.height = 19;
    const dayNum = dayjs(log.fecha_hora_inicio_control).date();

    const rowData: Record<string, string | number> = {
      item: idx + 1,
      area: log.mina || log.ubicacion_activo || "MINA",
      equipo: log.codigo || log.producto || log.correlativo,
      detalle: log.labor || "GENERAL",
      material: log.tarifa_material || "MINERAL",
      total_qty: Number(log.cantidad_vueltas || 0),
      total_sacos: Number(log.cantidad_sacos || 0),
      p_unit: Number(log.precio_unitario || 0),
      costo_total: Number(log.costo_total || 0),
    };

    rowData[`d${dayNum}`] = Number(log.cantidad_vueltas || 0);
    row.values = rowData;

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { size: 9, name: "Arial" };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: COLOR_BORDER } },
        bottom: { style: "thin", color: { argb: COLOR_BORDER } },
        left: { style: "thin", color: { argb: COLOR_BORDER } },
        right: { style: "thin", color: { argb: COLOR_BORDER } },
      };

      if (colNum === columns.length) cell.numFmt = '"S/."#,##0.00';
    });

    rIdx++;
  });
};

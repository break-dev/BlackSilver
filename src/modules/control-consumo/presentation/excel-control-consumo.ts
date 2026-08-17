import type ExcelJS from "exceljs";
import dayjs from "dayjs";
import { MESES } from "../../../shared/variables/meses";
import type {
  RES_Consumo,
  RES_ResumenEntregasReq,
  OrigenCostoUnitario,
} from "../service/control-consumo.responses";

const COLOR_HEADER_BG = "FF1E3A8A";
const COLOR_HEADER_TEXT = "FFFFFFFF";
const COLOR_BORDER = "FFCBD5E1";
const COLOR_ROW_ALT = "FFFAFAFA";
const COLOR_COST = "FFF0FDF4";
const COLOR_AUDITABLE_BG = "FFFEE2E2";
const COLOR_AUDITABLE_TEXT = "FF991B1B";
const COLOR_TOTAL_BG = "FFE2E8F0";

const ORIGEN_COSTO_LABEL: Record<OrigenCostoUnitario, string> = {
  snapshot_detalle: "Snapshot Detalle",
  lote_promedio: "Lote Promedio",
  lote_compra: "Lote Compra",
  oc_detalle: "OC Detalle",
  sin_costo: "Sin Costo",
};

const HEADERS: Array<{ key: string; title: string; width: number }> = [
  { key: "item", title: "#", width: 5 },
  { key: "fecha_req", title: "F. Req.", width: 12 },
  { key: "correlativo_req", title: "Correlativo Req.", width: 18 },
  { key: "solicitante", title: "Solicitante", width: 26 },
  { key: "cargo_solicitante", title: "Cargo Solicitante", width: 18 },
  { key: "mina", title: "Mina", width: 18 },
  { key: "labor", title: "Labor", width: 18 },
  { key: "almacen", title: "Almacén", width: 20 },
  { key: "producto", title: "Producto", width: 30 },
  { key: "categoria", title: "Categoría", width: 18 },
  { key: "tipo_bien", title: "Tipo Bien", width: 12 },
  { key: "u_base", title: "U.M. Base", width: 10 },
  { key: "cant_entregada_base", title: "Cant. Entregada", width: 13 },
  { key: "cant_consumida_total", title: "Cant. Consumida (total)", width: 14 },
  { key: "cant_consumida_este", title: "Cant. Consumida (este)", width: 14 },
  { key: "restante_base", title: "Restante Base", width: 13 },
  { key: "estado", title: "Estado", width: 14 },
  { key: "moneda", title: "Moneda", width: 8 },
  { key: "costo_unitario", title: "Costo Unit. Base", width: 14 },
  { key: "origen_costo", title: "Origen Costo", width: 14 },
  { key: "costo_total_consumo", title: "Costo Total Consumo", width: 16 },
  { key: "lote_mineral", title: "Lote Mineral", width: 14 },
  { key: "mina_lote", title: "Mina Lote", width: 16 },
  { key: "labor_lote", title: "Labor Lote", width: 16 },
  { key: "empleado_registro", title: "Empleado Reg.", width: 24 },
  { key: "cargo_registro", title: "Cargo Reg.", width: 18 },
  { key: "fecha_consumo", title: "F. Consumo", width: 16 },
  { key: "estado_consumo", title: "Estado Consumo", width: 14 },
  { key: "para_mantenimiento", title: "Mant.?", width: 8 },
  { key: "para_produccion", title: "Prod.?", width: 8 },
  { key: "af_consumidor", title: "AF Consumidor", width: 14 },
  { key: "marca_af", title: "Marca AF", width: 16 },
  { key: "modelo_af", title: "Modelo AF", width: 16 },
  { key: "costo_af", title: "Costo AF", width: 14 },
  { key: "labores_destinos", title: "Labores Destino", width: 28 },
  { key: "comentario", title: "Comentario", width: 36 },
];

const COL_KEYS = HEADERS.map((h) => h.key);

const formatMonto = (valor: number | string | null | undefined, moneda?: string | null) => {
  const n = Number(valor ?? 0);
  const prefix = (moneda || "PEN").toUpperCase().startsWith("USD") ? "$" : "S/.";
  return `${prefix} ${n.toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 2 })}`;
};

/**
 * Aplana la estructura agrupada (requerimiento → entrega → detalle → consumos[]) en una
 * lista plana de filas, una por cada consumo. Útil para reportes y para Excel.
 */
export const flattenConsumosForExcel = (
  reporte: RES_ResumenEntregasReq[],
): Array<{
  consumo: RES_Consumo;
  detalle: RES_ResumenEntregasReq;
}> => {
  const flat: Array<{ consumo: RES_Consumo; detalle: RES_ResumenEntregasReq }> = [];
  reporte.forEach((det) => {
    if (!det.consumos || det.consumos.length === 0) {
      // Si no hay consumos, igualmente emitir una fila "vacía" para que el reporte
      // muestre todo lo entregado y permita al usuario ver cuánto falta por consumir.
      flat.push({
        consumo: {
          id_consumo: 0,
          id_requerimiento_almacen_entrega_detalle: det.id_entrega_requerimiento_detalle,
          id_activo_fijo_consumidor: null,
          id_labor_destino: null,
          id_empleado_registro: 0,
          empleado_registro: "",
          cantidad_base_consumida: 0,
          fecha_hora_consumo: "",
          comentario_consumo: null,
          created_at: "",
          estado: "Sin Consumir" as never,
        } as RES_Consumo,
        detalle: det,
      });
      return;
    }
    det.consumos.forEach((c) => flat.push({ consumo: c, detalle: det }));
  });
  return flat;
};

/**
 * Builder del Excel "plano" de Control de Consumo.
 * Una hoja "Consumos" con una fila por cada consumo individual (o por entrega sin consumos),
 * todas las columnas de costo y referencia necesarias para análisis de costo de producción.
 */
export const buildControlConsumoExcel = async (
  workbook: ExcelJS.Workbook,
  reporte: RES_ResumenEntregasReq[],
  mes: number,
  anio: number,
) => {
  const mesNombre =
    (MESES.find((m) => m.value === String(mes))?.label || String(mes)).toUpperCase();

  const sheet = workbook.addWorksheet("Consumos", {
    views: [{ showGridLines: true, state: "frozen", ySplit: 4 }],
  });

  sheet.columns = HEADERS.map((h) => ({ key: h.key, width: h.width }));

  // Banda superior: título del reporte
  sheet.mergeCells("A1:AI2");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "REPORTE DE CONTROL DE CONSUMO - ANÁLISIS DE COSTOS DE PRODUCCIÓN";
  titleCell.font = {
    bold: true,
    size: 16,
    color: { argb: "FF0F172A" },
    name: "Arial",
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  let rowIdx = 3;
  // Subtítulo: rango y totales
  const metaRow = sheet.getRow(rowIdx);
  const totalConsumos = reporte.reduce(
    (acc, d) => acc + (d.consumos?.length ?? 0),
    0,
  );
  const totalCosto = reporte.reduce((acc, d) => {
    const costoUnit = Number(d.costo_unitario_base ?? 0);
    return acc + costoUnit * Number(d.cantidad_consumida_base ?? 0);
  }, 0);
  metaRow.getCell(1).value = `Período: ${mesNombre} ${anio}    •    Entregas: ${reporte.length}    •    Consumos: ${totalConsumos}`;
  metaRow.getCell(1).font = {
    bold: true,
    size: 10,
    color: { argb: "FF475569" },
    name: "Arial",
  };
  metaRow.getCell(1).alignment = { horizontal: "left" };

  const generatedCell = sheet.getCell(`AG${rowIdx}`);
  generatedCell.value = `Generado: ${dayjs().format("DD/MM/YYYY HH:mm")}`;
  generatedCell.font = {
    italic: true,
    size: 9,
    color: { argb: "FF64748B" },
    name: "Arial",
  };
  generatedCell.alignment = { horizontal: "right" };
  sheet.mergeCells(`AG${rowIdx}:AI${rowIdx}`);

  rowIdx += 1;

  // Cabeceras de las columnas
  const headerRow = sheet.getRow(rowIdx);
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h.title;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_HEADER_BG },
    };
    cell.font = {
      bold: true,
      color: { argb: COLOR_HEADER_TEXT },
      size: 9,
      name: "Arial",
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: COLOR_BORDER } },
      left: { style: "thin", color: { argb: COLOR_BORDER } },
      right: { style: "thin", color: { argb: COLOR_BORDER } },
      bottom: { style: "thin", color: { argb: COLOR_BORDER } },
    };
  });
  headerRow.height = 32;
  rowIdx += 1;

  const flat = flattenConsumosForExcel(reporte);

  if (flat.length === 0) {
    sheet.mergeCells(`A${rowIdx}:AI${rowIdx + 1}`);
    const empty = sheet.getCell(`A${rowIdx}`);
    empty.value =
      "No hay consumos para los filtros seleccionados (mes / año / búsqueda).";
    empty.font = { italic: true, color: { argb: "FF64748B" }, name: "Arial" };
    empty.alignment = { vertical: "middle", horizontal: "center" };
    return;
  }

  let totalCantConsumida = 0;
  let totalCostoConsumo = 0;
  let totalRestante = 0;

  flat.forEach(({ consumo, detalle }, idx) => {
    const r = sheet.getRow(rowIdx);
    r.height = 18;
    const cantConsumidaBase = Number(consumo.cantidad_base_consumida ?? 0);
    const cantConsumidaTotalBase = Number(detalle.cantidad_consumida_base ?? 0);
    const cantEntregadaBase = Number(detalle.cantidad_entregada_base ?? 0);
    const restanteBase = cantEntregadaBase - cantConsumidaTotalBase;
    const costoUnit = Number(detalle.costo_unitario_base ?? 0);
    const costoTotalConsumo =
      consumo.id_consumo === 0
        ? 0
        : Number(consumo.costo_total_consumo ?? cantConsumidaBase * costoUnit);
    const origenCosto: OrigenCostoUnitario =
      consumo.origen_costo_unitario ?? detalle.origen_costo_unitario ?? "sin_costo";
    const estadoConsumoCalc =
      cantConsumidaTotalBase >= cantEntregadaBase && cantEntregadaBase > 0
        ? "Consumo Total"
        : cantConsumidaTotalBase > 0
          ? "Consumo Parcial"
          : "Sin Consumir";

    totalCantConsumida += cantConsumidaBase;
    totalCostoConsumo += costoTotalConsumo;
    totalRestante += restanteBase;

    const paraMant =
      consumo.para_mantenimiento === true ||
      Number(consumo.para_mantenimiento) === 1;
    const paraProd =
      consumo.para_produccion === true ||
      Number(consumo.para_produccion) === 1;

    r.values = {
      item: idx + 1,
      fecha_req: dayjs(detalle.fecha_requerimiento).format("DD/MM/YYYY"),
      correlativo_req: String(detalle.correlativo_requerimiento ?? ""),
      solicitante: detalle.solicitante ?? "",
      cargo_solicitante: detalle.cargo_solicitante ?? "",
      mina: detalle.mina ?? "",
      labor: detalle.labor ?? "",
      almacen: detalle.almacen_destino ?? "",
      producto: detalle.producto ?? "",
      categoria: detalle.categoria ?? "",
      tipo_bien: detalle.tipo_bien ?? "",
      u_base: detalle.unidad_medida_base_abv ?? "",
      cant_entregada_base: cantEntregadaBase,
      cant_consumida_total: cantConsumidaTotalBase,
      cant_consumida_este: cantConsumidaBase,
      restante_base: restanteBase,
      estado: estadoConsumoCalc,
      moneda: detalle.moneda ?? "PEN",
      costo_unitario: costoUnit,
      origen_costo: ORIGEN_COSTO_LABEL[origenCosto] ?? origenCosto,
      costo_total_consumo: costoTotalConsumo,
      lote_mineral: consumo.codigo_lote_mineral ?? "",
      mina_lote: consumo.mina_lote_mineral ?? "",
      labor_lote: consumo.labor_lote_mineral ?? "",
      empleado_registro: consumo.empleado_registro ?? "",
      cargo_registro: consumo.cargo_registro ?? "",
      fecha_consumo: consumo.fecha_hora_consumo
        ? dayjs(consumo.fecha_hora_consumo).format("DD/MM/YYYY HH:mm")
        : "",
      estado_consumo: consumo.estado ?? "",
      para_mantenimiento: paraMant ? "Sí" : "No",
      para_produccion: paraProd ? "Sí" : "No",
      af_consumidor: consumo.correlativo_activo_fijo_consumidor ?? "",
      marca_af: consumo.marca_activo_fijo_consumidor ?? "",
      modelo_af: consumo.modelo_activo_fijo_consumidor ?? "",
      costo_af: Number(consumo.costo_compra_activo_fijo_consumidor ?? 0),
      labores_destinos: consumo.labores_destinos ?? "",
      comentario: consumo.comentario_consumo ?? "",
    };

    r.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.font = { size: 9, name: "Arial" };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNum === 1 || colNum === 7 || colNum === 11 || colNum === 12 || colNum === 17 || colNum === 19 || colNum === 20 || colNum === 27 || colNum === 29 || colNum === 30
          ? "center"
          : colNum === 4 || colNum === 5 || colNum === 8 || colNum === 9 || colNum === 10 || colNum === 13 || colNum === 14 || colNum === 15 || colNum === 16 || colNum === 18 || colNum === 21 || colNum === 25 || colNum === 26 || colNum === 31 || colNum === 32 || colNum === 33 || colNum === 34
            ? "left"
            : "left",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: COLOR_BORDER } },
        left: { style: "thin", color: { argb: COLOR_BORDER } },
        right: { style: "thin", color: { argb: COLOR_BORDER } },
        bottom: { style: "thin", color: { argb: COLOR_BORDER } },
      };

      const key = COL_KEYS[colNum - 1];
      if (key === "cant_entregada_base" || key === "cant_consumida_total" || key === "cant_consumida_este" || key === "restante_base") {
        cell.numFmt = "0.0000";
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
      if (key === "costo_unitario" || key === "costo_total_consumo" || key === "costo_af") {
        cell.numFmt = '"S/."#,##0.0000';
        cell.alignment = { vertical: "middle", horizontal: "right" };
      }
    });

    // Alternado
    if (idx % 2 === 1) {
      r.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR_ROW_ALT },
        };
      });
    }

    // Resaltar filas con costo > 0 (en la columna de costo total)
    if (costoTotalConsumo > 0) {
      const cell = r.getCell(COL_KEYS.indexOf("costo_total_consumo") + 1);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR_COST },
      };
    }

    // Resaltar auditable
    if (detalle.es_auditable === true || Number(detalle.es_auditable) === 1) {
      const cellProducto = r.getCell(COL_KEYS.indexOf("producto") + 1);
      cellProducto.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR_AUDITABLE_BG },
      };
      cellProducto.font = {
        ...(cellProducto.font || {}),
        color: { argb: COLOR_AUDITABLE_TEXT },
        bold: true,
      };
    }

    rowIdx += 1;
  });

  // Fila Totalizadora
  const totalRow = sheet.getRow(rowIdx);
  totalRow.height = 24;
  sheet.mergeCells(`A${rowIdx}:O${rowIdx}`);
  const labelTotalCell = totalRow.getCell(1);
  labelTotalCell.value = "TOTAL GENERAL DEL PERÍODO:";
  labelTotalCell.font = { bold: true, size: 10, color: { argb: "FF0F172A" } };
  labelTotalCell.alignment = { vertical: "middle", horizontal: "right" };

  totalRow.getCell(COL_KEYS.indexOf("cant_consumida_total") + 1).value = reporte.reduce(
    (acc, d) => acc + Number(d.cantidad_consumida_base ?? 0),
    0,
  );
  totalRow.getCell(COL_KEYS.indexOf("cant_consumida_total") + 1).numFmt = "0.0000";

  totalRow.getCell(COL_KEYS.indexOf("cant_consumida_este") + 1).value = totalCantConsumida;
  totalRow.getCell(COL_KEYS.indexOf("cant_consumida_este") + 1).numFmt = "0.0000";

  totalRow.getCell(COL_KEYS.indexOf("restante_base") + 1).value = totalRestante;
  totalRow.getCell(COL_KEYS.indexOf("restante_base") + 1).numFmt = "0.0000";

  totalRow.getCell(COL_KEYS.indexOf("costo_total_consumo") + 1).value = totalCostoConsumo;
  totalRow.getCell(COL_KEYS.indexOf("costo_total_consumo") + 1).numFmt = '"S/."#,##0.0000';

  totalRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true, size: 10, name: "Arial" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR_TOTAL_BG },
    };
    cell.border = {
      top: { style: "double", color: { argb: "FF0F172A" } },
      bottom: { style: "double", color: { argb: "FF0F172A" } },
    };
  });

  void formatMonto;
  void totalCosto;
};

export interface BuildControlConsumoExcelParams {
  reporte: RES_ResumenEntregasReq[];
  mes: number;
  anio: number;
}

/**
 * Helper que arma la configuración de useExcel y dispara la generación del Excel.
 */
export const useControlConsumoExcel = () => {
  const generate = (params: BuildControlConsumoExcelParams) => {
    const { reporte, mes, anio } = params;
    const mesNombre =
      MESES.find((m) => m.value === String(mes))?.label || String(mes);
    const filename = `Control_Consumo_Costos_${mesNombre}_${anio}.xlsx`;

    return {
      filename,
      builder: async (workbook: ExcelJS.Workbook) => {
        await buildControlConsumoExcel(workbook, reporte, mes, anio);
      },
    };
  };

  return { generate };
};

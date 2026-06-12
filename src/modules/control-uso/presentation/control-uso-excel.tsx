import type ExcelJS from "exceljs";
import dayjs from "dayjs";
import type { RES_ControlUsoLog, RES_MantenimientoReporte } from "../service/control-uso.responses";
import { MESES } from "../../../shared/variables/meses";

export const buildControlUsoExcel = async (
  workbook: ExcelJS.Workbook,
  logs: RES_ControlUsoLog[],
  mantenimientos: RES_MantenimientoReporte[],
  mes: number,
  anio: number,
  empresaLogoBase64?: string | null
) => {
  const daysInMonth = dayjs(`${anio}-${mes}-01`).daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Clasificar logs por tipo
  const vueltasLogs = logs.filter(l => l.cantidad_vueltas !== null && l.cantidad_vueltas !== undefined);
  const horometroLogs = logs.filter(l => l.cantidad_vueltas === null && (l.horometro_inicio !== null || l.horometro_fin !== null));
  const odometroLogs = logs.filter(l => l.cantidad_vueltas === null && l.horometro_inicio === null && l.horometro_fin === null && (l.odometro_inicio !== null || l.odometro_fin !== null));

  const mesNombre = MESES.find(m => m.value === String(mes))?.label || String(mes);

  const buildMatrixSheet = (
    sheetName: string, 
    data: RES_ControlUsoLog[], 
    mants: RES_MantenimientoReporte[],
    type: 'vueltas' | 'horometro' | 'odometro'
  ) => {
    if (data.length === 0) return;

    const sheet = workbook.addWorksheet(sheetName, { views: [{ showGridLines: false }] });

    // Definir Columnas
    const columns: Partial<ExcelJS.Column>[] = [
      { header: "", key: "item", width: 6 },
      { header: "", key: "area", width: 12 },
      { header: "", key: "equipo", width: 12 },
      { header: "", key: "detalle", width: 25 },
    ];

    if (type === 'vueltas') {
      columns.push({ header: "", key: "material", width: 25 });
    } else if (type === 'horometro') {
      columns.push({ header: "", key: "destino", width: 35 });
    }

    daysArray.forEach(d => {
      columns.push({ header: "", key: `d${d}`, width: 6 });
    });

    columns.push({ header: "", key: "total_qty", width: 15 });
    if (type === 'vueltas') {
      columns.push({ header: "", key: "total_sacos", width: 15 });
    }
    columns.push({ header: "", key: "costo_total", width: 15 });
    columns.push({ header: "", key: "mant_fecha", width: 22 });
    columns.push({ header: "", key: "mant_lectura", width: 22 });

    sheet.columns = columns;

    let rowIndex = 1;

    const ubicaciones = Array.from(new Set(data.map(l => l.ubicacion_activo || 'SIN UBICACIÓN')));

    ubicaciones.forEach((ubicacion, ubicacionIdx) => {
      const dataUbicacion = data.filter(l => (l.ubicacion_activo || 'SIN UBICACIÓN') === ubicacion);
      
      let globalItem = 1;

      // Espacio superior y Logo
      if (ubicacionIdx > 0) {
        rowIndex += 3; // Espacio entre tablas
      }

      // Añadir la Ubicación en la parte superior (celdas B y C)
      const rowUbi = sheet.getRow(rowIndex);
      rowUbi.getCell('area').value = ubicacion.toUpperCase();
      sheet.mergeCells(`B${rowIndex}:C${rowIndex}`);
      rowUbi.getCell('area').font = { bold: true, size: 10, name: "Arial" };
      rowUbi.getCell('area').border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
      rowUbi.getCell('area').alignment = { vertical: "middle", horizontal: "center" };
      
      // Añadir Logo a la derecha si es la primera
      if (ubicacionIdx === 0 && empresaLogoBase64) {
        try {
          const imageId = workbook.addImage({
            base64: empresaLogoBase64.split(",")[1],
            extension: "png",
          });
          sheet.addImage(imageId, {
            tl: { col: columns.length - 3, row: rowIndex - 1 },
            ext: { width: 120, height: 40 },
          });
        } catch (e) {
          console.error("Error al añadir logo al excel", e);
        }
      }
      rowIndex++;

      // Fila de MES
      const rowMesInfo = sheet.getRow(rowIndex);
      rowMesInfo.getCell('area').value = mesNombre.toUpperCase();
      sheet.mergeCells(`B${rowIndex}:C${rowIndex}`);
      rowMesInfo.getCell('area').font = { bold: true, size: 10, name: "Arial" };
      rowMesInfo.getCell('area').border = { bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
      rowMesInfo.getCell('area').alignment = { vertical: "middle", horizontal: "center" };

      // Titulo principal al costado
      const lastColIndex = columns.length;
      const lastColLetter = sheet.getColumn(lastColIndex).letter;
      sheet.mergeCells(`D${rowIndex-1}:${lastColLetter}${rowIndex}`);
      const mainTitleCell = sheet.getCell(`D${rowIndex-1}`);
      mainTitleCell.value = `REGISTRO DE CONTROL DE USO - ${ubicacion.toUpperCase()} ${anio}`;
      mainTitleCell.font = { bold: true, size: 16, color: { argb: "FF0F172A" }, name: "Arial" };
      mainTitleCell.alignment = { vertical: "middle", horizontal: "center" };

      rowIndex++;
      rowIndex++; // Espacio antes del header

      // Cabeceras de Tabla
      const headerRow = sheet.getRow(rowIndex);
      headerRow.height = 25;
      
      headerRow.getCell('item').value = "ITEM";
      headerRow.getCell('area').value = "AREA";
      headerRow.getCell('equipo').value = "EQUIPO";
      headerRow.getCell('detalle').value = "DETALLE";
      if (type === 'vueltas') {
        headerRow.getCell('material').value = "TIPO DE MATERIAL";
      } else if (type === 'horometro') {
        headerRow.getCell('destino').value = "DESTINO";
      }
      
      daysArray.forEach(d => {
        headerRow.getCell(`d${d}`).value = d;
      });
      
      headerRow.getCell('total_qty').value = type === 'vueltas' ? "TOTAL VUELTAS" : (type === 'horometro' ? "TOTAL HORAS" : "TOTAL KM");
      if (type === 'vueltas') {
        headerRow.getCell('total_sacos').value = "TOTAL SACOS";
      }
      headerRow.getCell('costo_total').value = "COSTO TOTAL";
      headerRow.getCell('mant_fecha').value = "MANTENIMIENTO FECHA";
      headerRow.getCell('mant_lectura').value = "MANTENIMIENTO LECTURA";

      headerRow.eachCell((cell, colNumber) => {
        if (colNumber <= columns.length) {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9, name: "Arial" };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } }; // Dark Blue
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = {
            top: { style: "thin", color: { argb: "FF334155" } },
            bottom: { style: "thin", color: { argb: "FF334155" } },
            left: { style: "thin", color: { argb: "FF334155" } },
            right: { style: "thin", color: { argb: "FF334155" } },
          };
        }
      });
      rowIndex++;

      // Agrupar por Producto (AREA)
      const productosObj = dataUbicacion.reduce((acc, log) => {
        if (!acc[log.producto]) acc[log.producto] = [];
        acc[log.producto].push(log);
        return acc;
      }, {} as Record<string, RES_ControlUsoLog[]>);

      Object.keys(productosObj).forEach((producto) => {
        const logsProducto = productosObj[producto];
        const startRowForMergeArea = rowIndex;

        // Agrupar por Activo dentro del producto (EQUIPO)
        const activosObj = logsProducto.reduce((acc, log) => {
          if (!acc[log.id_activo_fijo]) acc[log.id_activo_fijo] = [];
          acc[log.id_activo_fijo].push(log);
          return acc;
        }, {} as Record<number, RES_ControlUsoLog[]>);

        Object.keys(activosObj).forEach((idActivoStr) => {
          const idActivo = Number(idActivoStr);
          const logsActivo = activosObj[idActivo];
          const codigoEquipo = logsActivo[0].codigo ? `${logsActivo[0].correlativo} / ${logsActivo[0].codigo}` : logsActivo[0].correlativo;
          const startRowForMergeEquipo = rowIndex;

          const mantsActivo = mants.filter(m => m.id_activo_fijo === idActivo);
          const mantFechaText = mantsActivo.length > 0 ? dayjs(mantsActivo[0].fecha_hora_mantenimiento).format("DD/MM/YYYY") : "";
          let mantLecturaText = "";
          if (mantsActivo.length > 0) {
            if (type === 'vueltas') mantLecturaText = String(mantsActivo[0].vueltas_actuales || "-");
            if (type === 'horometro') mantLecturaText = String(mantsActivo[0].horometro_actual || "-");
            if (type === 'odometro') mantLecturaText = String(mantsActivo[0].odometro_actual || "-");
          }

          if (type === 'vueltas') {
            const tarifasObj = logsActivo.reduce((acc, log) => {
              const t = log.tarifa_desc || "Otros";
              const material = log.tipo_material || "SIN MATERIAL";
              const key = `${t}___${material}`;
              if (!acc[key]) acc[key] = [];
              acc[key].push(log);
              return acc;
            }, {} as Record<string, RES_ControlUsoLog[]>);

            Object.keys(tarifasObj).forEach((key) => {
              const [tarifa, materialStr] = key.split("___");
              const rowData: Record<string, string | number> = {
                item: globalItem++,
                area: producto.toUpperCase(),
                equipo: codigoEquipo,
                detalle: tarifa.toUpperCase(),
                material: materialStr.toUpperCase()
              };
              let totalVts = 0;
              let totalSacos = 0;
              let totalCost = 0;

              daysArray.forEach(d => {
                const logsDay = tarifasObj[key].filter(l => dayjs(l.fecha_hora_inicio_control).date() === d);
                const sumDay = logsDay.reduce((sum, l) => sum + Number(l.cantidad_vueltas || 0), 0);
                const sumSacos = logsDay.reduce((sum, l) => sum + Number(l.cantidad_sacos || 0), 0);
                if (sumDay > 0) {
                  rowData[`d${d}`] = sumDay;
                  totalVts += sumDay;
                }
                if (sumSacos > 0) {
                  totalSacos += sumSacos;
                }
              });

              totalCost = tarifasObj[key].reduce((sum, l) => sum + Number(l.costo_total || 0), 0);
              rowData.total_qty = totalVts > 0 ? totalVts : "";
              rowData.total_sacos = totalSacos > 0 ? totalSacos : "";
              rowData.costo_total = totalCost > 0 ? totalCost : "";

              if (rowIndex === startRowForMergeEquipo) {
                rowData.mant_fecha = mantFechaText;
                rowData.mant_lectura = mantLecturaText;
              }

              sheet.addRow(rowData);
              rowIndex++;
            });
          } else if (type === 'horometro') {
            const cargasObj = logsActivo.reduce((acc, log) => {
              const destinoStr = log.es_para_mina ? (log.mina || 'MINA') : (log.cliente || 'TERCEROS');
              const cargaDesc = log.tipo_carga || "USO GENERAL";
              const key = `${cargaDesc}___${destinoStr}`;
              
              if (!acc[key]) acc[key] = [];
              acc[key].push(log);
              return acc;
            }, {} as Record<string, RES_ControlUsoLog[]>);

            Object.keys(cargasObj).forEach((key) => {
              const [carga, destinoStr] = key.split("___");
              const rowData: Record<string, string | number> = {
                item: globalItem++,
                area: producto.toUpperCase(),
                equipo: codigoEquipo,
                detalle: carga.toUpperCase(),
                destino: destinoStr.toUpperCase()
              };
              let totalQty = 0;
              let totalCost = 0;

              daysArray.forEach(d => {
                const sumDay = cargasObj[key]
                  .filter(l => dayjs(l.fecha_hora_inicio_control).date() === d)
                  .reduce((sum, l) => sum + Number(l.total_horas || 0), 0);
                if (sumDay > 0) {
                  rowData[`d${d}`] = Number(sumDay.toFixed(2));
                  totalQty += sumDay;
                }
              });

              totalCost = cargasObj[key].reduce((sum, l) => sum + Number(l.costo_total || 0), 0);
              rowData.total_qty = totalQty > 0 ? Number(totalQty.toFixed(2)) : "";
              rowData.costo_total = totalCost > 0 ? totalCost : "";

              if (rowIndex === startRowForMergeEquipo) {
                rowData.mant_fecha = mantFechaText;
                rowData.mant_lectura = mantLecturaText;
              }

              sheet.addRow(rowData);
              rowIndex++;
            });
          } else {
            // ODOMETRO
            const cargasObj = logsActivo.reduce((acc, log) => {
              const cargaDesc = log.tipo_carga || "USO GENERAL";
              const key = `${cargaDesc}`;
              
              if (!acc[key]) acc[key] = [];
              acc[key].push(log);
              return acc;
            }, {} as Record<string, RES_ControlUsoLog[]>);

            Object.keys(cargasObj).forEach((key) => {
              const carga = key;
              const rowData: Record<string, string | number> = {
                item: globalItem++,
                area: producto.toUpperCase(),
                equipo: codigoEquipo,
                detalle: carga.toUpperCase(),
              };
              let totalQty = 0;
              let totalCost = 0;

              daysArray.forEach(d => {
                const sumDay = cargasObj[key]
                  .filter(l => dayjs(l.fecha_hora_inicio_control).date() === d)
                  .reduce((sum, l) => sum + Number(l.total_km || 0), 0);
                if (sumDay > 0) {
                  rowData[`d${d}`] = Number(sumDay.toFixed(2));
                  totalQty += sumDay;
                }
              });

              totalCost = cargasObj[key].reduce((sum, l) => sum + Number(l.costo_total || 0), 0);
              rowData.total_qty = totalQty > 0 ? Number(totalQty.toFixed(2)) : "";
              rowData.costo_total = totalCost > 0 ? totalCost : "";

              if (rowIndex === startRowForMergeEquipo) {
                rowData.mant_fecha = mantFechaText;
                rowData.mant_lectura = mantLecturaText;
              }

              sheet.addRow(rowData);
              rowIndex++;
            });
          }

          // Filas de Inicio y Fin
          if (type !== 'vueltas') {
            const rowInicio: Record<string, string | number> = { item: globalItem++, area: producto.toUpperCase(), equipo: codigoEquipo, detalle: type === 'horometro' ? "HORÓMETRO - INICIO" : "ODÓMETRO - INICIO" };
            const rowFin: Record<string, string | number> = { item: "", area: producto.toUpperCase(), equipo: codigoEquipo, detalle: type === 'horometro' ? "HORÓMETRO - TÉRMINO" : "ODÓMETRO - TÉRMINO" };

            daysArray.forEach(d => {
              const logsDia = logsActivo.filter(l => dayjs(l.fecha_hora_inicio_control).date() === d);
              if (logsDia.length > 0) {
                if (type === 'horometro') {
                  const inis = logsDia.map(l => Number(l.horometro_inicio)).filter(v => v > 0);
                  const fins = logsDia.map(l => Number(l.horometro_fin)).filter(v => v > 0);
                  if (inis.length > 0) rowInicio[`d${d}`] = Math.min(...inis);
                  if (fins.length > 0) rowFin[`d${d}`] = Math.max(...fins);
                } else {
                  const inis = logsDia.map(l => Number(l.odometro_inicio)).filter(v => v > 0);
                  const fins = logsDia.map(l => Number(l.odometro_fin)).filter(v => v > 0);
                  if (inis.length > 0) rowInicio[`d${d}`] = Math.min(...inis);
                  if (fins.length > 0) rowFin[`d${d}`] = Math.max(...fins);
                }
              }
            });
            sheet.addRow(rowInicio);
            rowIndex++;
            sheet.addRow(rowFin);
            rowIndex++;
          }

          // Merge de la columna Equipo
          if (rowIndex - 1 > startRowForMergeEquipo) {
            sheet.mergeCells(`C${startRowForMergeEquipo}:C${rowIndex - 1}`);
            const equipoCell = sheet.getCell(`C${startRowForMergeEquipo}`);
            equipoCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true, textRotation: 90 };
            equipoCell.font = { bold: true, size: 8, color: { argb: "FF3F3F46" }, name: "Arial" };
            equipoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F4F5" } };
          } else if (rowIndex - 1 === startRowForMergeEquipo) {
            const equipoCell = sheet.getCell(`C${startRowForMergeEquipo}`);
            equipoCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true, textRotation: 90 };
            equipoCell.font = { bold: true, size: 8, color: { argb: "FF3F3F46" }, name: "Arial" };
            equipoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F4F5" } };
          }
        }); // Fin activos

        // Merge de la columna Area
        if (rowIndex - 1 > startRowForMergeArea) {
          sheet.mergeCells(`B${startRowForMergeArea}:B${rowIndex - 1}`);
          const areaCell = sheet.getCell(`B${startRowForMergeArea}`);
          areaCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true, textRotation: 90 };
          
          let areaColor = "FFF4F4F5"; 
          if (type === 'vueltas') areaColor = "FF22C55E"; // Green 500
          else if (type === 'horometro') areaColor = "FFEAB308"; // Yellow 500
          else areaColor = "FF94A3B8"; // Slate 400
          
          areaCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: areaColor } };
          areaCell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" }, name: "Arial" };
        } else if (rowIndex - 1 === startRowForMergeArea) {
          const areaCell = sheet.getCell(`B${startRowForMergeArea}`);
          areaCell.alignment = { vertical: "middle", horizontal: "center", wrapText: true, textRotation: 90 };
          
          let areaColor = "FFF4F4F5"; 
          if (type === 'vueltas') areaColor = "FF22C55E";
          else if (type === 'horometro') areaColor = "FFEAB308";
          else areaColor = "FF94A3B8";
          
          areaCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: areaColor } };
          areaCell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" }, name: "Arial" };
        }

      }); // Fin productos
      
      // Espacio entre tablas de la misma ubicacion no es necesario, pero añadimos una fila final de borde o vacia
      sheet.addRow([]);
      rowIndex++;

    }); // Fin ubicaciones

    // Estilizar todas las filas de datos
    sheet.eachRow((row, rowNumber) => {
      const detalleCell = row.getCell('detalle');
      // Solo aplicamos bordes a las filas que tienen detalle y que no son los titulos
      if (detalleCell.value && detalleCell.value !== 'DETALLE' && rowNumber > 3) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber === sheet.getColumn("costo_total").number) {
             cell.numFmt = '"S/."#,##0.00';
          }
          
          if (!cell.border) {
            cell.border = {
              top: { style: "thin", color: { argb: "FFCBD5E1" } },
              bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
              left: { style: "thin", color: { argb: "FFCBD5E1" } },
              right: { style: "thin", color: { argb: "FFCBD5E1" } },
            };
          }
          if (colNumber > 4 && colNumber <= columns.length - 2) {
             cell.alignment = { vertical: "middle", horizontal: "center" };
          }
        });
      }
    });
  };

  buildMatrixSheet("Por Vueltas", vueltasLogs, mantenimientos, "vueltas");
  buildMatrixSheet("Por Horómetro", horometroLogs, mantenimientos, "horometro");
  buildMatrixSheet("Por Odómetro", odometroLogs, mantenimientos, "odometro");

};

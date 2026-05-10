import { useState, useMemo } from "react";
import type { RES_OrdenCompra } from "../../../../service/responses/ordenes-compra/orden-compra";
import { TipoComprobante } from "../../../../shared/enums/_generic/tipo-comprobante";

export const useComprobanteRecepcion = (orden: RES_OrdenCompra | undefined) => {
  const [incluirComprobante, setIncluirComprobante] = useState(false);

  // Datos básicos
  const [tipoComprobante, setTipoComprobante] = useState<string>(
    TipoComprobante.Factura,
  );
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [fechaEmision, setFechaEmision] = useState<Date | null>(new Date());
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);

  // Financieros
  const [moneda, setMoneda] = useState(orden?.moneda || "Soles");
  const [tipoCambio, setTipoCambio] = useState<number>(1);
  const [esAuditable, setEsAuditable] = useState(false);

  const [totalAntesIgv, setTotalAntesIgv] = useState<number>(0);
  const [incluyeIgv, setIncluyeIgv] = useState(orden?.incluye_igv ?? true);
  const [porcentajeIgv, setPorcentajeIgv] = useState<number>(
    orden?.porcentaje_igv ?? 18,
  );
  const [montoIgv, setMontoIgv] = useState<number>(0);
  const [totalDespuesIgv, setTotalDespuesIgv] = useState<number>(0);

  // Cálculos automáticos
  const handleUpdateTotalAntes = (val: number) => {
    const igvDecimal = porcentajeIgv / 100;
    const antes = val;
    const despues = antes * (1 + igvDecimal);
    const igv = despues - antes;

    setTotalAntesIgv(Number(antes.toFixed(2)));
    setMontoIgv(Number(igv.toFixed(2)));
    setTotalDespuesIgv(Number(despues.toFixed(2)));
  };

  const handleUpdateTotalDespues = (val: number) => {
    const igvDecimal = porcentajeIgv / 100;
    const despues = val;
    const antes = despues / (1 + igvDecimal);
    const igv = despues - antes;

    setTotalAntesIgv(Number(antes.toFixed(2)));
    setMontoIgv(Number(igv.toFixed(2)));
    setTotalDespuesIgv(Number(despues.toFixed(2)));
  };

  // Sincronizar con la OC solo cuando cambia el id de la OC
  const [prevId, setPrevId] = useState(orden?.id_orden_compra);
  if (orden && orden.id_orden_compra !== prevId) {
    setPrevId(orden.id_orden_compra);
    setMoneda(orden.moneda);
    setIncluyeIgv(orden.incluye_igv);
    setPorcentajeIgv(orden.porcentaje_igv);
    setEsAuditable(orden.detalles?.some((d) => d.es_auditable) || false);
  }

  const financialsSoles = useMemo(() => {
    const tc = Number(tipoCambio) || 1;
    return {
      total_antes_igv_soles: totalAntesIgv * tc,
      monto_igv_soles: montoIgv * tc,
      total_despues_igv_soles: totalDespuesIgv * tc,
    };
  }, [totalAntesIgv, montoIgv, totalDespuesIgv, tipoCambio]);

  return {
    incluirComprobante,
    setIncluirComprobante,
    //
    tipoComprobante,
    setTipoComprobante,
    serie,
    setSerie,
    numero,
    setNumero,
    fechaEmision,
    setFechaEmision,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    //
    moneda,
    setMoneda,
    tipoCambio,
    setTipoCambio,
    esAuditable,
    setEsAuditable,
    //
    totalAntesIgv,
    setTotalAntesIgv: handleUpdateTotalAntes,
    incluyeIgv,
    setIncluyeIgv,
    porcentajeIgv,
    setPorcentajeIgv,
    montoIgv,
    setMontoIgv,
    totalDespuesIgv,
    setTotalDespuesIgv: handleUpdateTotalDespues,
    //
    ...financialsSoles,
  };
};

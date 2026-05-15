import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { TipoComprobante } from "../../../shared/enums/_generic/tipo-comprobante";
import { MONEDAS } from "../../../shared/variables/monedas";
import type { RES_OrdenCompra } from "../../../service/responses/ordenes-compra/orden-compra";
import { OrdenCompraService } from "../service/orden-compra.service";
import type { REQ_RegistrarOCComprobante } from "../service/recepcion.requests";
import { useNotify } from "../../../hooks/useNotify";

interface UseRegistroComprobanteProps {
  orden: RES_OrdenCompra;
  ids_recepciones: number[];
  onSuccess: () => void;
}

export const useRegistroComprobante = ({
  orden,
  ids_recepciones,
  onSuccess,
}: UseRegistroComprobanteProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const [loading, setLoading] = useState(false);
  const [evidencias, setEvidencias] = useState<File[]>([]);

  const [form, setForm] = useState({
    tipo_comprobante: TipoComprobante.Factura as string,
    serie: "",
    numero: "",
    fecha_emision: null as unknown as Date,
    observacion: "",
    moneda: orden.moneda,
    tipo_cambio_venta_aplicado: orden.tipo_cambio_aplicado,
    es_auditable: orden.es_auditable,
    total_antes_igv: 0,
    incluye_igv: orden.incluye_igv,
    porcentaje_igv: orden.porcentaje_igv,
    monto_igv: 0,
    total_despues_igv: 0,
  });

  // Hydration fix
  useEffect(() => {
    setForm((prev) => ({ ...prev, fecha_emision: new Date() }));
  }, []);

  const handleUpdateTotalDespues = useCallback(
    (val: number) => {
      const igvDecimal = form.porcentaje_igv / 100;
      const despues = val;
      const antes = despues / (1 + igvDecimal);
      const igv = despues - antes;

      setForm((prev) => ({
        ...prev,
        total_antes_igv: Number(antes.toFixed(2)),
        monto_igv: Number(igv.toFixed(2)),
        total_despues_igv: Number(despues.toFixed(2)),
      }));
    },
    [form.porcentaje_igv],
  );

  const handleRegistrar = async () => {
    if (!form.serie || !form.numero) {
      notifyError("Debe ingresar la serie y el número del comprobante");
      return;
    }

    if (form.total_despues_igv <= 0) {
      notifyError("El total del comprobante debe ser mayor a 0");
      return;
    }

    setLoading(true);
    try {
      const tc =
        form.moneda === MONEDAS.PEN.label ? 1 : form.tipo_cambio_venta_aplicado;

      const payload: REQ_RegistrarOCComprobante = {
        id_orden_compra: orden.id_orden_compra,
        tipo_comprobante: form.tipo_comprobante,
        serie: form.serie,
        numero: form.numero,
        fecha_emision: dayjs(form.fecha_emision).format("YYYY-MM-DD"),
        observacion: form.observacion,
        moneda: form.moneda,
        tipo_cambio_venta_aplicado: tc,
        es_auditable: form.es_auditable,
        total_antes_igv: form.total_antes_igv,
        total_antes_igv_soles: form.total_antes_igv * tc,
        incluye_igv: form.incluye_igv,
        porcentaje_igv: form.porcentaje_igv,
        monto_igv: form.monto_igv,
        monto_igv_soles: form.monto_igv * tc,
        total_despues_igv: form.total_despues_igv,
        total_despues_igv_soles: form.total_despues_igv * tc,
        ids_recepciones: JSON.stringify(ids_recepciones),
      };

      const res = await OrdenCompraService.registrarComprobante(
        payload,
        evidencias,
      );

      if (res.success) {
        notifySuccess("Comprobante registrado correctamente");
        onSuccess();
      } else {
        notifyError(res.message || "No se pudo registrar el comprobante");
      }
    } catch (error) {
      console.error(error);
      notifyError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    evidencias,
    setEvidencias,
    handleUpdateTotalDespues,
    handleRegistrar,
  };
};

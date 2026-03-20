import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import { ReabastecimientoService } from "../service/reabastecimiento.service";
import { notifications } from "@mantine/notifications";
import type {
  RES_DetalleEntregaReabastecimiento,
  DTO_RecibirEntregas,
  RES_LoteRecepcion,
} from "../service/reabastecimiento.responses";

interface FormItem {
  id_solicitud_reabastecimiento_detalle: number;
  es_nuevo_lote: boolean;
  id_lote_existente: number | null;
  fecha_vencimiento: string | null;
}

interface FormRegistroRecepcion {
  items: FormItem[];
}

interface UseRegistroRecepcionProps {
  idEntrega: number;
  detalles: RES_DetalleEntregaReabastecimiento[];
  onSuccess: () => void;
}

export const useRegistroRecepcion = ({
  idEntrega,
  detalles,
  onSuccess,
}: UseRegistroRecepcionProps) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const [lotesDestino, setLotesDestino] = useState<RES_LoteRecepcion[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(false);

  const form = useForm<FormRegistroRecepcion>({
    initialValues: {
      items: detalles.map((d) => ({
        id_solicitud_reabastecimiento_detalle: d.id_solicitud_reabastecimiento_detalle,
        es_nuevo_lote: false,
        id_lote_existente: null,
        codigo_lote: d.correlativo || "",
        fecha_vencimiento: null,
      })),
    },
    validate: {
      items: {
        id_lote_existente: (val, values, path) => {
          const indexStr = path.split(".")[1];
          if (!indexStr) return null;
          const index = parseInt(indexStr);
          const item = values.items[index];
          if (!item.es_nuevo_lote && !val) {
            return "Requerido si ajusta stock";
          }
          return null;
        },
      },
    },
  });

  useEffect(() => {
    if (detalles && detalles.length > 0) {
      const sorted = [...detalles].sort((a, b) => {
        if (a.correlativo && b.correlativo) {
          return a.correlativo.localeCompare(b.correlativo);
        }
        return 0;
      });
      form.setValues({
        items: sorted.map((d) => ({
          id_solicitud_reabastecimiento_detalle: d.id_solicitud_reabastecimiento_detalle,
          es_nuevo_lote: false,
          id_lote_existente: null,
          fecha_vencimiento: null,
        })),
      });
    }
  }, [detalles]);

  useEffect(() => {
    let mounted = true;
    const fetchLotes = async () => {
      setLoadingLotes(true);
      try {
        const res = await ReabastecimientoService.getLotesDestino(idEntrega);
        if (mounted && res.success) {
          setLotesDestino(res.data || []);
        }
      } catch (error) {
        console.error("Error cargando lotes destino:", error);
      } finally {
        if (mounted) setLoadingLotes(false);
      }
    };
    fetchLotes();
    return () => {
      mounted = false;
    };
  }, [idEntrega]);

  const handleSubmit = async (values: FormRegistroRecepcion) => {
    try {
      setLoadingAction(true);

      const payload: DTO_RecibirEntregas = {
        id_reabastecimiento_entrega: idEntrega,
        items: values.items.map((item) => ({
          id_solicitud_reabastecimiento_detalle: item.id_solicitud_reabastecimiento_detalle,
          es_nuevo_lote: item.es_nuevo_lote,
          id_lote_existente: item.id_lote_existente,
          fecha_vencimiento: item.fecha_vencimiento,
        })),
      };

      await ReabastecimientoService.recibirEntregas(payload);
      notifications.show({
        title: "Éxito",
        message: "Ítems recibidos y stock ajustado correctamente",
        color: "teal",
      });
      onSuccess();
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al procesar las recepciones",
        color: "red",
      });
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    form,
    loadingAction,
    loadingLotes,
    lotesDestino,
    handleSubmit: form.onSubmit(handleSubmit),
  };
};

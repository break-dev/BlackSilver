import { useState, useEffect } from "react";
import { Stack, Text, Button, NumberInput, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { ControlConsumoService } from "../../service/control-consumo.service";
import { useNotify } from "../../../../hooks/useNotify";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import type {
  RES_ConsumoDetalle,
  RES_ControlConsumo,
} from "../../service/control-consumo.responses";

interface ModalRegistroConsumoProps {
  opened: boolean;
  close: () => void;
  selectedDetail: RES_ControlConsumo | null;
  onSuccess: (nuevoConsumo: RES_ConsumoDetalle) => void;
}

export const ModalRegistroConsumo = ({
  opened,
  close,
  selectedDetail,
  onSuccess,
}: ModalRegistroConsumoProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const [formCantidad, setFormCantidad] = useState<number | string>("");
  const [formFechaHora, setFormFechaHora] = useState<Date | null>(new Date());
  const [formComentario, setFormComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (opened) {
      setFormCantidad("");
      setFormFechaHora(new Date());
      setFormComentario("");
    }
  }, [opened]);

  const handleSubmitConsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetail || !formCantidad || !formFechaHora) return;

    const restante =
      selectedDetail.cantidad_entregada_base -
      selectedDetail.cantidad_consumida_base;
    if (Number(formCantidad) > restante) {
      notifyError(
        "La cantidad ingresada supera la cantidad restante por consumir.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const resp = await ControlConsumoService.registrarConsumo({
        id_requerimiento_almacen_entrega_detalle:
          selectedDetail.id_entrega_requerimiento_detalle,
        cantidad_base_consumida: Number(formCantidad),
        fecha_hora_consumo: dayjs(formFechaHora).format("YYYY-MM-DD HH:mm:ss"),
        comentario_consumo: formComentario.trim() || null,
      });

      if (resp.success && resp.data) {
        notifySuccess("Consumo registrado correctamente.");
        close();
        onSuccess(resp.data);
      } else {
        notifyError(resp.message || "Error al registrar el consumo.");
      }
    } catch (err) {
      console.error(err);
      notifyError("Ocurrió un error al conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalFieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-semibold text-xs ml-0.5",
  };

  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title="Registrar Consumo de Insumo"
      size="md"
    >
      {selectedDetail && (
        <form onSubmit={handleSubmitConsumo}>
          <Stack gap="md">
            {/* Product Info Summary Box */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 flex flex-col gap-2">
              <Text
                size="xs"
                fw={800}
                className="text-zinc-400 uppercase tracking-widest mb-0.5"
              >
                Producto a Consumir
              </Text>
              <Text size="sm" fw={900} className="text-white font-bold">
                {selectedDetail.producto}
              </Text>

              <div className="grid grid-cols-3 gap-2 mt-1 pt-2 border-t border-zinc-900/80">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 font-extrabold uppercase">
                    Entregado
                  </span>
                  <span className="text-xs text-zinc-300 font-bold">
                    {formatNumber(selectedDetail.cantidad_entregada_base)}{" "}
                    {selectedDetail.unidad_medida_base_abv}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 font-extrabold uppercase">
                    Consumido
                  </span>
                  <span className="text-xs text-zinc-300 font-bold">
                    {formatNumber(selectedDetail.cantidad_consumida_base)}{" "}
                    {selectedDetail.unidad_medida_base_abv}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 font-extrabold uppercase">
                    Restante
                  </span>
                  <span className="text-xs text-amber-400 font-extrabold">
                    {formatNumber(
                      selectedDetail.cantidad_entregada_base -
                        selectedDetail.cantidad_consumida_base,
                    )}{" "}
                    {selectedDetail.unidad_medida_base_abv}
                  </span>
                </div>
              </div>
            </div>

            {/* NumberInput for quantity */}
            <NumberInput
              label={`Cantidad a Consumir (${selectedDetail.unidad_medida_base_abv})`}
              placeholder={`Ingrese cantidad en ${selectedDetail.unidad_medida_base_abv}...`}
              value={formCantidad}
              onChange={(val) => {
                const maxVal =
                  selectedDetail.cantidad_entregada_base -
                  selectedDetail.cantidad_consumida_base;
                if (typeof val === "number") {
                  setFormCantidad(val > maxVal ? maxVal : val);
                } else {
                  const num = parseFloat(val);
                  if (!isNaN(num) && num > maxVal) {
                    setFormCantidad(maxVal);
                  } else {
                    setFormCantidad(val);
                  }
                }
              }}
              min={0.0001}
              max={
                selectedDetail.cantidad_entregada_base -
                selectedDetail.cantidad_consumida_base
              }
              clampBehavior="strict"
              decimalScale={4}
              step={0.1}
              required
              radius="lg"
              size="sm"
              classNames={modalFieldClasses}
            />

            {/* DateTimePicker for consumption time */}
            <DateTimePicker
              label="Fecha y Hora de Consumo"
              placeholder="Seleccione fecha y hora..."
              value={formFechaHora}
              onChange={(val) => setFormFechaHora(val ? new Date(val) : null)}
              maxDate={new Date()}
              required
              radius="lg"
              size="sm"
              classNames={modalFieldClasses}
            />

            {/* Textarea for comments */}
            <Textarea
              label="Comentario / Justificación"
              placeholder="Ingrese detalles del consumo (ej. medio litro se regó)..."
              value={formComentario}
              onChange={(e) => setFormComentario(e.currentTarget.value)}
              radius="lg"
              size="sm"
              minRows={3}
              classNames={modalFieldClasses}
            />

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-zinc-900/60 font-semibold">
              <Button
                variant="subtle"
                color="gray"
                radius="lg"
                size="sm"
                onClick={close}
                disabled={submitting}
                className="hover:bg-zinc-900"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                color="indigo"
                radius="lg"
                size="sm"
                loading={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-900/20"
              >
                Registrar Consumo
              </Button>
            </div>
          </Stack>
        </form>
      )}
    </ModalEstandar>
  );
};

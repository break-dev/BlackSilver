import { useState } from "react";
import dayjs from "dayjs";
import {
  Stack,
  Group,
  Select,
  TextInput,
  NumberInput,
  Checkbox,
  Textarea,
  Button,
  Text,
  Paper,
  Divider,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  DocumentTextIcon,
  BanknotesIcon,
  CalendarIcon,
  ChatBubbleLeftEllipsisIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { notifications } from "@mantine/notifications";
import type { RES_OrdenCompra } from "../../../../service/responses/ordenes-compra/orden-compra";
import { OrdenCompraService } from "../../service/orden-compra.service";
import type { REQ_RegistrarOCComprobante } from "../../service/recepcion.requests";
import { MultiFilePicker } from "../../../../presentation/utils/archivo/multifile-picker";
import { TipoComprobante } from "../../../../shared/enums/_generic/tipo-comprobante";
import { MONEDAS } from "../../../../shared/variables/monedas";
import type { Moneda } from "../../../../shared/enums/_generic/moneda";

interface Props {
  orden: RES_OrdenCompra;
  ids_recepciones: number[];
  onSuccess: () => void;
}

export const RegistroComprobante = ({
  orden,
  ids_recepciones,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [evidencias, setEvidencias] = useState<File[]>([]);

  const [form, setForm] = useState({
    tipo_comprobante: TipoComprobante.Factura as string,
    serie: "",
    numero: "",
    fecha_emision: new Date(),
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

  const handleUpdateTotalAntes = (val: number) => {
    const igvDecimal = form.porcentaje_igv / 100;
    const antes = val;
    const despues = antes * (1 + igvDecimal);
    const igv = despues - antes;

    setForm({
      ...form,
      total_antes_igv: Number(antes.toFixed(2)),
      monto_igv: Number(igv.toFixed(2)),
      total_despues_igv: Number(despues.toFixed(2)),
    });
  };

  const handleUpdateTotalDespues = (val: number) => {
    const igvDecimal = form.porcentaje_igv / 100;
    const despues = val;
    const antes = despues / (1 + igvDecimal);
    const igv = despues - antes;

    setForm({
      ...form,
      total_antes_igv: Number(antes.toFixed(2)),
      monto_igv: Number(igv.toFixed(2)),
      total_despues_igv: Number(despues.toFixed(2)),
    });
  };

  const handleRegistrar = async () => {
    if (!form.serie || !form.numero) {
      notifications.show({
        title: "Error",
        message: "Debe ingresar la serie y el número del comprobante",
        color: "red",
      });
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
        notifications.show({
          title: "Éxito",
          message: "Comprobante registrado correctamente",
          color: "green",
        });
        onSuccess();
      } else {
        notifications.show({
          title: "Error",
          message: res.message || "No se pudo registrar el comprobante",
          color: "red",
        });
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Error",
        message: "Ocurrió un error inesperado",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="xl" className="font-sans">
      <Paper
        radius="xl"
        className="bg-zinc-900/30 border border-zinc-800/80 p-6 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Datos Generales */}
          <Stack gap="lg">
            <Group gap="xs">
              <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
              <Text
                fw={900}
                size="sm"
                className="text-white uppercase tracking-widest"
              >
                Información del Comprobante
              </Text>
            </Group>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Tipo Comprobante"
                data={Object.values(TipoComprobante)}
                value={form.tipo_comprobante}
                onChange={(val) =>
                  setForm({ ...form, tipo_comprobante: val || "" })
                }
                radius="md"
                classNames={{
                  input: "bg-zinc-950 border-zinc-800",
                  label: "text-zinc-500 font-bold mb-1 uppercase text-[10px]",
                }}
              />
              <DateTimePicker
                label="Fecha de Emisión"
                value={form.fecha_emision}
                onChange={(val) => {
                  const dateValue = val
                    ? new Date(val as string | Date)
                    : new Date();
                  setForm({ ...form, fecha_emision: dateValue });
                }}
                radius="md"
                leftSection={<CalendarIcon className="w-4 h-4 text-zinc-500" />}
                classNames={{
                  input: "bg-zinc-950 border-zinc-800",
                  label: "text-zinc-500 font-bold mb-1 uppercase text-[10px]",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Serie"
                placeholder="F001"
                value={form.serie}
                onChange={(e) =>
                  setForm({
                    ...form,
                    serie: e.currentTarget.value.toUpperCase(),
                  })
                }
                radius="md"
                classNames={{
                  input: "bg-zinc-950 border-zinc-800",
                  label: "text-zinc-500 font-bold mb-1 uppercase text-[10px]",
                }}
              />
              <TextInput
                label="Número"
                placeholder="000123"
                value={form.numero}
                onChange={(e) =>
                  setForm({ ...form, numero: e.currentTarget.value })
                }
                radius="md"
                classNames={{
                  input: "bg-zinc-950 border-zinc-800",
                  label: "text-zinc-500 font-bold mb-1 uppercase text-[10px]",
                }}
              />
            </div>

            <Group gap="xl">
              <Select
                label="Moneda"
                data={Object.values(MONEDAS).map((m) => ({
                  value: m.label,
                  label: m.label,
                }))}
                value={form.moneda}
                onChange={(val) =>
                  setForm({
                    ...form,
                    moneda: val as Moneda,
                  })
                }
                radius="md"
                className="w-32"
                disabled
                classNames={{
                  input: "bg-zinc-950 border-zinc-800",
                  label: "text-zinc-500 font-bold mb-1 uppercase text-[10px]",
                }}
              />
              {form.moneda !== MONEDAS.PEN.label && (
                <NumberInput
                  label="Tipo de Cambio"
                  value={form.tipo_cambio_venta_aplicado}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      tipo_cambio_venta_aplicado: Number(val),
                    })
                  }
                  radius="md"
                  decimalScale={3}
                  fixedDecimalScale
                  disabled
                  className="flex-1"
                  classNames={{
                    input: "bg-zinc-950 border-zinc-800",
                    label: "text-zinc-500 font-bold mb-1 uppercase text-[10px]",
                  }}
                />
              )}
            </Group>

            <Checkbox
              label="Es Comprobante Auditable"
              checked={form.es_auditable}
              disabled
              onChange={(e) =>
                setForm({ ...form, es_auditable: e.currentTarget.checked })
              }
              color="indigo"
              size="xs"
              classNames={{
                label: "text-zinc-400 font-bold uppercase text-[10px]",
              }}
            />
          </Stack>

          {/* Datos Financieros */}
          <Stack gap="lg">
            <Group gap="xs">
              <BanknotesIcon className="w-5 h-5 text-indigo-400" />
              <Text
                fw={900}
                size="sm"
                className="text-white uppercase tracking-widest"
              >
                Montos y Totales
              </Text>
            </Group>

            <Paper className="bg-zinc-950/40 border border-zinc-800/40 p-5 rounded-2xl">
              <Stack gap="md">
                <Checkbox
                  label="Ingresar monto incluyendo IGV"
                  checked={form.incluye_igv}
                  disabled
                  onChange={(e) =>
                    setForm({ ...form, incluye_igv: e.currentTarget.checked })
                  }
                  color="indigo"
                  size="xs"
                  classNames={{
                    label: "text-zinc-400 font-bold uppercase text-[10px]",
                  }}
                />
                <NumberInput
                  label="% IGV"
                  value={form.porcentaje_igv}
                  disabled
                  onChange={(val) =>
                    setForm({ ...form, porcentaje_igv: Number(val) || 18 })
                  }
                  radius="md"
                  size="xs"
                  classNames={{
                    input: "bg-zinc-950 border-zinc-800",
                    label: "text-zinc-500 font-bold mb-1 uppercase text-[10px]",
                  }}
                />

                {form.incluye_igv ? (
                  <NumberInput
                    label="Total Comprobante (Inc. IGV)"
                    value={form.total_despues_igv}
                    onChange={(val) =>
                      handleUpdateTotalDespues(Number(val) || 0)
                    }
                    radius="md"
                    size="md"
                    decimalScale={2}
                    fixedDecimalScale
                    leftSection={
                      <Text size="sm" fw={900} c="zinc.5">
                        {form.moneda === MONEDAS.PEN.label ? "S/." : "$"}
                      </Text>
                    }
                    classNames={{
                      input:
                        "bg-zinc-900 border-indigo-500/30 text-white font-black",
                      label:
                        "text-indigo-400 font-black mb-1 uppercase text-[11px]",
                    }}
                  />
                ) : (
                  <NumberInput
                    label="Subtotal (Sin IGV)"
                    value={form.total_antes_igv}
                    onChange={(val) => handleUpdateTotalAntes(Number(val) || 0)}
                    radius="md"
                    size="md"
                    decimalScale={2}
                    fixedDecimalScale
                    leftSection={
                      <Text size="sm" fw={900} c="zinc.5">
                        {form.moneda === MONEDAS.PEN.label ? "S/." : "$"}
                      </Text>
                    }
                    classNames={{
                      input: "bg-zinc-900 border-zinc-800",
                      label:
                        "text-zinc-500 font-bold mb-1 uppercase text-[10px]",
                    }}
                  />
                )}

                <Divider color="zinc.8" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Text
                      size="10px"
                      fw={800}
                      c="zinc.5"
                      className="uppercase tracking-widest"
                    >
                      Base Imponible
                    </Text>
                    <Text fw={800} size="sm" c="zinc.3">
                      {form.moneda === MONEDAS.PEN.label ? "S/." : "$"}{" "}
                      {form.total_antes_igv.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text
                      size="10px"
                      fw={800}
                      c="zinc.5"
                      className="uppercase tracking-widest"
                    >
                      IGV ({form.porcentaje_igv}%)
                    </Text>
                    <Text fw={800} size="sm" c="indigo.4">
                      +{form.moneda === MONEDAS.PEN.label ? "S/." : "$"}{" "}
                      {form.monto_igv.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                </div>

                {!form.incluye_igv && (
                  <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-right">
                    <Text
                      size="10px"
                      fw={800}
                      c="indigo.4"
                      className="uppercase tracking-[0.2em] mb-1"
                    >
                      Total Calculado
                    </Text>
                    <Text fw={900} size="xl" className="text-white">
                      {form.moneda === MONEDAS.PEN.label ? "S/." : "$"}{" "}
                      {form.total_despues_igv.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                )}
              </Stack>
            </Paper>
          </Stack>
        </div>

        <Divider my="xl" color="zinc.8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Stack gap="md">
            <Group gap="xs">
              <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-zinc-500" />
              <Text
                fw={900}
                size="sm"
                className="text-zinc-400 uppercase tracking-widest"
              >
                Observaciones
              </Text>
            </Group>
            <Textarea
              placeholder="Notas adicionales sobre este comprobante..."
              value={form.observacion}
              onChange={(e) =>
                setForm({ ...form, observacion: e.currentTarget.value })
              }
              radius="md"
              minRows={4}
              classNames={{
                input: "bg-zinc-950 border-zinc-800 text-zinc-300",
                label: "hidden",
              }}
            />
          </Stack>

          <Stack gap="md">
            <Group gap="xs">
              <CloudArrowUpIcon className="w-5 h-5 text-zinc-500" />
              <Text
                fw={900}
                size="sm"
                className="text-zinc-400 uppercase tracking-widest"
              >
                Evidencias (PDF/Imagen)
              </Text>
            </Group>
            <MultiFilePicker
              label="Adjuntar Comprobantes"
              description="Máximo 5 archivos"
              multiple
              files={evidencias}
              onFilesChange={setEvidencias}
            />
          </Stack>
        </div>
      </Paper>

      <Group justify="flex-end" mt="xl">
        <Button
          variant="subtle"
          color="zinc"
          onClick={() => onSuccess()}
          className="font-bold text-zinc-500 hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          variant="gradient"
          gradient={{ from: "indigo.6", to: "cyan.6" }}
          size="md"
          radius="xl"
          loading={loading}
          onClick={handleRegistrar}
          className="font-black shadow-lg shadow-indigo-500/20 px-10"
        >
          REGISTRAR COMPROBANTE
        </Button>
      </Group>
    </Stack>
  );
};

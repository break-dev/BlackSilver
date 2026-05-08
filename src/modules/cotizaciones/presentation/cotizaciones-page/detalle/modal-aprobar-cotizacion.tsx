import { useState } from "react";
import {
  Stack,
  Text,
  Button,
  Group,
  Checkbox,
  Select,
  Badge,
  NumberInput,
} from "@mantine/core";
import { CheckBadgeIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { ModalEstandar } from "../../../../../presentation/utils/modal-estandar";
import { CotizacionesService } from "../../../service/cotizaciones.service";
import { useNotify } from "../../../../../hooks/useNotify";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import { useAprobacionCotizacion } from "../../../hooks/aprobacion/useAprobacionCotizacion";

import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../../../../../service/responses/cotizaciones/cotizacion";

interface ModalAprobarCotizacionProps {
  opened: boolean;
  onClose: () => void;
  cotizacion: RES_Cotizacion | null;
  detalles: RES_CotizacionDetalle[];
  empresas: {
    id_cotizacion: number;
    id_empresa: number;
    razon_social: string;
  }[];
  onSuccess: (
    id_cotizacion: number,
    cotizacionModificada: RES_Cotizacion,
    detallesAprobados: RES_CotizacionDetalle[],
    id_orden_compra?: number,
  ) => void;
}

export const ModalAprobarCotizacion = ({
  opened,
  onClose,
  cotizacion,
  detalles,
  empresas,
  onSuccess,
}: ModalAprobarCotizacionProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const [loading, setLoading] = useState(false);

  // ─── Hook centralizado de aprobación ────────────────────────────────────────
  const aprobacion = useAprobacionCotizacion({
    moneda: cotizacion?.moneda ?? "Soles",
    opened,
    detalles: detalles.map((d) => ({
      key: d.id_cotizacion_detalle,
      precio_referencia: Number(d.precio_unitario ?? 0),
      habilitado: true,
    })),
    initialEmpresaId: empresas[0]?.id_empresa.toString() ?? null,
    initialTipoCambio: cotizacion?.tipo_cambio_venta_referencial || "",
  });

  const {
    state,
    allSelected,
    indeterminate,
    toggleKey,
    toggleAll,
    setPrecioOC,
    validate,
    getSubtotal,
    getVariacion,
    tipoCambioAplicado,
  } = aprobacion;

  const handleConfirm = async () => {
    if (!cotizacion) return;
    const error = validate();
    if (error) { notifyError(error); return; }

    try {
      setLoading(true);
      const res = await CotizacionesService.aprobar_cotizacion(
        cotizacion.id_cotizacion,
        {
          id_empresa_compradora: Number(state.selectedEmpresaId),
          detalles_aprobados: state.selectedKeys.map((id) => ({
            id,
            precio_confirmado: Number(state.preciosOC[id] ?? 0),
          })),
          tipo_cambio_aplicado: tipoCambioAplicado,
        },
      );

      if (res.success && res.data) {
        notifySuccess(
          `Orden de Compra ${res.data.correlativo} generada correctamente.`,
        );
        const cotDetallesAprobados = detalles.filter((d) =>
          state.selectedKeys.includes(d.id_cotizacion_detalle),
        );
        onSuccess(
          cotizacion.id_cotizacion,
          cotizacion,
          cotDetallesAprobados,
          res.data.id_orden_compra,
        );
        onClose();
      } else {
        notifyError(res.message);
      }
    } catch (e) {
      console.error(e);
      notifyError("No se pudo procesar la aprobación.");
    } finally {
      setLoading(false);
    }
  };

  if (!cotizacion) return null;

  const simbolo = cotizacion.moneda === "Soles" ? "S/." : "$";

  return (
    <ModalEstandar
      opened={opened}
      close={onClose}
      onClose={onClose}
      title="Aprobar Cotización"
      size="xl"
    >
      <Stack gap="lg" className="p-1">
        {/* Banner Informativo */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-4">
          <ShoppingCartIcon className="w-8 h-8 text-indigo-400 shrink-0" />
          <Stack gap={0} className="flex-1">
            <Text size="sm" fw={800} className="text-white">
              Generación de Orden de Compra
            </Text>
            <Text size="xs" c="dimmed">
              Seleccione la empresa facturadora y verifique los productos que
              desea incluir en esta compra. Cotización actual:{" "}
              <span className="text-indigo-300 font-bold">
                {cotizacion.correlativo}
              </span>
            </Text>
          </Stack>
        </div>

        {/* Empresa Compradora */}
        <Stack gap={4}>
          <Text size="sm" fw={800} className="text-zinc-200">
            Empresa Compradora
          </Text>
          <Select
            placeholder="Seleccione la empresa"
            data={empresas.map((e) => ({
              value: e.id_empresa.toString(),
              label: e.razon_social,
            }))}
            value={state.selectedEmpresaId}
            onChange={(val) =>
              aprobacion.setState((prev) => ({ ...prev, selectedEmpresaId: val }))
            }
            classNames={{
              input: "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500",
              dropdown: "bg-zinc-900 border-zinc-800 dark",
              option: "hover:bg-indigo-500/20 data-[checked]:bg-indigo-500",
            }}
          />
        </Stack>

        {/* Tipo de Cambio */}
        {cotizacion.moneda !== "Soles" && (
          <Stack gap={4}>
            <Text size="sm" fw={800} className="text-zinc-200">
              Tipo de Cambio Venta (S/.)
            </Text>
            <NumberInput
              placeholder="Ej. 3.85"
              value={state.tipoCambio}
              onChange={(val) =>
                aprobacion.setState((prev) => ({
                  ...prev,
                  tipoCambio: val === "" ? "" : Number(val),
                }))
              }
              decimalScale={4}
              min={0}
              classNames={{
                input: "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500",
              }}
            />
          </Stack>
        )}

        {/* Selección de Productos */}
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={800} className="text-zinc-200">
              Productos Cotizados
            </Text>
            <Checkbox
              size="sm"
              color="indigo"
              checked={allSelected}
              indeterminate={indeterminate}
              label={
                <Text size="xs" c="dimmed" fw={700}>
                  Seleccionar Todos
                </Text>
              }
              onChange={toggleAll}
              classNames={{ label: "cursor-pointer" }}
            />
          </Group>

          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden max-h-[40vh] overflow-y-auto custom-scrollbar">
            {detalles.map((det) => {
              const key = det.id_cotizacion_detalle;
              const isChecked = state.selectedKeys.includes(key);
              const precioRef = Number(det.precio_unitario ?? 0);
              const variacion = getVariacion(key, precioRef);

              return (
                <div
                  key={key}
                  className={`p-3 border-b border-zinc-800/50 transition-colors last:border-b-0 ${
                    isChecked ? "bg-indigo-500/5" : "opacity-60"
                  }`}
                >
                  <Group wrap="nowrap" justify="space-between" gap="sm">
                    {/* Checkbox + info */}
                    <Group gap="sm" align="flex-start" className="flex-1 min-w-0">
                      <Checkbox
                        size="sm"
                        checked={isChecked}
                        onChange={() => toggleKey(key)}
                        color="indigo"
                        radius="sm"
                        className="mt-0.5"
                      />
                      <Stack gap={4} className="min-w-0">
                        <Text
                          size="xs"
                          fw={800}
                          className={isChecked ? "text-indigo-100" : "text-zinc-400"}
                        >
                          {det.producto}
                        </Text>
                        {/* precio unitario inline editable */}
                        <Group gap={4} align="center" wrap="nowrap">
                          <Text size="11px" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                            {formatNumber(det.cantidad)} {det.unidad_medida_ctz_abv} &middot; a
                          </Text>
                          <NumberInput
                            size="xs"
                            disabled={!isChecked}
                            value={state.preciosOC[key] ?? ""}
                            onChange={(val) =>
                              setPrecioOC(key, val === "" ? "" : Number(val))
                            }
                            decimalScale={4}
                            min={0}
                            prefix={`${simbolo} `}
                            className="w-28"
                            classNames={{
                              input: `bg-zinc-800 border-zinc-700 text-white text-xs font-bold focus:border-indigo-500 h-6 py-0 ${
                                !isChecked ? "opacity-40" : ""
                              }`,
                            }}
                          />
                          <Text size="11px" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                            c/u
                          </Text>
                          {isChecked && variacion !== null && (
                            <Badge
                              size="xs"
                              variant="light"
                              color={variacion > 0 ? "red" : "teal"}
                            >
                              {variacion > 0 ? "+" : ""}{simbolo}{" "}
                              {formatNumber(Math.abs(variacion))} vs cotización
                            </Badge>
                          )}
                        </Group>
                      </Stack>
                    </Group>

                    {/* Subtotal dinámico */}
                    <Badge
                      variant="light"
                      color={isChecked ? "indigo" : "gray"}
                      size="sm"
                      className="shrink-0"
                    >
                      Sub: {simbolo}{" "}
                      {formatNumber(getSubtotal(key, Number(det.cantidad), precioRef))}
                    </Badge>
                  </Group>
                </div>
              );
            })}
          </div>
        </Stack>

        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="subtle" color="zinc" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="filled"
            color="green"
            leftSection={<CheckBadgeIcon className="w-4 h-4" />}
            onClick={handleConfirm}
            loading={loading}
            className="shadow-lg shadow-green-900/20"
          >
            Confirmar Orden de Compra
          </Button>
        </Group>
      </Stack>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}</style>
    </ModalEstandar>
  );
};

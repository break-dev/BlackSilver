import { useEffect, useState } from "react";
import {
  Stack,
  Text,
  Button,
  Group,
  Checkbox,
  Select,
  Badge,
} from "@mantine/core";
import { CheckBadgeIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../../service/cotizaciones.responses";
import { CotizacionesService } from "../../service/cotizaciones.service";
import { useNotify } from "../../../../hooks/useNotify";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { usePrint } from "../../../../hooks/usePrint";
import { OrdenCompraService } from "../../../orden-compra/service/orden-compra.service";
import { OrdenCompraPDF } from "../../../orden-compra/presentation/orden-compra-pdf";

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
  const { print } = usePrint();

  const [loading, setLoading] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(
    null,
  );
  const [selectedDetalles, setSelectedDetalles] = useState<number[]>([]);

  useEffect(() => {
    if (opened && cotizacion) {
      // Iniciar con todos los detalles checkeados
      const ids = detalles.map((d) => d.id_cotizacion_detalle);
      setSelectedDetalles(ids);

      // Iniciar con la primera empresa seleccionada si existe
      if (empresas.length > 0) {
        setSelectedEmpresaId(empresas[0].id_empresa.toString());
      } else {
        setSelectedEmpresaId(null);
      }
    }
  }, [opened, cotizacion, detalles, empresas]);

  const toggleDetalle = (id: number) => {
    setSelectedDetalles((prev) =>
      prev.includes(id) ? prev.filter((detId) => detId !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedDetalles.length === detalles.length) {
      setSelectedDetalles([]); // Deseleccionar todos
    } else {
      setSelectedDetalles(detalles.map((d) => d.id_cotizacion_detalle)); // Seleccionar todos
    }
  };

  const handleConfirm = async () => {
    if (!cotizacion || !selectedEmpresaId) {
      notifyError("Debe seleccionar una empresa compradora.");
      return;
    }
    if (selectedDetalles.length === 0) {
      notifyError(
        "Debe seleccionar al menos un producto para la Orden de Compra.",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await CotizacionesService.aprobar_cotizacion(
        cotizacion.id_cotizacion,
        {
          id_empresa_compradora: Number(selectedEmpresaId),
          detalles_aprobados: selectedDetalles,
        },
      );

      if (res.success) {
        notifySuccess("Orden de compra generada correctamente.");

        // Lanzar PDF de OC automáticamente
        const ocId = res.data?.id_orden_compra;
        const ocCorrelativo = res.data?.correlativo;
        if (ocId) {
          const resDetalles = await OrdenCompraService.get_detalles(ocId);
          const resOrden = await OrdenCompraService.get_ordenes();
          if (resDetalles.success && resOrden.success) {
            const ordenData = resOrden.data.ordenes.find((o) => o.id === ocId);
            if (ordenData) {
              print(
                <OrdenCompraPDF
                  orden={ordenData}
                  detalles={resDetalles.data.detalles}
                />,
                { documentTitle: `OC - ${ocCorrelativo}` },
              );
            }
          }
        }

        const cotDetallesAprobados = detalles.filter((d) =>
          selectedDetalles.includes(d.id_cotizacion_detalle),
        );
        onSuccess(
          cotizacion.id_cotizacion,
          cotizacion,
          cotDetallesAprobados,
          ocId,
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

        {/* Seleccion de Empresa */}
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
            value={selectedEmpresaId}
            onChange={setSelectedEmpresaId}
            classNames={{
              input:
                "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500",
              dropdown: "bg-zinc-900 border-zinc-800 dark",
              option: "hover:bg-indigo-500/20 data-[checked]:bg-indigo-500",
            }}
          />
        </Stack>

        {/* Selección de Productos */}
        {(() => {
          const allSelected =
            detalles.length > 0 && selectedDetalles.length === detalles.length;
          const indeterminate =
            selectedDetalles.length > 0 &&
            selectedDetalles.length < detalles.length;

          return (
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
                  const isChecked = selectedDetalles.includes(
                    det.id_cotizacion_detalle,
                  );
                  const subtotal =
                    Number(det.cantidad) * Number(det.precio_unitario);

                  return (
                    <div
                      key={det.id_cotizacion_detalle}
                      className={`p-3 border-b border-zinc-800/50 transition-colors last:border-b-0 cursor-pointer ${
                        isChecked
                          ? "bg-indigo-500/5"
                          : "hover:bg-white/5 opacity-80 hover:opacity-100"
                      }`}
                      onClick={() => toggleDetalle(det.id_cotizacion_detalle)}
                    >
                      <Group wrap="nowrap" justify="space-between">
                        <Group gap="sm">
                          <Checkbox
                            size="sm"
                            checked={isChecked}
                            onChange={() =>
                              toggleDetalle(det.id_cotizacion_detalle)
                            }
                            onClick={(e) => e.stopPropagation()}
                            color="indigo"
                            radius="sm"
                          />
                          <Stack gap={0}>
                            <Text
                              size="xs"
                              fw={800}
                              className={
                                isChecked ? "text-indigo-100" : "text-zinc-300"
                              }
                            >
                              {det.producto}
                            </Text>
                            <Text size="11px" c="dimmed">
                              {formatNumber(det.cantidad)}{" "}
                              {det.unidad_medida_ctz_abv}
                              {" · a "}
                              <span className="text-zinc-300">
                                {cotizacion.moneda === "Soles" ? "S/." : "$"}{" "}
                                {formatNumber(Number(det.precio_unitario))}
                              </span>{" "}
                              c/u
                            </Text>
                          </Stack>
                        </Group>
                        <Badge
                          variant="light"
                          color={isChecked ? "indigo" : "gray"}
                          size="sm"
                        >
                          Sub: {cotizacion.moneda === "Soles" ? "S/." : "$"}{" "}
                          {formatNumber(subtotal)}
                        </Badge>
                      </Group>
                    </div>
                  );
                })}
              </div>
            </Stack>
          );
        })()}

        <Group justify="flex-end" mt="md" gap="sm">
          <Button
            variant="subtle"
            color="zinc"
            onClick={onClose}
            disabled={loading}
          >
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

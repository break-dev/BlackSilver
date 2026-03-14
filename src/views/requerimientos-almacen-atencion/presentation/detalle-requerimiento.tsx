import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ActionIcon,
  Tooltip,
  Button,
  Textarea,
  Checkbox,
} from "@mantine/core";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";
import { ReqDetalleTrazabilidad } from "./req-detalle-trazabilidad";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistrarEntrega } from "./registrar-entrega";
import { HistorialEntregasRequerimiento } from "./historial-entregas-requerimiento";
import { useGestionAtencion } from "../hooks/useGestionAtencion";
import { HeaderCard, InfoItem } from "./components/detail-elements";
import type {
  RES_RequerimientoAlmacen,
  DetalleRequerimientoExtendido,
} from "../service/atencion.responses";

interface GestionAtencionProps {
  requerimiento: RES_RequerimientoAlmacen;
  idAlmacen: number;
  onSuccess: () => void;
}

export const DetalleRequerimiento = ({
  requerimiento,
  idAlmacen,
  onSuccess,
}: GestionAtencionProps) => {
  const {
    loading,
    detalles,
    eventos,
    loadingTrazabilidad,
    openedTrace,
    openTrace,
    closeTrace,
    openedRechazo,
    openRechazo,
    closeRechazo,
    openedEntregaBatch,
    openEntregaBatch,
    closeEntregaBatch,
    openedHistorialGlobal,
    openHistorialGlobal,
    closeHistorialGlobal,
    selectedItemId,
    setSelectedItemId,
    selectedItemName,
    setSelectedItemName,
    selectedItemsIds,
    toggleItemSelection,
    deselectAllItems,
    comentarioAccion,
    setComentarioAccion,
    openedAprobar,
    openAprobar,
    closeAprobar,
    isProcessing,
    progresoGeneral,
    handleAprobar,
    handleRechazar,
    getStatusColor,
    loadData,
  } = useGestionAtencion({
    idRequerimiento: requerimiento.id_requerimiento,
    onSuccess,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  if (!detalles) return null;

  return (
    <Stack gap="xl" className="pb-10">
      {/* Header: Datos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        <HeaderCard
          icon={UserIcon}
          label="Solicitante"
          value={requerimiento.solicitante}
          color="indigo"
        />
        <HeaderCard
          icon={CheckBadgeIcon}
          label="Cód. Requerimiento"
          value={requerimiento.correlativo}
          color="violet"
        />
        <HeaderCard
          icon={MapPinIcon}
          label="Mina Destino"
          value={requerimiento.mina}
          color="amber"
        />
        <Paper
          p="md"
          radius="lg"
          className="bg-zinc-500/10 border border-zinc-500/20 relative overflow-hidden group hover:bg-zinc-500/20 transition-all"
        >
          <ClockIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-zinc-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10 w-full h-full">
            <Group gap={6} className="shrink-0">
              <ClockIcon className="w-4 h-4 text-zinc-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Fecha Requerida
              </Text>
            </Group>
            <div className="flex-1 flex items-center min-h-[24px]">
              <Text
                size="md"
                fw={800}
                className="text-zinc-100 tracking-tight leading-tight font-mono"
              >
                {requerimiento.fecha_entrega_requerida
                  ? dayjs(requerimiento.fecha_entrega_requerida).format("DD/MM/YYYY")
                  : "No especificada"}
              </Text>
            </div>
          </Stack>
        </Paper>
      </div>

      {/* Sub-header: Estados, Fechas */}
      <Paper
        p="md"
        radius="lg"
        className="bg-transparent border border-zinc-800/50 mx-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoItem
            label="Prioridad"
            value={requerimiento.premura}
            color="orange"
          />
          <InfoItem label="Estado" value={requerimiento.estado} color="green" />
          <Stack gap={4} className="lg:col-span-1">
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Labores Destino
            </Text>
            <Group gap={4}>
              {requerimiento.labores && requerimiento.labores.length > 0 ? (
                requerimiento.labores.map((l) => (
                  <Badge
                    key={l.id_labor}
                    variant="outline"
                    color="indigo"
                    size="sm"
                  >
                    ({l.correlativo}) {l.nombre}
                  </Badge>
                ))
              ) : (
                <Text size="xs" c="zinc.6" fs="italic">
                  Sin labores asignadas
                </Text>
              )}
            </Group>
          </Stack>
          <InfoItem
            label="Fecha de Registro"
            value={dayjs(requerimiento.created_at).format("DD/MM/YYYY HH:mm")}
            icon={ClockIcon}
            isMono
          />
        </div>
      </Paper>

      {/* Barra de Progreso */}
      <Paper
        p="md"
        radius="xl"
        className="bg-zinc-900/50 border border-zinc-800"
      >
        <Group justify="space-between" mb={8} px={4}>
          <Text
            size="xs"
            fw={800}
            className="text-zinc-400 tracking-tighter uppercase"
          >
            Progreso General de Atención
          </Text>
          <Text size="sm" fw={900} c="indigo.4">
            {progresoGeneral}%
          </Text>
        </Group>
        <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-linear-to-r from-indigo-500 to-indigo-400 transition-all duration-1000"
            style={{ width: `${progresoGeneral}%` }}
          />
        </div>
      </Paper>

      <div className="space-y-4">
        <Group justify="space-between" align="center" px={4}>
          <Group gap="xs">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <TruckIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <Text
              fw={800}
              className="text-zinc-100 italic tracking-tight text-lg"
            >
              Items Solicitados
            </Text>
          </Group>
          <Group gap="sm">
            <Button
              variant="light"
              color="indigo"
              size="xs"
              leftSection={<ClockIcon className="w-4 h-4" />}
              onClick={openHistorialGlobal}
            >
              Historial de Entregas
            </Button>
            <Button
              color="indigo"
              size="xs"
              leftSection={<TruckIcon className="w-4 h-4" />}
              disabled={selectedItemsIds.length === 0}
              onClick={openEntregaBatch}
            >
              Nueva Entrega
            </Button>
            <Badge variant="light" color="indigo" radius="md">
              {detalles.length}{" "}
              {detalles.length === 1 ? "Producto" : "Productos"}
            </Badge>
          </Group>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20">
          <Table verticalSpacing="md" horizontalSpacing="xl">
            <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">#</th>
                <th className="px-4 py-4 text-center w-10"></th>
                <th className="px-6 py-4 text-left">Producto</th>
                <th className="px-6 py-4 text-center">Cantidad solicitada</th>
                <th className="px-6 py-4 text-center w-44">Progreso</th>
                <th className="px-6 py-4 text-left">Comentario</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {detalles.map(
                (item: DetalleRequerimientoExtendido, idx: number) => (
                  <tr
                    key={item.id_requerimiento_almacen_detalle}
                    className="hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-xs font-mono text-zinc-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Checkbox
                        checked={selectedItemsIds.includes(
                          item.id_requerimiento_almacen_detalle,
                        )}
                        onChange={() =>
                          toggleItemSelection(
                            item.id_requerimiento_almacen_detalle,
                          )
                        }
                        disabled={
                          item.estado !==
                            EstadoDetalleRequerimiento.Aprobado.toString() &&
                          item.estado !==
                            EstadoDetalleRequerimiento.EnDespacho.toString()
                        }
                        color="indigo"
                        size="sm"
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Text
                        size="sm"
                        fw={800}
                        className="text-zinc-100 group-hover:text-indigo-400 transition-colors tracking-tight"
                      >
                        {item.producto}
                      </Text>
                    </td>
                    <td className="px-6 py-4 text-center flex flex-row gap-2.5 justify-center">
                      <Badge
                        variant="filled"
                        color="cyan.7"
                        radius="sm"
                        size="sm"
                        className="font-black px-4"
                      >
                        {Number(item.cantidad_solicitada || 0).toFixed(2)}{" "}
                        {item.unidad_medida_base_abv}
                      </Badge>
                      {item.unidad_medida_base_abv !==
                        item.unidad_medida_abv && (
                        <Badge
                          variant="filled"
                          color="pink.7"
                          radius="sm"
                          size="sm"
                          className="font-black px-4"
                        >
                          {Number(item.cantidad_solicitada_base || 0).toFixed(
                            2,
                          )}{" "}
                          {item.unidad_medida_base_abv}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex justify-between items-center px-1">
                          <Text size="10px" fw={800} c="zinc.5">
                            Atendido:{" "}
                            {Number(item.cantidad_entregada || 0).toFixed(2)}
                          </Text>
                          <Text size="10px" fw={900} c="indigo.4">
                            {item.porcentaje_progreso}%
                          </Text>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
                          <div
                            className="h-full bg-linear-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-700"
                            style={{ width: `${item.porcentaje_progreso}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Text
                        size="xs"
                        c="zinc.5"
                        className="max-w-[200px] italic leading-tight"
                      >
                        {item.comentario || (
                          <span className="text-gray-500">
                            Sin observaciones
                          </span>
                        )}
                      </Text>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant="light"
                        color={getStatusColor(item.estado)}
                        radius="md"
                        size="sm"
                        className="font-bold px-3 py-2.5"
                      >
                        {item.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Group gap={8} justify="center" wrap="nowrap">
                        <Tooltip
                          label="Ver Seguimiento"
                          position="top"
                          withArrow
                        >
                          <ActionIcon
                            variant="subtle"
                            color="zinc"
                            onClick={() => {
                              setSelectedItemId(
                                item.id_requerimiento_almacen_detalle,
                              );
                              setSelectedItemName(item.producto);
                              openTrace();
                            }}
                          >
                            <ClockIcon className="w-4 h-4" />
                          </ActionIcon>
                        </Tooltip>

                        {item.estado ===
                          EstadoDetalleRequerimiento.EsperandoAprobacion.toString() && (
                          <>
                            <Tooltip label="Aprobar" position="top" withArrow>
                              <ActionIcon
                                variant="filled"
                                color="green"
                                onClick={() => {
                                  setSelectedItemId(
                                    item.id_requerimiento_almacen_detalle,
                                  );
                                  openAprobar();
                                }}
                                disabled={isProcessing !== null}
                              >
                                <CheckCircleIcon className="w-5 h-5 text-white" />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Rechazar" position="top" withArrow>
                              <ActionIcon
                                variant="filled"
                                color="red"
                                onClick={() => {
                                  setSelectedItemId(
                                    item.id_requerimiento_almacen_detalle,
                                  );
                                  openRechazo();
                                }}
                                disabled={isProcessing !== null}
                              >
                                <XCircleIcon className="w-5 h-5 text-white" />
                              </ActionIcon>
                            </Tooltip>
                          </>
                        )}
                      </Group>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      <ModalEstandar
        opened={openedTrace}
        close={closeTrace}
        title="Seguimiento del requerimiento"
        size="md"
      >
        {selectedItemId && (
          <ReqDetalleTrazabilidad
            eventos={eventos}
            productoNombre={selectedItemName}
            loading={loadingTrazabilidad}
          />
        )}
      </ModalEstandar>

      <ModalEstandar
        opened={openedRechazo}
        close={closeRechazo}
        title="Rechazar ítem"
        size="md"
      >
        <Stack gap="md">
          <Paper
            p="md"
            className="bg-red-500/10 border border-red-900/50 rounded-xl flex items-start gap-4"
          >
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mt-1" />
            <Text size="sm" className="text-red-100 italic">
              Esta acción marcará el producto como rechazado.
            </Text>
          </Paper>
          <Textarea
            label="Motivo del rechazo"
            placeholder="Escriba aquí..."
            minRows={4}
            value={comentarioAccion}
            onChange={(e) => setComentarioAccion(e.currentTarget.value)}
          />
          <Group justify="end">
            <Button variant="subtle" color="zinc" onClick={closeRechazo}>
              Cancelar
            </Button>
            <Button
              color="red"
              disabled={!comentarioAccion.trim() || isProcessing !== null}
              loading={isProcessing !== null}
              onClick={handleRechazar}
            >
              Rechazar
            </Button>
          </Group>
        </Stack>
      </ModalEstandar>

      <ModalEstandar
        opened={openedAprobar}
        close={closeAprobar}
        title="Aprobar ítem"
        size="md"
      >
        <Stack gap="md">
          <Paper
            p="md"
            className="bg-green-500/10 border border-green-900/50 rounded-xl flex items-start gap-4"
          >
            <CheckCircleIcon className="w-8 h-8 text-green-400 mt-1" />
            <Text size="sm" className="text-green-100 italic">
              ¿Desea aprobar este producto? Puede ingresar un comentario
              opcional.
            </Text>
          </Paper>
          <Textarea
            label="Comentario (Opcional)"
            placeholder="Escriba aquí..."
            minRows={4}
            value={comentarioAccion}
            onChange={(e) => setComentarioAccion(e.currentTarget.value)}
          />
          <Group justify="end">
            <Button variant="subtle" color="zinc" onClick={closeAprobar}>
              Cancelar
            </Button>
            <Button
              color="green"
              loading={isProcessing !== null}
              onClick={handleAprobar}
            >
              Aprobar
            </Button>
          </Group>
        </Stack>
      </ModalEstandar>

      <ModalEstandar
        opened={openedEntregaBatch}
        close={closeEntregaBatch}
        title="Nueva Entrega de Materiales"
        size="90%"
      >
        <RegistrarEntrega
          idRequerimiento={requerimiento.id_requerimiento}
          idAlmacen={idAlmacen}
          selectedItemsIds={selectedItemsIds}
          detallesRequerimiento={detalles}
          onSuccess={() => {
            closeEntregaBatch();
            deselectAllItems();
            loadData(true);
            onSuccess();
          }}
          onCancel={closeEntregaBatch}
        />
      </ModalEstandar>

      <ModalEstandar
        opened={openedHistorialGlobal}
        close={closeHistorialGlobal}
        title="Historial de Entregas"
        size="70%"
      >
        <HistorialEntregasRequerimiento
          idRequerimiento={requerimiento.id_requerimiento}
        />
      </ModalEstandar>
    </Stack>
  );
};

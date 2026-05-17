import { useTitlePage } from "../../../hooks/useTitlePage";
import { useListarControlConsumo } from "../hooks/useListarControlConsumo";
import { FiltrosConsumo } from "./components/filtros-consumo";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { Group, Stack, Text, Badge, Tooltip } from "@mantine/core";
import {
  InboxStackIcon,
  Cog8ToothIcon,
  MapPinIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import type { RES_ControlConsumo } from "../service/control-consumo.responses";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { enPlural } from "../../../shared/functions/en-plural";
import { Estado_RequerimientoDetalle } from "../../../shared/enums/requerimiento-almacen/requerimiento";

export const ControlConsumoPage = () => {
  useTitlePage("Control de Consumo");

  const {
    reporte,
    loading,
    busqueda,
    setBusqueda,
    mes,
    setMes,
    anio,
    setAnio,
    activos,
    idActivoFijo,
    setIdActivoFijo,
    loadingActivos,
  } = useListarControlConsumo();

  // Find the selected asset object to show summaries
  const selectedAssetObj = activos.find(
    (a) => String(a.id_activo) === idActivoFijo,
  );

  // Flat view columns definition
  const columns: DataTableColumn<RES_ControlConsumo>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "correlativo_requerimiento",
      title: "Requerimiento",
      textAlign: "center",
      width: 150,
      render: (r) => {
        const badgeContent = (
          <Group
            gap={6}
            justify="center"
            wrap="nowrap"
            className={r.es_auditable ? "" : undefined}
          >
            <Badge
              variant="light"
              color="indigo"
              radius="md"
              className="font-bold border border-indigo-500/10 px-2 py-2"
            >
              {r.correlativo_requerimiento}
            </Badge>
            {r.es_auditable ? (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0 border border-amber-400/30" />
            ) : null}
          </Group>
        );

        if (r.es_auditable) {
          return (
            <Tooltip label="Requerimiento Auditable" withArrow>
              <div>{badgeContent}</div>
            </Tooltip>
          );
        }

        return badgeContent;
      },
    },
    {
      accessor: "producto",
      title: "Producto Consumido",
      width: 150,
      textAlign: "center",
      render: (r) => (
        <Text size="xs" fw={700} className="text-zinc-200">
          {r.producto}
        </Text>
      ),
    },
    {
      accessor: "cantidad_entregada",
      title: "Cantidad Req. / Ent.",
      textAlign: "center",
      width: 220,
      render: (r) => (
        <div className="flex flex-row gap-6 justify-center items-center py-1">
          <Tooltip
            label={`${formatNumber(r.cantidad_solicitada)} ${enPlural(r.unidad_medida_req, r.cantidad_solicitada)} Solicitados`}
            withArrow
          >
            <div className="flex flex-col items-center ">
              <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest mb-1.5">
                Requerido
              </span>
              <Badge
                variant="light"
                color="indigo"
                size="md"
                radius="md"
                className="font-bold border border-indigo-500/10"
              >
                {formatNumber(r.cantidad_solicitada)}{" "}
                <span className="text-[10px] opacity-70 font-extrabold ml-0.5">
                  {r.unidad_medida_req_abv}
                </span>
              </Badge>
            </div>
          </Tooltip>

          <div className="w-px h-9 bg-zinc-800/80 self-center" />

          <Tooltip
            label={`${formatNumber(r.cantidad_entregada)} ${enPlural(r.unidad_medida_req, r.cantidad_entregada)} Entregados`}
            withArrow
          >
            <div className="flex flex-col items-center ">
              <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest mb-1.5">
                Entregado
              </span>
              <Badge
                variant="light"
                color="teal"
                size="md"
                radius="md"
                className="font-bold border border-teal-500/10"
              >
                {formatNumber(r.cantidad_entregada)}{" "}
                <span className="text-[10px] opacity-70 font-extrabold ml-0.5">
                  {r.unidad_medida_req_abv}
                </span>
              </Badge>
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      accessor: "contratista_solicitante",
      title: "Solicitante",
      width: 150,
      textAlign: "center",
      render: (r) => (
        <Text size="xs" fw={700} className="text-zinc-300">
          {r.contratista_solicitante}
        </Text>
      ),
    },
    {
      accessor: "mina_destino",
      title: "Mina Destino",
      width: 150,
      textAlign: "center",
      render: (r) => (
        <Text
          size="xs"
          fw={700}
          className="text-zinc-200 leading-normal flex items-center justify-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 shadow-[0_0_6px_rgba(14,165,233,0.4)]" />
          {r.mina}
        </Text>
      ),
    },
    {
      accessor: "almacen_encargado",
      title: "Almacén Encargado",
      width: 150,
      textAlign: "center",
      render: (r) => (
        <Text
          size="xs"
          fw={700}
          className="text-zinc-200 leading-normal flex items-center justify-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 shadow-[0_0_6px_rgba(139,92,246,0.4)]" />
          {r.almacen_destino}
        </Text>
      ),
    },
    {
      accessor: "estado",
      title: "Estado Despacho",
      textAlign: "center",
      width: 200,
      render: (r) => {
        let color = "gray";
        const label = r.estado;

        if (r.estado === Estado_RequerimientoDetalle.EnDespacho) {
          color = "blue";
        } else if (r.estado === Estado_RequerimientoDetalle.Cerrado) {
          color = "red";
        } else if (r.estado === Estado_RequerimientoDetalle.Completado) {
          color = "teal";
        }

        return (
          <Badge
            color={color}
            variant="light"
            size="xs"
            className="font-bold border border-current/10"
          >
            {label}
          </Badge>
        );
      },
    },
  ];

  return (
    <Stack gap="lg" className="animate-fade-in text-zinc-100">
      {/* Search and Period Filter Component */}
      <FiltrosConsumo
        idActivoFijo={idActivoFijo}
        setIdActivoFijo={setIdActivoFijo}
        activos={activos}
        loadingActivos={loadingActivos}
        mes={mes}
        setMes={setMes}
        anio={anio}
        setAnio={setAnio}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />

      {/* Main Content Dashboard Card */}
      <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md">
        {/* Dynamic Asset Info Subheader */}
        {selectedAssetObj && (
          <div className="p-4 bg-zinc-900/20 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Cog8ToothIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <Stack gap={2}>
                <div className="flex items-center gap-2.5">
                  <Text
                    fw={800}
                    className="uppercase tracking-widest text-zinc-500 text-[10px]!"
                  >
                    Resumen de Consumo de Activo
                  </Text>
                  <Badge
                    size="sm"
                    color="pink"
                    variant="light"
                    className="font-extrabold border border-pink-500/10"
                  >
                    {selectedAssetObj.correlativo}
                  </Badge>
                </div>
                <Text size="md" fw={900} className="text-white tracking-tight">
                  {selectedAssetObj.producto}
                </Text>
              </Stack>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">
                  Ubicación:{" "}
                  {selectedAssetObj.id_mina
                    ? "En Mina"
                    : selectedAssetObj.id_almacen
                      ? "En Almacén"
                      : "-"}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-300 font-semibold text-xs">
                  <MapPinIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {selectedAssetObj.mina || selectedAssetObj.almacen || "-"}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">
                  Consumo Total
                </span>
                <Badge
                  size="sm"
                  color="indigo"
                  variant="light"
                  className="font-extrabold"
                >
                  {reporte.length}{" "}
                  {reporte.length === 1
                    ? "insumo consumido"
                    : "insumos consumidos"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Inner body based on state and selected view toggle */}
        <div className="relative shadow-inner">
          {loading ? (
            <Stack align="center" gap="md" py={100}>
              <div className="relative">
                <div className="size-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <ArchiveBoxArrowDownIcon className="size-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <Text
                size="xs"
                fw={900}
                className="uppercase tracking-[0.3em] text-zinc-500"
              >
                Cargando historial de consumos...
              </Text>
            </Stack>
          ) : reporte.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20">
              <InboxStackIcon className="size-12 text-zinc-700 mb-4" />
              <Text
                size="sm"
                fw={700}
                className="text-zinc-400 uppercase tracking-widest"
              >
                Sin consumos registrados
              </Text>
              <Text size="xs" c="dimmed" className="mt-1">
                No se registraron entregas de almacén asociadas a este activo en
                este periodo.
              </Text>
            </div>
          ) : (
            <DataTableEstandar
              idAccessor="id_requerimiento_detalle"
              columns={columns}
              records={reporte}
              loading={loading}
              minHeight={0}
            />
          )}
        </div>
      </div>
    </Stack>
  );
};

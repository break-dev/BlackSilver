import {
  Badge,
  Button,
  Stack,
  Text,
  TextInput,
  Group,
  ActionIcon,
  Tooltip,
  Select,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMemo } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { type DataTableColumn } from "mantine-datatable";
import { useRequerimientosPage } from "../hooks/useRequerimientosPage";
import { EstadoRequerimiento } from "../../../shared/enums/estados";
import { Premura } from "../../../shared/enums/otros";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroRequerimiento } from "./registro-requerimiento";
import { DetalleRequerimiento } from "./detalle-requerimiento";
import { TrazabilidadRequerimiento } from "./trazabilidad-requerimiento";
import type { RES_RequerimientoAlmacen } from "../services/requerimientos.responses";
import { MESES } from "../../../shared/variables/meses";

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

export const RequerimientosAlmacenPage = () => {
  useTitlePage("Requerimientos de Almacén");

  const {
    filteredRecords,
    loading,
    filters: { mes, setMes, yearcito, setYearcito, search, setSearch },
    actions: { addRecord, verDetalles, verTrazabilidad },
    ui: {
      selectedReq,
      detalles,
      loadingDetalle,
      selectedDetalle,
      trazabilidad,
      loadingTrazabilidad,
      progresoGeneral,
    },
  } = useRequerimientosPage();

  const [openedRegistro, { open: openReg, close: closeReg }] =
    useDisclosure(false);
  const [openedDetalle, { open: openDet, close: closeDet }] =
    useDisclosure(false);
  const [openedTrace, { open: openTrace, close: closeTrace }] =
    useDisclosure(false);

  const columns: DataTableColumn<RES_RequerimientoAlmacen>[] = useMemo(
    () => [
      {
        accessor: "index",
        title: "#",
        textAlign: "center",
        width: 60,
        render: (_record, index) => index + 1,
      },
      {
        accessor: "correlativo",
        title: "Código",
        width: 140,
        render: (item) => (
          <Badge variant="light" color="violet" radius="sm">
            {item.correlativo}
          </Badge>
        ),
      },
      {
        accessor: "premura",
        title: "Prioridad",
        width: 130,
        render: (item) => {
          const colors = {
            [Premura.Normal]: "cyan",
            [Premura.Urgente]: "orange",
            [Premura.Emergencia]: "red",
          };
          const color = colors[item.premura as Premura] || "gray";
          return (
            <Badge
              color={color}
              variant="light"
              radius="sm"
              size="sm"
              className="font-semibold uppercase tracking-wider"
            >
              {item.premura}
            </Badge>
          );
        },
      },
      {
        accessor: "mina",
        title: "Mina",
        width: 180,
        render: (item) => (
          <Group gap="xs" wrap="nowrap">
            <MapPinIcon className="w-5 h-5 text-zinc-500 shrink-0" />
            <Text size="sm" className="text-zinc-200">
              {item.mina}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "almacen_destino",
        title: "Almacén",
        width: 180,
        render: (item) => (
          <Group gap="xs" wrap="nowrap">
            <BuildingStorefrontIcon className="w-5 h-5 text-zinc-500 shrink-0" />
            <Text size="sm" className="text-zinc-200 italic">
              {item.almacen_destino}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "fecha_entrega_requerida",
        title: "Programación",
        width: 180,
        render: (item) => (
          <Stack gap={3}>
            <Group gap={6}>
              <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
              <Text size="xs" fw={600} className="text-zinc-200">
                Entrega:{" "}
                {dayjs(item.fecha_entrega_requerida).format("DD/MM/YYYY")}
              </Text>
            </Group>
            <Text size="11px" className="text-zinc-500 ml-[22px]">
              Creado: {dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
            </Text>
          </Stack>
        ),
      },
      {
        accessor: "estado",
        title: "Estado",
        width: 130,
        render: (item) => {
          const colorMap: Record<EstadoRequerimiento, string> = {
            [EstadoRequerimiento.Generado]: "green",
            [EstadoRequerimiento.Cerrado]: "gray",
            [EstadoRequerimiento.Anulado]: "red",
            [EstadoRequerimiento.EnProceso]: "blue",
          };
          return (
            <Badge
              color={colorMap[item.estado] || "gray"}
              variant="light"
              radius="sm"
              size="sm"
              className="font-semibold uppercase tracking-wider"
            >
              {item.estado}
            </Badge>
          );
        },
      },
      {
        accessor: "acciones",
        title: "Acciones",
        textAlign: "center",
        width: 120,
        render: (item) => (
          <Group gap="xs" justify="center">
            <Tooltip label="Ver Detalle" position="top" withArrow>
              <ActionIcon
                variant="filled"
                color="violet"
                radius="md"
                onClick={() => {
                  verDetalles(item);
                  openDet();
                }}
                className="shadow-sm hover:scale-110 transition-transform"
              >
                <EyeIcon className="w-5 h-5 text-white" />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [verDetalles, openDet],
  );

  const inputClasses = {
    input:
      "bg-zinc-900/40 backdrop-blur-md border-zinc-800/50 focus:border-indigo-500/50 transition-all text-zinc-100 placeholder:text-zinc-600 shadow-inner",
    label: "text-zinc-400 font-medium mb-1.5 text-xs uppercase tracking-wider",
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100 p-2">
      {/* Container de Filtros con Glassmorphism */}
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between gap-6 items-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 w-full">
            <Select
              label="Mes"
              placeholder="Elegir mes"
              data={MESES}
              value={mes}
              onChange={(val) => setMes(val || "1")}
              classNames={inputClasses}
              radius="lg"
              size="xs"
            />
            <Select
              label="Año"
              placeholder="Elegir año"
              data={YEARS}
              value={yearcito}
              onChange={(val) =>
                setYearcito(val || String(new Date().getFullYear()))
              }
              classNames={inputClasses}
              radius="lg"
              size="xs"
            />
            <TextInput
              label="Búsqueda rápida"
              placeholder="Código o solicitante..."
              leftSection={
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              classNames={inputClasses}
              radius="lg"
              size="xs"
            />
          </div>

          <Button
            leftSection={<PlusIcon className="w-5 h-5" />}
            onClick={openReg}
            radius="xl"
            size="xs"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full lg:w-auto px-8"
          >
            Nuevo Requerimiento
          </Button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-zinc-950/20 border border-zinc-800/30 rounded-2xl overflow-hidden shadow-2xl transition-all">
        {filteredRecords.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4">
            <div className="bg-zinc-900/50 p-6 rounded-full border border-zinc-800 animate-pulse">
              <CubeIcon className="w-12 h-12 text-zinc-700" />
            </div>
            <div className="text-center">
              <Text fw={600} size="lg" className="text-zinc-400">
                No se encontraron requerimientos
              </Text>
              <Text size="sm" className="text-zinc-600">
                Intenta cambiando el periodo o ajustando tu búsqueda
              </Text>
            </div>
          </div>
        ) : (
          <DataTableEstandar
            idAccessor="id_requerimiento"
            columns={columns}
            records={filteredRecords}
            loading={loading}
          />
        )}
      </div>

      {/* Modales - Mantener consistencia con la arquitectura */}
      <ModalEstandar
        opened={openedRegistro}
        close={closeReg}
        title="Nuevo Requerimiento de Material"
        size="80%"
      >
        <RegistroRequerimiento
          onSuccess={(item) => {
            closeReg();
            addRecord(item);
          }}
          onCancel={closeReg}
        />
      </ModalEstandar>

      <ModalEstandar
        opened={openedDetalle}
        close={closeDet}
        title="Detalle del Requerimiento"
        size="95%"
      >
        {selectedReq && (
          <DetalleRequerimiento
            headerData={selectedReq}
            detalles={detalles}
            laboresVinculadas={selectedReq?.labores || []}
            loading={loadingDetalle}
            progresoGeneral={progresoGeneral}
            onOpenTrazabilidad={(det) => {
              verTrazabilidad(det);
              openTrace();
            }}
          />
        )}
      </ModalEstandar>

      <ModalEstandar
        opened={openedTrace}
        close={closeTrace}
        title="Seguimiento de tu requerimiento"
        size="md"
      >
        {selectedDetalle && (
          <TrazabilidadRequerimiento
            productoNombre={selectedDetalle.producto}
            eventos={trazabilidad}
            loading={loadingTrazabilidad}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

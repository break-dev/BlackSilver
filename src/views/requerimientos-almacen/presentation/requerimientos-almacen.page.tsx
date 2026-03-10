import {
  Badge,
  Button,
  Stack,
  Text,
  TextInput,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { type DataTableColumn } from "mantine-datatable";

import { useRequerimientosPage } from "../hooks/useRequerimientosPage";
import { EstadoRequerimiento } from "../../../shared/enums/estados";
import { Premura } from "../../../shared/enums/otros";
import { useUIStore } from "../../../stores/ui.store";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroRequerimiento } from "./registro-requerimiento";
import { DetalleRequerimiento } from "./detalle-requerimiento";
import { TrazabilidadRequerimiento } from "./trazabilidad-requerimiento";
import { LaboresRequerimiento } from "./labores-requerimiento";
import type { RES_RequerimientoAlmacen } from "../services/requerimientos.responses";

export const RequerimientosAlmacenPage = () => {
  const setTitle = useUIStore((state) => state.setTitle);

  const {
    requerimientos,
    loading,
    actions: { listar, verDetalles, verTrazabilidad, verLabores },
    ui: {
      selectedReq,
      detalles,
      loadingDetalle,
      selectedDetalle,
      trazabilidad,
      loadingTrazabilidad,
      laboresVinculadas,
      loadingLabores,
    },
  } = useRequerimientosPage();

  const [openedRegistro, { open: openReg, close: closeReg }] =
    useDisclosure(false);
  const [openedDetalle, { open: openDet, close: closeDet }] =
    useDisclosure(false);
  const [openedTrace, { open: openTrace, close: closeTrace }] =
    useDisclosure(false);
  const [openedLabores, { open: openLabores, close: closeLabores }] =
    useDisclosure(false);

  // Local UI state
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTitle("Requerimientos de Almacén");
  }, [setTitle]);

  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return requerimientos;
    return requerimientos.filter(
      (item) =>
        (item.correlativo || "").toLowerCase().includes(q) ||
        (item.solicitante || "").toLowerCase().includes(q),
    );
  }, [requerimientos, search]);

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
          const color = colors[item.premura] || "gray";
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
        accessor: "solicitante",
        title: "Solicitante",
        width: 200,
        render: (item) => (
          <Group gap="xs" wrap="nowrap">
            <UserCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
            <Text size="sm" className="text-zinc-200 truncate">
              {item.solicitante}
            </Text>
          </Group>
        ),
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
          const colorMap = {
            [EstadoRequerimiento.Generada]: "green",
            [EstadoRequerimiento.Cerrada]: "gray",
            [EstadoRequerimiento.Anulada]: "red",
          };
          return (
            <Badge
              color={colorMap[item.estado]}
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
            <Tooltip label="Ver Labores" position="top" withArrow>
              <ActionIcon
                variant="filled"
                color="indigo"
                radius="md"
                onClick={() => {
                  verLabores(item);
                  openLabores();
                }}
              >
                <MapPinIcon className="w-5 h-5 text-white" />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Ver Detalle" position="top" withArrow>
              <ActionIcon
                variant="filled"
                color="violet"
                radius="md"
                onClick={() => {
                  verDetalles(item);
                  openDet();
                }}
              >
                <EyeIcon className="w-5 h-5 text-white" />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
      },
    ],
    [verDetalles, openDet, verLabores, openLabores],
  );

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
        <Group className="flex-1 w-full lg:w-auto">
          <TextInput
            placeholder="Buscar por código o solicitante..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="flex-1 min-w-[200px]"
            radius="lg"
          />
        </Group>

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openReg}
          radius="lg"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Nuevo Requerimiento
        </Button>
      </div>

      <DataTableEstandar
        idAccessor="id_requerimiento"
        columns={columns}
        records={filteredRecords}
        loading={loading}
      />

      {/* Modal Registro */}
      <ModalEstandar
        opened={openedRegistro}
        close={closeReg}
        title="Nuevo Requerimiento de Material"
        size="75%"
      >
        <RegistroRequerimiento
          onSuccess={() => {
            closeReg();
            listar();
          }}
          onCancel={closeReg}
        />
      </ModalEstandar>

      {/* Modal Detalle */}
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
            loading={loadingDetalle}
            onOpenTrazabilidad={(det) => {
              verTrazabilidad(det);
              openTrace();
            }}
          />
        )}
      </ModalEstandar>

      {/* Modal Trazabilidad */}
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

      {/* Modal Labores */}
      <ModalEstandar
        opened={openedLabores}
        close={closeLabores}
        title="Labores Involucradas"
        size="lg"
      >
        <LaboresRequerimiento
          labores={laboresVinculadas}
          loading={loadingLabores}
        />
      </ModalEstandar>
    </div>
  );
};

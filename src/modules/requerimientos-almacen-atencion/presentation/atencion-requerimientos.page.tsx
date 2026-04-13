import { useEffect, useState, useMemo } from "react";
import {
  Badge,
  Group,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Tooltip,
  Select,
  Loader,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  MapPinIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { type DataTableColumn } from "mantine-datatable";
import { useEntregas } from "../hooks/useEntregas";
import type { RES_RequerimientoAlmacen } from "../service/atencion.responses";
import { Estado_Requerimiento } from "../../../shared/enums/requerimiento-almacen/requerimiento";
import { Premura } from "../../../shared/enums/_generic/premura.ts";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { DetalleRequerimiento } from "./detalle-requerimiento.tsx";
import { MESES } from "../../../shared/variables/meses.ts";
import { useDisclosure } from "@mantine/hooks";

export const RequerimientosAlmacenAtencionPage = () => {
  useTitlePage("Atención de Requerimientos");
  const [errorLocal, setErrorLocal] = useState("");

  const [openedGestion, { open: openGestion, close: closeGestion }] =
    useDisclosure(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
    busqueda,
    setBusqueda,
    filteredRecords,
    loading,
    obtenerAlmacenesAutorizados,
    almacenes,
    loadingAlmacenes,
    updateRequirementLocal,
  } = useEntregas({ setError: setErrorLocal });

  // Use effect remains for fetching stores but title is managed by hook
  useEffect(() => {
    obtenerAlmacenesAutorizados();
  }, [obtenerAlmacenesAutorizados]);

  // Ya no manejamos 'page' localmente ni disclosures

  const columns: DataTableColumn<RES_RequerimientoAlmacen>[] = useMemo(
    () => [
      {
        accessor: "index",
        title: "#",
        textAlign: "center",
        width: 60,
      },
      {
        accessor: "correlativo",
        title: "Código",
        width: 140,
        render: (item) => (
          <Badge variant="light" color="indigo" radius="sm">
            {item.correlativo}
          </Badge>
        ),
      },
      {
        accessor: "solicitante",
        title: "Solicitante",
        width: 180,
        render: (item) => (
          <Group gap="xs" wrap="nowrap">
            <UserCircleIcon className="w-5 h-5 text-emerald-500" />
            <Text size="sm" className="text-zinc-200">
              {item.solicitante}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "mina",
        title: "Mina Destino",
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
        accessor: "fechas",
        title: "Programación",
        width: 180,
        render: (item) => {
          const fechaReq =
            item.fecha_entrega_requerida &&
            dayjs(item.fecha_entrega_requerida).isValid()
              ? dayjs(item.fecha_entrega_requerida).format("DD/MM/YYYY")
              : "No especificada";

          return (
            <Stack gap={2}>
              <Group gap={6}>
                <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
                <Text size="xs" fw={600} className="text-zinc-200">
                  Entrega: {fechaReq}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" ml={22}>
                Creado: {dayjs(item.created_at).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Stack>
          );
        },
      },
      {
        accessor: "premura",
        title: "Prioridad",
        width: 120,
        render: (item) => {
          const getPremuraColor = (premura: string) => {
            switch (premura) {
              case Premura.Normal:
                return "blue";
              case Premura.Urgente:
                return "orange";
              case Premura.Emergencia:
                return "red";
              default:
                return "zinc";
            }
          };
          const color = getPremuraColor(item.premura);
          return (
            <Badge
              color={color}
              variant="light"
              size="sm"
              className="uppercase"
            >
              {item.premura}
            </Badge>
          );
        },
      },
      {
        accessor: "estado",
        title: "Estado",
        width: 130,
        render: (item) => {
          const colors: Record<string, string> = {
            [Estado_Requerimiento.Generado]: "green",
            [Estado_Requerimiento.Cerrado]: "gray",
            [Estado_Requerimiento.Anulado]: "red",
          };
          const color =
            item.estado && colors[item.estado] ? colors[item.estado] : "gray";
          return (
            <Badge
              color={color}
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
        width: 80,
        render: (item) => (
          <Tooltip label="Gestionar Atención" position="top" withArrow>
            <ActionIcon
              variant="filled"
              color="indigo"
              radius="md"
              onClick={() => {
                setSelectedId(item.id_requerimiento);
                openGestion();
              }}
              className="shadow-md hover:scale-105 transition-transform"
            >
              <PlayCircleIcon className="w-5 h-5 text-white" />
            </ActionIcon>
          </Tooltip>
        ),
      },
    ],
    [openGestion, setSelectedId],
  );

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
        <div className="flex flex-wrap gap-4 flex-1 w-full lg:w-auto">
          {/* Almacén Selector */}
          <div className="w-full sm:w-72">
            <Select
              placeholder="Seleccione Almacén a Atender"
              leftSection={
                loadingAlmacenes ? (
                  <Loader size="xs" />
                ) : (
                  <MapPinIcon className="w-4 h-4 text-zinc-400" />
                )
              }
              data={almacenes.map((a) => ({
                value: String(a.id_almacen),
                label: a.nombre,
              }))}
              value={idAlmacen}
              onChange={setIdAlmacen}
              radius="lg"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          {/* Mes Selector */}
          <div className="w-full sm:w-40">
            <Select
              placeholder="Mes"
              leftSection={
                <CalendarDaysIcon className="w-4 h-4 text-zinc-400" />
              }
              data={MESES}
              value={mes}
              onChange={(val) => setMes(val || "")}
              radius="lg"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          {/* Año Selector */}
          <div className="w-full sm:w-32">
            <Select
              placeholder="Año"
              data={Array.from({ length: 5 }, (_, i) => ({
                value: String(dayjs().year() - i),
                label: String(dayjs().year() - i),
              }))}
              value={yearcito}
              onChange={(val) => setYearcito(val || "")}
              radius="lg"
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          <TextInput
            placeholder="Buscar por código, solicitante o mina..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.currentTarget.value);
            }}
            disabled={!idAlmacen}
            className="flex-1 min-w-[200px]"
            radius="lg"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            }}
          />
        </div>
      </div>

      {!idAlmacen ? (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
          <div className="p-4 rounded-full bg-zinc-900/50 mb-4">
            <CheckBadgeIcon className="w-12 h-12 text-zinc-600" />
          </div>
          <Text size="lg" fw={600} className="text-zinc-400">
            Panel de Requerimientos de Almacén
          </Text>
          <Text className="text-zinc-500 text-center max-w-sm mt-1">
            Seleccione el almacén para visualizar los requerimientos pendientes
            de atención.
          </Text>
        </div>
      ) : (
        <DataTableEstandar
          idAccessor="id_requerimiento"
          columns={columns}
          records={filteredRecords}
          loading={loading}
        />
      )}

      <ModalEstandar
        opened={openedGestion}
        close={closeGestion}
        title={`Atender Requerimiento de Almacén`}
        size="95%"
      >
        {selectedId && (
          <DetalleRequerimiento
            requerimiento={
              filteredRecords.find((r) => r.id_requerimiento === selectedId)!
            }
            idAlmacen={Number(idAlmacen)}
            onSuccess={() => {
              // Actualizamos localmente el estado a 'En Proceso' para evitar re-fetch de la lista general
              updateRequirementLocal(selectedId, {
                estado: Estado_Requerimiento.EnDespacho,
              });
            }}
          />
        )}
      </ModalEstandar>

      {errorLocal && (
        <Text c="red" size="sm" mt="md">
          {errorLocal}
        </Text>
      )}
    </div>
  );
};

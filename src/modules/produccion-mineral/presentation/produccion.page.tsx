import { useState, useMemo } from "react";
import {
  Button,
  Stack,
  Text,
  Card,
  Badge,
  Table,
  TextInput,
  Group,
} from "@mantine/core";
import {
  FolderOpenIcon,
  MapPinIcon,
  InboxStackIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { useProduccion } from "../hooks/_useProduccion";
import type { RES_LoteMineralEnProduccion } from "../service/produccion.responses";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { IniciarProduccion } from "./iniciar-produccion";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";

export const ProduccionMineralPage = () => {
  useTitlePage("Producción de Mineral");
  const {
    state: { lotesEnProduccion, lotesPendientes },
    status: { loading, loadingPendientes, submitting, error },
    actions: { iniciarProduccion },
  } = useProduccion();

  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [expandedRecordIds, setExpandedRecordIds] = useState<
    (string | number)[]
  >([]);

  const handleIniciar = async (idLote: number) => {
    const success = await iniciarProduccion(idLote);
    if (success) {
      setModalOpen(false);
    }
  };

  const columns: DataTableColumn<RES_LoteMineralEnProduccion>[] = useMemo(
    () => [
      {
        accessor: "index",
        title: "#",
        textAlign: "center",
        width: 50,
      },
      {
        accessor: "correlativo",
        title: "Lote / Correlativo",
        width: 180,
        textAlign: "center",
        render: (record) => (
          <Stack gap={0} justify="center" align="center">
            <Badge
              color="indigo"
              variant="light"
              size="sm"
              fw={700}
              className="text-white "
            >
              {record.correlativo}
            </Badge>
            {record.codigo_interno && (
              <Text
                size="10px"
                className="font-mono text-zinc-500 font-semibold"
              >
                Cód: {record.codigo_interno}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        accessor: "contratista",
        title: "Contratista",
        width: 180,
        textAlign: "center",
        render: (record) => (
          <Text size="sm" fw={600} className="text-zinc-200">
            {record.contratista}
          </Text>
        ),
      },
      {
        accessor: "mina",
        title: "Mina",
        width: 200,
        textAlign: "center",
        render: (record) => (
          <Group gap="xs" wrap="nowrap" align="center" justify="center">
            <div className="flex items-center justify-center size-7.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
              <BuildingOffice2Icon className="size-3.5" />
            </div>
            <Text size="sm" fw={700} className="text-emerald-400">
              {record.mina}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "labor",
        title: "Labor",
        width: 180,
        textAlign: "center",
        render: (record) => (
          <Group gap="xs" wrap="nowrap" justify="center" align="center">
            <div className="flex items-center justify-center size-7.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-xs">
              <MapPinIcon className="w-3.5 h-3.5" />
            </div>
            <Text size="sm" fw={600} className="text-violet-300 truncate">
              {record.labor}
            </Text>
          </Group>
        ),
      },
      {
        accessor: "descripcion",
        title: "Descripción",
        render: (record) =>
          record.descripcion ? (
            <Group gap="xs" wrap="nowrap">
              <div className="flex items-center justify-center size-6 text-zinc-500">
                <DocumentTextIcon className="size-3.5" />
              </div>
              <Text
                size="xs"
                className="text-zinc-400 italic truncate max-w-xs"
              >
                "{record.descripcion}"
              </Text>
            </Group>
          ) : (
            <Text size="xs" className="text-zinc-600 pl-8 font-medium">
              -
            </Text>
          ),
      },
      {
        accessor: "consumos",
        title: "Consumos",
        width: 150,
        textAlign: "center",
        render: (record) =>
          record.consumos.length > 0 ? (
            <Badge
              color="indigo"
              variant="filled"
              size="xs"
              className="font-extrabold uppercase tracking-wider py-1.5 px-3 bg-linear-to-r from-indigo-600 to-violet-600 text-white border border-indigo-400/20 shadow-md shadow-indigo-950/40"
            >
              {record.consumos.length} Insumos
            </Badge>
          ) : (
            <Badge
              color="gray"
              variant="light"
              size="xs"
              className="font-extrabold uppercase tracking-wider py-1.5 px-3 text-zinc-500 border border-zinc-800 bg-zinc-900/40"
            >
              0 Insumos
            </Badge>
          ),
      },
    ],
    [],
  );

  const lotesFiltrados = useMemo(() => {
    const lotesData = lotesEnProduccion || [];
    if (!busqueda) return lotesData;
    const term = busqueda.toLowerCase();
    return lotesData.filter(
      (l) =>
        l.correlativo.toLowerCase().includes(term) ||
        (l.codigo_interno && l.codigo_interno.toLowerCase().includes(term)) ||
        l.contratista.toLowerCase().includes(term) ||
        l.mina.toLowerCase().includes(term) ||
        (l.labor && l.labor.toLowerCase().includes(term)),
    );
  }, [lotesEnProduccion, busqueda]);

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      {/* Header — Buscador y Iniciar Producción */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <TextInput
          label="Buscar Lote en Producción"
          placeholder="Buscar por correlativo, contratista, mina..."
          leftSection={<MagnifyingGlassIcon className="size-4 text-zinc-400" />}
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          className="flex-1 min-w-64"
          radius="lg"
          size="sm"
          classNames={{
            label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
          }}
        />
        <Button
          onClick={() => setModalOpen(true)}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 shrink-0 px-6 font-bold h-[38px] transition-all"
        >
          Iniciar Producción
        </Button>
      </div>

      {error && (
        <Card
          radius="md"
          className="bg-red-950/20 border border-red-500/30 p-4"
        >
          <Text size="sm" c="red.4" fw={700}>
            {error}
          </Text>
        </Card>
      )}

      {loading ? (
        <Stack align="center" gap="md" py={100}>
          <div className="relative">
            <div className="size-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <InboxStackIcon className="size-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <Text
            size="xs"
            fw={900}
            className="uppercase tracking-[0.3em] text-zinc-500"
          >
            Consultando Producción Activa...
          </Text>
        </Stack>
      ) : lotesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-4xl border border-dashed border-zinc-800 backdrop-blur-sm animate-fade-in">
          <FolderOpenIcon className="size-12 text-zinc-700 mb-4 animate-pulse" />
          <Text
            size="sm"
            fw={800}
            className="text-zinc-400 uppercase tracking-widest"
          >
            Sin producción activa
          </Text>
          <Text size="xs" c="dimmed" className="mt-1 max-w-xs text-center">
            {busqueda
              ? "No se encontraron lotes de mineral activos que coincidan con la búsqueda."
              : "No se encontraron lotes de mineral actualmente en proceso de producción. ¡Inicie uno nuevo con el botón superior!"}
          </Text>
        </div>
      ) : (
        <DataTableEstandar
          idAccessor="id_lote_mineral"
          columns={columns}
          records={lotesFiltrados}
          loading={loading}
          rowExpansion={{
            expanded: {
              recordIds: expandedRecordIds,
              onRecordIdsChange: setExpandedRecordIds,
            },
            content: ({ record }: { record: RES_LoteMineralEnProduccion }) => (
              <div className="p-4 bg-zinc-950/40 rounded-lg border border-zinc-800/60 m-2 animate-fade-in">
                <Text
                  size="xs"
                  fw={900}
                  className="text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"
                >
                  <InboxStackIcon className="w-4 h-4 text-indigo-400" />
                  Consumos Consolidados ({record.consumos.length})
                </Text>
                {record.consumos.length === 0 ? (
                  <Text
                    size="xs"
                    c="dimmed"
                    className="italic text-center py-2"
                  >
                    Sin consumos asociados aún.
                  </Text>
                ) : (
                  <div className="border border-zinc-800/60 rounded-xl overflow-hidden bg-zinc-950/10 max-w-2xl">
                    <Table
                      variant="unstyled"
                      className="w-full text-zinc-300 text-xs"
                    >
                      <thead className="bg-zinc-950 font-bold text-zinc-400 border-b border-zinc-800/50">
                        <tr>
                          <th className="px-3 py-1.5 text-left">Insumo</th>
                          <th className="px-3 py-1.5 text-right w-32">
                            Cantidad
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 bg-zinc-900/10">
                        {record.consumos.map((c) => (
                          <tr
                            key={c.id_producto}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-3 py-1.5 font-medium">
                              {c.producto}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-white">
                              {formatNumber(c.total_consumido)}{" "}
                              {c.unidad_base_abv}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            ),
          }}
        />
      )}

      {/* Modal: Iniciar Producción */}
      <ModalEstandar
        opened={modalOpen}
        close={() => setModalOpen(false)}
        title="Iniciar Proceso de Producción"
        size="md"
      >
        <IniciarProduccion
          lotesPendientes={lotesPendientes}
          loadingPendientes={loadingPendientes}
          submitting={submitting}
          onIniciar={handleIniciar}
          onCancel={() => setModalOpen(false)}
        />
      </ModalEstandar>
    </div>
  );
};

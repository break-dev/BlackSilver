import {
  Badge,
  Button,
  Group,
  Text,
  TextInput,
  Select,
  ActionIcon,
  Stack,
  Paper,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import {
  PlusIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  InboxStackIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import dayjs from "dayjs";

import { useLotesPage } from "../hooks/useLotesPage";
import type { RES_Lote } from "../service/lotes.responses";

import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { RegistroLote } from "./registro-lote";
import { AjusteStockModal } from "./ajuste-stock";

export const LotesPage = () => {
  const {
    almacenes,
    records,
    loading,
    idAlmacen,
    setIdAlmacen,
    busqueda,
    setBusqueda,
    filtroCategoria,
    setFiltroCategoria,
    filtroProducto,
    setFiltroProducto,
    categoriasUnicas,
    productosUnicos,
    addLote,
    updateLote,
  } = useLotesPage();

  // Modals Local State (Purely UI)
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [loteParaAjustar, setLoteParaAjustar] = useState<RES_Lote | null>(null);
  const [openedAjuste, { open: openAjuste, close: closeAjuste }] =
    useDisclosure(false);

  // Columns definition (Purely UI)
  const columns: DataTableColumn<RES_Lote>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 60,
    },
    {
      accessor: "codigo_lote",
      title: "Cód. Lote",
      textAlign: "center",
      width: 130,
      render: (record) => (
        <Badge
          variant="light"
          color="indigo"
          radius="md"
          className="font-bold border border-indigo-500/20 py-3 mx-auto"
        >
          {record.correlativo}
        </Badge>
      ),
    },
    {
      accessor: "producto",
      title: "Producto",
      textAlign: "center",
      width: 300,
      render: (record) => (
        <Stack gap={2} align="center">
          <Text
            size="sm"
            fw={700}
            className="text-white leading-tight text-center"
          >
            {record.producto}
          </Text>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Text
              size="9px"
              c="dimmed"
              fw={800}
              className="uppercase tracking-wider px-1.5 py-0.5 bg-zinc-800/50 rounded border border-zinc-700/30"
            >
              {record.categoria || "Sin cat."}
            </Text>
            {record.es_perecible === 1 && (
              <Badge
                variant="light"
                color="orange"
                size="xs"
                radius="xs"
                className="h-4 px-1 text-[8px] font-black uppercase"
              >
                Perecible
              </Badge>
            )}
            {record.es_fiscalizado === 1 && (
              <Badge
                variant="light"
                color="red"
                size="xs"
                radius="xs"
                className="h-4 px-1 text-[8px] font-black uppercase"
              >
                Fiscalizado
              </Badge>
            )}
          </div>
          {record.descripcion && (
            <Text
              size="11px"
              c="zinc.5"
              fs="italic"
              lineClamp={1}
              className="mt-0.5 opacity-80 text-center"
            >
              {record.descripcion}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "stock_actual",
      title: "Stock Disponible",
      textAlign: "center",
      width: 320,
      render: (record) => {
        const esBajoStock =
          Number(record.stock_actual_base) <= Number(record.stock_minimo);
        return (
          <div className="flex flex-col items-center gap-1.5">
            <Group gap="lg" wrap="nowrap" justify="center">
              <div className="flex flex-col items-center">
                <Badge
                  variant="filled"
                  color="teal.9"
                  radius="md"
                  className="text-white font-bold h-7 px-3 shadow-lg shadow-teal-900/40"
                >
                  {record.stock_actual} {record.unidad_medida}
                </Badge>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <Text size="10px" c="white" fw={800}>
                    {record.contenido_por_presentacion}{" "}
                    {record.unidad_medida_base} x {record.unidad_medida}
                  </Text>
                </div>
              </div>

              <div className="h-8 w-px bg-zinc-800/50" />

              <div className="flex flex-col items-center">
                <Badge
                  variant="light"
                  color="pink.6"
                  radius="md"
                  className="font-bold h-7 border border-pink-500/20"
                >
                  {record.stock_actual_base} {record.unidad_medida_base}
                </Badge>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <Text size="10px" c="zinc.5" fw={700}>
                    Mínimo:
                  </Text>
                  <Text size="10px" c="pink.5" fw={800}>
                    {record.stock_minimo}
                  </Text>
                </div>
              </div>

              <ActionIcon
                variant="subtle"
                color="zinc"
                size="lg"
                onClick={() => {
                  setLoteParaAjustar(record);
                  openAjuste();
                }}
                className="hover:bg-zinc-800 transition-colors rounded-xl"
              >
                <PencilSquareIcon className="w-5 h-5 text-zinc-400" />
              </ActionIcon>
            </Group>
            {esBajoStock && (
              <div className="bg-red-500/10 border border-red-500/20 rounded py-0.5 px-2 w-fit animate-pulse">
                <Text
                  size="9px"
                  c="red.4"
                  fw={900}
                  className="uppercase tracking-widest leading-none"
                >
                  Critico: Bajando del mínimo
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessor: "fecha_ingreso",
      title: "Ingreso",
      textAlign: "center",
      width: 140,
      render: (record) => (
        <Group gap={8} wrap="nowrap" justify="center">
          <div className="p-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
            <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <Text size="11px" fw={700} className="text-zinc-200">
              {dayjs(record.fecha_hora_ingreso).format("DD MMM YYYY")}
            </Text>
            <Text
              size="10px"
              c="dimmed"
              fw={700}
              className="uppercase tracking-tighter"
            >
              {dayjs(record.fecha_hora_ingreso).format("HH:mm")}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      accessor: "fecha_vencimiento",
      title: "Vencimiento",
      textAlign: "center",
      width: 150,
      render: (record) => {
        if (!record.fecha_vencimiento) {
          return (
            <Text size="xs" c="dimmed" fs="italic">
              Sin vcto.
            </Text>
          );
        }
        const isVencido = record.estado_vencimiento === "Vencido";
        return (
          <Group gap={8} wrap="nowrap" justify="center">
            <div
              className={`p-1.5 rounded-lg border ${isVencido ? "bg-red-500/10 border-red-500/30" : "bg-orange-500/10 border-orange-500/30"}`}
            >
              <ClockIcon
                className={`w-4 h-4 ${isVencido ? "text-red-500" : "text-orange-400"}`}
              />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <Text
                size="xs"
                fw={800}
                className={isVencido ? "text-red-500" : "text-orange-400"}
              >
                {dayjs(record.fecha_vencimiento).format("DD/MM/YYYY")}
              </Text>
              <Text
                size="9px"
                fw={900}
                className={`uppercase tracking-widest ${isVencido ? "text-red-700" : "text-orange-800"}`}
              >
                {record.estado_vencimiento}
              </Text>
            </div>
          </Group>
        );
      },
    },
    {
      accessor: "plazo",
      title: "Plazo",
      textAlign: "center",
      width: 150,
      render: (record) => {
        if (!record.fecha_vencimiento || record.dias_para_vencer === null) {
          return (
            <Text size="xs" c="dimmed" fs="italic">
              ---
            </Text>
          );
        }
        return (
          <Stack gap={2} align="center">
            <Text
              size="xs"
              fw={900}
              className={
                record.dias_para_vencer <= 0 ? "text-red-500" : "text-zinc-300"
              }
            >
              {record.dias_para_vencer <= 0
                ? "VENCIDO"
                : `QUEDAN: ${record.dias_para_vencer} DÍAS`}
            </Text>
            {record.dias_espera_vencimiento && (
              <Text size="9px" c="dimmed" fw={700} className="uppercase">
                Aviso: {record.dias_espera_vencimiento}d. antes
              </Text>
            )}
          </Stack>
        );
      },
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 100,
      render: (record) => (
        <Badge
          color={record.estado === "Activo" ? "teal.9" : "grow.9"}
          variant="filled"
          size="xs"
          radius="sm"
          className="font-black border border-zinc-800 shadow-md mx-auto"
        >
          {record.estado.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-1">
      <Paper
        withBorder
        p={6}
        radius="lg"
        className="bg-zinc-900/30 border-zinc-800/50 shadow-2xl backdrop-blur-md"
      >
        <div className="flex flex-col lg:flex-row gap-2 items-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-1 w-full">
            <Select
              label="Almacén de Consulta"
              placeholder="Seleccionar..."
              data={almacenes.map((a) => ({
                value: String(a.id_almacen),
                label: a.nombre,
              }))}
              size="xs"
              value={idAlmacen}
              onChange={setIdAlmacen}
              searchable
              clearable
              radius="md"
              leftSection={
                <InboxStackIcon className="w-3.5 h-3.5 text-indigo-400" />
              }
              classNames={{
                root: "flex-1",
                input:
                  "bg-zinc-900/80 border-zinc-800 focus:border-indigo-500/50 text-white font-bold h-7 text-[10px] min-h-0",
                label:
                  "text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5",
                dropdown:
                  "bg-zinc-950 border-zinc-800 rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl",
                option:
                  "text-zinc-400 hover:bg-indigo-600 hover:text-white data-[selected]:bg-indigo-500 data-[selected]:text-white py-1 px-2 text-[10px] font-bold transition-colors",
              }}
            />

            <TextInput
              label="Búsqueda Inteligente"
              placeholder="Cód. Lote, Producto..."
              size="xs"
              leftSection={
                <MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-500" />
              }
              value={busqueda}
              onChange={(e) => setBusqueda(e.currentTarget.value)}
              disabled={!idAlmacen}
              radius="md"
              classNames={{
                root: "flex-1",
                input:
                  "bg-zinc-900/80 border-zinc-800 focus:border-indigo-500/50 text-white font-bold h-7 text-[10px] min-h-0",
                label:
                  "text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5",
              }}
            />

            <Select
              label="Filtrar por Categoría"
              placeholder="Todas"
              size="xs"
              data={categoriasUnicas}
              value={filtroCategoria}
              onChange={setFiltroCategoria}
              searchable
              clearable
              disabled={!idAlmacen}
              radius="md"
              leftSection={
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 ml-1.5" />
              }
              classNames={{
                root: "flex-1",
                input:
                  "bg-zinc-900/80 border-zinc-800 focus:border-indigo-500/50 text-white font-bold h-7 text-[10px] min-h-0",
                label:
                  "text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5",
                dropdown:
                  "bg-zinc-950 border-zinc-800 rounded-lg backdrop-blur-xl",
                option:
                  "text-zinc-400 hover:bg-indigo-600 hover:text-white py-1 px-2 text-[10px] font-bold transition-colors",
              }}
            />

            <Select
              label="Filtrar por Producto"
              placeholder="Todos"
              size="xs"
              data={productosUnicos}
              value={filtroProducto}
              onChange={setFiltroProducto}
              searchable
              clearable
              disabled={!idAlmacen}
              radius="md"
              leftSection={
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 ml-1.5" />
              }
              classNames={{
                root: "flex-1",
                input:
                  "bg-zinc-900/80 border-zinc-800 focus:border-indigo-500/50 text-white font-bold h-7 text-[10px] min-h-0",
                label:
                  "text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-0.5 px-0.5",
                dropdown:
                  "bg-zinc-950 border-zinc-800 rounded-lg backdrop-blur-xl",
                option:
                  "text-zinc-400 hover:bg-indigo-600 hover:text-white py-1 px-2 text-[10px] font-bold transition-colors",
              }}
            />
          </div>

          <Button
            leftSection={<PlusIcon className="w-3.5 h-3.5" />}
            onClick={openCreate}
            disabled={!idAlmacen}
            radius="md"
            size="xs"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-900/50 border-0 h-7 px-4 font-black text-[9px] uppercase tracking-wider transition-all active:scale-95 w-full lg:w-auto"
          >
            Nuevo Lote
          </Button>
        </div>
      </Paper>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-4xl overflow-hidden backdrop-blur-sm shadow-2xl relative">
        <DataTableEstandar
          idAccessor="id_lote"
          columns={columns}
          records={records}
          loading={loading}
        />
      </div>

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Ingreso de Mercadería"
        size="lg"
      >
        <RegistroLote
          initialAlmacenId={idAlmacen ? Number(idAlmacen) : null}
          onSuccess={(nuevoLote) => {
            closeCreate();
            addLote(nuevoLote);
          }}
          onCancel={closeCreate}
        />
      </ModalEstandar>

      <ModalEstandar
        opened={openedAjuste}
        close={closeAjuste}
        title="Corrección de Inventario"
        size="lg"
      >
        {loteParaAjustar && (
          <AjusteStockModal
            lote={loteParaAjustar}
            onSuccess={(updatedLote) => {
              updateLote(updatedLote);
              closeAjuste();
            }}
            onCancel={closeAjuste}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

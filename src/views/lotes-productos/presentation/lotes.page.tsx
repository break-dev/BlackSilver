import {
  Badge,
  Button,
  Group,
  Text,
  TextInput,
  Select,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState, useMemo } from "react";
import {
  PlusIcon,
  CubeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import dayjs from "dayjs";

import { useLote } from "../../../services/lote/useLote";
import type { RES_Lote } from "../service/lotes-productos.responses";

import { useUIStore } from "../../../stores/ui.store";
import { DataTableEstandar } from "../../utils/datatable-estandar";
import { ModalEstandar } from "../../utils/modal-estandar";
import { RegistroLote } from "./registro-lote";
import { AjusteStockModal } from "./ajuste-stock";
import { SelectAlmacen } from "../../utils/select-almacen";

const PAGE_SIZE = 20;

export const LotesPage = () => {
  const setTitle = useUIStore((state) => state.setTitle);

  // Data State
  const [lotes, setLotes] = useState<RES_Lote[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Filters
  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [filtroProducto, setFiltroProducto] = useState<string | null>(null);

  // Modals
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const [loteParaAjustar, setLoteParaAjustar] = useState<RES_Lote | null>(null);
  const [openedAjuste, { open: openAjuste, close: closeAjuste }] =
    useDisclosure(false);

  // Hooks
  const { listarPorAlmacen } = useLote({ setError: () => {} });

  // Title
  useEffect(() => {
    setTitle("Gestión de Lotes");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load Lotes when Almacen changes
  useEffect(() => {
    const loadLotes = async () => {
      setLotes([]);
      setPage(1);
      setBusqueda("");
      setFiltroCategoria(null);
      setFiltroProducto(null);

      if (!idAlmacen) return;

      setLoading(true);
      const data = await listarPorAlmacen(Number(idAlmacen));
      if (data) setLotes(data);
      setLoading(false);
    };
    loadLotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlmacen]);

  // Derived Filters
  const categoriasUnicas = useMemo(() => {
    const unique = new Set(lotes.map((l) => l.categoria).filter(Boolean));
    return Array.from(unique)
      .sort()
      .map((c) => ({ value: String(c), label: String(c) }));
  }, [lotes]);

  const productosUnicos = useMemo(() => {
    const source = filtroCategoria
      ? lotes.filter((l) => l.categoria === filtroCategoria)
      : lotes;
    const unique = new Set(source.map((l) => l.producto).filter(Boolean));
    return Array.from(unique)
      .sort()
      .map((p) => ({ value: String(p), label: String(p) }));
  }, [lotes, filtroCategoria]);

  const filteredRecords = useMemo(() => {
    return lotes.filter((l) => {
      const matchCategoria =
        !filtroCategoria || l.categoria === filtroCategoria;
      const matchProducto = !filtroProducto || l.producto === filtroProducto;

      const q = busqueda.toLowerCase();
      const matchBusqueda =
        !busqueda ||
        l.producto.toLowerCase().includes(q) ||
        l.codigo_lote.toLowerCase().includes(q) ||
        (l.categoria || "").toLowerCase().includes(q);

      return matchCategoria && matchProducto && matchBusqueda;
    });
  }, [lotes, busqueda, filtroCategoria, filtroProducto]);

  const paginatedRecords = useMemo(() => {
    const from = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(from, from + PAGE_SIZE);
  }, [filteredRecords, page]);

  // Columns
  const columns: DataTableColumn<RES_Lote>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 60,
      render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      accessor: "codigo_lote",
      title: "Cód. Lote",
      width: 120,
      render: (record) => (
        <Badge variant="light" color="violet" radius="sm">
          {record.codigo_lote}
        </Badge>
      ),
    },
    {
      accessor: "producto",
      title: "Producto",
      render: (record) => (
        <Group gap="xs">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500">
            <CubeIcon className="w-4 h-4" />
          </div>
          <Text size="sm" fw={600} className="text-white">
            {record.producto}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "categoria",
      title: "Categoría",
      width: 150,
      render: (record) => (
        <Text size="sm" className="text-zinc-300 font-medium">
          {record.categoria || "-"}
        </Text>
      ),
    },
    {
      accessor: "stock_actual",
      title: "Stock Actual",
      width: 280,
      render: (record) => {
        const esBajoStock =
          Number(record.stock_total_almacen) <= Number(record.stock_minimo);

        return (
          <div className="flex flex-col gap-1">
            <Group gap="xs" wrap="nowrap">
              <Badge
                variant="filled"
                color="cyan"
                radius="sm"
                size="sm"
                className="text-white fw-bold shadow-xs"
              >
                {record.stock_actual} {record.unidad_medida}
              </Badge>
              <div className="h-4 w-[1px] bg-zinc-800" />
              <Badge
                variant="filled"
                color="pink"
                radius="sm"
                size="sm"
                className="text-white fw-bold shadow-xs"
              >
                {record.stock_actual_base} {record.producto.split(" - ").pop()}
              </Badge>

              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => {
                  setLoteParaAjustar(record);
                  openAjuste();
                }}
                title="Ajustar Stock"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </ActionIcon>
            </Group>
            {esBajoStock && (
              <Badge
                color="red"
                variant="dot"
                size="xs"
                className="animate-pulse"
              >
                Bajo Stock (Mín: {record.stock_minimo})
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessor: "fecha_hora_ingreso",
      title: "Fecha de Ingreso",
      width: 160,
      render: (record) => (
        <Group gap="sm" wrap="nowrap">
          <CalendarDaysIcon className="w-5 h-5 text-indigo-400" />
          <div className="flex flex-col gap-0">
            <Text size="sm" fw={600} className="text-zinc-100">
              {dayjs(record.fecha_hora_ingreso).format("DD/MM/YYYY")}
            </Text>
            <Text size="xs" color="dimmed" fw={500}>
              {dayjs(record.fecha_hora_ingreso).format("HH:mm A")}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      accessor: "fecha_vencimiento",
      title: "Vencimiento",
      width: 180,
      render: (record) => {
        if (!record.fecha_vencimiento)
          return (
            <Group gap="xs" wrap="nowrap" opacity={0.5}>
              <div className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800">
                <ClockIcon className="w-3 h-3 text-zinc-500" />
              </div>
              <Text size="xs" c="dimmed" className="italic">
                No perecible
              </Text>
            </Group>
          );

        const dias =
          record.dias_para_vencer !== null
            ? Number(record.dias_para_vencer)
            : 0;
        const diasConfig =
          record.dias_espera_vencimiento !== null
            ? Number(record.dias_espera_vencimiento)
            : 0;

        // Determinar estado
        let color = "zinc";
        let mensaje = "Vigente";
        let iconColor = "text-zinc-500";

        if (dias < 0) {
          color = "red";
          mensaje = `Vencido hace ${Math.abs(dias)} días`;
          iconColor = "text-red-500";
        } else if (dias <= diasConfig) {
          color = "orange";
          mensaje = `Vence en ${dias} días`;
          iconColor = "text-orange-400";
        }

        return (
          <Group gap="sm" wrap="nowrap">
            <ClockIcon className={`w-5 h-5 ${iconColor}`} />
            <div className="flex flex-col gap-0">
              <Text size="sm" fw={600} className="text-zinc-100">
                {dayjs(record.fecha_vencimiento).format("DD/MM/YYYY")}
              </Text>
              {mensaje !== "Vigente" && (
                <Text size="xs" color={color} fw={700}>
                  {mensaje}
                </Text>
              )}
            </div>
          </Group>
        );
      },
    },
    {
      accessor: "estado",
      title: "Estado",
      width: 100,
      textAlign: "center",
      render: (record) => (
        <Badge
          color={record.estado === "Activo" ? "green" : "red"}
          variant="light"
          size="sm"
        >
          {record.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="flex flex-wrap gap-4 w-full xl:w-auto flex-1">
          {/* 1. Almacén */}
          <div className="w-full sm:w-64">
            <SelectAlmacen
              label={null}
              placeholder="Almacén"
              value={idAlmacen}
              onChange={(val) => {
                setIdAlmacen(val);
              }}
              className="w-full"
            />
          </div>

          {/* 2. Buscador */}
          <TextInput
            placeholder="Buscar lote, producto..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.currentTarget.value);
              setPage(1);
            }}
            disabled={!idAlmacen}
            className="flex-1 min-w-[200px]"
            radius="lg"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            }}
          />

          {/* 3. Filtros Dinámicos */}
          {lotes.length > 0 && (
            <>
              <Select
                placeholder="Categoría"
                data={categoriasUnicas}
                value={filtroCategoria}
                onChange={(val) => {
                  setFiltroCategoria(val);
                  setFiltroProducto(null);
                  setPage(1);
                }}
                searchable
                clearable
                className="w-full sm:w-40"
                radius="lg"
                classNames={{
                  input:
                    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                  dropdown: "bg-zinc-900 border-zinc-800",
                  option: "text-zinc-300 hover:bg-zinc-800",
                }}
              />
              <Select
                placeholder="Producto"
                data={productosUnicos}
                value={filtroProducto}
                onChange={(val) => {
                  setFiltroProducto(val);
                  setPage(1);
                }}
                searchable
                clearable
                disabled={!filtroCategoria && productosUnicos.length > 50}
                className="w-full sm:w-48"
                radius="lg"
                classNames={{
                  input:
                    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                  dropdown: "bg-zinc-900 border-zinc-800",
                  option: "text-zinc-300 hover:bg-zinc-800",
                }}
              />
            </>
          )}
        </div>

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openCreate}
          disabled={!idAlmacen}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 border-0 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          Nuevo Lote
        </Button>
      </div>

      {/* Empty State or Table */}
      {!idAlmacen ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <CubeIcon className="w-12 h-12 text-zinc-600 mb-4" />
          <Text className="text-zinc-400 font-medium">
            Seleccione un almacén para consultar sus lotes disponibles.
          </Text>
        </div>
      ) : (
        <DataTableEstandar
          idAccessor="id_lote"
          columns={columns}
          records={paginatedRecords}
          totalRecords={filteredRecords.length}
          page={page}
          onPageChange={setPage}
          loading={loading}
        />
      )}

      {/* Modal Create */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Registro de Nuevo Lote"
      >
        <RegistroLote
          initialAlmacenId={idAlmacen ? Number(idAlmacen) : null}
          onSuccess={(nuevoLote) => {
            closeCreate();
            // Add to list only if matches current warehouse
            if (
              idAlmacen &&
              String(nuevoLote.id_almacen) === String(idAlmacen)
            ) {
              setLotes((prev) => [nuevoLote, ...prev]);
            }
          }}
          onCancel={closeCreate}
        />
      </ModalEstandar>

      {/* Modal Ajuste Stock */}
      <ModalEstandar
        opened={openedAjuste}
        close={closeAjuste}
        title="Ajuste de Stock"
        size="lg"
      >
        {loteParaAjustar && (
          <AjusteStockModal
            lote={loteParaAjustar}
            onSuccess={(updatedLote) => {
              setLotes((prev) =>
                prev.map((l) =>
                  l.id_lote === updatedLote.id_lote ? updatedLote : l,
                ),
              );
              closeAjuste();
            }}
            onCancel={closeAjuste}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

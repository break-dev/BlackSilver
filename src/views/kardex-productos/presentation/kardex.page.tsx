import {
  Badge,
  Text,
  TextInput,
  Select,
  Group,
  Stack,
  Loader,
} from "@mantine/core";
import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  TagIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";

import { useKardex } from "../hooks/useKardex";
import type { RES_MovimientoKardex } from "../service/kardex.responses";

import { useUIStore } from "../../../stores/ui.store";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { TipoMovimiento } from "../../../shared/enums/tipos";
import { MESES } from "../../../presentation/variables/meses";

export const KardexProductosPage = () => {
  const setTitle = useUIStore((state) => state.setTitle);

  const {
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
    busqueda,
    setBusqueda,
    filtroProducto,
    setFiltroProducto,
    filtroLote,
    setFiltroLote,
    filteredRecords,
    almacenes,
    productosUnicos,
    lotesUnicos,
    loadingMovimientos,
    loadingAlmacenes,
    movimientos,
    error,
  } = useKardex();

  // Title effect
  useEffect(() => {
    setTitle("Kardex de Productos");
  }, [setTitle]);

  // Columns definition
  const columns: DataTableColumn<RES_MovimientoKardex>[] = useMemo(
    () => [
      {
        accessor: "id_kardex",
        title: "#",
        textAlign: "center",
        width: 60,
        render: (_record, index) => index + 1,
      },
      {
        accessor: "correlativo",
        title: "Cód. Lote",
        width: 120,
        render: (record) => (
          <Badge variant="light" color="violet" radius="sm">
            {record.correlativo}
          </Badge>
        ),
      },
      {
        accessor: "producto",
        title: "Producto",
        width: 300,
        render: (record) => (
          <Group gap="xs" wrap="nowrap">
            <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 shrink-0 border border-zinc-700">
              <CubeIcon className="w-5 h-5" />
            </div>
            <Stack gap={0}>
              <Text size="sm" fw={700} className="text-white leading-tight">
                {record.producto || "-"}
              </Text>
              {record.categoria && (
                <Group gap={4} wrap="nowrap">
                  <TagIcon className="w-3 h-3 text-zinc-500" />
                  <Text size="xs" color="dimmed" fw={500} className="italic">
                    {record.categoria}
                  </Text>
                </Group>
              )}
            </Stack>
          </Group>
        ),
      },
      {
        accessor: "tipo_movimiento",
        title: "Transacción",
        width: 180,
        render: (record) => {
          const isIngreso = record.tipo_movimiento
            .toLowerCase()
            .includes("ingreso");
          return (
            <Stack gap={2}>
              <Text
                size="10px"
                fw={800}
                className="text-zinc-500 uppercase tracking-tighter ml-1"
              >
                {record.tipo_origen}
              </Text>
              <Badge
                color={isIngreso ? "teal" : "orange"}
                variant="light"
                size="sm"
                radius="sm"
                leftSection={
                  isIngreso ? (
                    <ArrowDownIcon className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpIcon className="w-3.5 h-3.5" />
                  )
                }
              >
                {record.tipo_movimiento}
              </Badge>
            </Stack>
          );
        },
      },
      {
        accessor: "cantidad_movimiento",
        title: "Movimiento",
        textAlign: "right",
        width: 160,
        render: (record) => {
          const isIngreso = record.tipo_movimiento === TipoMovimiento.Ingreso;
          return (
            <div className="flex flex-col items-end gap-1">
              {record.unidad_base !== record.unidad_lote && (
                <Badge
                  variant="filled"
                  color={isIngreso ? "green.7" : "red.7"}
                  size="sm"
                  radius="sm"
                  className="font-bold shadow-md"
                >
                  {isIngreso ? "+" : "-"}{" "}
                  {Number(record.cantidad_movimiento).toFixed(2)}{" "}
                  {record.unidad_lote_abv}
                </Badge>
              )}
              <Text
                size="xs"
                c={isIngreso ? "green.4" : "red.4"}
                fw={700}
                className="italic pr-1 opacity-90"
              >
                ({isIngreso ? "+" : "-"}{" "}
                {Number(record.cantidad_movimiento_base).toFixed(2)}{" "}
                {record.unidad_base_abv})
              </Text>
            </div>
          );
        },
      },
      {
        accessor: "stock_resultante",
        title: "Stock Resultante",
        textAlign: "right",
        width: 170,
        render: (record) => (
          <div className="flex flex-col items-end gap-1">
            {record.unidad_base !== record.unidad_lote && (
              <Badge
                variant="light"
                color="cyan"
                radius="sm"
                size="sm"
                className="font-bold border border-cyan-500/30"
              >
                {Number(record.stock_resultante).toFixed(2)}{" "}
                {record.unidad_lote_abv}
              </Badge>
            )}
            <Badge
              variant="light"
              color="pink"
              radius="sm"
              size="sm"
              className="font-bold border border-pink-500/30"
            >
              {Number(record.stock_resultante_base).toFixed(2)}{" "}
              {record.unidad_base_abv}
            </Badge>
          </div>
        ),
      },
      {
        accessor: "created_at",
        title: "Fecha",
        width: 160,
        render: (record) => (
          <Group gap="sm" wrap="nowrap">
            <CalendarDaysIcon className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="flex flex-col gap-0">
              <Text size="xs" fw={600} className="text-zinc-100">
                {dayjs(record.created_at).format("DD/MM/YYYY")}
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                {dayjs(record.created_at).format("HH:mm A")}
              </Text>
            </div>
          </Group>
        ),
      },
      {
        accessor: "descripcion",
        title: "Descripción",
        width: 200,
        render: (record) => (
          <Text
            size="xs"
            className="text-zinc-400 italic line-clamp-2"
            title={record.descripcion || ""}
          >
            {record.descripcion || "-"}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      {/* Filtros Principales y Buscador */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:flex xl:flex-wrap gap-4 w-full">
          {/* Almacén */}
          <div className="w-full sm:w-64">
            <Select
              placeholder="Seleccione Almacén"
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
                  "bg-zinc-950/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          {/* Mes */}
          <div className="w-full sm:w-44">
            <Select
              placeholder="Mes"
              leftSection={
                <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
              }
              data={MESES}
              value={mes}
              onChange={(val) => setMes(val || "")}
              radius="lg"
              allowDeselect={false}
              classNames={{
                input:
                  "bg-zinc-950/50 border-zinc-800 focus:border-zinc-300 text-white",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          {/* Año */}
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
              allowDeselect={false}
              classNames={{
                input:
                  "bg-zinc-950/50 border-zinc-800 focus:border-zinc-300 text-white",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          {/* Buscador */}
          <TextInput
            placeholder="Producto, lote, glosa..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            disabled={!idAlmacen}
            className="flex-1 min-w-[200px]"
            radius="lg"
            classNames={{
              input:
                "bg-zinc-950/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            }}
          />

          {/* Filtros Dinámicos (solo si hay movimientos) */}
          {movimientos.length > 0 && (
            <div className="flex gap-4 w-full xl:w-auto animate-fade-in">
              <Select
                placeholder="Filtrar Producto"
                data={productosUnicos}
                value={filtroProducto}
                onChange={(val) => {
                  setFiltroProducto(val);
                  setFiltroLote(null);
                }}
                searchable
                clearable
                className="flex-1 xl:w-60"
                radius="lg"
                classNames={{
                  input:
                    "bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-500",
                  dropdown: "bg-zinc-900 border-zinc-800",
                  option: "text-zinc-300 hover:bg-zinc-800",
                }}
              />
              <Select
                placeholder="Filtrar Lote"
                data={lotesUnicos}
                value={filtroLote}
                onChange={setFiltroLote}
                searchable
                clearable
                disabled={!filtroProducto && lotesUnicos.length > 50}
                className="flex-1 xl:w-44"
                radius="lg"
                classNames={{
                  input:
                    "bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-500",
                  dropdown: "bg-zinc-900 border-zinc-800",
                  option: "text-zinc-300 hover:bg-zinc-800",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabla / Estado Vacío */}
      {!idAlmacen ? (
        <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-zinc-800 rounded-4xl bg-zinc-900/20">
          <div className="p-5 rounded-full bg-zinc-900/50 mb-4 border border-zinc-800">
            <CubeIcon className="w-12 h-12 text-zinc-600" />
          </div>
          <Text className="text-zinc-400 font-bold text-xl text-center">
            Seleccione un Almacén
          </Text>
          <Text className="text-zinc-500 text-sm max-w-xs text-center mt-1">
            Debe elegir un almacén y periodo para visualizar los movimientos de
            stock.
          </Text>
        </div>
      ) : (
        <div className="animate-fade-in">
          <DataTableEstandar
            idAccessor="id_kardex"
            columns={columns}
            records={filteredRecords}
            loading={loadingMovimientos}
          />
        </div>
      )}

      {error && (
        <Text
          c="red.5"
          size="sm"
          mt="md"
          fw={700}
          className="text-center animate-pulse"
        >
          {error}
        </Text>
      )}
    </div>
  );
};

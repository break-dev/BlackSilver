import { ActionIcon, Badge, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMemo, useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  InboxStackIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import dayjs from "dayjs";

import { useLotesPage } from "../../hooks/useLotesPage";
import type { RES_Lote } from "../../service/lotes.responses";
import { useTitlePage } from "../../../../hooks/useTitlePage";

import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { RegistroLote } from "../registro-lote";
import { AjusteStockModal } from "../ajuste-stock";
import { LotesFilter } from "./lotes-filter";
import { ProductGroupCard } from "./product-group-card";
import type { GroupedProduct } from "./types";
import { EstadoVencimiento } from "../../../../shared/enums/estados";
import { formatNumber } from "../../../../presentation/functions/formatNumber";

export const LotesPage = () => {
  useTitlePage("Gestión de Inventario y Lotes");
  const {
    almacenes,
    records,
    loading,
    loadingAlmacenes,
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

  // Grouping logic
  const groupedProducts = useMemo(() => {
    const groups: Record<number, GroupedProduct> = {};

    records.forEach((lote) => {
      if (!groups[lote.id_producto]) {
        groups[lote.id_producto] = {
          id_producto: lote.id_producto,
          producto: lote.producto,
          categoria: lote.categoria,
          unidad_medida_base: lote.unidad_medida_base,
          stock_minimo: lote.stock_minimo,
          lotes: [],
          total_stock_base: 0,
          vigentes: 0,
          por_vencer: 0,
          vencidos: 0,
          es_perecible: lote.es_perecible,
          es_fiscalizado: lote.es_fiscalizado,
        };
      }
      const group = groups[lote.id_producto];
      group.lotes.push(lote);
      group.total_stock_base += Number(lote.stock_actual_base || 0);

      // Solo contabilizamos si el lote tiene stock positivo
      if (Number(lote.stock_actual_base) > 0) {
        if (lote.estado_vencimiento === EstadoVencimiento.Vencido) {
          group.vencidos++;
        } else if (lote.estado_vencimiento === EstadoVencimiento.PorVencer) {
          group.por_vencer++;
        } else if (
          lote.estado_vencimiento === EstadoVencimiento.Vigente ||
          lote.estado_vencimiento === EstadoVencimiento.NA ||
          lote.estado_vencimiento === EstadoVencimiento.SinFecha
        ) {
          group.vigentes++;
        }
      }
    });

    return Object.values(groups).sort((a, b) =>
      a.producto.localeCompare(b.producto),
    );
  }, [records]);

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
      accessor: "stock_actual",
      title: "Stock Disponible",
      textAlign: "center",
      width: 320,
      render: (record) => {
        return (
          <div className="flex flex-row justify-center">
            <Group gap="lg" wrap="nowrap" justify="center">
              {record.unidad_medida_base !== record.unidad_medida && (
                <>
                  <Badge
                    variant="filled"
                    color="teal.9"
                    radius="md"
                    className="text-white font-bold h-7 px-3 shadow-lg shadow-teal-900/40"
                  >
                    {formatNumber(record.stock_actual)} {record.unidad_medida}
                  </Badge>

                  <div className="flex items-center gap-1 mt-1 px-1">
                    {/* Verificamos que las unidades sean distintas antes de renderizar el texto */}

                    <Text size="10px" c="white" fw={800}>
                      {formatNumber(record.contenido_por_presentacion)}{" "}
                      {record.unidad_medida_base} x {record.unidad_medida}
                    </Text>
                  </div>
                </>
              )}

              <div className="flex flex-col items-center">
                <Badge
                  variant="light"
                  color="pink.6"
                  radius="md"
                  className="font-bold h-7 border border-pink-500/20"
                >
                  {record.stock_actual_base} {record.unidad_medida_base}
                </Badge>
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
              No aplica
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
      <LotesFilter
        almacenes={almacenes}
        loadingAlmacenes={loadingAlmacenes}
        idAlmacen={idAlmacen}
        setIdAlmacen={setIdAlmacen}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        categoriasUnicas={categoriasUnicas}
        filtroCategoria={filtroCategoria}
        setFiltroCategoria={setFiltroCategoria}
        productosUnicos={productosUnicos}
        filtroProducto={filtroProducto}
        setFiltroProducto={setFiltroProducto}
        openCreate={openCreate}
      />

      {loading ? (
        <Stack align="center" gap="md" py={100}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <InboxStackIcon className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <Text
            size="xs"
            fw={900}
            className="uppercase tracking-[0.3em] text-zinc-500"
          >
            Consultando Inventario...
          </Text>
        </Stack>
      ) : groupedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10 backdrop-blur-sm">
          <InboxStackIcon className="w-12 h-12 text-zinc-700 mb-4" />
          <Text
            size="sm"
            fw={700}
            className="text-zinc-400 uppercase tracking-widest"
          >
            Sin resultados
          </Text>
          <Text size="xs" c="dimmed" className="mt-1">
            No se encontraron lotes para los filtros aplicados.
          </Text>
        </div>
      ) : (
        <Stack gap="xl">
          {groupedProducts.map((p) => (
            <ProductGroupCard
              key={p.id_producto}
              product={p}
              columns={columns}
              loading={loading}
            />
          ))}
        </Stack>
      )}

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Ingreso de Mercadería"
        size="lg"
      >
        <RegistroLote
          initialAlmacenId={idAlmacen ? Number(idAlmacen) : null}
          almacenes={almacenes}
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

import {
  Badge,
  Group,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Tooltip,
  Select,
} from "@mantine/core";
import {
  CalendarDaysIcon,
  EyeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useMemo, useState, useCallback } from "react";
import { type DataTableColumn } from "mantine-datatable";
import { useDisclosure } from "@mantine/hooks";

import { useTitlePage } from "../../../hooks/useTitlePage";
import { usePrint } from "../../../hooks/usePrint";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { useOrdenCompra } from "../hooks/useOrdenCompra";
import { OrdenCompraService } from "../service/orden-compra.service";
import { OrdenCompraPDF } from "./orden-compra-pdf";
import { useNotify } from "../../../hooks/useNotify";
import { Estado_OrdenCompra } from "../../../shared/enums/orden-compra/orden-compra";
import type { RES_OrdenCompra, RES_OrdenCompraDetalle } from "../service/orden-compra.responses";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { DetalleOrdenCompra } from "./detalle-orden-compra.tsx";
import { MESES } from "../../../shared/variables/meses";

// ─── Colores por estado ──────────────────────────────────────────────────────
const COLOR_BY_STATE: Record<string, { color: string; label: string }> = {
  [Estado_OrdenCompra.Generada]:    { color: "teal",   label: "Generada" },
  [Estado_OrdenCompra.EnRecepcion]: { color: "blue",   label: "En Recepción" },
  [Estado_OrdenCompra.Anulada]:     { color: "red",    label: "Anulada" },
  [Estado_OrdenCompra.Cerrada]:     { color: "gray",   label: "Cerrada" },
  [Estado_OrdenCompra.Completada]:  { color: "green",  label: "Completada" },
};

export const OrdenCompraPage = () => {
  useTitlePage("Órdenes de Compra");

  const { 
    filteredRecords, 
    loading, 
    filters: { mes, setMes, yearcito, setYearcito, search, setSearch } 
  } = useOrdenCompra();

  const { print } = usePrint();
  const { notify } = useNotify();
  
  const [printingId, setPrintingId] = useState<number | null>(null);
  const [selectedOrden, setSelectedOrden] = useState<RES_OrdenCompra | null>(null);
  const [detalles, setDetalles] = useState<RES_OrdenCompraDetalle[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [openedDetalle, { open: openDet, close: closeDet }] = useDisclosure(false);

  const handlePrintOC = useCallback(async (orden: RES_OrdenCompra) => {
    setPrintingId(orden.id);
    try {
      const res = await OrdenCompraService.get_detalles(orden.id);
      if (res.success) {
        print(<OrdenCompraPDF orden={orden} detalles={res.data.detalles} />, {
          documentTitle: `OC - ${orden.correlativo}`,
        });
      } else {
        notify({ type: "error", content: res.message });
      }
    } catch {
      notify({ type: "error", content: "No se pudo generar el PDF." });
    } finally {
      setPrintingId(null);
    }
  }, [print, notify]);

  const handleVerDetalle = useCallback(async (orden: RES_OrdenCompra) => {
    setSelectedOrden(orden);
    openDet();
    setLoadingDetalle(true);
    try {
      const res = await OrdenCompraService.get_detalles(orden.id);
      if (res.success) {
        setDetalles(res.data.detalles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetalle(false);
    }
  }, [openDet]);

  const columns: DataTableColumn<RES_OrdenCompra>[] = useMemo(() => [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_, index) => index + 1,
    },
    {
      accessor: "correlativo",
      title: "Orden",
      width: 140,
      render: (item) => (
        <Text size="sm" fw={900} className="text-emerald-400 font-mono">
          {item.correlativo}
        </Text>
      ),
    },
    {
      accessor: "empresa_nombre",
      title: "Empresa Compradora",
      width: 250,
      render: (item) => (
        <Stack gap={0}>
          <Text size="sm" fw={700} className="text-white truncate">
            {item.empresa_nombre}
          </Text>
          {item.empresa_ruc && (
            <Text size="11px" c="dimmed">RUC: {item.empresa_ruc}</Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "correlativo_cotizacion",
      title: "Cotización",
      width: 130,
      render: (item) => (
        <Badge variant="light" color="indigo" radius="sm" className="font-mono">
          {item.correlativo_cotizacion}
        </Badge>
      ),
    },
    {
      accessor: "fecha_hora_orden",
      title: "Fecha",
      width: 150,
      render: (item) => (
        <Group gap={6}>
          <CalendarDaysIcon className="w-4 h-4 text-zinc-500" />
          <Text size="xs" fw={600} className="text-zinc-200">
            {dayjs(item.fecha_hora_orden).format("DD/MM/YYYY")}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "total_despues_igv",
      title: "Total",
      textAlign: "right",
      width: 130,
      render: (item) => (
        <Text size="sm" fw={900} className="text-emerald-400 font-mono">
          {item.moneda === "Soles" ? "S/." : "$"} {formatNumber(Number(item.total_despues_igv))}
        </Text>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      width: 130,
      render: (item) => {
        const stateInfo = COLOR_BY_STATE[item.estado] ?? { color: "gray", label: item.estado };
        return (
          <Badge
            variant={item.estado === Estado_OrdenCompra.Completada ? "filled" : "light"}
            color={stateInfo.color}
            size="sm"
          >
            {stateInfo.label}
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
          <Tooltip label="Ver Detalle" withArrow>
            <ActionIcon
              variant="light"
              color="indigo"
              radius="md"
              onClick={() => handleVerDetalle(item)}
            >
              <EyeIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Imprimir PDF" withArrow>
            <ActionIcon
              variant="light"
              color="teal"
              radius="md"
              loading={printingId === item.id}
              onClick={() => handlePrintOC(item)}
            >
              <DocumentTextIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ], [printingId, handlePrintOC, handleVerDetalle]);

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100 p-2">
      {/* Filtros Limpios (Igual a Atención de Solicitudes) */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
        <div className="flex flex-wrap gap-4 flex-1 w-full lg:w-auto">
          <div className="w-full sm:w-44">
            <Select
              placeholder="Mes"
              leftSection={<CalendarDaysIcon className="w-4 h-4 text-zinc-400" />}
              data={MESES}
              value={mes}
              onChange={(val) => setMes(val || "")}
              radius="lg"
              classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          <div className="w-full sm:w-32">
            <Select
              placeholder="Año"
              data={Array.from({ length: 5 }, (_, i) => {
                const y = (dayjs().year() - i).toString();
                return { value: y, label: y };
              })}
              value={yearcito}
              onChange={(val) => setYearcito(val || "")}
              radius="lg"
              classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "text-zinc-300 hover:bg-zinc-800",
              }}
            />
          </div>

          <TextInput
            placeholder="Buscar por código, empresa o cotización..."
            leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="flex-1 min-w-[200px]"
            radius="lg"
            classNames={{
              input: "bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-zinc-500",
            }}
          />
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-zinc-950/20 border border-zinc-800/30 rounded-2xl overflow-hidden shadow-2xl transition-all">
        {filteredRecords.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-zinc-500 gap-4">
            <div className="bg-zinc-900/50 p-6 rounded-full border border-zinc-800 animate-pulse">
              <ClipboardDocumentCheckIcon className="w-12 h-12 text-zinc-700" />
            </div>
            <div className="text-center">
              <Text fw={600} size="lg" className="text-zinc-400 italic">
                No se encontraron Órdenes de Compra
              </Text>
              <Text size="sm" className="text-zinc-600">
                Seleccione un periodo o ajuste su búsqueda rápida
              </Text>
            </div>
          </div>
        ) : (
          <DataTableEstandar
            idAccessor="id"
            columns={columns}
            records={filteredRecords}
            loading={loading}
          />
        )}
      </div>

      {/* Modales */}
      <ModalEstandar
        opened={openedDetalle}
        close={closeDet}
        title={`Detalle de Orden de Compra: ${selectedOrden?.correlativo}`}
        size="80%"
      >
        {selectedOrden && (
          <DetalleOrdenCompra 
            orden={selectedOrden} 
            detalles={detalles} 
            loading={loadingDetalle} 
          />
        )}
      </ModalEstandar>
    </div>
  );
};

export default OrdenCompraPage;

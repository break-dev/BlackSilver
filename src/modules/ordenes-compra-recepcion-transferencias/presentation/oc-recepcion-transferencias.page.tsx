import { useState } from "react";
import { Select, Badge, ActionIcon, Tooltip, TextInput } from "@mantine/core";
import {
  CalendarDaysIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  InboxStackIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { MESES } from "../../../shared/variables/meses";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { useListarTransferencias } from "../hooks/useListarTransferencias";
import { DetalleTransferenciaModal } from "./DetalleTransferenciaModal";
import { HistorialRecepcionesModal } from "./HistorialRecepcionesModal";
import { RegistrarRecepcionTransferencia } from "./RegistrarRecepcionTransferencia";
import type { RES_TransferenciaOC } from "../service/oc-recepcion-transferencias.responses";

export const RecepcionTransferenciasOCPage = () => {
  useTitlePage("Recepción de Transferencias");

  const {
    almacenes,
    selectedAlmacenId,
    setSelectedAlmacenId,
    mes,
    setMes,
    anio,
    setAnio,
    transferencias,
    loading,
    loadingAlmacenes,
    selectedTransferencia,
    detallesTransferencia,

    seleccionarTransferencia,
    cerrarDetalle,
    refrescarLista,
  } = useListarTransferencias();

  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [modalRecepcionAbierto, setModalRecepcionAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const filteredTransferencias = transferencias.filter(
    (t) =>
      t.correlativo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.almacen_destino?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.empleado_transferencia
        ?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      t.estado?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "Recepción Completa":
        return "teal";
      case "Recepcionado Parcialmente":
        return "orange";
      default:
        return "blue";
    }
  };

  const onRecepcionSuccess = () => {
    setModalRecepcionAbierto(false);
    cerrarDetalle();
    refrescarLista();
  };

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-400 text-xs font-semibold mb-1 ml-1",
    dropdown:
      "bg-zinc-950 border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl",
    option:
      "text-zinc-300 hover:bg-zinc-800 hover:text-white data-[selected]:bg-indigo-600 data-[selected]:text-white font-medium transition-colors",
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100 flex flex-col h-full">
      {/* Filtros de Selección Fluidos */}
      <div className="flex flex-col md:flex-row items-end gap-3 w-full">
        <div className="w-full md:w-64">
          <Select
            label="Almacén de consulta"
            placeholder="Seleccionar..."
            data={almacenes.map((a) => ({
              value: String(a.id_almacen),
              label: a.nombre,
            }))}
            value={selectedAlmacenId?.toString() || null}
            onChange={(val) => setSelectedAlmacenId(val ? Number(val) : null)}
            searchable
            clearable
            disabled={loadingAlmacenes}
            radius="lg"
            size="sm"
            leftSection={<InboxStackIcon className="w-4 h-4 text-indigo-400" />}
            classNames={inputClasses}
            comboboxProps={{
              withinPortal: true,
              zIndex: 9999,
              transitionProps: { transition: "pop", duration: 200 },
            }}
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            label="Mes"
            placeholder="Elegir..."
            leftSection={<CalendarDaysIcon className="w-4 h-4 text-zinc-500" />}
            data={MESES}
            value={String(mes)}
            onChange={(val) => setMes(Number(val) || 1)}
            radius="lg"
            size="sm"
            allowDeselect={false}
            classNames={inputClasses}
            comboboxProps={{
              withinPortal: true,
              zIndex: 9999,
              transitionProps: { transition: "pop", duration: 200 },
            }}
          />
        </div>

        <div className="w-full md:w-32">
          <Select
            label="Año"
            placeholder="Elegir..."
            data={Array.from({ length: 5 }, (_, i) => ({
              value: String(dayjs().year() - i),
              label: String(dayjs().year() - i),
            }))}
            value={String(anio)}
            onChange={(val) => setAnio(Number(val) || dayjs().year())}
            radius="lg"
            size="sm"
            allowDeselect={false}
            classNames={inputClasses}
            comboboxProps={{
              withinPortal: true,
              zIndex: 9999,
              transitionProps: { transition: "pop", duration: 200 },
            }}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <TextInput
            label="Buscar registro"
            placeholder="Buscar transferencia, empleado..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            disabled={!selectedAlmacenId}
            radius="lg"
            size="sm"
            classNames={inputClasses}
          />
        </div>
      </div>

      {/* DATATABLE */}
      <div className="flex-1 min-h-0 relative">
        <DataTableEstandar
          idAccessor="id_transferencia"
          records={filteredTransferencias}
          loading={loading || loadingAlmacenes}
          columns={[
            {
              accessor: "index",
              title: "#",
              textAlign: "center",
              width: 60,
              render: (_record, index) => index + 1,
            },
            {
              accessor: "correlativo",
              title: "Transferencia",

              render: (r: RES_TransferenciaOC) => (
                <span className="font-mono font-black text-indigo-400">
                  {r.correlativo}
                </span>
              ),
            },
            {
              accessor: "fecha_hora_transferencia",
              title: "Fecha",

              render: (r: RES_TransferenciaOC) => (
                <span className="text-zinc-300 font-medium">
                  {dayjs(r.fecha_hora_transferencia).format("DD/MM/YYYY")}
                </span>
              ),
            },
            {
              accessor: "almacen_destino",
              title: "Almacén Destino",
              render: (r: RES_TransferenciaOC) => (
                <span className="font-bold text-zinc-200">
                  {r.almacen_destino}
                </span>
              ),
            },
            {
              accessor: "empleado_transferencia",
              title: "Enviado por",
              render: (r: RES_TransferenciaOC) => (
                <span className="text-zinc-400 truncate max-w-[200px] inline-block">
                  {r.empleado_transferencia}
                </span>
              ),
            },
            {
              accessor: "estado",
              title: "Estado",
              textAlign: "center",
              render: (r: RES_TransferenciaOC) => (
                <Badge
                  color={getBadgeColor(r.estado)}
                  variant="dot"
                  size="sm"
                  className="bg-zinc-900 font-bold"
                >
                  {r.estado}
                </Badge>
              ),
            },
            {
              accessor: "acciones",
              title: "",
              width: 80,
              textAlign: "center",
              render: (r: RES_TransferenciaOC) => (
                <Tooltip
                  label="Ver Detalles y Acciones"
                  position="left"
                  withArrow
                >
                  <ActionIcon
                    variant="light"
                    color="indigo"
                    onClick={() => seleccionarTransferencia(r)}
                  >
                    <EyeIcon className="w-5 h-5" />
                  </ActionIcon>
                </Tooltip>
              ),
            },
          ]}
          onRowClick={(r: { record: unknown }) =>
            seleccionarTransferencia(r.record as RES_TransferenciaOC)
          }
        />
      </div>

      {/* MODAL DETALLES Y ACCIONES (Nivel 1) */}
      <ModalEstandar
        opened={
          !!selectedTransferencia &&
          !modalHistorialAbierto &&
          !modalRecepcionAbierto
        }
        close={cerrarDetalle}
        title="Detalle de Transferencia"
        size="lg"
      >
        {selectedTransferencia && (
          <DetalleTransferenciaModal
            transferencia={{
              ...selectedTransferencia,
              detalles: detallesTransferencia,
            }}
            onOpenHistorial={() => setModalHistorialAbierto(true)}
            onOpenNuevaRecepcion={() => setModalRecepcionAbierto(true)}
          />
        )}
      </ModalEstandar>

      {/* MODAL HISTORIAL (Nivel 2) */}
      <ModalEstandar
        opened={modalHistorialAbierto}
        close={() => setModalHistorialAbierto(false)}
        title="Historial de Recepciones"
        size="lg"
      >
        {selectedTransferencia && (
          <HistorialRecepcionesModal
            idTransferencia={selectedTransferencia.id_transferencia}
          />
        )}
      </ModalEstandar>

      {/* MODAL NUEVA RECEPCIÓN (Nivel 2) */}
      <ModalEstandar
        opened={modalRecepcionAbierto}
        close={() => setModalRecepcionAbierto(false)}
        title="Registrar Recepción"
        size="70%"
      >
        {selectedTransferencia && selectedAlmacenId && (
          <RegistrarRecepcionTransferencia
            idTransferencia={selectedTransferencia.id_transferencia}
            idAlmacenRecepcionista={selectedAlmacenId}
            detalles={detallesTransferencia}
            onSuccess={onRecepcionSuccess}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

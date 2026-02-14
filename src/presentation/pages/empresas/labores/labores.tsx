import { useState, useMemo, useEffect } from "react";
import { Button, TextInput, Badge, Select, Tooltip, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type DataTableColumn } from "mantine-datatable";
import {
  PlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLabores } from "../../../../services/empresas/labores/useLabores";
import type { RES_Labor } from "../../../../services/empresas/labores/dtos/responses";
import { RegistroLabor } from "./components/registro-labor";
// import { AsignarResponsable } from "./components/asignar-responsable";
import { HistorialResponsables } from "./components/historial-responsables";
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";

const PAGE_SIZE = 35;
const TIPOS_LABOR = ["Bypass", "Crucero", "Tajo", "Rampa", "Chimenea"];
const TIPOS_SOSTENIMIENTO = ["Convencional", "Mecanizada"];

export const EmpresasLabores = () => {
  const setTitle = UIStore((state) => state.setTitle);

  // Estado local
  const [labores, setLabores] = useState<RES_Labor[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipoLabor, setFiltroTipoLabor] = useState<string | null>(null);
  const [filtroSostenimiento, setFiltroSostenimiento] = useState<string | null>(null);

  // Modal Registro
  const [opened, { open, close }] = useDisclosure(false);

  // Modal Asignar
  const [openedAssign, { open: openAssign, close: closeAssign }] = useDisclosure(false);
  const [selectedLabor, setSelectedLabor] = useState<RES_Labor | null>(null);

  // Servicio
  const { listar } = useLabores({ setError });

  // Methods
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await listar();
      setLabores(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Title
  useEffect(() => {
    setTimeout(() => {
      setTitle("Labores Mineras");
    }, 0);
  }, [setTitle]);

  // Datos filtrados
  const laboresFiltradas = useMemo(() => {
    return labores.filter((l) => {
      const term = busqueda.toLowerCase();

      const matchTipo = !filtroTipoLabor || l.tipo_labor === filtroTipoLabor;
      const matchSostenimiento = !filtroSostenimiento || l.tipo_sostenimiento === filtroSostenimiento;

      const matchBusqueda =
        !busqueda ||
        l.nombre.toLowerCase().includes(term);

      return matchBusqueda && matchTipo && matchSostenimiento;
    });
  }, [labores, busqueda, filtroTipoLabor, filtroSostenimiento]);

  // Paginación
  const registrosPaginados = useMemo(() => {
    const inicio = (page - 1) * PAGE_SIZE;
    return laboresFiltradas.slice(inicio, inicio + PAGE_SIZE);
  }, [laboresFiltradas, page]);

  // Callback al registrar exitosamente
  const handleRegistroExitoso = () => {
    close();
    fetchData();
  };

  const columns: DataTableColumn<RES_Labor>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      accessor: "concesion",
      title: "Concesión",
      width: 150,
      render: (record) => (
        <span className="text-zinc-300 font-semibold">{record.concesion}</span>
      ),
    },
    {
      accessor: "empresa",
      title: "Empresa",
      width: 150,
      render: (record) => (
        <span className="text-zinc-400 text-sm">{record.empresa}</span>
      ),
    },
    {
      accessor: "nombre",
      title: "Nombre Labor",
      width: 200,
      render: (record) => (
        <div className="flex flex-col">
          <span className="text-zinc-200 font-semibold">{record.nombre}</span>
          <span className="text-zinc-500 text-xs">{record.descripcion}</span>
        </div>
      ),
    },
    {
      accessor: "tipo_labor",
      title: "Tipo",
      width: 120,
      render: (record) => (
        <Badge
          variant="light"
          color="cyan"
          radius="sm"
          className="font-bold tracking-wider"
        >
          {record.tipo_labor.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessor: "tipo_sostenimiento",
      title: "Sostenimiento",
      width: 150,
      render: (record) => (
        <span className="text-zinc-400 text-sm italic">{record.tipo_sostenimiento}</span>
      ),
    },
    {
      accessor: "responsable", // Custom logic for button
      title: "Responsable",
      textAlign: "center",
      width: 140,
      render: (record) => (
        <div className="flex items-center gap-2 justify-center w-full">
          {record.responsable_actual ? (
            <Badge
              variant="dot"
              color="green"
              size="md"
              className="pl-0 pr-3"
            >
              {record.responsable_actual}
            </Badge>
          ) : (
            <Badge variant="outline" color="gray" size="sm">
              Sin Asignar
            </Badge>
          )}

          <Tooltip label="Gestionar Responsable" withArrow position="top">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLabor(record);
                openAssign();
              }}
            >
              <EyeIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <TextInput
            placeholder="Buscar labor..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.currentTarget.value);
              setPage(1);
            }}
            className="flex-1 min-w-64"
            radius="lg"
            size="sm"
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
            focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
            }}
          />

          <Select
            placeholder="Tipo Labor"
            data={TIPOS_LABOR}
            value={filtroTipoLabor}
            onChange={(val) => {
              setFiltroTipoLabor(val);
              setPage(1);
            }}
            clearable
            searchable
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500 min-w-32`,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "hover:bg-zinc-800 text-zinc-300",
            }}
            radius="lg"
            size="sm"
          />

          <Select
            placeholder="Sostenimiento"
            data={TIPOS_SOSTENIMIENTO}
            value={filtroSostenimiento}
            onChange={(val) => {
              setFiltroSostenimiento(val);
              setPage(1);
            }}
            clearable
            searchable
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500 min-w-32`,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "hover:bg-zinc-800 text-zinc-300",
            }}
            radius="lg"
            size="sm"
          />
        </div>

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={open}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 
        font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 shrink-0"
        >
          Nueva Labor
        </Button>
      </div>

      {/* DataTable */}
      <DataTableClassic
        idAccessor="id_labor"
        columns={columns}
        records={registrosPaginados}
        totalRecords={laboresFiltradas.length}
        page={page}
        onPageChange={setPage}
        loading={loading}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Modal de Registro */}
      <ModalRegistro opened={opened} close={close} title="Nueva Labor">
        <RegistroLabor onSuccess={handleRegistroExitoso} onCancel={close} />
      </ModalRegistro>

      {/* Modal Asignar Responsable */}
      <ModalRegistro opened={openedAssign} close={closeAssign} title="Gestión de Responsables">
        {selectedLabor && (
          <HistorialResponsables
            labor={selectedLabor}
            onClose={() => {
              closeAssign();
              fetchData();
            }}
          />
        )}
      </ModalRegistro>
    </div>
  );
};

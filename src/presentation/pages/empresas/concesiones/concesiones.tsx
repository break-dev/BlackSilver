import { useState, useMemo, useEffect } from "react";
import { Button, TextInput, Badge, Select, Tooltip, ActionIcon, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type DataTableColumn } from "mantine-datatable";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { GestionEmpresas } from "./components/gestion-empresas";
import { useConcesion } from "../../../../services/empresas/concesiones/useConcesion";
import type { RES_Concesion } from "../../../../services/empresas/concesiones/dtos/responses";
import { EstadoBase } from "../../../../shared/enums";
import { RegistroConcesion } from "./components/registro-concesion";
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";
import { SelectTipoMineral } from "../../../utils/select-tipo-mineral";

const PAGE_SIZE = 35;

export const EmpresasConcesiones = () => {
  const setTitle = UIStore((state) => state.setTitle);
  // Estado local
  const [concesiones, setConcesiones] = useState<RES_Concesion[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);
  const [filtroMineral, setFiltroMineral] = useState<string | null>(null);

  // Modal registro
  const [opened, { open, close }] = useDisclosure(false);

  // Modal Gestión Empresas
  const [gestionOpened, { open: openGestion, close: closeGestion }] = useDisclosure(false);
  const [selectedConcesion, setSelectedConcesion] = useState<RES_Concesion | null>(null);

  // Servicio
  const { listar } = useConcesion({ setError });

  // Carga inicial
  useEffect(() => {
    let cancelled = false;
    listar()
      .then((data) => {
        if (!cancelled) setConcesiones(data || []);
      })
      .finally(() => {
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Title
  useEffect(() => {
    setTimeout(() => {
      setTitle("Concesiones");
    }, 0);
  }, [setTitle]);

  // Opciones de filtros derivados de los datos
  const estadosUnicos = useMemo(() => {
    const set = new Set(concesiones.map((c) => c.estado));
    return Array.from(set)
      .sort()
      .map((e) => ({ value: e, label: e }));
  }, [concesiones]);

  // Datos filtrados
  const concesionesFiltradas = useMemo(() => {
    return concesiones.filter((c) => {
      const matchBusqueda =
        !busqueda ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.codigo_concesion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.codigo_reinfo?.toLowerCase().includes(busqueda.toLowerCase());

      const matchEstado = !filtroEstado || c.estado === filtroEstado;
      const matchMineral = !filtroMineral || c.tipo_mineral === filtroMineral;

      return matchBusqueda && matchEstado && matchMineral;
    });
  }, [concesiones, busqueda, filtroEstado, filtroMineral]);

  // Paginación
  const registrosPaginados = useMemo(() => {
    const inicio = (page - 1) * PAGE_SIZE;
    return concesionesFiltradas.slice(inicio, inicio + PAGE_SIZE);
  }, [concesionesFiltradas, page]);

  // Callback al registrar exitosamente
  const handleRegistroExitoso = (concesion: RES_Concesion) => {
    close();
    setConcesiones((prev) => [concesion, ...prev]);
  };

  const columns: DataTableColumn<RES_Concesion>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      accessor: "nombre",
      title: "Nombre Concesión",
      width: 200,
      render: (record) => (
        <span className="text-zinc-200 font-semibold">{record.nombre}</span>
      ),
    },
    {
      accessor: "codigo_concesion",
      title: "Cod. Concesión",
      width: 140,
      render: (record) =>
        record.codigo_concesion ? (
          <Badge
            variant="light"
            color="violet"
            radius="sm"
            className="font-mono"
          >
            {record.codigo_concesion}
          </Badge>
        ) : (
          <span className="text-zinc-600">-</span>
        ),
    },
    {
      accessor: "codigo_reinfo",
      title: "Cod. REINFO",
      width: 140,
      render: (record) =>
        record.codigo_reinfo ? (
          <Badge variant="light" color="pink" radius="sm" className="font-mono">
            {record.codigo_reinfo}
          </Badge>
        ) : (
          <span className="text-zinc-600">-</span>
        ),
    },
    {
      accessor: "tipo_mineral",
      title: "Tipo De Mineral",
      width: 130,
      render: (record) =>
        record.tipo_mineral ? (
          <span className="text-zinc-300 font-medium">
            {record.tipo_mineral}
          </span>
        ) : (
          <span className="text-zinc-500">-</span>
        ),
    },
    {
      accessor: "ubigeo",
      title: "Ubicación",
      width: 150,
      render: (record) =>
        record.ubigeo ? (
          <div className="flex items-center gap-1 text-zinc-400 text-sm">
            <MapPinIcon className="w-4 h-4 text-emerald-500" />
            <span className="truncate max-w-[140px]">{record.ubigeo}</span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      accessor: "empresas_asignadas",
      title: "Empresas",
      textAlign: "center",
      width: 110,
      render: (record) => (
        <Group gap="xs" justify="center">
          <Badge
            leftSection={<BuildingOffice2Icon className="w-3 h-3" />}
            color={record.empresas_asignadas > 0 ? "indigo" : "zinc"}
            variant="light"
            radius="sm"
          >
            {record.empresas_asignadas} Asign.
          </Badge>

          <Tooltip label="Gestionar Empresas" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => {
                setSelectedConcesion(record);
                openGestion();
              }}
            >
              <EyeIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 100,
      render: (record) => (
        <Badge
          color={record.estado === EstadoBase.Activo ? "green" : "red"}
          variant="light"
          radius="sm"
          size="sm"
        >
          {record.estado}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <TextInput
            placeholder="Buscar por nombre, código o REINFO..."
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

          <SelectTipoMineral
            label=""
            placeholder="Mineral"
            value={filtroMineral}
            onChange={(val) => {
              setFiltroMineral(val);
              setPage(1);
            }}
            clearable
            className="min-w-36"
          />

          <Select
            placeholder="Estado"
            data={estadosUnicos}
            value={filtroEstado}
            onChange={(val) => {
              setFiltroEstado(val);
              setPage(1);
            }}
            clearable
            radius="lg"
            size="sm"
            className="min-w-36"
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
            focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
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
          Nueva Concesión
        </Button>
      </div>

      {/* DataTable */}
      <DataTableClassic
        idAccessor="id_concesion"
        columns={columns}
        records={registrosPaginados}
        totalRecords={concesionesFiltradas.length}
        page={page}
        onPageChange={setPage}
        loading={loading}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Modal de Registro */}
      <ModalRegistro opened={opened} close={close} title="Nueva Concesión">
        <RegistroConcesion onSuccess={handleRegistroExitoso} onCancel={close} />
      </ModalRegistro>

      {/* Modal de Gestión de Empresas */}
      <ModalRegistro
        opened={gestionOpened}
        close={closeGestion}
        title="Gestión de Empresas"
      >
        {selectedConcesion && (
          <GestionEmpresas concesion={selectedConcesion} onClose={closeGestion} />
        )}
      </ModalRegistro>
    </div>
  );
};

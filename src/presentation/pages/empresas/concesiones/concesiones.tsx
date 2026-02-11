import { useState, useMemo, useEffect } from "react";
import { Button, TextInput, Badge, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type DataTableColumn } from "mantine-datatable";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useConcesion } from "../../../../services/empresas/concesiones/useConcesion";
import type { RES_Concesion } from "../../../../services/empresas/concesiones/dtos/responses";
import { EstadoBase } from "../../../../shared/enums";
import { RegistroConcesion } from "./components/registro-concesion";
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";

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
  const [filtroEmpresa, setFiltroEmpresa] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);

  // Modal
  const [opened, { open, close }] = useDisclosure(false);

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
  const empresasUnicas = useMemo(() => {
    const set = new Set(concesiones.map((c) => c.empresa));
    return Array.from(set)
      .sort()
      .map((e) => ({ value: e, label: e }));
  }, [concesiones]);

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
        c.empresa.toLowerCase().includes(busqueda.toLowerCase());

      const matchEmpresa = !filtroEmpresa || c.empresa === filtroEmpresa;
      const matchEstado = !filtroEstado || c.estado === filtroEstado;

      return matchBusqueda && matchEmpresa && matchEstado;
    });
  }, [concesiones, busqueda, filtroEmpresa, filtroEstado]);

  // Paginación
  const registrosPaginados = useMemo(() => {
    const inicio = (page - 1) * PAGE_SIZE;
    return concesionesFiltradas.slice(inicio, inicio + PAGE_SIZE);
  }, [concesionesFiltradas, page]);

  // Callback al registrar exitosamente
  const handleRegistroExitoso = (concesion: RES_Concesion) => {
    close();
    setConcesiones([...concesiones, concesion]);
  };

  const columns: DataTableColumn<RES_Concesion>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 60,
      render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      accessor: "empresa",
      title: "Empresa",
    },
    {
      accessor: "nombre",
      title: "Concesión",
      render: (record) => (
        <span className="text-indigo-200 font-semibold">{record.nombre}</span>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
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
            placeholder="Buscar por nombre o empresa..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.currentTarget.value);
              setPage(1);
            }}
            className="flex-1 min-w-50"
            radius="lg"
            size="sm"
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
            focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
            }}
          />
          <Select
            placeholder="Empresa"
            data={empresasUnicas}
            value={filtroEmpresa}
            onChange={(val) => {
              setFiltroEmpresa(val);
              setPage(1);
            }}
            clearable
            radius="lg"
            size="sm"
            className="min-w-45"
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
            focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
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
            className="min-w-35"
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
            focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
          />
        </div>
        {/* End of filters wrapper */}

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
        idAccessor="id_concesiones"
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
    </div>
  );
};

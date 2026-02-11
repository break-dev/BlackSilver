import { useState, useMemo, useEffect } from "react";
import { Button, TextInput, Badge, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type DataTableColumn } from "mantine-datatable";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useLabor } from "../../../../services/empresas/labores/useLabor";
import type { RES_Labor } from "../../../../services/empresas/labores/dtos/responses";
import { EstadoBase } from "../../../../shared/enums";
import { RegistroLabor } from "./components/registro-labor";
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";

const PAGE_SIZE = 35;

export const EmpresasLabores = () => {
  const setTitle = UIStore((state) => state.setTitle);
  // Estado local
  const [labores, setLabores] = useState<RES_Labor[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroConcesion, setFiltroConcesion] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);

  // Modal
  const [opened, { open, close }] = useDisclosure(false);

  // Servicios
  const { listar: listarLabores } = useLabor({ setError });

  // Carga inicial
  useEffect(() => {
    let cancelled = false;
    // setIsLoading(true);
    listarLabores()
      .then((data) => {
        if (!cancelled) setLabores(data || []);
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
      setTitle("Labores");
    }, 0);
  }, [setTitle]);

  // Opciones de filtros
  const concesionesUnicas = useMemo(() => {
    const set = new Set(labores.map((l) => l.concesion || ""));
    return Array.from(set)
      .filter(Boolean)
      .sort()
      .map((c) => ({ value: String(c), label: String(c) }));
  }, [labores]);

  const tiposUnicos = useMemo(() => {
    const set = new Set(labores.map((l) => l.tipo_labor));
    return Array.from(set)
      .filter(Boolean)
      .sort()
      .map((t) => ({ value: String(t), label: String(t) }));
  }, [labores]);

  const estadosUnicos = useMemo(() => {
    const set = new Set(labores.map((l) => l.estado));
    return Array.from(set)
      .filter(Boolean)
      .sort()
      .map((e) => ({ value: String(e), label: String(e) }));
  }, [labores]);

  // Datos filtrados
  const laboresFiltradas = useMemo(() => {
    return labores.filter((l) => {
      const matchBusqueda =
        !busqueda ||
        l.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (l.concesion || "").toLowerCase().includes(busqueda.toLowerCase());

      const matchConcesion =
        !filtroConcesion || l.concesion === filtroConcesion;
      const matchTipo = !filtroTipo || l.tipo_labor === filtroTipo;
      const matchEstado = !filtroEstado || l.estado === filtroEstado;

      return matchBusqueda && matchConcesion && matchTipo && matchEstado;
    });
  }, [labores, busqueda, filtroConcesion, filtroTipo, filtroEstado]);

  // Paginación
  const registrosPaginados = useMemo(() => {
    const inicio = (page - 1) * PAGE_SIZE;
    return laboresFiltradas.slice(inicio, inicio + PAGE_SIZE);
  }, [laboresFiltradas, page]);

  // Callback registro exitoso
  const handleRegistroExitoso = (labor: RES_Labor) => {
    close();
    setLabores([...labores, labor]);
  };

  const columns: DataTableColumn<RES_Labor>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 60,
      render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      accessor: "concesion",
      title: "Concesión",
    },
    {
      accessor: "nombre",
      title: "Labor",
      render: (record) => (
        <span className="text-indigo-200 font-semibold">{record.nombre}</span>
      ),
    },
    {
      accessor: "tipo_labor",
      title: "Tipo",
      render: (record) => (
        <Badge color="blue" variant="light" size="sm" radius="sm">
          {record.tipo_labor}
        </Badge>
      ),
    },
    {
      accessor: "tipo_sostenimiento",
      title: "Sostenimiento",
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
            placeholder="Buscar por nombre o concesión..."
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
            placeholder="Concesión"
            data={concesionesUnicas}
            value={filtroConcesion}
            onChange={(val) => {
              setFiltroConcesion(val);
              setPage(1);
            }}
            clearable
            radius="lg"
            size="sm"
            className="min-w-45"
            searchable
            classNames={{
              input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
            focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
              dropdown: "bg-zinc-900 border-zinc-800",
              option: "text-zinc-300 hover:bg-zinc-800",
            }}
          />
          <Select
            placeholder="Tipo"
            data={tiposUnicos}
            value={filtroTipo}
            onChange={(val) => {
              setFiltroTipo(val);
              setPage(1);
            }}
            clearable
            radius="lg"
            size="sm"
            className="min-w-30"
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
            className="min-w-30"
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
          Nueva Labor
        </Button>
      </div>

      {/* DataTable */}
      <DataTableClassic
        idAccessor="id_labores"
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
    </div>
  );
};

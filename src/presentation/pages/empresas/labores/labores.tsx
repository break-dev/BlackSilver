import { useState, useMemo, useEffect } from "react";
import { Button, Modal, Group, TextInput, Badge, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useLabor } from "../../../../services/empresas/labores/useLabor";
import { useConcesion } from "../../../../services/empresas/concesiones/useConcesion";
import type { RES_Labor } from "../../../../services/empresas/labores/dtos/responses";
import type { RES_Concesion } from "../../../../services/empresas/concesiones/dtos/responses";
import { EstadoBase } from "../../../../shared/enums";
import { RegistroLabor } from "./components/registro-labor";

const PAGE_SIZE = 25;

export const EmpresasLabores = () => {
  // Estado local
  const [labores, setLabores] = useState<RES_Labor[]>([]);
  const [concesiones, setConcesiones] = useState<RES_Concesion[]>([]);
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
  const { listar: listarLabores } = useLabor({ setIsLoading, setError });
  const { listar: listarConcesiones } = useConcesion({
    setIsLoading: () => { },
    setError: () => { }
  });

  // Carga inicial
  useEffect(() => {
    let cancelled = false;

    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [dataLabores, dataConcesiones] = await Promise.all([
          listarLabores(),
          listarConcesiones()
        ]);

        if (!cancelled) {
          setLabores(dataLabores || []);
          setConcesiones(dataConcesiones || []);
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    cargarDatos();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opciones de filtros
  const concesionesUnicas = useMemo(() => {
    // Si tenemos la lista de concesiones cargada, la usamos para el filtro
    if (concesiones.length > 0) {
      return concesiones
        .filter((c) => c.nombre) // Filtrar concesiones sin nombre
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((c) => ({
          value: String(c.nombre), // Asegurar string 
          label: String(c.nombre)
        }));
    }
    // Fallback a los nombres en labores si no cargó concesiones (aunque se intenta cargar ambas)
    const set = new Set(labores.map((l) => l.concesion || ""));
    return Array.from(set)
      .filter(Boolean) // Filtrar strings vacíos y nulos
      .sort()
      .map((c) => ({ value: String(c), label: String(c) }));
  }, [concesiones, labores]);

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
      // Mapeo seguro del nombre de concesión
      const concesionNombre =
        concesiones.find(c => c.id_concesion === l.id_concesion)?.nombre ||
        l.concesion ||
        "";

      const matchBusqueda =
        !busqueda ||
        l.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        concesionNombre.toLowerCase().includes(busqueda.toLowerCase());

      const matchConcesion = !filtroConcesion || concesionNombre === filtroConcesion;
      const matchTipo = !filtroTipo || l.tipo_labor === filtroTipo;
      const matchEstado = !filtroEstado || l.estado === filtroEstado;

      return matchBusqueda && matchConcesion && matchTipo && matchEstado;
    });
  }, [labores, concesiones, busqueda, filtroConcesion, filtroTipo, filtroEstado]);

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
      render: (record) => {
        const cons = concesiones.find(c => c.id_concesion === record.id_concesion);
        return cons ? cons.nombre : record.concesion || "-";
      }
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
      {/* Encabezado */}
      <Group justify="space-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Labores</h2>
          <p className="text-zinc-400 text-sm">
            Gestiona las labores mineras registradas.
          </p>
        </div>
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={open}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 
          font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
        >
          Nueva Labor
        </Button>
      </Group>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
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

      {/* DataTable */}
      <div
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden 
        backdrop-blur-sm"
      >
        <DataTable
          columns={columns}
          records={registrosPaginados}
          totalRecords={laboresFiltradas.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          highlightOnHover
          fetching={loading}
          idAccessor="id_labor"
          noRecordsText="No se encontraron labores"
          loadingText="Cargando..."
          minHeight={300}
          paginationText={({ from, to, totalRecords }) =>
            `${from} - ${to} de ${totalRecords}`
          }
          classNames={{
            root: "bg-transparent",
            table: "bg-transparent",
            header: "bg-zinc-900/80",
            pagination: "bg-zinc-900/50 border-t border-zinc-800",
          }}
          styles={{
            header: {
              "--mantine-color-text": "var(--mantine-color-zinc-3, #d4d4d8)",
            },
          }}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Modal de Registro */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-6 bg-linear-to-b from-[#ffc933] to-[#b8920a] 
              rounded-full shadow-[0_0_10px_#d4a50a]"
            />
            <span
              className="text-xl font-bold bg-linear-to-r from-white via-zinc-100 
              to-zinc-400 bg-clip-text text-transparent tracking-tight"
            >
              Nueva Labor
            </span>
          </div>
        }
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        radius="xl"
        classNames={{
          content: "bg-zinc-950 border border-white/10 shadow-2xl shadow-black",
          header: "bg-zinc-950 text-white pt-5 pb-1 px-6",
          body: "bg-zinc-950 px-6 pt-6 pb-6",
          close: `text-zinc-400 hover:text-white hover:bg-white/10 transition-all 
          duration-200 rounded-full w-8 h-8 flex items-center justify-center`,
          title: "text-xl font-bold text-white",
        }}
        transitionProps={{ transition: "pop", duration: 250 }}
      >
        <RegistroLabor onSuccess={handleRegistroExitoso} onCancel={close} />
      </Modal>
    </div>
  );
};

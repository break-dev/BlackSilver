import { useState, useMemo, useEffect } from "react";
import { Button, Modal, Group, TextInput, Badge, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCategoria } from "../../../../services/inventario/categorias/useCategoria";
import type { RES_Categoria } from "../../../../services/inventario/categorias/dtos/responses";
import { EstadoBase, TipoRequerimiento } from "../../../../shared/enums";
import { RegistroCategoria } from "./components/registro-categoria";

const PAGE_SIZE = 25;

export const InventarioCategorias = () => {
  // Estado local
  const [categorias, setCategorias] = useState<RES_Categoria[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);

  // Modal
  const [opened, { open, close }] = useDisclosure(false);

  // Servicio
  const { listar } = useCategoria({ setIsLoading, setError });

  // Carga inicial
  useEffect(() => {
    let cancelled = false;
    listar().then((data) => {
      if (!cancelled) setCategorias(data || []);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opciones de filtros
  const tiposUnicos = useMemo(() => {
    const set = new Set(categorias.map((c) => c.tipo_requerimiento));
    return Array.from(set)
      .filter(Boolean)
      .sort()
      .map((t) => ({ value: String(t), label: String(t) }));
  }, [categorias]);

  const estadosUnicos = useMemo(() => {
    const set = new Set(categorias.map((c) => c.estado));
    return Array.from(set)
      .filter(Boolean)
      .sort()
      .map((e) => ({ value: String(e), label: String(e) }));
  }, [categorias]);

  // Datos filtrados
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) => {
      const matchBusqueda =
        !busqueda ||
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

      const matchTipo = !filtroTipo || c.tipo_requerimiento === filtroTipo;
      const matchEstado = !filtroEstado || c.estado === filtroEstado;

      return matchBusqueda && matchTipo && matchEstado;
    });
  }, [categorias, busqueda, filtroTipo, filtroEstado]);

  // Paginación
  const registrosPaginados = useMemo(() => {
    const inicio = (page - 1) * PAGE_SIZE;
    return categoriasFiltradas.slice(inicio, inicio + PAGE_SIZE);
  }, [categoriasFiltradas, page]);

  // Callback registro exitoso
  const handleRegistroExitoso = (categoria: RES_Categoria) => {
    close();
    setCategorias([...categorias, categoria]);
  };

  const columns: DataTableColumn<RES_Categoria>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 60,
      render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
    },
    {
      accessor: "nombre",
      title: "Categoría",
      render: (record) => (
        <span className="text-indigo-200 font-semibold">{record.nombre}</span>
      ),
    },
    {
      accessor: "tipo_requerimiento",
      title: "Tipo",
      render: (record) => (
        <Badge
          color={
            record.tipo_requerimiento === TipoRequerimiento.Bien
              ? "blue"
              : "cyan"
          }
          variant="light"
          size="sm"
          radius="sm"
        >
          {record.tipo_requerimiento}
        </Badge>
      ),
    },
    {
      accessor: "descripcion",
      title: "Descripción",
      width: "40%",
      render: (record) => (
        <span className="text-zinc-400 text-sm truncate block" title={record.descripcion || ""}>
          {record.descripcion || "-"}
        </span>
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
      {/* Encabezado */}
      <Group justify="space-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Categorías</h2>
          <p className="text-zinc-400 text-sm">
            Gestiona las categorías de inventario y define si son Bienes o Servicios.
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
          Nueva Categoría
        </Button>
      </Group>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <TextInput
          placeholder="Buscar por nombre o descripción..."
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
          totalRecords={categoriasFiltradas.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          highlightOnHover
          fetching={loading}
          idAccessor="id"
          noRecordsText="No se encontraron categorías"
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
              Nueva Categoría
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
        <RegistroCategoria onSuccess={handleRegistroExitoso} onCancel={close} />
      </Modal>
    </div>
  );
};

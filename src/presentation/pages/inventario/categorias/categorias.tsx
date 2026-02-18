import { useState, useMemo, useEffect } from "react";
import { Button, TextInput, Badge, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type DataTableColumn } from "mantine-datatable";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useCategoria } from "../../../../services/inventario/categorias/useCategoria";
import type { RES_Categoria } from "../../../../services/inventario/categorias/dtos/responses";
import { EstadoBase, TipoRequerimiento } from "../../../../shared/enums";
import { RegistroCategoria } from "./components/registro-categoria";
import { UIStore } from "../../../../stores/ui.store";
import { ModalRegistro } from "../../../utils/modal-registro";
import { DataTableClassic } from "../../../utils/datatable-classic";

const PAGE_SIZE = 35;

export const InventarioCategorias = () => {
  const setTitle = UIStore((state) => state.setTitle);
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
  const { listar } = useCategoria({ setError });

  // Carga inicial
  useEffect(() => {
    let cancelled = false;
    listar()
      .then((data) => {
        if (!cancelled) {
          setCategorias(data || []);
        }
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
      setTitle("Categorías");
    }, 0);
  }, [setTitle]);

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
    setCategorias((prev) => [categoria, ...prev]);
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
        <span
          className="text-zinc-400 text-sm truncate block"
          title={record.descripcion || ""}
        >
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
      {/* Encabezado y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
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
        {/* End of filters wrapper */}

        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={open}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 
        font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 shrink-0"
        >
          Nueva Categoría
        </Button>
      </div>

      {/* DataTable */}
      <DataTableClassic
        idAccessor="id_categoria"
        columns={columns}
        records={registrosPaginados}
        totalRecords={categoriasFiltradas.length}
        page={page}
        onPageChange={setPage}
        loading={loading}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Modal de Registro */}
      <ModalRegistro opened={opened} close={close} title="Nueva Categoría">
        <RegistroCategoria onSuccess={handleRegistroExitoso} onCancel={close} />
      </ModalRegistro>
    </div>
  );
};

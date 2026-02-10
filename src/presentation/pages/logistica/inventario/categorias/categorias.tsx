import { useEffect, useState, useMemo } from "react";
import {
    Table,
    Button,
    Modal,
    Group,
    TextInput,
    Badge,
    ActionIcon,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Services
import { useCategoria } from "../../../../../services/logistica/inventario/categorias/useCategoria";
import type { RES_Categoria } from "../../../../../services/logistica/inventario/categorias/dtos/categoria.dto";
import { EstadoBase, TipoRequerimiento } from "../../../../../shared/enums";

// Components
import { FormularioCategoria } from "./components/FormularioCategoria";

export const InventarioCategorias = () => {
    // Estados Locales
    const [categorias, setCategorias] = useState<RES_Categoria[]>([]);
    const [loading, setLoading] = useState(false);
    const [_, setErrorStr] = useState("");
    const [filtro, setFiltro] = useState("");
    const [categoriaEditar, setCategoriaEditar] = useState<RES_Categoria | null>(null);
    const [categoriaToDelete, setCategoriaToDelete] = useState<number | null>(null);

    // Control de Modal de Mantine UI
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

    // Hooks de Servicio
    const { listar: listarCategorias, eliminar: eliminarCategoria } = useCategoria({
        setIsLoading: setLoading,
        setError: setErrorStr,
    });

    // Cargar datos al montar
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        const datos = await listarCategorias();
        console.log("Categorias cargadas:", datos);
        setCategorias(datos || []);
    };

    // Filtrado de datos (Cliente)
    const categoriasFiltradas = useMemo(() => {
        return categorias.filter((c) => {
            const nombreMatch = c.nombre.toLowerCase().includes(filtro.toLowerCase());
            const descMatch = c.descripcion?.toLowerCase().includes(filtro.toLowerCase());
            const tipoMatch = c.tipo_requerimiento.toLowerCase().includes(filtro.toLowerCase());
            const estadoMatch = c.estado.toLowerCase().includes(filtro.toLowerCase());

            return nombreMatch || (descMatch) || tipoMatch || estadoMatch;
        });
    }, [categorias, filtro]);

    // Manejadores
    const handleOpenCrear = () => {
        setCategoriaEditar(null);
        openModal();
    };

    const handleOpenEditar = (cat: RES_Categoria) => {
        setCategoriaEditar(cat);
        openModal();
    };

    const handleEliminar = (id: number) => {
        setCategoriaToDelete(id);
        openDeleteModal();
    };

    const confirmEliminar = async () => {
        if (categoriaToDelete) {
            const exito = await eliminarCategoria(categoriaToDelete);
            if (exito) cargarDatos();
            closeDeleteModal();
            setCategoriaToDelete(null);
        }
    };

    const handleSuccess = () => {
        closeModal();
        cargarDatos();
    };

    return (
        <div className="space-y-6">
            <Group justify="space-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Categorías</h2>
                    <p className="text-zinc-400 text-sm">
                        Gestiona las categorías de inventario y define si son Bienes o Servicios.
                    </p>
                </div>
                <Button
                    leftSection={<PlusIcon className="w-5 h-5" />}
                    onClick={handleOpenCrear}
                    radius="lg"
                    size="sm"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
                >
                    Nueva Categoría
                </Button>
            </Group>

            {/* Filtros */}
            <div className="flex gap-4 mb-4">
                <TextInput
                    placeholder="Buscar por nombre, descripción o tipo..."
                    leftSection={
                        <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
                    }
                    value={filtro}
                    onChange={(e) => setFiltro(e.currentTarget.value)}
                    className="w-full max-w-md"
                    radius="lg"
                    size="sm"
                    classNames={{
                        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                    }}
                />
            </div>

            {/* Tabla */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
                <Table highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr className="bg-zinc-900/80">
                            <Table.Th
                                className="text-zinc-400 font-normal w-16 text-center"
                                style={{ textAlign: "center" }}
                            >
                                #
                            </Table.Th>
                            <Table.Th className="text-zinc-300">Categoría</Table.Th>
                            <Table.Th className="text-zinc-300">Tipo Requerimiento</Table.Th>
                            <Table.Th className="text-zinc-300">Descripción</Table.Th>
                            <Table.Th className="text-zinc-300 text-center" style={{ textAlign: "center" }}>Estado</Table.Th>
                            <Table.Th
                                className="text-zinc-300 text-center"
                                style={{ textAlign: "center" }}
                            >
                                Acciones
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {categoriasFiltradas.length > 0 ? (
                            categoriasFiltradas.map((c, index) => (
                                <Table.Tr key={c.id}>
                                    <Table.Td
                                        className="text-zinc-500 font-medium text-xs w-16 text-center"
                                        style={{ textAlign: "center" }}
                                    >
                                        {index + 1}
                                    </Table.Td>
                                    <Table.Td className="text-indigo-200 font-semibold">
                                        {c.nombre}
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={c.tipo_requerimiento === TipoRequerimiento.Bien ? "blue" : "cyan"}
                                            variant="light"
                                            size="sm"
                                            radius="sm"
                                        >
                                            {c.tipo_requerimiento}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td className="text-zinc-400 text-sm max-w-xs truncate" title={c.descripcion || ""}>
                                        {c.descripcion || "-"}
                                    </Table.Td>
                                    <Table.Td className="text-center">
                                        <Badge
                                            color={c.estado === EstadoBase.Activo ? "green" : "red"}
                                            variant="light"
                                            radius="sm"
                                            size="sm"
                                        >
                                            {c.estado}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="sm" justify="center">
                                            <Tooltip label="Editar">
                                                <ActionIcon
                                                    variant="light"
                                                    color="pink"
                                                    size="lg"
                                                    radius="md"
                                                    aria-label="Editar"
                                                    onClick={() => handleOpenEditar(c)}
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </ActionIcon>
                                            </Tooltip>
                                            <Tooltip label="Eliminar">
                                                <ActionIcon
                                                    variant="light"
                                                    color="grape"
                                                    size="lg"
                                                    radius="md"
                                                    aria-label="Eliminar"
                                                    onClick={() => handleEliminar(c.id)}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        ) : (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={6}
                                    className="text-center py-8 text-zinc-500"
                                >
                                    {loading
                                        ? "Cargando..."
                                        : "No hay categorías que coincidan con la búsqueda"}
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </div>

            {/* Modal Crear/Editar */}
            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-gradient-to-b from-[#ffc933] to-[#b8920a] rounded-full shadow-[0_0_10px_#d4a50a]"></div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent tracking-tight">
                            {categoriaEditar ? "Editar Categoría" : "Nueva Categoría"}
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
                    close: "text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center",
                    title: "text-xl font-bold text-white",
                }}
                transitionProps={{ transition: "pop", duration: 250 }}
            >
                <FormularioCategoria
                    categoria={categoriaEditar}
                    onSuccess={handleSuccess}
                    onCancel={closeModal}
                />
            </Modal>

            {/* Modal Confirmar Eliminación */}
            <Modal
                opened={deleteModalOpened}
                onClose={closeDeleteModal}
                centered
                radius="xl"
                withCloseButton={false}
                classNames={{
                    content: "bg-zinc-950 border border-white/10 shadow-2xl shadow-black",
                    body: "bg-zinc-950 p-6",
                }}
                transitionProps={{ transition: "pop", duration: 250 }}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-2">Eliminar Categoría</h3>
                        <p className="text-zinc-400 text-sm">
                            ¿Estás seguro que deseas eliminar la categoría
                            <span className="text-white font-semibold">
                                {categoriaToDelete && categorias.find(c => c.id === categoriaToDelete)?.nombre ?
                                    ` "${categorias.find(c => c.id === categoriaToDelete)?.nombre}"` : ""}
                            </span>?
                            <br />Esta acción no se puede deshacer.
                        </p>
                    </div>
                    <Group justify="center" gap="md" className="w-full mt-2">
                        <Button
                            variant="subtle"
                            onClick={closeDeleteModal}
                            radius="lg"
                            size="sm"
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmEliminar}
                            radius="lg"
                            size="sm"
                            className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 flex-1"
                        >
                            Eliminar
                        </Button>
                    </Group>
                </div>
            </Modal>
        </div>
    );
};

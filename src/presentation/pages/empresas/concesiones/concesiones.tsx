import { useEffect, useState, useMemo } from "react";
import {
    Table,
    Button,
    Modal,
    Group,
    TextInput,
    Text,
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
} from "@heroicons/react/24/outline";

// Services
import { useConcesion } from "../../../../services/empresa/concesiones/useConcesion";
import type { RES_Concesion } from "../../../../services/empresa/concesiones/dtos/concesion.dto";
import { useEmpresa } from "../../../../services/empresa/useEmpresa";
import type { RES_Empresa } from "../../../../services/empresa/dtos/empresa.dto";
import { EstadoBase } from "../../../../shared/enums";

// Components
import { FormularioConcesion } from "./components/FormularioConcesion";

export const EmpresasConcesiones = () => {
    // Estados Locales
    const [concesiones, setConcesiones] = useState<RES_Concesion[]>([]);
    const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
    const [loading, setLoading] = useState(false);
    const [_, setErrorStr] = useState("");
    const [filtro, setFiltro] = useState("");
    const [concesionEditar, setConcesionEditar] = useState<RES_Concesion | null>(
        null
    );

    // Control de Modal
    const [opened, { open, close }] = useDisclosure(false);

    // Hooks de Servicio
    const { listar: listarConcesiones } = useConcesion({
        setIsLoading: setLoading,
        setError: setErrorStr,
    });

    const { listar: listarEmpresas } = useEmpresa({
        setIsLoading: setLoading,
        setError: setErrorStr,
    });

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        const datosEmpresas = await listarEmpresas();
        setEmpresas(datosEmpresas || []);

        const datosConcesiones = await listarConcesiones();
        setConcesiones(datosConcesiones || []);
    };

    // Filtrado de datos (Cliente)
    const concesionesFiltradas = useMemo(() => {
        return concesiones.filter((c) => {
            const nombreMatch = c.nombre.toLowerCase().includes(filtro.toLowerCase());
            const empresaMatch = empresas
                .find((e) => e.id === c.id_empresa)
                ?.nombre_comercial.toLowerCase()
                .includes(filtro.toLowerCase());
            return nombreMatch || empresaMatch;
        });
    }, [concesiones, empresas, filtro]);

    // Manejadores
    const handleOpenCrear = () => {
        setConcesionEditar(null);
        open();
    };

    const handleOpenEditar = (concesion: RES_Concesion) => {
        setConcesionEditar(concesion);
        open();
    };

    const handleSuccess = () => {
        close();
        cargarDatos();
    };

    return (
        <div className="space-y-6">
            <Group justify="space-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Concesiones</h2>
                    <p className="text-zinc-400 text-sm">
                        Gestiona las concesiones mineras de las empresas.
                    </p>
                </div>
                <Button
                    leftSection={<PlusIcon className="w-5 h-5" />}
                    onClick={handleOpenCrear}
                    radius="lg"
                    size="sm"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
                >
                    Nueva Concesión
                </Button>
            </Group>

            {/* Filtros */}
            <div className="flex gap-4 mb-4">
                <TextInput
                    placeholder="Buscar por nombre o empresa..."
                    leftSection={
                        <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
                    }
                    value={filtro}
                    onChange={(e) => setFiltro(e.currentTarget.value)}
                    className="w-full max-w-md"
                    radius="lg"
                    size="sm"
                    classNames={{
                        input: "focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300",
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
                            <Table.Th className="text-zinc-300">Empresa</Table.Th>
                            <Table.Th className="text-zinc-300">Concesión</Table.Th>
                            <Table.Th className="text-zinc-300">Estado</Table.Th>
                            <Table.Th
                                className="text-zinc-300 text-center"
                                style={{ textAlign: "center" }}
                            >
                                Acciones
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {concesionesFiltradas.length > 0 ? (
                            concesionesFiltradas.map((c, index) => {
                                const emp = empresas.find((e) => e.id === c.id_empresa);
                                return (
                                    <Table.Tr key={c.id}>
                                        <Table.Td
                                            className="text-zinc-500 font-medium text-xs w-16 text-center"
                                            style={{ textAlign: "center" }}
                                        >
                                            {index + 1}
                                        </Table.Td>
                                        <Table.Td className="text-zinc-300 font-medium">
                                            {emp ? emp.nombre_comercial : "Desconocida"}
                                        </Table.Td>
                                        <Table.Td className="text-indigo-200 font-semibold">
                                            {c.nombre}
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={c.estado === EstadoBase.Activo ? "green" : "red"}
                                                variant="light"
                                                radius="sm"
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
                                                        onClick={() => {
                                                            // TODO: Implementar eliminar
                                                            console.log("Eliminar", c);
                                                        }}
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })
                        ) : (
                            <Table.Tr>
                                <Table.Td
                                    colSpan={5}
                                    className="text-center py-8 text-zinc-500"
                                >
                                    {loading
                                        ? "Cargando..."
                                        : "No hay concesiones que coincidan con la búsqueda"}
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </div>

            {/* Modal Crear/Editar */}
            <Modal
                opened={opened}
                onClose={close}
                title={
                    <Text fw={700} c="white">
                        {concesionEditar ? "Editar Concesión" : "Nueva Concesión"}
                    </Text>
                }
                centered
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                radius="lg"
                classNames={{
                    content: "bg-[#0f1014] border border-zinc-800 shadow-2xl shadow-black/50",
                    header: "bg-[#0f1014] text-white pb-3 pt-2 border-b border-zinc-800/50",
                    body: "bg-[#0f1014] pt-6",
                    close: "text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                }}
                transitionProps={{ transition: "pop", duration: 200 }}
            >
                <FormularioConcesion
                    concesion={concesionEditar}
                    empresas={empresas}
                    onSuccess={handleSuccess}
                    onCancel={close}
                />
            </Modal>
        </div>
    );
};

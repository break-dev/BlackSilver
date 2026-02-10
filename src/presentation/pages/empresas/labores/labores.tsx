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
import { useLabor } from "../../../../services/empresas/labores/useLabor";
import type { RES_Labor } from "../../../../services/empresas/labores/dtos/responses";
import { useConcesion } from "../../../../services/empresas/concesiones/useConcesion";
import type { RES_Concesion } from "../../../../services/empresas/concesiones/dtos/responses";
import { EstadoBase } from "../../../../shared/enums";

// Components
import { FormularioLabor } from "./components/FormularioLabor";

export const EmpresasLabores = () => {
  // Estados Locales
  const [labores, setLabores] = useState<RES_Labor[]>([]);
  const [concesiones, setConcesiones] = useState<RES_Concesion[]>([]);
  const [loading, setLoading] = useState(false);
  const [_, setErrorStr] = useState("");
  const [filtro, setFiltro] = useState("");
  const [laborEditar, setLaborEditar] = useState<RES_Labor | null>(null);
  const [laborToDelete, setLaborToDelete] = useState<number | null>(null);

  // Control de Modal
  const [opened, { open, close }] = useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  // Hooks de Servicio
  const { listar: listarLabores, eliminar: eliminarLabor } = useLabor({
    setIsLoading: setLoading,
    setError: setErrorStr,
  });

  const { listar: listarConcesiones } = useConcesion({
    setIsLoading: setLoading,
    setError: setErrorStr,
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const datosConcesiones = await listarConcesiones();
    console.log("Concesiones cargadas:", datosConcesiones);
    setConcesiones(datosConcesiones || []);

    const datosLabores = await listarLabores();
    console.log("Labores cargadas:", datosLabores);
    setLabores(datosLabores || []);
  };

  // Filtrado de datos (Cliente)
  const laboresFiltradas = useMemo(() => {
    return labores.filter((l) => {
      const nombreMatch = l.nombre.toLowerCase().includes(filtro.toLowerCase());
      const concesionMatch = concesiones
        .find((c) => String(c.id_concesion) === String(l.id_concesion))
        ?.nombre.toLowerCase()
        .includes(filtro.toLowerCase());
      // Check direct concession name if available from back (per JSON)
      const directConcesionMatch = l.concesion
        ?.toLowerCase()
        .includes(filtro.toLowerCase());

      const tipoMatch = l.tipo_labor
        .toLowerCase()
        .includes(filtro.toLowerCase());
      return nombreMatch || concesionMatch || directConcesionMatch || tipoMatch;
    });
  }, [labores, concesiones, filtro]);

  // Manejadores
  const handleOpenCrear = () => {
    setLaborEditar(null);
    open();
  };

  const handleOpenEditar = (labor: RES_Labor) => {
    setLaborEditar(labor);
    open();
  };

  const handleEliminar = (id: number) => {
    setLaborToDelete(id);
    openDeleteModal();
  };

  const confirmEliminar = async () => {
    if (laborToDelete) {
      const exito = await eliminarLabor(laborToDelete);
      if (exito) cargarDatos();
      closeDeleteModal();
      setLaborToDelete(null);
    }
  };

  const handleSuccess = () => {
    close();
    cargarDatos();
  };

  return (
    <div className="space-y-6">
      <Group justify="space-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Labores</h2>
          <p className="text-zinc-400 text-sm">
            Gestiona las labores mineras de las concesiones.
          </p>
        </div>
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={handleOpenCrear}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
        >
          Nueva Labor
        </Button>
      </Group>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <TextInput
          placeholder="Buscar por nombre, concesión o tipo..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={filtro}
          onChange={(e) => setFiltro(e.currentTarget.value)}
          className="w-full max-w-md"
          radius="lg"
          size="sm"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
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
              <Table.Th className="text-zinc-300">Concesión</Table.Th>
              <Table.Th className="text-zinc-300">Labor</Table.Th>
              <Table.Th className="text-zinc-300">Tipo</Table.Th>
              <Table.Th className="text-zinc-300">Sostenimiento</Table.Th>
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
            {laboresFiltradas.length > 0 ? (
              laboresFiltradas.map((l, index) => {
                // Try finding by ID first, fallback to name string from labor object
                const cons = concesiones.find(
                  (c) => String(c.id_concesion) === String(l.id_concesion),
                );
                const nombreConcesion = cons
                  ? cons.nombre
                  : l.concesion || "Desconocida";

                return (
                  <Table.Tr key={l.id_labor}>
                    <Table.Td
                      className="text-zinc-500 font-medium text-xs w-16 text-center"
                      style={{ textAlign: "center" }}
                    >
                      {index + 1}
                    </Table.Td>
                    <Table.Td className="text-zinc-400 font-medium text-sm">
                      {nombreConcesion}
                    </Table.Td>
                    <Table.Td className="text-indigo-200 font-semibold">
                      {l.nombre}
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light" size="sm" radius="sm">
                        {l.tipo_labor}
                      </Badge>
                    </Table.Td>
                    <Table.Td className="text-zinc-300 text-sm">
                      {l.tipo_sostenimiento}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={l.estado === EstadoBase.Activo ? "green" : "red"}
                        variant="light"
                        radius="sm"
                        size="sm"
                      >
                        {l.estado}
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
                            onClick={() => handleOpenEditar(l)}
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
                            onClick={() => handleEliminar(l.id_labor)}
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
                  colSpan={7}
                  className="text-center py-8 text-zinc-500"
                >
                  {loading
                    ? "Cargando..."
                    : "No hay labores que coincidan con la búsqueda"}
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
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ffc933] to-[#b8920a] rounded-full shadow-[0_0_10px_#d4a50a]"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent tracking-tight">
              {laborEditar ? "Editar Labor" : "Nueva Labor"}
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
          close:
            "text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-full w-8 h-8 flex items-center justify-center",
          title: "text-xl font-bold text-white",
        }}
        transitionProps={{ transition: "pop", duration: 250 }}
      >
        <FormularioLabor
          labor={laborEditar}
          concesiones={concesiones}
          onSuccess={handleSuccess}
          onCancel={close}
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
            <h3 className="text-lg font-bold text-white mb-2">
              Eliminar Labor
            </h3>
            <p className="text-zinc-400 text-sm">
              ¿Estás seguro que deseas eliminar esta labor? Esta acción no se
              puede deshacer.
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

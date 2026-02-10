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
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { EstadoBase } from "../../../../shared/enums";

export const EmpresasConcesiones = () => {


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
                const empresa = empresas.find(
                  (e) => e.id_empresa === c.id_empresa,
                );
                return (
                  <Table.Tr key={c.id_concesion}>
                    <Table.Td
                      className="text-zinc-500 font-medium text-xs w-16 text-center"
                      style={{ textAlign: "center" }}
                    >
                      {index + 1}
                    </Table.Td>
                    <Table.Td className="text-zinc-400 font-medium text-sm">
                      {empresa ? empresa.nombre_comercial : "Desconocida"}
                    </Table.Td>
                    <Table.Td className="text-indigo-200 font-semibold">
                      {c.nombre}
                    </Table.Td>
                    <Table.Td>
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
                            onClick={() => handleEliminar(c.id_concesion)}
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


    </div>
  );
};

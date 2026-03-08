import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Menu,
  TextInput,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
  BuildingStorefrontIcon,
  UserCircleIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroAlmacen } from "./registro-almacen";
import { HistorialResponsables } from "./historial-responsables";
import { MinasAbastecidas } from "./minas-abastecidas";
import { useAlmacenes } from "../hooks/useAlmacenes";
import type { RES_Almacen } from "../service/almacenes.responses";

export const AlmacenesPage = () => {
  useTitlePage("Almacenes");

  const {
    loading,
    setAlmacenes,
    handleChildMessage,
    busqueda,
    setBusqueda,
    almacenesFiltrados,
  } = useAlmacenes();

  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [
    openedResponsables,
    { open: openResponsables, close: closeResponsables },
  ] = useDisclosure(false);
  const [openedAlcance, { open: openAlcance, close: closeAlcance }] =
    useDisclosure(false);
  const [selectedAlmacen, setSelectedAlmacen] = useState<RES_Almacen | null>(
    null,
  );

  const columns: DataTableColumn<RES_Almacen>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "nombre",
      title: "Almacén",
      width: 250,
      render: (record) => (
        <Group gap="xs">
          <BuildingStorefrontIcon className="w-5 h-5 text-zinc-500" />
          <div>
            <Text size="sm" fw={500} className="text-zinc-200">
              {record.nombre}
            </Text>
            {record.es_principal && (
              <Badge size="xs" variant="light" color="pink">
                Principal
              </Badge>
            )}
          </div>
        </Group>
      ),
    },
    {
      accessor: "minas_count",
      title: "Minas",
      width: 130,
      textAlign: "center",
      render: (record) => (
        <Group gap={6} justify="center">
          <Badge variant="light" color="cyan" size="sm" radius="sm">
            {record.minas_count || 0} Minas
          </Badge>
          <Tooltip label="Ver Minas">
            <ActionIcon
              variant="subtle"
              color="cyan"
              size="sm"
              onClick={() => {
                setSelectedAlmacen(record);
                openAlcance();
              }}
            >
              <RectangleStackIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "responsable_actual",
      title: "Responsable",
      width: 200,
      render: (record) => (
        <Group gap="xs">
          {record.responsable_actual ? (
            <>
              <UserCircleIcon className="w-5 h-5 text-emerald-500" />
              <Text size="sm" className="text-zinc-200">
                {record.responsable_actual}
              </Text>
            </>
          ) : (
            <Badge variant="outline" color="gray" size="sm">
              Sin Asignar
            </Badge>
          )}
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => {
              setSelectedAlmacen(record);
              openResponsables();
            }}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </ActionIcon>
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
          color={record.estado === "Activo" ? "green" : "red"}
          variant="light"
          radius="sm"
          size="sm"
        >
          {record.estado}
        </Badge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 80,
      textAlign: "right",
      render: () => (
        <Menu shadow="md" width={150} position="left">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
            <Menu.Label className="text-zinc-500">Acciones</Menu.Label>
            <Menu.Item
              leftSection={<PencilSquareIcon className="w-4 h-4" />}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Editar
            </Menu.Item>
            <Menu.Item
              leftSection={<TrashIcon className="w-4 h-4" />}
              color="red"
              className="hover:bg-red-900/20"
            >
              Eliminar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <TextInput
          placeholder="Buscar por nombre o responsable..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.currentTarget.value);
          }}
          className="flex-1 min-w-64"
          radius="lg"
          size="sm"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
          }}
        />
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openCreate}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
        >
          Nuevo Almacén
        </Button>
      </div>

      <DataTableEstandar
        idAccessor="id_almacen"
        columns={columns}
        records={almacenesFiltrados}
        loading={loading}
      />

      {/* Modal: Crear Almacén */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nuevo Almacén"
      >
        <RegistroAlmacen
          onSuccess={(nuevo) => {
            closeCreate();
            setAlmacenes((prev) => [nuevo, ...prev]);
          }}
          onCancel={closeCreate}
        />
      </ModalEstandar>

      {/* Modal: Historial de Responsables */}
      <ModalEstandar
        opened={openedResponsables}
        close={closeResponsables}
        title="Gestión de Responsables"
      >
        {selectedAlmacen && (
          <HistorialResponsables
            almacen={selectedAlmacen}
            onMessage={handleChildMessage}
            onUpdateResponsable={(nombre) =>
              setAlmacenes((prev) =>
                prev.map((alm) =>
                  alm.id_almacen === selectedAlmacen.id_almacen
                    ? { ...alm, responsable_actual: nombre }
                    : alm,
                ),
              )
            }
          />
        )}
      </ModalEstandar>

      {/* Modal: Abastecimiento a Minas */}
      <ModalEstandar
        opened={openedAlcance}
        close={closeAlcance}
        title="Gestión de Minas"
      >
        {selectedAlmacen && (
          <MinasAbastecidas
            almacen={selectedAlmacen}
            onMessage={handleChildMessage}
            onMinasChange={(delta) => {
              setAlmacenes((prev) =>
                prev.map((alm) =>
                  alm.id_almacen === selectedAlmacen.id_almacen
                    ? { ...alm, minas_count: (alm.minas_count || 0) + delta }
                    : alm,
                ),
              );
              setSelectedAlmacen((prev) =>
                prev
                  ? { ...prev, minas_count: (prev.minas_count || 0) + delta }
                  : null,
              );
            }}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

export default AlmacenesPage;

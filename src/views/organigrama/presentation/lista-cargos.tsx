import {
  Button,
  Group,
  TextInput,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Menu,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  BriefcaseIcon,
  TrashIcon,
  PencilSquareIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import type { RES_Cargo } from "../service/organigrama.responses";

interface Props {
  cargos: RES_Cargo[];
  loading: boolean;
  busqueda: string;
  setBusqueda: (v: string) => void;
  onNuevo: () => void;
}

export const ListaCargos = ({
  cargos,
  loading,
  busqueda,
  setBusqueda,
  onNuevo,
}: Props) => {
  const colCargos: DataTableColumn<RES_Cargo>[] = [
    {
      accessor: "index",
      title: "#",
      width: 50,
      textAlign: "center",
      render: (_, i) => i + 1,
    },
    {
      accessor: "nombre",
      title: "Cargo",
      render: (r) => (
        <Group gap="xs">
          <BriefcaseIcon className="w-5 h-5 text-emerald-400" />
          <Text size="sm" fw={500} className="text-zinc-200">
            {r.nombre}
          </Text>
        </Group>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 100,
      render: (r) => (
        <Badge color={r.estado === "Activo" ? "green" : "red"} variant="light">
          {r.estado}
        </Badge>
      ),
    },
    {
      accessor: "actions",
      title: "",
      width: 60,
      textAlign: "right",
      render: () => (
        <Menu shadow="md" width={150} position="left">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown className="bg-zinc-900 border-zinc-800">
            <Menu.Item
              leftSection={<PencilSquareIcon className="w-4 h-4" />}
              className="text-zinc-300 hover:bg-zinc-800"
            >
              Editar
            </Menu.Item>
            <Menu.Item
              leftSection={<TrashIcon className="w-4 h-4" />}
              color="red"
            >
              Eliminar
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <TextInput
          placeholder="Buscar cargo..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          radius="lg"
          size="sm"
          classNames={{ input: "bg-zinc-900/50 border-zinc-800 text-white" }}
          className="flex-1"
        />
        <Button
          leftSection={<PlusIcon className="w-4 h-4" />}
          onClick={onNuevo}
          radius="lg"
          size="sm"
          className="bg-emerald-600"
        >
          Nuevo Cargo
        </Button>
      </Group>

      <DataTableEstandar
        idAccessor="id_cargo"
        columns={colCargos}
        records={cargos}
        loading={loading}
      />
    </Stack>
  );
};

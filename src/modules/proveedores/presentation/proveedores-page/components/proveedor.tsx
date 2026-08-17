import {
  Badge,
  ActionIcon,
  Tooltip,
  Group,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBuildingBank,
  IconBuilding,
  IconMail,
  IconPhone,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { DataTableEstandar } from "../../../../../presentation/utils/datatable-estandar";
import type { DataTableColumn } from "mantine-datatable";
import type { ProveedorResponse } from "../../../service/proveedores.responses";
import { TipoEntidad } from "../../../../../shared/enums/_generic/tipo-entidad";

type Col = DataTableColumn<ProveedorResponse>;

interface Props {
  proveedores: ProveedorResponse[];
  loading: boolean;
  modoCarbon: boolean;
  onOpenCuentas: (proveedor: ProveedorResponse) => void;
  onOpenPersonal: (proveedor: ProveedorResponse) => void;
}

export const Proveedor = ({
  proveedores,
  loading,
  modoCarbon,
  onOpenCuentas,
  onOpenPersonal,
}: Props) => {
  const columnas: Col[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
      render: (_: ProveedorResponse, index: number) => index + 1,
    },
    {
      accessor: "razon_social",
      title: "Proveedor",
      width: 280,
      render: (r: ProveedorResponse) => (
        <Group gap="sm">
          <ThemeIcon
            variant="light"
            color={
              r.tipo_entidad === TipoEntidad.Natural ? "cyan" : "indigo"
            }
            radius="xl"
            size="lg"
          >
            {r.tipo_entidad === TipoEntidad.Natural ? (
              <IconUser className="w-5 h-5" />
            ) : (
              <IconBuilding className="w-5 h-5" />
            )}
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500} className="text-zinc-200">
              {r.razon_social}
            </Text>
            <Text size="xs" className="text-zinc-500">
              {r.tipo_entidad}
              {r.ruc && ` · RUC: ${r.ruc}`}
              {r.dni && ` · DNI: ${r.dni}`}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      accessor: "cantidad_cuentas_bancarias",
      title: "Cuentas",
      width: 150,
      textAlign: "center",
      render: (r: ProveedorResponse) => (
        <Group gap="xs" justify="center" wrap="nowrap">
          <Badge
            color={r.cantidad_cuentas_bancarias > 0 ? "blue" : "gray"}
            variant="light"
            size="sm"
            radius="xl"
          >
            {r.cantidad_cuentas_bancarias === 1
              ? "1 cuenta"
              : `${r.cantidad_cuentas_bancarias} cuentas`}
          </Badge>
          <Tooltip label="Gestionar Cuentas" withArrow position="left">
            <ActionIcon
              variant="subtle"
              color="blue"
              radius="xl"
              size="sm"
              onClick={() => onOpenCuentas(r)}
            >
              <IconBuildingBank size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
    {
      accessor: "id_proveedor",
      title: "Personal",
      width: 110,
      textAlign: "center",
      render: (r: ProveedorResponse) => (
        <Tooltip label="Ver personal externo" withArrow position="left">
          <ActionIcon
            variant="subtle"
            color="indigo"
            radius="xl"
            size="sm"
            onClick={() => onOpenPersonal(r)}
          >
            <IconUsers size={16} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      ),
    },
    {
      accessor: "contacto",
      title: "Contacto",
      width: 200,
      render: (r: ProveedorResponse) => (
        <Stack gap={2}>
          {r.correo && (
            <Group gap={4}>
              <IconMail
                size={14}
                stroke={1.5}
                className="text-zinc-500 shrink-0"
              />
              <Text size="xs" className="text-zinc-300 truncate max-w-55">
                {r.correo}
              </Text>
            </Group>
          )}
          {r.telefono && (
            <Group gap={4}>
              <IconPhone
                size={14}
                stroke={1.5}
                className="text-zinc-500 shrink-0"
              />
              <Text size="xs" className="text-zinc-300 font-mono">
                {r.telefono}
              </Text>
            </Group>
          )}
          {!r.correo && !r.telefono && (
            <Text size="xs" c="dimmed" fs="italic">
              Sin contacto
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "direccion",
      title: "Ubicación",
      width: 240,
      textAlign: "left",
      render: (r: ProveedorResponse) => {
        const geo = modoCarbon
          ? [
              r.departamento_nombre,
              r.provincia_nombre,
              r.distrito_nombre,
            ]
              .filter(Boolean)
              .join(", ")
          : "";
        const direccion = r.direccion || "";
        if (!geo && !direccion) {
          return (
            <Text size="xs" c="dimmed" fs="italic">
              Sin ubicación
            </Text>
          );
        }
        return (
          <Stack gap={2}>
            {direccion && (
              <Text size="xs" className="text-zinc-300">
                {direccion}
              </Text>
            )}
            {geo && (
              <Text
                size="xs"
                className="text-zinc-500 uppercase tracking-wide"
              >
                {geo}
              </Text>
            )}
          </Stack>
        );
      },
    },
    {
      accessor: "indicadores",
      title: "Indicadores",
      textAlign: "center",
      render: (r: ProveedorResponse) => {
        const badges = [];
        if (r.para_mantenimiento) {
          badges.push(
            <Badge key="maint" color="blue" variant="light" size="sm" radius="xl">
              Da Mantenimiento
            </Badge>,
          );
        }
        if (r.para_transporte) {
          badges.push(
            <Badge key="trans" color="teal" variant="light" size="sm" radius="xl">
              Transporte
            </Badge>,
          );
        }
        return badges.length > 0 ? (
          <Group gap="xs" justify="center">
            {badges}
          </Group>
        ) : (
          <Text size="sm" className="text-zinc-500">
            —
          </Text>
        );
      },
    },
    {
      accessor: "estado",
      title: "Estado",
      width: 100,
      textAlign: "center",
      render: (r: ProveedorResponse) => (
        <Badge
          color={r.estado === "Activo" ? "green" : "gray"}
          variant="light"
          size="sm"
          radius="lg"
        >
          {r.estado}
        </Badge>
      ),
    },
  ];

  return (
    <DataTableEstandar
      idAccessor="id_proveedor"
      records={proveedores}
      loading={loading}
      columns={columnas}
    />
  );
};
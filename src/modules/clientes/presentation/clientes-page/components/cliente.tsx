import {
  Badge,
  Group,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconBuilding, IconUser } from "@tabler/icons-react";
import { DataTableEstandar } from "../../../../../presentation/utils/datatable-estandar";
import type { ClienteResponse } from "../../../service/clientes.responses";

interface Props {
  clientes: ClienteResponse[];
  loading: boolean;
}

export const Cliente = ({ clientes, loading }: Props) => {
  return (
    <DataTableEstandar
      idAccessor="id_cliente"
      records={clientes}
      loading={loading}
      columns={[
        {
          accessor: "index",
          title: "#",
          textAlign: "center",
          width: 50,
          render: (_: ClienteResponse, index: number) => index + 1,
        },
        {
          accessor: "razon_social",
          title: "Cliente",
          width: 280,
          render: (r: ClienteResponse) => (
            <Group gap="sm">
              <ThemeIcon
                variant="light"
                color={r.tipo_entidad === "Persona Natural" ? "cyan" : "indigo"}
                radius="xl"
                size="lg"
              >
                {r.tipo_entidad === "Persona Natural" ? (
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
          accessor: "direccion",
          title: "Dirección",
          textAlign: "center",
          render: (r: ClienteResponse) => (
            <Text
              size="sm"
              className="text-zinc-400 mx-3.5 text-center"
              lineClamp={1}
            >
              {r.direccion || "—"}
            </Text>
          ),
        },
        {
          accessor: "telefono",
          title: "Teléfono",
          render: (r: ClienteResponse) => (
            <Text size="sm" className="text-zinc-300">
              {r.telefono || "—"}
            </Text>
          ),
        },
        {
          accessor: "correo",
          title: "Correo",
          render: (r: ClienteResponse) => (
            <Text size="sm" className="text-zinc-400">
              {r.correo || "—"}
            </Text>
          ),
        },
        {
          accessor: "estado",
          title: "Estado",
          width: 100,
          textAlign: "center",
          render: (r: ClienteResponse) => (
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
      ]}
    />
  );
};

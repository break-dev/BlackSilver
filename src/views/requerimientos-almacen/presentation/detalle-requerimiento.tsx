import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  ClockIcon,
  CubeIcon,
  UserIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";
import type {
  RES_RequerimientoAlmacen,
  RES_RequerimientoDetalle,
} from "../services/requerimientos.responses";

interface DetalleRequerimientoProps {
  headerData: RES_RequerimientoAlmacen;
  detalles: RES_RequerimientoDetalle[];
  loading: boolean;
  onOpenTrazabilidad: (detalle: RES_RequerimientoDetalle) => void;
}

export const DetalleRequerimiento = ({
  headerData,
  detalles,
  loading,
  onOpenTrazabilidad,
}: DetalleRequerimientoProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case EstadoDetalleRequerimiento.Pendiente:
        return "blue";
      case EstadoDetalleRequerimiento.AprobacionLogistica:
        return "violet";
      case EstadoDetalleRequerimiento.Completado:
        return "green";
      case EstadoDetalleRequerimiento.RechazadoLogistica:
        return "red";
      default:
        return "gray";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader color="violet" />
      </div>
    );

  return (
    <Stack gap="xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Solicitante",
            val: headerData.solicitante,
            icon: UserIcon,
            color: "indigo",
          },
          {
            label: "Código",
            val: headerData.correlativo,
            icon: CheckBadgeIcon,
            color: "violet",
          },
          {
            label: "Mina",
            val: headerData.mina,
            icon: MapPinIcon,
            color: "amber",
          },
          {
            label: "Almacén",
            val: headerData.almacen_destino,
            icon: BuildingStorefrontIcon,
            color: "emerald",
          },
        ].map((item, i) => (
          <Paper
            key={i}
            p="md"
            radius="lg"
            className={`bg-${item.color}-500/5 border border-${item.color}-500/20`}
          >
            <Group gap="xs" mb={4}>
              <item.icon className={`w-4 h-4 text-${item.color}-500`} />
              <Text
                size="xs"
                fw={800}
                c={`${item.color}.3`}
                className="uppercase tracking-widest"
              >
                {item.label}
              </Text>
            </Group>
            <Text fw={800} className="text-white truncate">
              {item.val}
            </Text>
          </Paper>
        ))}
      </div>

      <div className="overflow-hidden border border-zinc-800 rounded-xl bg-zinc-950/20">
        <Table verticalSpacing="md">
          <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs font-bold uppercase">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4 text-right">Cant. Solic.</th>
              <th className="px-6 py-4 text-right">Cant. Entregada</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((det) => (
              <tr
                key={det.id_requerimiento_almacen_detalle}
                className="hover:bg-zinc-900/40 border-b border-zinc-900"
              >
                <td className="px-6 py-4">
                  <Group gap="sm">
                    <CubeIcon className="w-5 h-5 text-zinc-500" />
                    <Stack gap={0}>
                      <Text size="sm" fw={800}>
                        {det.producto}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {det.comentario}
                      </Text>
                    </Stack>
                  </Group>
                </td>
                <td className="px-6 py-4 text-right">
                  <Badge color="cyan">
                    {det.cantidad_solicitada} {det.unidad_medida}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Badge color={det.cantidad_entregada > 0 ? "green" : "gray"}>
                    {det.cantidad_entregada} {det.unidad_medida}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge color={getStatusColor(det.estado)} variant="light">
                    {det.estado}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                  <Tooltip label="Ver Seguimiento">
                    <ActionIcon
                      color="indigo"
                      variant="filled"
                      onClick={() => onOpenTrazabilidad(det)}
                    >
                      <ClockIcon className="w-4 h-4" />
                    </ActionIcon>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Stack>
  );
};

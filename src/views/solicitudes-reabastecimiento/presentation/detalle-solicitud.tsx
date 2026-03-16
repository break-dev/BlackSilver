import {
  Badge,
  Group,
  Stack,
  Table,
  Text,
  Paper,
  Divider,
} from "@mantine/core";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type {
  RES_SolicitudReabastecimiento,
  RES_SolicitudDetalle,
} from "../service/reabastecimiento.responses";

interface DetalleSolicitudProps {
  headerData: RES_SolicitudReabastecimiento;
  detalles: RES_SolicitudDetalle[];
  loading: boolean;
  onOpenTrazabilidad: (detalle: RES_SolicitudDetalle) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InfoCard = ({ icon: Icon, label, value, color = "zinc" }: any) => (
  <Paper
    bg="zinc.9"
    p="md"
    radius="lg"
    className="border border-zinc-800/50 flex flex-col gap-1 shadow-sm"
  >
    <Group gap="xs">
      <Icon className={`w-4 h-4 text-${color}-500`} />
      <Text
        size="xs"
        fw={700}
        className="text-zinc-500 uppercase tracking-widest"
      >
        {label}
      </Text>
    </Group>
    <Text size="sm" fw={600} className="text-zinc-100 italic">
      {value}
    </Text>
  </Paper>
);

export const DetalleSolicitud = ({
  headerData,
  detalles,
  loading,
  onOpenTrazabilidad,
}: DetalleSolicitudProps) => {
  return (
    <Stack gap="xl" className="animate-fade-in p-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          icon={BuildingStorefrontIcon}
          label="Almacén Solicitante"
          value={headerData.almacen_solicitante}
          color="indigo"
        />
        <InfoCard
          icon={UserIcon}
          label="Solicitante"
          value={headerData.empleado_solicitante}
          color="violet"
        />
        <InfoCard
          icon={CalendarDaysIcon}
          label="Fecha de Creación"
          value={dayjs(headerData.created_at).format("DD/MM/YYYY HH:mm")}
          color="cyan"
        />
      </div>

      <Paper
        bg="zinc.9/50"
        p="lg"
        radius="xl"
        className="border border-zinc-800/30"
      >
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fw={800} size="xl" className="text-zinc-100">
                Items Solicitados
              </Text>
              <Text
                size="xs"
                fw={800}
                className="text-zinc-500 uppercase tracking-widest"
              >
                Lista detallada de productos
              </Text>
            </Stack>
            <Badge
              size="lg"
              color="indigo"
              variant="light"
              radius="sm"
              className="font-bold py-4"
            >
              SOLICITUD: {headerData.correlativo}
            </Badge>
          </Group>

          <Divider color="zinc.8" />

          <div className="overflow-x-auto">
            <Table variant="unstyled" verticalSpacing="md">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-zinc-800/50">
                  <th className="py-4 px-2">Producto</th>
                  <th className="py-4 px-2 text-right">Cant. Solicitada</th>
                  <th className="py-4 px-2 text-right">Cant. Entregada</th>
                  <th className="py-4 px-2">Estado</th>
                  <th className="py-4 px-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td
                        colSpan={5}
                        className="py-8 bg-zinc-800/10 rounded-lg mb-2"
                      ></td>
                    </tr>
                  ))
                ) : detalles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-zinc-600 italic"
                    >
                      No se encontraron detalles
                    </td>
                  </tr>
                ) : (
                  detalles.map((det) => (
                    <tr
                      key={det.id_solicitud_detalle}
                      className="hover:bg-zinc-800/20 transition-colors border-b border-zinc-800/30"
                    >
                      <td className="py-4 px-2">
                        <Text size="sm" fw={600} className="text-zinc-100">
                          {det.producto}
                        </Text>
                        <Text
                          size="10px"
                          className="text-zinc-500 uppercase tracking-wider"
                        >
                          Presentación: {det.contenido_por_presentacion}{" "}
                          {det.unidad_medida_base_abreviatura} /{" "}
                          {det.unidad_medida_solicitud_abreviatura}
                        </Text>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <Badge variant="light" color="indigo" radius="sm">
                          {det.cantidad_solicitada}{" "}
                          {det.unidad_medida_solicitud_abreviatura}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <Badge
                          variant="light"
                          color={
                            det.cantidad_entregada > 0 ? "emerald" : "zinc"
                          }
                          radius="sm"
                        >
                          {det.cantidad_entregada}{" "}
                          {det.unidad_medida_solicitud_abreviatura}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <Badge
                          variant="dot"
                          color="blue"
                          size="sm"
                          radius="xs"
                          className="uppercase font-bold tracking-wider"
                        >
                          {det.estado}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Text
                          size="xs"
                          fw={700}
                          className="text-indigo-400 hover:text-indigo-300 cursor-pointer underline underline-offset-4"
                          onClick={() => onOpenTrazabilidad(det)}
                        >
                          Ver Historial
                        </Text>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
};

import {
  Loader,
  Stack,
  Text,
  Badge,
  Paper,
  Group,
  Timeline,
  ThemeIcon,
} from "@mantine/core";
import dayjs from "dayjs";
import { useTrazabilidadOC } from "../hooks/useTrazabilidadOC";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  CubeIcon,
} from "@heroicons/react/24/solid";
import { Estado_OrdenCompraDetalle } from "../../../shared/enums/orden-compra/orden-compra";

interface TrazabilidadProps {
  idDetalle: number;
  productoNombre: string;
}

export const TrazabilidadDetalleOC = ({
  idDetalle,
  productoNombre,
}: TrazabilidadProps) => {
  const { loading, eventos } = useTrazabilidadOC(idDetalle);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" color="indigo" />
      </div>
    );

  return (
    <Stack gap="xl" className="animate-fade-in p-2">
      {/* Header Visual */}
      <div className="px-4 py-3 border-l-4 border-indigo-500 bg-zinc-900/50 rounded-r-xl shadow-sm">
        <Text
          size="xs"
          c="dimmed"
          fw={700}
          className="uppercase tracking-widest mb-1"
        >
          Producto:
        </Text>
        <Text size="lg" fw={800} className="text-white tracking-tight">
          {productoNombre}
        </Text>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
          <CubeIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3 opacity-20" />
          <Text c="dimmed" fs="italic" size="sm">
            No hay eventos registrados para este producto.
          </Text>
        </div>
      ) : (
        <Timeline
          active={eventos.length + 1}
          bulletSize={32}
          lineWidth={2}
          className="px-4"
        >
          {eventos.map((evento, index) => {
            const style = getStatusStyles(evento.estado);

            return (
              <Timeline.Item
                key={evento.id_log || index}
                color={style.color}
                bullet={
                  <ThemeIcon
                    size={32}
                    radius="xl"
                    color={style.color}
                    variant={style.variant}
                    className="shadow-lg transform transition-transform hover:scale-110"
                  >
                    {getStatusIcon(evento.estado)}
                  </ThemeIcon>
                }
                title={
                  <Group justify="space-between" align="center" mb={6}>
                    <Badge
                      color={style.color}
                      variant={style.variant}
                      radius="xl"
                      size="sm"
                      className={`font-bold border px-3 py-2 ${
                        style.variant === "light"
                          ? "border-current/20"
                          : "border-transparent"
                      }`}
                    >
                      {evento.estado}
                    </Badge>
                    <Text size="11px" c="zinc.5" fw={700} className="font-mono">
                      {dayjs(evento.created_at).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </Group>
                }
              >
                <Paper
                  p="md"
                  radius="lg"
                  className="bg-zinc-900/40 border border-zinc-800/50 shadow-sm transition-colors hover:bg-zinc-900/60"
                >
                  <Text
                    size="sm"
                    fw={500}
                    c="zinc.2"
                    className="leading-relaxed"
                  >
                    {evento.descripcion || "Sin comentarios registrados."}
                  </Text>
                  <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Text size="10px" fw={800} c="zinc.5">
                        {evento.empleado?.charAt(0) || "?"}
                      </Text>
                    </div>
                    <Text size="xs" c="zinc.5" fw={500}>
                      Registrado por:
                    </Text>
                    <Text size="xs" fw={700} c="zinc.3" className="italic">
                      {evento.empleado || "Sistema"}
                    </Text>
                  </div>
                </Paper>
              </Timeline.Item>
            );
          })}
        </Timeline>
      )}
    </Stack>
  );
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case Estado_OrdenCompraDetalle.Pendiente:
      return { color: "blue", variant: "light" as const };
    case Estado_OrdenCompraDetalle.EnRecepcion:
      return { color: "indigo", variant: "light" as const };
    case Estado_OrdenCompraDetalle.RecepcionCompleta:
      return { color: "teal", variant: "light" as const };
    case "Aprobado":
      return { color: "green", variant: "light" as const };
    case "Rechazado":
      return { color: "red", variant: "filled" as const };
    case "Anulada":
      return { color: "zinc", variant: "filled" as const };
    default:
      return { color: "gray", variant: "light" as const };
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case Estado_OrdenCompraDetalle.Pendiente:
      return <ClipboardDocumentListIcon className="w-4 h-4 text-white" />;
    case Estado_OrdenCompraDetalle.EnRecepcion:
      return <TruckIcon className="w-4 h-4 text-white" />;
    case Estado_OrdenCompraDetalle.RecepcionCompleta:
      return <CheckCircleIcon className="w-4 h-4 text-white" />;
    case "Rechazado":
      return <XCircleIcon className="w-4 h-4 text-white" />;
    case "Aprobado":
      return <CheckBadgeIcon className="w-4 h-4 text-white" />;
    case "Anulada":
      return <CubeIcon className="w-4 h-4 text-white" />;
    default:
      return <ClockIcon className="w-4 h-4 text-white" />;
  }
};

import {
  Timeline,
  Text,
  Loader,
  Center,
  Stack,
  Group,
  Paper,
  Badge,
  ThemeIcon,
} from "@mantine/core";
import {
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  TruckIcon,
  ArchiveBoxArrowDownIcon,
  XCircleIcon,
  CheckCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";

interface Props {
  eventos: RES_Trazabilidad[];
  loading?: boolean;
  productoNombre?: string;
}

export const TrazabilidadPrestamo = ({
  eventos,
  loading,
  productoNombre,
}: Props) => {
  if (loading) {
    return (
      <Center py={60}>
        <Loader size="lg" color="indigo" />
      </Center>
    );
  }

  return (
    <Stack gap="xl" className="animate-fade-in p-2 font-sans">
      {productoNombre && (
        <div className="px-4 py-3 border-l-4 border-indigo-500 bg-zinc-900/50 rounded-r-xl shadow-sm">
          <Text
            size="xs"
            c="dimmed"
            fw={800}
            className="uppercase tracking-widest mb-1"
          >
            Producto:
          </Text>
          <Text size="lg" fw={900} className="text-white tracking-tight">
            {productoNombre}
          </Text>
        </div>
      )}

      {eventos.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
          <CubeIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3 opacity-20" />
          <Text c="dimmed" fs="italic" size="sm" fw={800}>
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
          {[...eventos].reverse().map((evento, idx) => {
            const style = getStatusStyles(evento.estado);
            return (
              <Timeline.Item
                key={idx}
                color={style.color}
                bullet={
                  <ThemeIcon
                    size={32}
                    radius="xl"
                    color={style.color}
                    variant="filled"
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
                      className={`font-black border px-3 py-2 ${style.variant === "light" ? "border-current/20" : "border-transparent"}`}
                    >
                      {evento.estado}
                    </Badge>
                    <Text size="11px" c="zinc.5" fw={800} className="font-mono">
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
                    c="zinc.100"
                    className="leading-relaxed"
                  >
                    {evento.descripcion || getSystemMessage(evento.estado)}
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
                    <Text
                      size="xs"
                      fw={700}
                      c="zinc.3"
                      className="italic underline underline-offset-4 decoration-indigo-500/20"
                    >
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

const getSystemMessage = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente") || s.includes("esperando"))
    return "Se ha generado la solicitud de préstamo para este producto.";
  if (s.includes("aprobado") || s.includes("autorizado"))
    return "El almacén prestamista aprobó el despacho para este producto.";
  if (
    s.includes("despacho") ||
    s.includes("iniciado") ||
    s.includes("entregando")
  )
    return "Se ha iniciado la entrega física de los materiales.";
  if (s.includes("entrega") || s.includes("atendido"))
    return "Se ha registrado una nueva entrega física de este producto.";
  if (s.includes("completad") || s.includes("finalizado"))
    return "La atención de este ítem se ha completado satisfactoriamente al 100%.";
  if (s.includes("rechazado"))
    return "El almacén prestamista rechazó la solicitud para este producto.";
  if (s.includes("devolucion"))
    return "Se ha procesado una devolución de materiales al almacén de origen.";
  if (s.includes("cerrado") || s.includes("anulado"))
    return "El ítem ha sido cerrado o anulado por el sistema.";
  return "Acción registrada automáticamente por el sistema al procesar el cambio de estado.";
};

const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente") || s.includes("esperando"))
    return { color: "blue", variant: "light" as const };
  if (s.includes("aprobado") || s.includes("autorizado"))
    return { color: "violet", variant: "light" as const };
  if (s.includes("despacho") || s.includes("iniciado"))
    return { color: "orange", variant: "light" as const };
  if (s.includes("entrega") || s.includes("atendido")) {
    if (s.includes("iniciada"))
      return { color: "orange", variant: "light" as const };
    return { color: "green", variant: "light" as const };
  }
  if (s.includes("completad") || s.includes("finalizado"))
    return { color: "cyan", variant: "light" as const };
  if (s.includes("devolucion"))
    return { color: "pink", variant: "light" as const };
  if (s.includes("rechazado"))
    return { color: "red", variant: "filled" as const };
  if (s.includes("cerrado") || s.includes("anulado"))
    return { color: "zinc", variant: "filled" as const };
  return { color: "gray", variant: "light" as const };
};

const getStatusIcon = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente") || s.includes("esperando"))
    return <ClipboardDocumentListIcon className="w-4 h-4 text-white" />;
  if (s.includes("aprobado") || s.includes("autorizado"))
    return <CheckBadgeIcon className="w-4 h-4 text-white" />;
  if (s.includes("despacho") || s.includes("iniciado"))
    return <TruckIcon className="w-4 h-4 text-white" />;
  if (s.includes("entrega") || s.includes("atendido"))
    return <ArchiveBoxArrowDownIcon className="w-4 h-4 text-white" />;
  if (s.includes("completad") || s.includes("finalizado"))
    return <CheckCircleIcon className="w-4 h-4 text-white" />;
  if (s.includes("devolucion"))
    return <TruckIcon className="w-4 h-4 text-white" />;
  if (s.includes("rechazado"))
    return <XCircleIcon className="w-4 h-4 text-white" />;
  if (s.includes("cerrado") || s.includes("anulado"))
    return <CubeIcon className="w-4 h-4 text-white" />;
  return <div className="w-2 h-2 rounded-full bg-white" />;
};

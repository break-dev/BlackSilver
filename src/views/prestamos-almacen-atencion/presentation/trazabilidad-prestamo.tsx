import { 
  Timeline, 
  Text, 
  Loader, 
  ScrollArea, 
  Center, 
  Stack, 
  Group, 
  Paper, 
  Badge, 
  ThemeIcon 
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
import { type RES_TrazabilidadPrestamo } from "../service/prestamos-atencion.responses";
import { EstadoDetallePrestamo } from "../../../shared/enums/estados";

interface Props {
  eventos: RES_TrazabilidadPrestamo[];
  loading?: boolean;
  productoNombre?: string;
}

export const TrazabilidadPrestamo = ({ eventos, loading, productoNombre }: Props) => {
  if (loading) {
    return (
      <Center py={60}>
        <Stack gap="xs" align="center">
          <Loader size="lg" color="indigo" type="dots" />
          <Text size="xs" c="dimmed" className="uppercase tracking-widest animate-pulse font-black">Rastreando movimientos...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="xl" className="animate-fade-in p-2 font-sans">
      {productoNombre && (
        <div className="px-4 py-3 border-l-4 border-indigo-500 bg-zinc-900/50 rounded-r-xl shadow-sm">
          <Text size="xs" c="dimmed" fw={800} className="uppercase tracking-widest mb-1">Producto:</Text>
          <Text size="lg" fw={900} className="text-white tracking-tight">{productoNombre}</Text>
        </div>
      )}

      {eventos.length === 0 ? (
        <Center py={60} className="bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
          <Stack align="center" gap="xs">
            <CubeIcon className="w-12 h-12 text-zinc-700 opacity-20" />
            <Text c="dimmed" fs="italic" size="sm" fw={800}>No hay eventos registrados para este producto.</Text>
          </Stack>
        </Center>
      ) : (
        <ScrollArea h={450} type="hover" offsetScrollbars>
          <Timeline active={eventos.length + 1} bulletSize={32} lineWidth={2} className="px-4">
            {[...eventos].reverse().map((evento, idx) => {
              const style = getStatusStyles(evento.estado);
              return (
                <Timeline.Item
                  key={idx}
                  color={style.color}
                  bullet={
                    <ThemeIcon size={32} radius="xl" color={style.color} variant="filled" className="shadow-lg transform transition-transform hover:scale-110">
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
                        className={`font-black border px-3 py-2 ${style.variant === 'light' ? 'border-current/20' : 'border-transparent'}`}
                      >
                        {evento.estado}
                      </Badge>
                      <Text size="11px" c="zinc.5" fw={800} className="font-mono">
                        {dayjs(evento.created_at).format("DD/MM/YYYY HH:mm")}
                      </Text>
                    </Group>
                  }
                >
                  <Paper p="md" radius="lg" className="bg-zinc-900/40 border border-zinc-800/50 shadow-sm transition-colors hover:bg-zinc-900/60">
                    <Text size="sm" fw={500} c="zinc.2" className="leading-relaxed italic">
                      {evento.comentario || "Acción registrada automáticamente por el sistema."}
                    </Text>
                    <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          <Text size="10px" fw={900} c="zinc.5">{evento.nombre_empleado?.charAt(0) || "S"}</Text>
                       </div>
                       <Text size="xs" c="zinc.5" fw={800}>Registrad por:</Text>
                       <Text size="xs" fw={900} c="zinc.3" className="italic underline underline-offset-4 decoration-indigo-500/30">
                          {evento.nombre_empleado || "Sistema Automático"}
                       </Text>
                    </div>
                  </Paper>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </ScrollArea>
      )}
    </Stack>
  );
};

const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente")) return { color: "blue", variant: "light" as const };
  if (s.includes("aprobado")) return { color: "violet", variant: "light" as const };
  if (s.includes("despacho") || s.includes("entregando")) return { color: "orange", variant: "light" as const };
  if (s.includes("entrega") || s.includes("completad")) return { color: "emerald", variant: "light" as const };
  if (s.includes("rechazado")) return { color: "red", variant: "filled" as const };
  if (s.includes("cerrado")) return { color: "zinc", variant: "filled" as const };
  return { color: "gray", variant: "light" as const };
};

const getStatusIcon = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente")) return <ClipboardDocumentListIcon className="w-4 h-4 text-white" />;
  if (s.includes("aprobado")) return <CheckBadgeIcon className="w-4 h-4 text-white" />;
  if (s.includes("despacho")) return <TruckIcon className="w-4 h-4 text-white" />;
  if (s.includes("entrega") || s.includes("completad")) return <CheckBadgeIcon className="w-4 h-4 text-white" />;
  if (s.includes("rechazado")) return <XCircleIcon className="w-4 h-4 text-white" />;
  if (s.includes("cerrado")) return <CubeIcon className="w-4 h-4 text-white" />;
  return <div className="w-2 h-2 rounded-full bg-white" />;
};

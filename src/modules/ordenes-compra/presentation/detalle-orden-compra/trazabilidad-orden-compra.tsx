import {
  Timeline,
  Text,
  Loader,
  Center,
  Stack,
  ThemeIcon,
  Badge,
  Paper,
  Group,
  Divider,
} from "@mantine/core";
import {
  ClipboardList,
  Truck,
  CheckCircle2,
  Package,
  User,
  Clock,
  ArrowRight,
  Milestone,
  History,
} from "lucide-react";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { RES_Trazabilidad } from "../../../../service/responses/_generic/trazabilidad";

interface Props {
  eventos: RES_Trazabilidad[];
  loading?: boolean;
  productoNombre?: string;
}

export const TrazabilidadOrdenCompra = ({
  eventos,
  loading,
  productoNombre,
}: Props) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && eventos.length > 0 && timelineRef.current) {
      gsap.fromTo(
        ".gsap-timeline-node",
        { opacity: 0, scale: 0, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
        },
      );

      gsap.fromTo(
        ".gsap-timeline-content",
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.2,
        },
      );
    }
  }, [loading, eventos]);

  if (loading) {
    return (
      <Center py={100} className="flex-col gap-6">
        <Loader size="xl" color="indigo" type="bars" />
        <Text
          c="dimmed"
          fw={800}
          className="tracking-widest uppercase animate-pulse"
        >
          Recuperando Trazabilidad...
        </Text>
      </Center>
    );
  }

  return (
    <Stack
      gap="xl"
      className="p-4 font-sans overflow-hidden bg-zinc-950/20 rounded-3xl"
    >
      {productoNombre && (
        <Paper
          radius="20px"
          p="lg"
          className="bg-linear-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 relative overflow-hidden shadow-lg"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
            <Package size={80} />
          </div>
          <Group gap="md">
            <div className="p-3 bg-indigo-500/20 rounded-2xl">
              <History className="text-indigo-400" size={24} />
            </div>
            <Stack gap={0}>
              <Text
                size="xs"
                c="indigo.3"
                fw={900}
                className="uppercase tracking-[0.2em] mb-1"
              >
                Historial del Producto
              </Text>
              <Text
                size="xl"
                fw={900}
                className="text-white tracking-tight leading-none italic"
              >
                {productoNombre}
              </Text>
            </Stack>
          </Group>
        </Paper>
      )}

      {eventos.length === 0 ? (
        <Paper
          radius="24px"
          className="text-center py-24 bg-zinc-900/10 border border-dashed border-zinc-800"
        >
          <Milestone className="w-20 h-20 text-zinc-800 mx-auto mb-6 opacity-40 animate-bounce" />
          <Text
            c="zinc.5"
            fw={900}
            size="lg"
            className="uppercase tracking-widest"
          >
            Sin registros logísticos
          </Text>
          <Text
            size="sm"
            c="zinc.6"
            mt="xs"
            className="max-w-[280px] mx-auto italic"
          >
            Este ítem aún no ha iniciado su viaje de trazabilidad en el sistema.
          </Text>
        </Paper>
      ) : (
        <div ref={timelineRef} className="px-6 py-4">
          <Timeline
            active={eventos.length + 1}
            bulletSize={40}
            lineWidth={3}
            color="indigo"
          >
            {eventos.map((evento, idx) => {
              const style = getStatusStyles(evento.estado);
              return (
                <Timeline.Item
                  key={evento.id_log || idx}
                  color={style.color}
                  bullet={
                    <ThemeIcon
                      size={40}
                      radius="12px"
                      color={style.color}
                      variant="filled"
                      className="gsap-timeline-node shadow-xl transform transition-all duration-300 hover:rotate-12"
                    >
                      {getStatusIcon(evento.estado)}
                    </ThemeIcon>
                  }
                  title={
                    <Group
                      justify="space-between"
                      align="center"
                      mb={10}
                      className="gsap-timeline-content w-full"
                    >
                      <Badge
                        color={style.color}
                        variant="gradient"
                        gradient={{ from: style.color, to: "zinc.9" }}
                        radius="md"
                        size="lg"
                        className="font-black px-5 py-4 border border-white/5"
                      >
                        {evento.estado.toUpperCase()}
                      </Badge>
                      <Group
                        gap={8}
                        className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md"
                      >
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <Text
                          size="xs"
                          c="zinc.4"
                          fw={900}
                          className="font-mono tracking-tight text-white"
                        >
                          {dayjs(evento.created_at).format("DD/MM/YYYY HH:mm")}
                        </Text>
                      </Group>
                    </Group>
                  }
                >
                  <Paper
                    p="xl"
                    radius="24px"
                    className="gsap-timeline-content bg-zinc-900/40 border border-zinc-800/80 shadow-2xl backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-300"
                  >
                    <Group gap="lg" align="flex-start" wrap="nowrap">
                      <div className="mt-1.5 p-1 bg-white/5 rounded-full">
                        <ArrowRight className="w-4 h-4 text-zinc-500" />
                      </div>
                      <Text
                        size="md"
                        fw={600}
                        c="zinc.100"
                        className="leading-relaxed tracking-tight"
                      >
                        {evento.descripcion}
                      </Text>
                    </Group>

                    <Divider my="xl" color="zinc.8" variant="dotted" />

                    <Group justify="space-between" align="center">
                      <Group gap={12}>
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5 text-indigo-300" />
                        </div>
                        <Stack gap={0}>
                          <Text
                            size="10px"
                            c="zinc.5"
                            fw={900}
                            className="uppercase tracking-[0.2em] mb-0.5"
                          >
                            Operador Responsable
                          </Text>
                          <Text
                            size="md"
                            fw={900}
                            className="bg-clip-text text-transparent bg-linear-to-r from-white to-zinc-500"
                          >
                            {evento.empleado || "Sistema Cupper & Hannia"}
                          </Text>
                        </Stack>
                      </Group>
                    </Group>
                  </Paper>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </div>
      )}
    </Stack>
  );
};

const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente")) return { color: "orange" };
  if (s.includes("recepc")) return { color: "pink" };
  if (
    s.includes("completad") ||
    s.includes("recibido") ||
    s.includes("aprobado")
  )
    return { color: "emerald" };
  return { color: "indigo" };
};

const getStatusIcon = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("pendiente"))
    return <ClipboardList className="w-5 h-5 text-white" />;
  if (s.includes("recepc")) return <Truck className="w-5 h-5 text-white" />;
  if (
    s.includes("completad") ||
    s.includes("recibido") ||
    s.includes("aprobado")
  )
    return <CheckCircle2 className="w-5 h-5 text-white" />;
  return <Package className="w-5 h-5 text-white" />;
};

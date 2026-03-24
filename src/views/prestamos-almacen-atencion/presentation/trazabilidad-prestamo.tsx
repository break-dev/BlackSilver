import { Timeline, Avatar, Text, Loader, ScrollArea, Center, Stack } from "@mantine/core";
import dayjs from "dayjs";
import { type RES_TrazabilidadPrestamo } from "../service/prestamos-atencion.responses";

interface Props {
  eventos: RES_TrazabilidadPrestamo[];
  loading?: boolean;
}

export const TrazabilidadPrestamo = ({ eventos, loading }: Props) => {
  if (loading) {
    return (
      <Center py="xl">
        <Loader type="dots" color="indigo" size="lg" />
      </Center>
    );
  }

  if (eventos.length === 0) {
    return (
      <Center py="xl" className="bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
        <Text size="sm" c="dimmed" fs="italic">No se ha registrado seguimiento para este producto aún.</Text>
      </Center>
    );
  }

  return (
    <ScrollArea h={450} type="hover" scrollbars="y" className="pr-4">
      <Timeline active={0} bulletSize={32} lineWidth={2} color="indigo" radius="xl">
        {eventos.map((t, i) => (
          <Timeline.Item 
            key={i} 
            bullet={
              <Avatar 
                size={32} 
                radius="xl" 
                src={t.path_foto || null} 
                className="border-2 border-zinc-800 bg-zinc-950" 
              />
            }
            title={
                <Group justify="space-between" align="center" className="w-full">
                    <Text size="sm" fw={900} className="text-white tracking-tight uppercase">{t.estado}</Text>
                    <Text size="10px" fw={900} color="indigo.4" className="tabular-nums italic">
                        {dayjs(t.created_at).format("DD/MM/YYYY HH:mm")}
                    </Text>
                </Group>
            }
            className="pb-6"
          >
            <Stack gap={4}>
                <Text size="xs" fw={400} className="text-zinc-400 leading-relaxed" fs="italic" style={{ whiteSpace: "pre-wrap" }}>
                {t.comentario || "Cambio automático de estado por el sistema."}
              </Text>
              <Text size="10px" fw={900} className="text-zinc-500 uppercase tracking-widest">
                Responsable: <span className="text-zinc-300">{t.nombre_empleado}</span>
              </Text>
            </Stack>
          </Timeline.Item>
        ))}
      </Timeline>
    </ScrollArea>
  );
};

// Sub-component wrapper for Group
import { Group } from "@mantine/core";

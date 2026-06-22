import { Paper, Stack, Group, Text, Badge } from "@mantine/core";
import { ClockIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { BadgeField } from "../header/badge-field";
import type { RES_RequerimientoAlmacen } from "../../../../../service/responses/requerimientos-almacen/requerimiento-almacen";
import type { RES_Labor } from "../../../../../service/responses/labor";

interface InfoStatsProps {
  requerimiento: RES_RequerimientoAlmacen;
}

export const InfoStats = ({ requerimiento }: InfoStatsProps) => {
  return (
    <Paper
      p="md"
      radius="lg"
      className="bg-transparent border border-zinc-800/50 mx-2"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <BadgeField
          label="Prioridad"
          value={requerimiento.premura}
          color="orange"
        />
        <BadgeField label="Estado" value={requerimiento.estado} color="green" />
        <Stack gap={4} className="lg:col-span-1">
          <Text
            size="xs"
            c="zinc.5"
            fw={800}
            className="uppercase tracking-widest"
          >
            Labores Destino
          </Text>
          <Group gap={4}>
            {requerimiento.labores && requerimiento.labores.length > 0 ? (
              requerimiento.labores.map((l: RES_Labor) => (
                <Badge
                  key={l.id_labor}
                  variant="outline"
                  color="indigo"
                  size="sm"
                >
                  {l.correlativo} {l.nombre ? `(${l.nombre})` : ""}
                </Badge>
              ))
            ) : (
              <Text size="xs" c="zinc.6" fs="italic">
                Sin labores asignadas
              </Text>
            )}
          </Group>
        </Stack>
        <BadgeField
          label="Fecha de Registro"
          value={dayjs(requerimiento.created_at).format("DD/MM/YYYY HH:mm")}
          icon={ClockIcon}
          isMono
        />
      </div>
    </Paper>
  );
};

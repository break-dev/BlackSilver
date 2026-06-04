import { Badge, Group, Stack, Text, Tooltip } from "@mantine/core";
import {
  CubeIcon,
  ShieldCheckIcon,
  TruckIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import type { GroupedActivoProducto } from "./product-group-card";

interface Props {
  product: GroupedActivoProducto;
}

export const ProductGroupHeader = ({ product }: Props) => {
  return (
    <div className="p-4 bg-zinc-900/20 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <CubeIcon className="w-4 h-4 text-indigo-400" />
        </div>
        <Stack gap={2}>
          <Text
            fw={800}
            className="uppercase tracking-widest text-zinc-500 text-[10px]!"
          >
            {product.categoria || "SIN CATEGORÍA"}
          </Text>
          <div className="flex flex-row gap-3">
            <Text size="md" fw={900} className="text-white tracking-tight">
              {product.producto}
            </Text>
            <Group gap={6} className="flex flex-row self-end gap-3 mb-0.5">
              {product.es_auditable && (
                <Tooltip label="Activo con auditoría estricta">
                  <Badge
                    color="yellow"
                    variant="light"
                    size="xs"
                    leftSection={<ShieldCheckIcon className="w-3.5 h-3.5" />}
                  >
                    Auditable
                  </Badge>
                </Tooltip>
              )}
              {product.para_transporte && (
                <Tooltip label="Activo habilitado para transporte logístico">
                  <Badge
                    color="teal"
                    variant="light"
                    size="xs"
                    leftSection={<TruckIcon className="w-3.5 h-3.5" />}
                  >
                    Vehículo
                  </Badge>
                </Tooltip>
              )}
              {product.control_por_odometro && (
                <Tooltip label="Control de kilometraje (Odómetro) habilitado">
                  <Badge 
                    color="blue" 
                    variant="light" 
                    size="xs"
                    leftSection={<ArrowTrendingUpIcon className="w-3.5 h-3.5" />}
                  >
                    Odómetro
                  </Badge>
                </Tooltip>
              )}
              {product.control_por_horometro && (
                <Tooltip label="Control de horas de motor (Horómetro) habilitado">
                  <Badge
                    color="violet"
                    variant="light"
                    size="xs"
                    leftSection={<ClockIcon className="w-3.5 h-3.5" />}
                  >
                    Horómetro
                  </Badge>
                </Tooltip>
              )}
              {product.control_por_vueltas && (
                <Tooltip label="Control de vueltas habilitado">
                  <Badge
                    color="grape"
                    variant="light"
                    size="xs"
                    leftSection={<ArrowPathIcon className="w-3.5 h-3.5" />}
                  >
                    Vueltas
                  </Badge>
                </Tooltip>
              )}
            </Group>
          </div>
        </Stack>
      </div>

      <div className="flex items-center gap-6">
        <Badge
          variant="gradient"
          gradient={{ from: "indigo.8", to: "cyan.8" }}
          radius="md"
          size="md"
          className="h-9 px-6 border-0 shadow-lg shadow-indigo-900/20"
        >
          <Text size="xs" fw={800} className="text-center">
            {product.activos.length}{" "}
            {product.activos.length === 1 ? "Activo" : "Activos"}
          </Text>
        </Badge>
      </div>
    </div>
  );
};

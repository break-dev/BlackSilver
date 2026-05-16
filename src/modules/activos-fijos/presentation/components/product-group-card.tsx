import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import type { RES_ActivoFijoResumen } from "../../service/activos.responses";
import { ProductGroupHeader } from "./product-group-header";
import { Badge, Text, Group, Stack, Tooltip } from "@mantine/core";
import { MapPinIcon, MapIcon, StarIcon } from "@heroicons/react/24/outline";

export interface GroupedActivoProducto {
  id_producto: number;
  producto: string;
  categoria: string | null;
  es_auditable: boolean;
  para_transporte: boolean;
  control_por_odometro: boolean;
  control_por_horometro: boolean;
  activos: RES_ActivoFijoResumen[];
}

interface ProductGroupCardProps {
  product: GroupedActivoProducto;
  loading: boolean;
  onMoverActivo: (record: RES_ActivoFijoResumen) => void;
  onVerHistorial: (record: RES_ActivoFijoResumen) => void;
}

const parseEspecificaciones = (
  raw: { clave: string; valor: string }[] | null,
): { clave: string; valor: string }[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? (parsed as { clave: string; valor: string }[])
        : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const ProductGroupCard = ({
  product,
  loading,
}: ProductGroupCardProps) => {
  const columns: DataTableColumn<RES_ActivoFijoResumen>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "correlativo",
      title: "Código",
      width: 140,
      render: (record) => (
        <Stack gap={1}>
          <Badge variant="light" color="indigo" size="sm" radius="sm" fw={700}>
            {record.correlativo}
          </Badge>
          {record.codigo && (
            <Text size="10px" c="dimmed" fw={600} className="ml-1">
              Cód: {record.codigo}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "marca_modelo",
      title: "Marca & Modelo",
      width: 220,
      render: (record) => (
        <Stack gap={1}>
          <Text size="xs" fw={700} c="white">
            {record.marca || "Genérica"} {record.modelo || "-"}
          </Text>
          <Text size="xs" c="dimmed">
            Año: {record.yearcito_modelo || "N/A"}{" "}
            {record.numero_serie ? `| S/N: ${record.numero_serie}` : ""}
          </Text>
        </Stack>
      ),
    },
    {
      accessor: "ubicacion",
      title: "Ubicación",
      width: 220,
      render: (record) => {
        const isMina = !!record.id_mina;
        const isAlmacen = !!record.id_almacen;

        if (!isMina && !isAlmacen) {
          return (
            <Text size="xs" c="dimmed" fs="italic">
              Sin ubicación
            </Text>
          );
        }

        return (
          <Group gap="xs" wrap="nowrap">
            <div
              className={`p-1.5 rounded-md ${
                isMina
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
              }`}
            >
              {isMina ? (
                <MapIcon className="w-3.5 h-3.5" />
              ) : (
                <MapPinIcon className="w-3.5 h-3.5" />
              )}
            </div>
            <Stack gap={0}>
              <Group gap={4} wrap="nowrap">
                <Text
                  size="xs"
                  fw={700}
                  c="white"
                  className="truncate max-w-[140px]"
                >
                  {record.mina || record.almacen}
                </Text>
                {record.en_almacen_principal ? (
                  <Tooltip label="Almacén Principal">
                    <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                  </Tooltip>
                ) : null}
              </Group>
              <Text
                size="10px"
                c="dimmed"
                className="uppercase font-bold tracking-wider"
              >
                {isMina ? "Mina" : "Almacén"}
              </Text>
            </Stack>
          </Group>
        );
      },
    },
    {
      accessor: "especificaciones",
      title: "Especificaciones",
      render: (record) => {
        const specs = parseEspecificaciones(record.especificaciones);
        if (specs.length === 0) {
          return (
            <Text size="sm" c="dimmed">
              -
            </Text>
          );
        }
        return (
          <Group gap={4} wrap="wrap">
            {specs.map((sp, sIdx) => (
              <Badge
                key={sIdx}
                variant="light"
                color="blue"
                size="sm"
                radius="sm"
                classNames={{
                  root: "bg-zinc-800/40 text-zinc-300 border border-zinc-700/30",
                }}
              >
                {sp.clave}: {sp.valor}
              </Badge>
            ))}
          </Group>
        );
      },
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 130,
      render: (record) => {
        const colors: Record<string, string> = {
          "En Uso": "green",
          "En Mantenimiento": "orange",
          "En Almacén": "teal",
          "Dado de Baja": "red",
        };
        return (
          <Badge
            variant="light"
            color={colors[record.estado] || "gray"}
            radius="sm"
            size="xs"
            fw={700}
          >
            {record.estado}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md">
      <ProductGroupHeader product={product} />

      <div className="relative shadow-inner">
        <DataTableEstandar
          idAccessor="id_activo"
          columns={columns}
          records={product.activos}
          loading={loading}
          initialPageSize={5}
          minHeight={0}
        />
      </div>
    </div>
  );
};

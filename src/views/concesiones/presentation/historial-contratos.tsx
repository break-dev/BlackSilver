import {
  Stack,
  Text,
  Badge,
  ActionIcon,
  Divider,
  ScrollArea,
  Group,
} from "@mantine/core";
import {
  XCircleIcon,
  CalendarIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { useGestionContratos } from "../hooks/useGestionContratos";
import { NuevoContrato } from "./nuevo-contrato";

interface HistorialContratosProps {
  idConcesion: number;
}

export const HistorialContratos = ({
  idConcesion,
}: HistorialContratosProps) => {
  const {
    contratos,
    loading,
    handleTerminarContrato,
    loadingAccion,
    recargar,
  } = useGestionContratos(idConcesion);

  return (
    <Stack gap="xl">
      {/* FORMULARIO DE CONTRATO */}
      <NuevoContrato idConcesion={idConcesion} onSuccess={recargar} />

      <Divider
        label="Historial de Contratos"
        labelPosition="center"
        classNames={{ label: "text-zinc-500 text-xs" }}
      />

      {/* LISTADO DE CONTRATOS */}
      <ScrollArea h={300} offsetScrollbars>
        <Stack gap="sm">
          {contratos.length === 0 && !loading && (
            <Text size="sm" ta="center" className="text-zinc-600 py-8">
              No hay contratos registrados históricamente
            </Text>
          )}

          {contratos.map((c) => (
            <Group
              key={c.id_contrato}
              justify="space-between"
              className={`p-3 rounded-xl border ${c.estado === "Activo" ? "bg-indigo-900/5 border-indigo-900/20" : "bg-zinc-900/20 border-zinc-800/50 opacity-60"}`}
            >
              <Group gap="sm">
                <BuildingOffice2Icon
                  className={`w-5 h-5 ${c.estado === "Activo" ? "text-indigo-400" : "text-zinc-500"}`}
                />
                <div>
                  <Text size="sm" fw={500} className="text-zinc-200">
                    {c.nombre_comercial}
                  </Text>
                  <Text size="xs" className="text-zinc-500 font-mono">
                    {c.ruc}
                  </Text>
                </div>
              </Group>

              <Group gap="xl">
                <Stack gap={2} align="center">
                  <Text size="xs" className="text-zinc-600">
                    Periodo
                  </Text>
                  <Text
                    size="xs"
                    className="text-zinc-400 flex items-center gap-1"
                  >
                    <CalendarIcon className="w-3 h-3" />
                    {c.fecha_inicio}{" "}
                    {c.fecha_fin ? `al ${c.fecha_fin}` : "(Actual)"}
                  </Text>
                </Stack>

                {c.estado === "Activo" ? (
                  <ActionIcon
                    variant="light"
                    color="red"
                    radius="md"
                    onClick={() => handleTerminarContrato(c.id_contrato)}
                    loading={loadingAccion}
                    title="Terminar Contrato"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </ActionIcon>
                ) : (
                  <Badge variant="dot" color="gray" size="sm">
                    Terminado
                  </Badge>
                )}
              </Group>
            </Group>
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  );
};

import { ActionIcon, Tooltip, Text, Group, Stack, Skeleton } from "@mantine/core";
import { CubeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useMinasAbastecidas } from "../hooks/useMinasAbastecidas";
import { AbastecerMina } from "./abastecer-mina";
import type { IMessage } from "../../../shared/interfaces";
import type {
  RES_Almacen,
  RES_MinaAbastecida,
} from "../service/almacenes.responses";

interface MinasAbastecidasProps {
  almacen: RES_Almacen;
  onMessage?: (msg: IMessage) => void;
  onMinasChange?: (delta: number) => void;
}

export const MinasAbastecidas = ({
  almacen,
  onMinasChange,
}: MinasAbastecidasProps) => {
  const {
    minas,
    loading,
    handleDesvincular,
    handleVinculada,
  } = useMinasAbastecidas(almacen.id_almacen);

  return (
    <div className="space-y-4">
      {/* Formulario siempre visible — el header va dentro */}
      <AbastecerMina
        idAlmacen={almacen.id_almacen}
        nombreAlmacen={almacen.nombre}
        onSuccess={(nueva) => handleVinculada(nueva, onMinasChange)}
      />

      {/* Separador */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-zinc-800" />
        <Text size="xs" fw={700} className="text-zinc-500 uppercase tracking-widest px-2">
          Minas Asignadas
        </Text>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Skeleton mientras carga */}
      {loading && (
        <Stack gap="sm">
          {[1, 2, 3].map((i) => (
            <Group
              key={i}
              wrap="nowrap"
              className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg"
            >
              <Skeleton height={40} width={40} radius="xl" />
              <Stack gap={6} className="flex-1">
                <Skeleton height={13} width="50%" radius="sm" />
                <Skeleton height={10} width="35%" radius="sm" />
              </Stack>
            </Group>
          ))}
        </Stack>
      )}

      {/* Estado vacío */}
      {!loading && minas.length === 0 && (
        <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
          <CubeIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">
            Este almacén no atiende ninguna mina.
          </p>
        </div>
      )}

      {/* Lista de minas */}
      {!loading && (
        <div className="grid gap-3">
          {minas.map((item: RES_MinaAbastecida, idx: number) => (
            <div
              key={item.id_almacen_mina || idx}
              className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-900/20 text-indigo-500 flex items-center justify-center border border-indigo-900/30">
                  <CubeIcon className="w-5 h-5" />
                </div>
                <div>
                  <Text fw={600} className="text-zinc-200">
                    {item.nombre}
                  </Text>
                  <Text size="xs" className="text-zinc-500 font-medium mt-0.5">
                    Concesión:{" "}
                    <span className="text-zinc-400 font-normal">
                      {item.concesion}
                    </span>
                  </Text>
                </div>
              </div>
              <Tooltip label="Desvincular Mina">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={() =>
                    handleDesvincular(item.id_almacen_mina, onMinasChange)
                  }
                >
                  <TrashIcon className="w-4 h-4" />
                </ActionIcon>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

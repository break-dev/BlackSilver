import React from "react";
import { ActionIcon, Button, Group, Select, Stack, Text } from "@mantine/core";
import { RectangleGroupIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface CategoriaMinima {
  id_categoria: number;
  nombre: string;
}

interface CategoriasDestinosProps {
  categoriaNombre: string;
  idsDestinosTemp: number[];
  setIdsDestinosTemp: React.Dispatch<React.SetStateAction<number[]>>;
  categoriasParaConsumo: { value: string; label: string }[];
  todasCategorias: CategoriaMinima[];
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
  isCreationMode?: boolean;
}

export const CategoriasDestinos = ({
  categoriaNombre,
  idsDestinosTemp,
  setIdsDestinosTemp,
  categoriasParaConsumo,
  todasCategorias,
  onSave,
  loading,
  isCreationMode = false,
}: CategoriasDestinosProps) => {
  return (
    <Stack gap="md">
      <div className="p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl">
        <Group gap="sm" align="center" mb="md">
          <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <RectangleGroupIcon className="size-4 text-indigo-400" />
          </div>
          <Stack gap={0}>
            <Text
              size="xs"
              fw={700}
              className="text-zinc-300 uppercase tracking-wider"
            >
              {isCreationMode ? "Vincular Destinos" : categoriaNombre}
            </Text>
            <Text
              size="xs"
              className="text-zinc-500 lowercase first-letter:uppercase"
            >
              Seleccione a quién abastece este insumo
            </Text>
          </Stack>
        </Group>

        <Select
          placeholder="Buscar categoría consumidora..."
          data={categoriasParaConsumo.filter(
            (c) => !idsDestinosTemp.includes(Number(c.value)),
          )}
          searchable
          nothingFoundMessage="No hay más categorías disponibles"
          radius="lg"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-indigo-500 transition-all",
            label: "text-zinc-400 text-[10px] font-bold uppercase ml-1 mb-1",
          }}
          onChange={(val) => {
            if (val) {
              setIdsDestinosTemp((prev: number[]) => [...prev, Number(val)]);
            }
          }}
        />
      </div>

      <Stack gap="xs">
        <Text
          size="xs"
          fw={700}
          className="text-zinc-500 uppercase tracking-widest px-1"
        >
          Destinos de consumo ({idsDestinosTemp.length})
        </Text>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {idsDestinosTemp.length === 0 ? (
            <div className="py-10 text-center bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
              <RectangleGroupIcon className="size-8 text-zinc-800 mx-auto mb-2 opacity-50" />
              <Text size="xs" className="text-zinc-600 italic">
                No hay destinos vinculados aún
              </Text>
            </div>
          ) : (
            idsDestinosTemp.map((id) => {
              const cat = todasCategorias.find((c) => c.id_categoria === id);
              return (
                <Group
                  key={id}
                  justify="space-between"
                  className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <Text size="sm" fw={600} className="text-zinc-300">
                      {cat?.nombre || "Categoría"}
                    </Text>
                  </div>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    className="hover:bg-red-900/20"
                    onClick={() =>
                      setIdsDestinosTemp((prev: number[]) =>
                        prev.filter((cid) => cid !== id),
                      )
                    }
                  >
                    <XMarkIcon className="size-4" />
                  </ActionIcon>
                </Group>
              );
            })
          )}
        </div>
      </Stack>

      <Button
        fullWidth
        onClick={onSave}
        loading={loading}
        radius="lg"
        className={
          !isCreationMode
            ? "bg-zinc-100 hover:bg-white text-zinc-950 shadow-lg shadow-white/5 font-bold"
            : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        }
      >
        {!isCreationMode ? "Guardar Cambios" : "Aceptar"}
      </Button>
    </Stack>
  );
};

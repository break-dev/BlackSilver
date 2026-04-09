import { Button, TextInput } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";

interface Props {
  onOpenRegistro: () => void;
}

export const Filtros = ({ onOpenRegistro }: Props) => {
  return (
    <div className="flex justify-between items-end pb-4 border-b border-zinc-800/50 flex-none relative z-10">
      <div className="flex items-center gap-4">
        <TextInput
          placeholder="Buscar proveedor..."
          leftSection={<IconSearch size={16} />}
          classNames={{
            input: "bg-zinc-900 border-zinc-700 text-white min-w-[250px]",
          }}
        />
        <Button
          leftSection={<IconPlus size={18} stroke={2.5} />}
          radius="xl"
          size="md"
          variant="gradient"
          gradient={{ from: "zinc-800", to: "zinc-900", deg: 90 }}
          className="border border-zinc-700 hover:border-zinc-500 shadow-xl"
          onClick={onOpenRegistro}
        >
          Nuevo Proveedor
        </Button>
      </div>
    </div>
  );
};

import { Select, Button, Loader } from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/outline";
import type { RES_MinaAbastecida } from "../service/almacenes.responses";
import { useAbastecerMina } from "../hooks/useAbastecerMina";

interface AbastecerMinaProps {
  idAlmacen: number;
  onSuccess: (mina: RES_MinaAbastecida) => void;
  onCancel: () => void;
}

export const AbastecerMina = ({
  idAlmacen,
  onSuccess,
  onCancel,
}: AbastecerMinaProps) => {
  const {
    selectOptions,
    loading,
    minasDisponibles,
    idMina,
    setIdMina,
    formError,
    isAssigning,
    handleAsignar,
  } = useAbastecerMina(idAlmacen);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAsignar(onSuccess);
  };

  if (loading && minasDisponibles.length === 0) {
    return (
      <div className="flex justify-center p-10">
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Mina"
          placeholder="Buscar mina..."
          data={selectOptions}
          searchable
          nothingFoundMessage="No hay minas disponibles"
          leftSection={<CubeIcon className="w-4 h-4 text-zinc-400" />}
          value={idMina}
          onChange={(val) => setIdMina(val || "")}
          error={formError}
          radius="lg"
          size="sm"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            dropdown: "bg-zinc-900 border-zinc-800",
            option:
              "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
            label: "text-zinc-300 mb-1 font-medium",
            groupLabel:
              "text-zinc-500 font-bold text-xs uppercase mt-2 mb-1 pl-2",
          }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            variant="default"
            onClick={onCancel}
            disabled={isAssigning}
          >
            Cancelar
          </Button>
          <Button size="sm" type="submit" loading={isAssigning}>
            Vincular
          </Button>
        </div>
      </form>
    </div>
  );
};

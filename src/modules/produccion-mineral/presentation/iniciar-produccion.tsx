import { useState } from "react";
import { Button, Group, Select, Stack } from "@mantine/core";
import type { RES_LoteMineral } from "../../../service/responses/lote-mineral";

interface IniciarProduccionProps {
  lotesPendientes: RES_LoteMineral[];
  loadingPendientes: boolean;
  submitting: boolean;
  onIniciar: (idLote: number) => Promise<void>;
  onCancel: () => void;
}

export const IniciarProduccion = ({
  lotesPendientes,
  loadingPendientes,
  submitting,
  onIniciar,
  onCancel,
}: IniciarProduccionProps) => {
  const [selectedLoteId, setSelectedLoteId] = useState<string | null>(null);

  const selectClasses = {
    input:
      "bg-zinc-900 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl ",
    option:
      "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
    label: "text-zinc-300 mb-1.5 font-semibold text-xs ml-0.5",
  };

  const handleIniciar = async () => {
    if (!selectedLoteId) return;
    await onIniciar(Number(selectedLoteId));
  };

  return (
    <Stack gap="md">
      <Select
        label="Lote Mineral Pendiente"
        placeholder={
          loadingPendientes
            ? "Cargando lotes..."
            : lotesPendientes.length > 0
              ? "Seleccione lote mineral..."
              : "Sin lotes pendientes"
        }
        data={lotesPendientes.map((l) => ({
          value: String(l.id_lote_mineral),
          label: `${l.codigo}  - Mina: ${l.mina}`,
        }))}
        value={selectedLoteId}
        onChange={setSelectedLoteId}
        disabled={loadingPendientes}
        required
        searchable
        classNames={selectClasses}
        radius="md"
      />

      <Group justify="flex-end" mt="lg">
        <Button
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={submitting}
          radius="lg"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleIniciar}
          loading={submitting}
          disabled={!selectedLoteId}
          color="indigo"
          radius="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-lg shadow-indigo-900/20"
        >
          Iniciar Producción
        </Button>
      </Group>
    </Stack>
  );
};

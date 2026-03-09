import {
  Button,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Paper,
  Divider,
} from "@mantine/core";
import { InboxIcon, ScaleIcon, PencilIcon } from "@heroicons/react/24/outline";

import { useAjusteStock } from "../hooks/useAjusteStock";
import type { RES_Lote } from "../service/lotes.responses";

interface AjusteStockModalProps {
  lote: RES_Lote;
  onSuccess: (lote: RES_Lote) => void;
  onCancel: () => void;
}

export const AjusteStockModal = ({
  lote,
  onSuccess,
  onCancel,
}: AjusteStockModalProps) => {
  const {
    nuevoStock,
    nuevoStockBase,
    motivo,
    setMotivo,
    submitting,
    error,
    handleStockChange,
    handleBaseStockChange,
    handleSubmit,
  } = useAjusteStock({ lote, onSuccess });

  const inputStyles = {
    input:
      "bg-zinc-900 border-zinc-800 text-white h-12 focus:border-indigo-500 shadow-sm",
    label:
      "text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-1.5 ml-1",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Paper
        p="md"
        radius="lg"
        bg="zinc.9/10"
        className="border border-zinc-800/50"
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={2}>
            <Text
              size="xs"
              fw={700}
              c="zinc.5"
              className="uppercase tracking-widest"
            >
              Lote Seleccionado
            </Text>
            <Text size="lg" fw={800} className="text-white leading-tight">
              {lote.producto}
            </Text>
            <Text size="xs" c="indigo.4" fw={700} className="font-mono">
              {lote.correlativo}
            </Text>
          </Stack>
        </Group>
      </Paper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <NumberInput
            label={`Nuevo Stock (${lote.unidad_medida})`}
            placeholder="0.00"
            decimalScale={2}
            min={0}
            value={nuevoStock}
            onChange={handleStockChange}
            classNames={inputStyles}
            leftSection={<InboxIcon className="w-4 h-4 text-zinc-500" />}
          />
          <Text size="10px" c="dimmed" className="italic px-2">
            Cantidad física en el empaque.
          </Text>
        </div>

        <div className="space-y-2">
          <NumberInput
            label={`Nuevo Stock Base (${lote.unidad_medida_base})`}
            placeholder="0.00"
            decimalScale={4}
            min={0}
            value={nuevoStockBase}
            onChange={handleBaseStockChange}
            classNames={inputStyles}
            leftSection={<ScaleIcon className="w-4 h-4 text-zinc-500" />}
          />
          <Text size="10px" c="dimmed" className="italic px-2">
            Equivalencia total en unidades mínimas de medida.
          </Text>
        </div>
      </div>

      <Divider className="border-zinc-800/50" />

      <TextInput
        label="Motivo del Ajuste"
        placeholder="Ej: Corrección de pesaje, merma, etc."
        value={motivo}
        onChange={(e) => setMotivo(e.currentTarget.value)}
        classNames={inputStyles}
        leftSection={<PencilIcon className="w-4 h-4 text-zinc-500" />}
        autoFocus
      />

      {error && (
        <Text
          color="red"
          size="sm"
          ta="center"
          fw={700}
          className="italic py-2"
        >
          {error}
        </Text>
      )}

      <Group justify="flex-end" className="pt-6 border-t border-zinc-800/50">
        <Button
          variant="subtle"
          color="zinc"
          onClick={onCancel}
          radius="md"
          className="text-zinc-500 font-bold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={submitting}
          radius="lg"
          className="bg-zinc-100 hover:bg-white text-zinc-900 font-black px-10 shadow-xl"
        >
          Aplicar Corrección
        </Button>
      </Group>
    </form>
  );
};

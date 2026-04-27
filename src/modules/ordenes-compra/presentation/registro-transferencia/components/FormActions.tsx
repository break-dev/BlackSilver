import { Button, Group } from "@mantine/core";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface FormActionsProps {
  onCancel: () => void;
  handleConfirmar: () => void;
  isProcessing: boolean;
  canSave: boolean;
}

export const FormActions = ({
  onCancel,
  handleConfirmar,
  isProcessing,
  canSave,
}: FormActionsProps) => {
  return (
    <Group
      justify="space-between"
      mt="xl"
      className="border-t border-zinc-800/50 pt-5"
    >
      <Button
        variant="subtle"
        color="gray"
        onClick={onCancel}
        disabled={isProcessing}
        leftSection={<XMarkIcon className="w-5 h-5" />}
        radius="lg"
        className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
      >
        Cancelar
      </Button>

      <Button
        color="indigo"
        onClick={handleConfirmar}
        loading={isProcessing}
        disabled={!canSave}
        leftSection={<CheckIcon className="w-5 h-5 text-white" />}
        radius="lg"
        className={`font-black tracking-wide shadow-md transition-all ${
          canSave
            ? "hover:shadow-indigo-500/20 hover:-translate-y-0.5 bg-indigo-500 text-white"
            : "bg-zinc-800 text-zinc-500 border border-zinc-700/50"
        }`}
      >
        Confirmar Transferencia
      </Button>
    </Group>
  );
};

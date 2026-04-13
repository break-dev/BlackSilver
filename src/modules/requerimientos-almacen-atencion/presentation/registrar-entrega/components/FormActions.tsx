import { Button, Group } from "@mantine/core";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

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
      justify="flex-end"
      gap="md"
      className="pt-6 border-t border-zinc-800 mt-2"
    >
      <Button
        variant="subtle"
        radius="lg"
        size="sm"
        onClick={onCancel}
        className="text-zinc-400 hover:text-white px-8 font-bold"
      >
        Cancelar
      </Button>
      <Button
        size="sm"
        radius="lg"
        leftSection={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
        disabled={!canSave || isProcessing}
        loading={isProcessing}
        onClick={handleConfirmar}
        className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
      >
        Guardar Entrega
      </Button>
    </Group>
  );
};

import { Button, Group } from "@mantine/core";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  canSubmit: boolean;
}

export const FormActions = ({
  onCancel,
  onSubmit,
  isProcessing,
  canSubmit,
}: FormActionsProps) => {
  return (
    <Group justify="flex-end" gap="lg" className="pt-10 mt-6 border-t border-zinc-800/60">
      <Button
        variant="subtle"
        radius="xl"
        size="md"
        className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 font-bold px-8 transition-colors"
        onClick={onCancel}
      >
        Cancelar
      </Button>
      <Button
        size="md"
        radius="xl"
        leftSection={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
        disabled={!canSubmit || isProcessing}
        loading={isProcessing}
        onClick={onSubmit}
        className="bg-zinc-100 hover:bg-white text-zinc-950 font-black px-10 shadow-[0_8px_24px_rgba(255,255,255,0.1)] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
      >
        Guardar Entrega
      </Button>
    </Group>
  );
};

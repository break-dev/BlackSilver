import { Button, Group, Text } from "@mantine/core";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

interface FormActionsProps {
  onCancel: () => void;
  handleConfirmar: () => void;
  isProcessing: boolean;
  canSave: boolean;
  error?: string;
}

export const FormActions = ({
  onCancel,
  handleConfirmar,
  isProcessing,
  canSave,
  error,
}: FormActionsProps) => {
  return (
    <Group
      justify="flex-end"
      gap="lg"
      className="pt-10 mt-6 border-t border-zinc-800/60"
    >
      {error && (
        <Text
          c="red.4"
          size="sm"
          fw={800}
          className="italic text-center tracking-tight"
        >
          {error}
        </Text>
      )}
      <Button
        variant="subtle"
        radius="xl"
        size="sm"
        className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 font-bold px-8 transition-colors"
        onClick={onCancel}
      >
        Cancelar
      </Button>
      <Button
        size="sm"
        radius="xl"
        leftSection={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
        disabled={!canSave || isProcessing}
        loading={isProcessing}
        onClick={handleConfirmar}
        className="bg-zinc-100 hover:bg-white text-zinc-950 font-black px-10 shadow-[0_8px_24px_rgba(255,255,255,0.1)] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
      >
        Guardar Entrega
      </Button>
    </Group>
  );
};

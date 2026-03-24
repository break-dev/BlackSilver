import { Button, Group } from "@mantine/core";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface FormActionsProps {
  onCancel: () => void;
  handleConfirmar: () => void;
  isProcessing: boolean;
  canSave: boolean;
}

export const FormActions = ({ onCancel, handleConfirmar, isProcessing, canSave }: FormActionsProps) => {
  return (
    <Group justify="end" gap="md" mt="xl" className="border-t border-zinc-800/50 pt-8">
      <Button variant="subtle" color="zinc" radius="xl" size="md" className="font-black italic px-8 hover:bg-zinc-900" onClick={onCancel}>
          Descartar
      </Button>
      <Button
        onClick={handleConfirmar}
        loading={isProcessing}
        disabled={!canSave}
        radius="xl"
        size="md"
        leftSection={<CheckCircleIcon className="w-6 h-6" />}
        className="bg-zinc-100 text-zinc-900 font-black hover:bg-white px-12 shadow-[0_15px_30px_-5px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
      >
        Confirmar Despacho Físico
      </Button>
    </Group>
  );
};

import { ModalEstandar } from "../../../../../presentation/utils/modal-estandar";
import { TextInput, Button, Alert } from "@mantine/core";
import { IconBuildingBank, IconExclamationCircle } from "@tabler/icons-react";
import { useRegistroBanco } from "../../../hooks/useRegistroBanco";
import type { BancoResponse } from "../../../service/proveedores.responses";

interface Props {
  opened: boolean;
  onClose: () => void;
  onSuccess: (banco: BancoResponse) => void;
}

export const RegistroBanco = ({ opened, onClose, onSuccess }: Props) => {
  const { payload, handleChange, submit, loading, error } = useRegistroBanco(
    (banco: BancoResponse) => {
      onSuccess(banco);
      onClose();
    },
  );

  return (
    <ModalEstandar
      opened={opened}
      close={onClose}
      title="Registrar Nuevo Banco"
      size="sm"
      zIndex={1002}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && (
          <Alert
            icon={<IconExclamationCircle size={16} />}
            color="red"
            variant="filled"
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="Razón Social / Nombre Oficial"
          placeholder="Ej. Banco de Crédito del Perú"
          value={payload.nombre}
          onChange={(e) => handleChange("nombre", e.target.value)}
          classNames={{
            input: "bg-zinc-900 border-zinc-700 text-white",
            label: "text-zinc-400 font-medium",
          }}
        />
        <TextInput
          label="Siglas / Abreviatura"
          placeholder="Ej. BCP"
          value={payload.abreviatura}
          onChange={(e) => handleChange("abreviatura", e.target.value)}
          classNames={{
            input: "bg-zinc-900 border-zinc-700 text-white",
            label: "text-zinc-400 font-medium",
          }}
        />
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-800">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            classNames={{ root: "text-zinc-400 hover:bg-zinc-800" }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftSection={<IconBuildingBank size={18} />}
            color="blue.7"
          >
            Registrar Banco
          </Button>
        </div>
      </form>
    </ModalEstandar>
  );
};

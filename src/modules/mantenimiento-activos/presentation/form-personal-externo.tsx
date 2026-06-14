import { useState } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useNotify } from "../../../hooks/useNotify";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";

interface FormPersonalExternoProps {
  opened: boolean;
  onClose: () => void;
  idProveedor: number;
  onSuccess: (nuevo: RES_PersonalExterno) => void;
}

export const FormPersonalExterno = ({
  opened,
  onClose,
  idProveedor,
  onSuccess,
}: FormPersonalExternoProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      notifyError("El nombre es requerido");
      return;
    }

    setSubmitting(true);
    try {
      const res = await AuxService.crear_personal_externo({
        id_proveedor: idProveedor,
        nombre: nombre.trim(),
        apellido: apellido.trim() || undefined,
        dni: dni.trim() || undefined,
      });

      if (res.success && res.data) {
        notifySuccess("Personal externo registrado con éxito");
        onSuccess(res.data);
        onClose();
        // Reset
        setNombre("");
        setApellido("");
        setDni("");
      } else {
        notifyError(res.message || "Error al registrar personal");
      }
    } catch (err) {
      console.error(err);
      notifyError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = {
    input:
      "bg-zinc-900 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-semibold text-xs ml-0.5",
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Nuevo Personal Externo"
      centered
      radius="xl"
      classNames={{
        content: "bg-zinc-950 border border-zinc-800 text-white shadow-2xl",
        header: "bg-zinc-950 text-white border-b border-zinc-900",
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md" mt="md">
          <TextInput
            label="Nombre"
            placeholder="Ingrese nombre..."
            value={nombre}
            onChange={(e) => setNombre(e.currentTarget.value)}
            required
            classNames={inputClasses}
            radius="md"
          />
          <TextInput
            label="Apellido"
            placeholder="Ingrese apellido..."
            value={apellido}
            onChange={(e) => setApellido(e.currentTarget.value)}
            classNames={inputClasses}
            radius="md"
          />
          <TextInput
            label="DNI / Documento"
            placeholder="Ingrese número de documento..."
            value={dni}
            onChange={(e) => setDni(e.currentTarget.value)}
            classNames={inputClasses}
            radius="md"
          />

          <Group justify="flex-end" mt="lg">
            <Button
              variant="subtle"
              color="gray"
              onClick={onClose}
              disabled={submitting}
              radius="lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="indigo"
              loading={submitting}
              radius="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              Registrar Personal
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

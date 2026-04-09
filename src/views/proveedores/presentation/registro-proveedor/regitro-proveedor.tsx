import { IconDeviceFloppy, IconExclamationCircle } from "@tabler/icons-react";
import { Button, Grid, Select, TextInput, Alert } from "@mantine/core";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { useRegistroProveedor } from "../../hooks/useRegistroProveedor";
import { TipoEntidad } from "../../../../shared/enums/tipos";

interface Props {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegistroProveedor = ({ opened, onClose, onSuccess }: Props) => {
  const { payload, handleChange, handleSelectChange, submit, loading, error } =
    useRegistroProveedor(onSuccess);

  return (
    <ModalEstandar
      opened={opened}
      close={onClose}
      title="Registrar Nuevo Proveedor"
      size="lg"
    >
      <form onSubmit={submit} className="flex flex-col gap-6">
        {error && (
          <Alert
            icon={<IconExclamationCircle size={16} />}
            color="red"
            variant="filled"
            className="mb-2"
          >
            {error}
          </Alert>
        )}

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Tipo de Entidad"
              placeholder="Seleccione"
              searchable
              data={Object.values(TipoEntidad)}
              value={payload.tipo_entidad}
              onChange={handleSelectChange}
              classNames={{
                input: "bg-zinc-900 border-zinc-700 text-white",
                label: "text-zinc-400 font-medium",
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={
                payload.tipo_entidad === TipoEntidad.Natural ? "DNI" : "RUC"
              }
              placeholder="Ingrese el documento"
              value={
                payload.tipo_entidad === TipoEntidad.Natural
                  ? payload.dni || ""
                  : payload.ruc || ""
              }
              onChange={(e) =>
                payload.tipo_entidad === TipoEntidad.Natural
                  ? handleChange("dni", e.target.value)
                  : handleChange("ruc", e.target.value)
              }
              classNames={{
                input: "bg-zinc-900 border-zinc-700 text-white",
                label: "text-zinc-400 font-medium",
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12 }}>
            <TextInput
              label="Razón Social / Nombre Completo"
              placeholder="Ej. Comercializadora XYZ S.A.C."
              value={payload.razon_social || ""}
              onChange={(e) => handleChange("razon_social", e.target.value)}
              classNames={{
                input: "bg-zinc-900 border-zinc-700 text-white",
                label: "text-zinc-400 font-medium",
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12 }}>
            <TextInput
              label="Dirección Principal"
              placeholder="Av. Principal 123, Ciudad"
              value={payload.direccion || ""}
              onChange={(e) => handleChange("direccion", e.target.value)}
              classNames={{
                input: "bg-zinc-900 border-zinc-700 text-white",
                label: "text-zinc-400 font-medium",
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Teléfono Móvil / Fijo"
              placeholder="Opcional"
              value={payload.telefono || ""}
              onChange={(e) => handleChange("telefono", e.target.value)}
              classNames={{
                input: "bg-zinc-900 border-zinc-700 text-white",
                label: "text-zinc-400 font-medium",
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Correo Electrónico"
              placeholder="Opcional"
              value={payload.correo || ""}
              onChange={(e) => handleChange("correo", e.target.value)}
              classNames={{
                input: "bg-zinc-900 border-zinc-700 text-white",
                label: "text-zinc-400 font-medium",
              }}
            />
          </Grid.Col>
        </Grid>

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
            leftSection={<IconDeviceFloppy size={18} />}
            variant="gradient"
            gradient={{ from: "teal.7", to: "emerald.7", deg: 45 }}
          >
            Guardar Proveedor
          </Button>
        </div>
      </form>
    </ModalEstandar>
  );
};

import {
  Button,
  Group,
  TextInput,
  Textarea,
  Stack,
  Select,
  Switch,
  Checkbox,
  Text,
} from "@mantine/core";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TipoProducto } from "../../../shared/enums/_generic/tipo-producto";

interface RegistroCategoriaProps {
  nombre: string;
  setNombre: (val: string) => void;
  descripcion: string;
  setDescripcion: (val: string) => void;
  tipoRequerimiento: string | null;
  setTipoRequerimiento: (val: string | null) => void;
  clasificacionBien: string | null;
  setClasificacionBien: (val: string | null) => void;
  esConsumible: boolean;
  setEsConsumible: (val: boolean) => void;
  paraCocina: boolean;
  setParaCocina: (val: boolean) => void;
  paraMina: boolean;
  setParaMina: (val: boolean) => void;
  idsConsumidoras: number[];
  setIdsConsumidoras: (val: number[]) => void;
  onOpenDestinos: () => void;
  error: string;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const RegistroCategoria = ({
  nombre,
  setNombre,
  descripcion,
  setDescripcion,
  tipoRequerimiento,
  setTipoRequerimiento,
  clasificacionBien,
  setClasificacionBien,
  esConsumible,
  setEsConsumible,
  paraCocina,
  setParaCocina,
  paraMina,
  setParaMina,
  idsConsumidoras,
  onOpenDestinos,
  error,
  loading,
  onSave,
  onCancel,
}: RegistroCategoriaProps) => {
  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 
    focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Nombre"
        placeholder="Ej. Herramientas, EPP, Consumibles..."
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        value={nombre}
        onChange={(e) => setNombre(e.currentTarget.value)}
      />

      <Select
        label="Tipo"
        placeholder="Seleccione un tipo..."
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        data={Object.values(TipoProducto)}
        value={tipoRequerimiento}
        onChange={setTipoRequerimiento}
        comboboxProps={{
          withinPortal: true,
          zIndex: 99999,
          transitionProps: { transition: "pop", duration: 200 },
        }}
      />

      <Select
        label="Clasificación (opc.)"
        placeholder="Seleccione una clasificación ..."
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        data={Object.values(TipoBien)}
        value={clasificacionBien}
        onChange={setClasificacionBien}
        comboboxProps={{
          withinPortal: true,
          zIndex: 99999,
          transitionProps: { transition: "pop", duration: 200 },
        }}
      />

      <Stack gap="xs">
        <div className="text-zinc-300 text-sm font-medium">Destino de Uso</div>
        <Group
          gap="xl"
          className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-800"
        >
          <Checkbox
            label="Mina"
            checked={paraMina}
            onChange={(e) => setParaMina(e.currentTarget.checked)}
            disabled={loading}
            color="indigo"
            size="sm"
            classNames={{
              label: "text-zinc-300 cursor-pointer",
              input: "cursor-pointer",
            }}
          />
          <Checkbox
            label="Cocina"
            checked={paraCocina}
            onChange={(e) => setParaCocina(e.currentTarget.checked)}
            disabled={loading}
            color="indigo"
            size="sm"
            classNames={{
              label: "text-zinc-300 cursor-pointer",
              input: "cursor-pointer",
            }}
          />
        </Group>
      </Stack>

      <div className="space-y-4">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-between transition-all duration-200">
          <div className="flex flex-col gap-1 pr-4">
            <Text size="sm" fw={600} className="text-indigo-200">
              Trazabilidad de consumo
            </Text>
            <Text size="xs" className="text-indigo-100/70 leading-snug">
              Indique si esta categoría abastece a otras.
            </Text>
          </div>
          <Switch
            checked={esConsumible}
            onChange={(e) => setEsConsumible(e.currentTarget.checked)}
            disabled={loading}
            color="indigo"
            size="md"
            className="cursor-pointer"
          />
        </div>

        <div className="">
          <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800 transition-all duration-200">
            <div className="min-w-0">
              <span
                className={`text-xs font-semibold truncate block ${!esConsumible ? "text-zinc-600" : "text-zinc-300"}`}
              >
                {idsConsumidoras.length}{" "}
                {idsConsumidoras.length === 1
                  ? "Destino seleccionado"
                  : "Destinos seleccionados"}
              </span>
            </div>
            <Button
              variant="filled"
              color="indigo"
              size="xs"
              leftSection={<PlusIcon className="w-3 h-3" />}
              radius="md"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 h-7 shrink-0 disabled:opacity-30 disabled:bg-zinc-800"
              onClick={onOpenDestinos}
              disabled={!esConsumible || loading}
            >
              Gestionar
            </Button>
          </div>
        </div>
      </div>

      <Textarea
        label="Descripción (Opcional)"
        placeholder="Detalles adicionales sobre esta categoría..."
        radius="lg"
        minRows={3}
        disabled={loading}
        classNames={inputClasses}
        value={descripcion}
        onChange={(e) => setDescripcion(e.currentTarget.value)}
      />

      {error && (
        <div className="text-red-500 text-sm font-medium px-1">{error}</div>
      )}

      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white 
          hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          loading={loading}
          onClick={onSave}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 
          text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 
          shadow-lg border-0"
        >
          Guardar
        </Button>
      </Group>
    </Stack>
  );
};

import { TextInput, Select, NumberInput, Textarea, Loader, ActionIcon, Group, Text, Divider } from "@mantine/core";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { DTO_RecepcionLotExtendido } from "../../../hooks/registro-recepcion/useRegistroRecepcionOC";
import type { RES_Marca } from "../../../../../service/responses/marca";
import type { RES_Empleado } from "../../../../../service/responses/empleado";

interface ActivoRecepcionRowOCProps {
  lot: DTO_RecepcionLotExtendido;
  lotIndex: number;
  groupIndex: number;
  totalLots: number;
  codigoError?: string;
  marcas: RES_Marca[];
  loadingMarcas: boolean;
  empleados: RES_Empleado[];
  loadingEmpleados: boolean;
  setLotValue: <K extends keyof DTO_RecepcionLotExtendido>(
    groupIndex: number,
    lotIndex: number,
    field: K,
    value: DTO_RecepcionLotExtendido[K],
  ) => void;
  removeLot: (groupIndex: number, lotIndex: number) => void;
  inputClasses: Record<string, string>;
}

export const ActivoRecepcionRowOC = ({
  lot,
  lotIndex,
  groupIndex,
  totalLots,
  codigoError,
  marcas,
  loadingMarcas,
  empleados,
  loadingEmpleados,
  setLotValue,
  removeLot,
  inputClasses,
}: ActivoRecepcionRowOCProps) => {
  return (
    <div className="p-3 space-y-3 relative group/lot bg-zinc-900/10 border-b border-zinc-800/40">
      {lotIndex > 0 && <Divider color="zinc.8" variant="dashed" mb="sm" />}

      <div className="flex justify-between items-center mb-1">
        <Group gap="xs">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <Text
            size="xs"
            fw={900}
            className="text-indigo-400 uppercase tracking-widest"
          >
            Activo #{lotIndex + 1}
          </Text>
        </Group>
        {totalLots > 1 && (
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            radius="md"
            onClick={() => removeLot(groupIndex, lotIndex)}
            title="Eliminar Activo"
          >
            <TrashIcon className="w-4 h-4" />
          </ActionIcon>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <TextInput
          label="Código Interno"
          placeholder="Ej. ACT-001"
          value={lot.codigo || ""}
          onChange={(e) =>
            setLotValue(
              groupIndex,
              lotIndex,
              "codigo",
              e.currentTarget.value,
            )
          }
          error={codigoError}
          size="xs"
          radius="lg"
          classNames={inputClasses}
        />

        <TextInput
          label="Número de Serie"
          placeholder="Ej. S/N 123456"
          value={lot.numero_serie || ""}
          onChange={(e) =>
            setLotValue(
              groupIndex,
              lotIndex,
              "numero_serie",
              e.currentTarget.value,
            )
          }
          size="xs"
          radius="lg"
          classNames={inputClasses}
        />

        <Select
          label="Marca"
          placeholder="Seleccione Marca"
          data={marcas.map((m) => ({
            value: m.id_marca.toString(),
            label: m.nombre,
          }))}
          value={lot.id_marca?.toString() || null}
          onChange={(val) =>
            setLotValue(
              groupIndex,
              lotIndex,
              "id_marca",
              val ? Number(val) : null,
            )
          }
          searchable
          clearable
          comboboxProps={{ withinPortal: true }}
          size="xs"
          radius="lg"
          classNames={inputClasses}
          rightSection={
            loadingMarcas ? (
              <Loader size={12} color="indigo" />
            ) : null
          }
        />

        <TextInput
          label="Modelo"
          placeholder="Ej. Caterpillar 994K"
          value={lot.modelo || ""}
          onChange={(e) =>
            setLotValue(
              groupIndex,
              lotIndex,
              "modelo",
              e.currentTarget.value,
            )
          }
          size="xs"
          radius="lg"
          classNames={inputClasses}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[150px_220px_1fr] gap-3">
        <NumberInput
          label="Año del Modelo"
          placeholder="Ej. 2026"
          value={lot.yearcito_modelo || undefined}
          onChange={(val) =>
            setLotValue(
              groupIndex,
              lotIndex,
              "yearcito_modelo",
              val ? Number(val) : null,
            )
          }
          hideControls
          size="xs"
          radius="lg"
          classNames={inputClasses}
        />

        <Select
          label="Responsable"
          placeholder="Seleccione"
          data={empleados.map((e) => ({
            value: e.id_empleado.toString(),
            label: e.nombre_completo,
          }))}
          value={lot.id_empleado_responsable?.toString() || null}
          onChange={(val) =>
            setLotValue(
              groupIndex,
              lotIndex,
              "id_empleado_responsable",
              val ? Number(val) : null,
            )
          }
          searchable
          clearable
          comboboxProps={{ withinPortal: true }}
          size="xs"
          radius="lg"
          classNames={inputClasses}
          rightSection={
            loadingEmpleados ? (
              <Loader size={12} color="indigo" />
            ) : null
          }
        />

        <Textarea
          label="Descripción / Notas"
          placeholder="Especificaciones o notas adicionales..."
          value={lot.descripcion_activo || ""}
          onChange={(e) =>
            setLotValue(
              groupIndex,
              lotIndex,
              "descripcion_activo",
              e.currentTarget.value,
            )
          }
          autosize
          minRows={1}
          size="xs"
          radius="lg"
          classNames={inputClasses}
        />
      </div>
    </div>
  );
};

import { Badge, Checkbox } from "@mantine/core";
import type { RES_PrestamoDetalle } from "../../../../../../service/responses/prestamos/prestamo";
import type { RES_ActivoFijoDisponible } from "../../../../../../service/responses/activo-fijo";

interface ActivoRowProps {
  activo: RES_ActivoFijoDisponible;
  idDetallePrestamo: number;
  cant: number;
  maxBase: number;
  detalle: RES_PrestamoDetalle;
  isSelectedElsewhere: boolean;
  handleCantActivoChange: (
    idDetalle: number,
    idActivo: number,
    cant: number,
  ) => void;
}

export const ActivoRow = ({
  activo,
  idDetallePrestamo,
  cant,
  maxBase,
  isSelectedElsewhere,
  handleCantActivoChange,
}: ActivoRowProps) => {
  const isSelected = cant > 0;

  // Is disabled if selected elsewhere or if we reached the pending limit (and this row is not selected)
  const isDisabled = isSelectedElsewhere || (maxBase === 0 && !isSelected);

  return (
    <tr
      className={`${isSelected ? "bg-indigo-500/5" : "hover:bg-zinc-800/20"} transition-colors`}
    >
      <td className="py-3 text-center">
        <Badge
          variant="light"
          color="indigo"
          radius="sm"
          className="font-bold border border-indigo-500/20 py-3"
        >
          {activo.correlativo}
        </Badge>
      </td>
      <td className="text-center">
        <div className="flex flex-col gap-1 items-center">
          <Badge
            variant="dot"
            color={activo.en_almacen_principal ? "teal" : "blue"}
            size="sm"
            className="font-bold py-1.5"
          >
            {activo.en_almacen_principal
              ? "Almacén Principal"
              : activo.mina || activo.almacen || "Sin Asignar"}
          </Badge>
        </div>
      </td>
      <td className="text-center">
        <div className="flex flex-col gap-1 items-center justify-center">
          {!activo.control_por_horometro && !activo.control_por_odometro && (
            <Badge
              variant="light"
              color="zinc"
              size="sm"
              className="bg-zinc-800/30 font-bold"
            >
              No Aplica
            </Badge>
          )}
          {!!activo.control_por_horometro && (
            <Badge
              variant="light"
              color="teal"
              size="sm"
              className="bg-zinc-800/30 font-bold"
            >
              Por Horómetro
            </Badge>
          )}
          {!!activo.control_por_odometro && (
            <Badge
              variant="light"
              color="blue"
              size="sm"
              className="bg-zinc-800/30 font-bold"
            >
              Por Odómetro
            </Badge>
          )}
        </div>
      </td>
      <td className="pr-8">
        <div className="flex items-center justify-center h-full">
          <Checkbox
            checked={isSelected}
            disabled={isDisabled}
            onChange={(e) =>
              handleCantActivoChange(
                idDetallePrestamo,
                activo.id_activo,
                e.currentTarget.checked ? 1 : 0,
              )
            }
            color="indigo"
            radius="sm"
            size="sm"
            classNames={{
              input:
                "cursor-pointer disabled:cursor-not-allowed border-zinc-700 bg-zinc-900",
            }}
          />
        </div>
      </td>
    </tr>
  );
};

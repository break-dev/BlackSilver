import { Badge } from "@mantine/core";
import { EstadoDetallePrestamo } from "../../../../shared/enums/estados";

interface Props {
  estado: string;
}

export const PrestamoStatusBadge = ({ estado }: Props) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case EstadoDetallePrestamo.Pendiente:
        return "blue";
      case EstadoDetallePrestamo.Aprobado:
        return "violet";
      case EstadoDetallePrestamo.DespachoIniciado:
        return "orange";
      case EstadoDetallePrestamo.Completado:
        return "teal";
      case EstadoDetallePrestamo.DevolucionParcial:
        return "cyan";
      case EstadoDetallePrestamo.DevolucionTotal:
        return "green";
      case EstadoDetallePrestamo.Rechazado:
        return "red";
      case EstadoDetallePrestamo.Cerrado:
        return "zinc";
      default:
        return "zinc";
    }
  };

  return (
    <Badge 
      variant="light" 
      color={getStatusColor(estado)} 
      radius="md" 
      size="sm"
      className="font-bold tracking-wider uppercase px-2 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
    >
      {estado}
    </Badge>
  );
};

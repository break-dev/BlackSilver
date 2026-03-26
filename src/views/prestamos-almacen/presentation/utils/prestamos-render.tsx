import {
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  TruckIcon,
  ArchiveBoxArrowDownIcon,
  XCircleIcon,
  CheckCircleIcon,
  CubeIcon,
  ArrowPathIcon,
  ArrowLongLeftIcon,
} from "@heroicons/react/24/solid";
import {
  EstadoDetallePrestamo,
  EstadoPrestamo,
} from "../../../../shared/enums/prestamos";

export const getEstadoDetalleColor = (
  estado: EstadoDetallePrestamo,
): string => {
  switch (estado) {
    case EstadoDetallePrestamo.Pendiente:
      return "blue";
    case EstadoDetallePrestamo.Aprobado:
      return "violet";
    case EstadoDetallePrestamo.DespachoIniciado:
      return "orange";
    case EstadoDetallePrestamo.NuevaEntrega:
      return "green";
    case EstadoDetallePrestamo.Completado:
      return "cyan";
    case EstadoDetallePrestamo.DevolucionParcial:
      return "yellow";
    case EstadoDetallePrestamo.DevolucionTotal:
      return "teal";
    case EstadoDetallePrestamo.Rechazado:
      return "red";
    case EstadoDetallePrestamo.Cerrado:
      return "zinc";
    default:
      return "gray";
  }
};

export const getEstadoDetalleIcon = (estado: EstadoDetallePrestamo) => {
  switch (estado) {
    case EstadoDetallePrestamo.Pendiente:
      return <ClipboardDocumentListIcon className="w-4 h-4 text-white" />;
    case EstadoDetallePrestamo.Aprobado:
      return <CheckBadgeIcon className="w-4 h-4 text-white" />;
    case EstadoDetallePrestamo.DespachoIniciado:
      return <TruckIcon className="w-4 h-4 text-white" />;
    case EstadoDetallePrestamo.NuevaEntrega:
      return <ArchiveBoxArrowDownIcon className="w-4 h-4 text-white" />;
    case EstadoDetallePrestamo.Completado:
      return <CheckCircleIcon className="w-4 h-4 text-white" />;
    case EstadoDetallePrestamo.DevolucionParcial:
      return <ArrowPathIcon className="w-4 h-4 text-white" />;
    case EstadoDetallePrestamo.DevolucionTotal:
      return <ArrowLongLeftIcon className="w-4 h-4 text-white" />;
    case EstadoDetallePrestamo.Rechazado:
      return <XCircleIcon className="w-4 h-4 text-white" />;
    case EstadoDetallePrestamo.Cerrado:
      return <CubeIcon className="w-4 h-4 text-white" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-white" />;
  }
};

export const getEstadoPrestamoColor = (estado: EstadoPrestamo): string => {
  switch (estado) {
    case EstadoPrestamo.Generado:
      return "blue";
    case EstadoPrestamo.EnProceso:
      return "indigo";
    case EstadoPrestamo.Completado:
      return "teal";
    case EstadoPrestamo.Finalizado:
      return "zinc";
    case EstadoPrestamo.Anulado:
      return "red";
    default:
      return "gray";
  }
};

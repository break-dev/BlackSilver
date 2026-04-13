import {
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  TruckIcon,
  ArchiveBoxArrowDownIcon,
  XCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/solid";
import {
  Estado_Prestamo,
  Estado_PrestamoDetalle,
  Estado_PrestamoDetalleLog,
} from "../../../../shared/enums/prestamo-almacen/prestamo";

export const getEstadoDetalleColor = (
  estado: Estado_PrestamoDetalle,
): string => {
  switch (estado) {
    case Estado_PrestamoDetalle.EsperandoAprobacion:
      return "blue";
    case Estado_PrestamoDetalle.Aprobado:
      return "violet";
    case Estado_PrestamoDetalle.EnDespacho:
      return "orange";
    case Estado_PrestamoDetalle.Completado:
      return "green";
    case Estado_PrestamoDetalle.Rechazado:
      return "red";
    case Estado_PrestamoDetalle.Cerrado:
      return "zinc";
    default:
      return "gray";
  }
};

export const getEstadoDetalleIcon = (estado: Estado_PrestamoDetalleLog) => {
  switch (estado) {
    case Estado_PrestamoDetalleLog.EsperandoAprobacion:
      return <ClipboardDocumentListIcon className="w-4 h-4 text-white" />;
    case Estado_PrestamoDetalleLog.Aprobado:
      return <CheckBadgeIcon className="w-4 h-4 text-white" />;
    case Estado_PrestamoDetalleLog.EnDespacho:
      return <TruckIcon className="w-4 h-4 text-white" />;
    case Estado_PrestamoDetalleLog.NuevaEntrega:
      return <ArchiveBoxArrowDownIcon className="w-4 h-4 text-white" />;
    case Estado_PrestamoDetalleLog.Rechazado:
      return <XCircleIcon className="w-4 h-4 text-white" />;
    case Estado_PrestamoDetalleLog.Cerrado:
      return <CubeIcon className="w-4 h-4 text-white" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-white" />;
  }
};

export const getEstadoPrestamoColor = (estado: Estado_Prestamo): string => {
  switch (estado) {
    case Estado_Prestamo.Generado:
      return "blue";
    case Estado_Prestamo.EnDespacho:
      return "indigo";
    case Estado_Prestamo.Completado:
      return "zinc";
    case Estado_Prestamo.Anulado:
      return "red";
    default:
      return "gray";
  }
};

import {
  BuildingOffice2Icon,
  UserGroupIcon,
  UsersIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  ReceiptRefundIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

// Asociacion de iconos a cada modulo y submodulo, mediante
// el campo "path". Visible en el menu de navegacion
export const iconos_menu_navegacion = [
  {
    modulo_path: "configuracion",
    icono: Cog6ToothIcon,
    submodulos: [
      { submodulo_path: "empresas", icono: BuildingOffice2Icon },
      { submodulo_path: "personal", icono: UserGroupIcon },
      { submodulo_path: "usuarios", icono: UsersIcon },
    ],
  },
  {
    modulo_path: "logistica",
    icono: TruckIcon,
    submodulos: [
      { submodulo_path: "inventario", icono: ClipboardDocumentListIcon },
      { submodulo_path: "requerimiento_almacen", icono: DocumentTextIcon },
      {
        submodulo_path: "solicitud_reabastecimiento",
        icono: ArrowsRightLeftIcon,
      },
      { submodulo_path: "prestamos_almacen", icono: ReceiptRefundIcon },
      { submodulo_path: "compras", icono: ShoppingCartIcon },
    ],
  },
];

import { Badge, ActionIcon, Tooltip } from "@mantine/core";
import { IconBuildingBank } from "@tabler/icons-react";
import { DataTableEstandar } from "../../../../../presentation/utils/datatable-estandar";
import type { ProveedorResponse } from "../../../service/proveedores.responses";

interface Props {
  proveedores: ProveedorResponse[];
  loading: boolean;
  onOpenCuentas: (proveedor: ProveedorResponse) => void;
}

export const Proveedor = ({ proveedores, loading, onOpenCuentas }: Props) => {
  return (
    <DataTableEstandar
      idAccessor="id_proveedor"
      records={proveedores}
      loading={loading}
      minHeight={400}
      columns={[
        {
          accessor: "index",
          title: "#",
          width: 60,
          textAlign: "center",
        },
        {
          accessor: "razon_social",
          title: "Proveedor / Razón Social",
          render: (r: ProveedorResponse) => (
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight">
                {r.razon_social}
              </span>
              <span className="text-xs text-zinc-400 flex gap-2">
                {r.tipo_entidad}
                {r.ruc && ` • RUC: ${r.ruc}`}
                {r.dni && ` • DNI: ${r.dni}`}
              </span>
            </div>
          ),
        },
        {
          accessor: "contacto",
          title: "Contacto",
          render: (r: ProveedorResponse) => (
            <div className="flex flex-col text-sm">
              {r.telefono && (
                <span className="text-zinc-300">📞 {r.telefono}</span>
              )}
              {r.correo && <span className="text-zinc-400">✉️ {r.correo}</span>}
              {!r.telefono && !r.correo && (
                <span className="text-zinc-600 italic">Sin contacto</span>
              )}
            </div>
          ),
        },
        {
          accessor: "estado",
          title: "Estado",
          width: 120,
          textAlign: "center",
          render: (r: ProveedorResponse) => (
            <Badge
              color={r.estado === "Activo" ? "teal.8" : "red.8"}
              variant="filled"
              radius="sm"
              size="sm"
            >
              {r.estado}
            </Badge>
          ),
        },
        {
          accessor: "actions",
          title: "Acciones",
          width: 140,
          textAlign: "center",
          render: (r: ProveedorResponse) => (
            <div className="flex justify-center gap-2">
              <Tooltip label="Cuentas Bancarias" withArrow position="top">
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  radius="md"
                  onClick={() => onOpenCuentas(r)}
                >
                  <IconBuildingBank size={18} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </div>
          ),
        },
      ]}
    />
  );
};

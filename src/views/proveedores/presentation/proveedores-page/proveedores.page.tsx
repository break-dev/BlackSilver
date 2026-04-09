import { useTitlePage } from "../../../../hooks/useTitlePage";
import { useProveedores } from "../../hooks/useProveedores";
import { RegistroProveedor } from "../registro-proveedor/regitro-proveedor";
import { CuentasBancarias } from "../cuentas-bancarias/cuentas-bancarias";
import { useState } from "react";
import type { ProveedorResponse } from "../../service/proveedores.responses";
import { Filtros } from "./components/filtros";
import { Proveedor } from "./components/proveedor";

export const ProveedoresPage = () => {
  useTitlePage("Proveedores");
  const { proveedores, loading, fetchProveedores } = useProveedores();

  const [openRegistro, setOpenRegistro] = useState(false);
  const [selectedProveedor, setSelectedProveedor] =
    useState<ProveedorResponse | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-zinc-800/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <Filtros onOpenRegistro={() => setOpenRegistro(true)} />

      <div className="flex-1 min-h-0 relative z-10">
        <Proveedor
          proveedores={proveedores}
          loading={loading}
          onOpenCuentas={(p) => setSelectedProveedor(p)}
        />
      </div>

      <RegistroProveedor
        opened={openRegistro}
        onClose={() => setOpenRegistro(false)}
        onSuccess={fetchProveedores}
      />

      <CuentasBancarias
        proveedor={selectedProveedor}
        onClose={() => setSelectedProveedor(null)}
      />
    </div>
  );
};

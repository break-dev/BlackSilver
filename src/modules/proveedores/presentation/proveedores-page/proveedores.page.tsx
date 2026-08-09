import { Stack } from "@mantine/core";

import { useTitlePage } from "../../../../hooks/useTitlePage";
import { useProveedores } from "../../hooks/useProveedores";
import { RegistroProveedor } from "../registro-proveedor/registro-proveedor";
import { CuentasBancarias } from "../cuentas-bancarias/cuentas-bancarias";
import { useState } from "react";
import type {
  CuentaBancariaResponse,
  ProveedorResponse,
} from "../../service/proveedores.responses";
import { Filtros } from "./components/filtros";
import { Proveedor } from "./components/proveedor";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";

export const ProveedoresPage = () => {
  useTitlePage("Proveedores");
  const {
    proveedores,
    loading,
    insertProveedor,
    updateProveedor,
    recargar,
  } = useProveedores();

  const [openRegistro, setOpenRegistro] = useState(false);
  const [selectedProveedor, setSelectedProveedor] =
    useState<ProveedorResponse | null>(null);

  const proveedorEnGestion =
    selectedProveedor
      ? (proveedores.find((p) => p.id_proveedor === selectedProveedor.id_proveedor) ??
        selectedProveedor)
      : null;

  const actualizarCuentas = (
    proveedor: ProveedorResponse,
    cuentas: CuentaBancariaResponse[],
  ): ProveedorResponse => ({
    ...proveedor,
    cuentas_bancarias: cuentas,
    cantidad_cuentas_bancarias: cuentas.length,
  });

  const handleCuentaActualizada = (cuenta: CuentaBancariaResponse) => {
    if (!selectedProveedor) return;

    const cuentasActualizadas = (selectedProveedor.cuentas_bancarias ?? []).map(
      (c) => (c.id_cuenta_bancaria === cuenta.id_cuenta_bancaria ? cuenta : c),
    );

    updateProveedor(
      selectedProveedor.id_proveedor,
      actualizarCuentas(selectedProveedor, cuentasActualizadas),
    );
  };

  const handleCuentaAgregada = (cuenta: CuentaBancariaResponse) => {
    if (!selectedProveedor) return;

    const cuentasActualizadas = [
      cuenta,
      ...(selectedProveedor.cuentas_bancarias ?? []),
    ];

    updateProveedor(
      selectedProveedor.id_proveedor,
      actualizarCuentas(selectedProveedor, cuentasActualizadas),
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Stack gap="md">
        <Filtros
          onOpenRegistro={() => setOpenRegistro(true)}
          onReload={recargar}
          loading={loading}
        />

        <Proveedor
          proveedores={proveedores}
          loading={loading}
          onOpenCuentas={(p) => setSelectedProveedor(p)}
        />
      </Stack>

      {/* Modal: Registro de Proveedor */}
      <ModalEstandar
        opened={openRegistro}
        close={() => setOpenRegistro(false)}
        title="Nuevo Proveedor"
        size="lg"
      >
        <RegistroProveedor
          onCancel={() => setOpenRegistro(false)}
          onSuccess={(p) => {
            insertProveedor(p);
            setOpenRegistro(false);
          }}
        />
      </ModalEstandar>

      {/* Modal: Gestión de Cuentas Bancarias */}
      <ModalEstandar
        opened={!!selectedProveedor}
        close={() => setSelectedProveedor(null)}
        title={
          proveedorEnGestion
            ? `Cuentas Bancarias: ${proveedorEnGestion.razon_social}`
            : ""
        }
        size="xl"
      >
        {proveedorEnGestion && (
          <CuentasBancarias
            proveedor={proveedorEnGestion}
            onCuentaActualizada={handleCuentaActualizada}
            onCuentaAgregada={handleCuentaAgregada}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

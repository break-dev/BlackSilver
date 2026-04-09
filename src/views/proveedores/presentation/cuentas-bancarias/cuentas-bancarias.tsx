import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { useCuentasBancarias } from "../../hooks/useCuentasBancarias";
import type { ProveedorResponse } from "../../service/proveedores.responses";
import {
  RegistroCuenta,
  type RegistroCuentaRef,
} from "./components/registro-cuenta";
import { CuentaBancaria } from "./components/cuenta-bancaria";
import { useRef } from "react";
import { Loader } from "@mantine/core";

interface Props {
  proveedor: ProveedorResponse | null;
  onClose: () => void;
}

export const CuentasBancarias = ({ proveedor, onClose }: Props) => {
  const {
    cuentas,
    bancos,
    setBancos,
    loadingCuentas,
    loadingBancos,
    reloadCuentas,
  } = useCuentasBancarias(proveedor?.id_proveedor || null);

  const regCuentaRef = useRef<RegistroCuentaRef>(null);

  if (!proveedor) return null;

  return (
    <ModalEstandar
      opened={!!proveedor}
      close={onClose}
      title={`Cuentas Bancarias: ${proveedor.razon_social}`}
      size="xl"
    >
      <div className="flex flex-col gap-8">
        {/* Formulario arriba según lo solicitado */}
        <RegistroCuenta
          ref={regCuentaRef}
          idProveedor={proveedor.id_proveedor}
          bancos={bancos}
          loadingBancos={loadingBancos}
          onCuentaAdded={reloadCuentas}
          onBancoAdded={(b) => {
            setBancos((prev) => [...prev, b]);
            regCuentaRef.current?.autoSelectBanco(b.id_banco);
          }}
        />

        {/* Lista de Cuentas usando items individuales en vez de tabla */}
        <div className="flex flex-col gap-3">
          <h3 className="text-zinc-300 font-medium text-sm uppercase tracking-widest px-1">
            Cuentas Registradas
          </h3>

          {loadingCuentas ? (
            <div className="flex justify-center p-8 bg-zinc-900/30 rounded-xl border border-zinc-800">
              <Loader color="blue" type="bars" />
            </div>
          ) : cuentas.length > 0 ? (
            <div className="flex flex-col gap-3">
              {cuentas.map((cuenta) => (
                <CuentaBancaria
                  key={cuenta.id_cuenta_bancaria}
                  cuenta={cuenta}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center p-8 bg-zinc-900/30 border border-zinc-800 rounded-xl text-zinc-500 font-medium">
              Este proveedor no tiene cuentas bancarias registradas.
            </div>
          )}
        </div>
      </div>
    </ModalEstandar>
  );
};

import { useCuentasBancarias } from "../../hooks/useCuentasBancarias";
import { useEdicionCuentaBancaria } from "../../hooks/useEdicionCuentaBancaria";
import type {
  CuentaBancariaResponse,
  ProveedorResponse,
} from "../../service/proveedores.responses";
import {
  RegistroCuenta,
  type RegistroCuentaRef,
} from "./components/registro-cuenta";
import { CuentaBancaria } from "./components/cuenta-bancaria";
import { EdicionCuentaBancaria } from "./components/edicion-cuenta";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { useEffect, useRef, useState } from "react";
import { Text } from "@mantine/core";
import { IconCreditCard } from "@tabler/icons-react";
import { Moneda } from "../../../../shared/enums/_generic/moneda";

interface Props {
  proveedor: ProveedorResponse;
  onCuentaActualizada?: (cuenta: CuentaBancariaResponse) => void;
  onCuentaAgregada?: (cuenta: CuentaBancariaResponse) => void;
}

export const CuentasBancarias = ({
  proveedor,
  onCuentaActualizada,
  onCuentaAgregada,
}: Props) => {
  const { bancos, setBancos, loadingBancos } = useCuentasBancarias(
    proveedor.id_proveedor,
  );

  const regCuentaRef = useRef<RegistroCuentaRef>(null);
  const [cuentaAEditar, setCuentaAEditar] =
    useState<CuentaBancariaResponse | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const cuentas = proveedor.cuentas_bancarias ?? [];

  // Proveedores de carbon: todas sus cuentas bancarias son en Soles,
  // sin posibilidad de elegir otra moneda.
  const monedaFija = proveedor.para_carbon ? "Soles" : undefined;

  const edicion = useEdicionCuentaBancaria({
    onSuccess: (cuentaActualizada) => {
      onCuentaActualizada?.(cuentaActualizada);
    },
    onClose: () => setOpenEdit(false),
    monedaFija: proveedor.para_carbon ? Moneda.Soles : undefined,
  });

  useEffect(() => {
    if (cuentaAEditar) {
      edicion.cargarCuenta(cuentaAEditar);
    } else {
      edicion.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentaAEditar]);

  const handleOpenEdit = (cuenta: CuentaBancariaResponse) => {
    setCuentaAEditar(cuenta);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setCuentaAEditar(null);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Formulario arriba según lo solicitado */}
      <RegistroCuenta
        ref={regCuentaRef}
        idProveedor={proveedor.id_proveedor}
        bancos={bancos}
        loadingBancos={loadingBancos}
        onCuentaAdded={(cuenta) => onCuentaAgregada?.(cuenta)}
        onBancoAdded={(b) => {
          setBancos((prev) => [...prev, b]);
          regCuentaRef.current?.autoSelectBanco(b.id_banco);
        }}
        monedaFija={monedaFija}
      />

      {/* Lista de Cuentas usando items individuales en vez de tabla */}
      <div className="flex flex-col gap-3">
        <h3 className="text-zinc-300 font-medium text-sm uppercase tracking-widest px-1">
          Cuentas Registradas
        </h3>

        {cuentas.length > 0 ? (
          <div className="flex flex-col gap-3">
            {cuentas.map((cuenta) => (
              <CuentaBancaria
                key={cuenta.id_cuenta_bancaria}
                cuenta={cuenta}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-xl">
            <IconCreditCard
              size={40}
              className="text-zinc-700 mb-3"
              stroke={1}
            />
            <Text size="sm" className="text-zinc-500 font-medium">
              Este proveedor no tiene cuentas bancarias registradas.
            </Text>
          </div>
        )}
      </div>

      {/* Modal: Edición de Cuenta Bancaria */}
      <ModalEstandar
        opened={openEdit}
        close={handleCloseEdit}
        title="Editar Cuenta Bancaria"
        size="md"
        validateClose
        closeConfirmationMessage="Vas a descartar los cambios no guardados de esta cuenta bancaria."
      >
        {cuentaAEditar && (
          <EdicionCuentaBancaria
            hook={edicion}
            onCancel={handleCloseEdit}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

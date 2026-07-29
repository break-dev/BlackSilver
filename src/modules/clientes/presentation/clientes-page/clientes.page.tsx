import { Stack } from "@mantine/core";

import { useTitlePage } from "../../../../hooks/useTitlePage";
import { useClientes } from "../../hooks/useClientes";
import { RegistroCliente } from "../registro-cliente/registro-cliente";
import { CuentasBancarias } from "../cuentas-bancarias/cuentas-bancarias";
import { useState } from "react";
import type {
  ClienteResponse,
  CuentaBancariaResponse,
} from "../../service/clientes.responses";
import { Filtros } from "./components/filtros";
import { Cliente } from "./components/cliente";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";

export const ClientesPage = () => {
  useTitlePage("Clientes");
  const { clientes, loading, insertCliente, updateCliente } = useClientes();

  const [openRegistro, setOpenRegistro] = useState(false);
  const [selectedCliente, setSelectedCliente] =
    useState<ClienteResponse | null>(null);

  const actualizarCuentas = (
    cliente: ClienteResponse,
    cuentas: CuentaBancariaResponse[],
  ): ClienteResponse => ({
    ...cliente,
    cuentas_bancarias: cuentas,
    cantidad_cuentas_bancarias: cuentas.length,
  });

  const handleCuentaActualizada = (cuenta: CuentaBancariaResponse) => {
    if (!selectedCliente) return;

    const cuentasActualizadas = (
      selectedCliente.cuentas_bancarias ?? []
    ).map((c) =>
      c.id_cuenta_bancaria === cuenta.id_cuenta_bancaria ? cuenta : c,
    );

    const clienteActualizado = actualizarCuentas(
      selectedCliente,
      cuentasActualizadas,
    );

    updateCliente(clienteActualizado);
    setSelectedCliente(clienteActualizado);
  };

  const handleCuentaAgregada = (cuenta: CuentaBancariaResponse) => {
    if (!selectedCliente) return;

    const cuentasActualizadas = [
      cuenta,
      ...(selectedCliente.cuentas_bancarias ?? []),
    ];

    const clienteActualizado = actualizarCuentas(
      selectedCliente,
      cuentasActualizadas,
    );

    updateCliente(clienteActualizado);
    setSelectedCliente(clienteActualizado);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Stack gap="md">
        <Filtros onOpenRegistro={() => setOpenRegistro(true)} />

        <Cliente
          clientes={clientes}
          loading={loading}
          onOpenCuentas={(c) => setSelectedCliente(c)}
        />
      </Stack>

      {/* Modal: Registro de Cliente */}
      <ModalEstandar
        opened={openRegistro}
        close={() => setOpenRegistro(false)}
        title="Nuevo Cliente"
        size="lg"
      >
        <RegistroCliente
          onCancel={() => setOpenRegistro(false)}
          onSuccess={(c) => {
            insertCliente(c);
            setOpenRegistro(false);
          }}
        />
      </ModalEstandar>

      {/* Modal: Gestión de Cuentas Bancarias */}
      <ModalEstandar
        opened={!!selectedCliente}
        close={() => setSelectedCliente(null)}
        title={
          selectedCliente
            ? `Cuentas Bancarias: ${selectedCliente.razon_social}`
            : ""
        }
        size="xl"
      >
        {selectedCliente && (
          <CuentasBancarias
            cliente={selectedCliente}
            onCuentaActualizada={handleCuentaActualizada}
            onCuentaAgregada={handleCuentaAgregada}
          />
        )}
      </ModalEstandar>
    </div>
  );
};

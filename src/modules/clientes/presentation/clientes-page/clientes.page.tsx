import { Stack } from "@mantine/core";

import { useTitlePage } from "../../../../hooks/useTitlePage";
import { useClientes } from "../../hooks/useClientes";
import { RegistroCliente } from "../registro-cliente/registro-cliente";
import { CuentasBancarias } from "../cuentas-bancarias/cuentas-bancarias";
import { useState } from "react";
import type { ClienteResponse } from "../../service/clientes.responses";
import { Filtros } from "./components/filtros";
import { Cliente } from "./components/cliente";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";

export const ClientesPage = () => {
  useTitlePage("Clientes");
  const { clientes, loading, insertCliente } = useClientes();

  const [openRegistro, setOpenRegistro] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteResponse | null>(null);

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
          <CuentasBancarias cliente={selectedCliente} />
        )}
      </ModalEstandar>
    </div>
  );
};

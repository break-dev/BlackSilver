import { Stack } from "@mantine/core";

import { useTitlePage } from "../../../../hooks/useTitlePage";
import { useClientes } from "../../hooks/useClientes";
import { RegistroCliente } from "../registro-cliente/registro-cliente";
import { useState } from "react";
import { Filtros } from "./components/filtros";
import { Cliente } from "./components/cliente";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";

export const ClientesPage = () => {
  useTitlePage("Clientes");
  const { clientes, loading, insertCliente } = useClientes();

  const [openRegistro, setOpenRegistro] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <Stack gap="md">
        <Filtros onOpenRegistro={() => setOpenRegistro(true)} />

        <Cliente
          clientes={clientes}
          loading={loading}
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
    </div>
  );
};

import { useState, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useNotify } from "../../../hooks/useNotify";
import { CuentasEmpresaService } from "../service/cuentas-empresa.service";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import type { RES_CuentaEmpresa } from "../../../service/responses/cuenta-empresa";

export const useCuentasEmpresa = () => {
  const { notifySuccess, notifyError } = useNotify();

  const [empresaParaCuenta, setEmpresaParaCuenta] = useState<{
    id_empresa: number;
    razon_social: string;
  } | null>(null);
  const [openedCrearCuenta, { open: openCrearCuenta, close: closeCrearCuentaRaw }] =
    useDisclosure(false);

  const [cuentaParaEditar, setCuentaParaEditar] =
    useState<RES_CuentaEmpresa | null>(null);
  const [openedEditarCuenta, { open: openEditarCuenta, close: closeEditarCuentaRaw }] =
    useDisclosure(false);

  const onOpenCrearCuentaModal = useCallback(
    (id_empresa: number, razon_social: string) => {
      setEmpresaParaCuenta({ id_empresa, razon_social });
      openCrearCuenta();
    },
    [openCrearCuenta],
  );

  const closeCrearCuentaModal = useCallback(() => {
    closeCrearCuentaRaw();
    setEmpresaParaCuenta(null);
  }, [closeCrearCuentaRaw]);

  const onOpenEditarCuentaModal = useCallback(
    (cuenta: RES_CuentaEmpresa) => {
      setCuentaParaEditar(cuenta);
      openEditarCuenta();
    },
    [openEditarCuenta],
  );

  const closeEditarCuentaModal = useCallback(() => {
    closeEditarCuentaRaw();
    setCuentaParaEditar(null);
  }, [closeEditarCuentaRaw]);

  const handleToggleEstadoCuenta = useCallback(
    async (
      id_cuenta_bancaria: number,
      estadoActual: EstadoBase,
    ): Promise<boolean> => {
      const nuevoEstado =
        estadoActual === EstadoBase.Activo
          ? EstadoBase.Inactivo
          : EstadoBase.Activo;

      try {
        const result = await CuentasEmpresaService.cambiar_estado(
          id_cuenta_bancaria,
          nuevoEstado,
        );
        if (result.success) {
          notifySuccess(
            nuevoEstado === EstadoBase.Activo
              ? "Cuenta bancaria reactivada"
              : "Cuenta bancaria desactivada",
          );
          return true;
        }
        notifyError(result.message);
        return false;
      } catch (err) {
        notifyError("Error al cambiar el estado de la cuenta bancaria");
        console.error(err);
        return false;
      }
    },
    [notifySuccess, notifyError],
  );

  return {
    empresaParaCuenta,
    openedCrearCuenta,
    onOpenCrearCuentaModal,
    closeCrearCuentaModal,

    cuentaParaEditar,
    openedEditarCuenta,
    onOpenEditarCuentaModal,
    closeEditarCuentaModal,

    handleToggleEstadoCuenta,
  };
};
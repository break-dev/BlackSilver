import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { FormularioContratoEmpleado } from "./formulario-contrato";
import type {
  RES_EmpleadoConContrato,
  RES_ContratoEmpleado,
} from "../../../service/responses/contrato-empleado";

interface ModalContratoEmpleadoProps {
  idEmpleado: number;
  opened: boolean;
  close: () => void;
  /**
   * Callback al guardar el contrato. El argumento es el payload del backend
   * `{ contrato, empleado }`. Útil para que el padre actualice la lista sin refresh.
   */
  onSuccess?: (payload?: RES_EmpleadoConContrato) => void;
  /**
   * Contrato anterior del mismo empleado. Si se pasa, el form pre-rellena
   * los campos con los valores del anterior.
   */
  contratoAnterior?: RES_ContratoEmpleado;
}

export const ModalContratoEmpleado = ({
  idEmpleado,
  opened,
  close,
  onSuccess,
  contratoAnterior,
}: ModalContratoEmpleadoProps) => {
  return (
    <ModalEstandar
      opened={opened}
      close={close}
      title="Registrar Contrato de Trabajo"
      size="lg"
    >
      <FormularioContratoEmpleado
        idEmpleado={idEmpleado}
        contratoAnterior={contratoAnterior}
        onSuccess={(payload) => {
          // El formulario del contrato, al confirmar, hace su submit interno
          // (POST /api/contratos-empleado). Aquí cerramos el modal y delegamos
          // al padre la actualización de la lista.
          onSuccess?.(payload as RES_EmpleadoConContrato);
          close();
        }}
        onCancel={close}
      />
    </ModalEstandar>
  );
};

import {
  Grid,
  Select,
  TextInput,
  Switch,
  Alert,
  Loader,
  ActionIcon,
  Tooltip,
  Button,
} from "@mantine/core";
import {
  IconNotes,
  IconInfoCircle,
  IconPlus,
  IconExclamationCircle,
} from "@tabler/icons-react";
import { MONEDAS } from "../../../../../shared/variables/monedas";
import { useRegistroCuentaBancaria } from "../../../hooks/useRegistroCuentaBancaria";
import type { BancoResponse } from "../../../service/proveedores.responses";
import { useState, forwardRef, useImperativeHandle } from "react";
import { RegistroBanco } from "./registro-banco";

interface Props {
  idProveedor: number;
  bancos: BancoResponse[];
  loadingBancos: boolean;
  onCuentaAdded: () => void;
  onBancoAdded: (banco: BancoResponse) => void;
}

export interface RegistroCuentaRef {
  autoSelectBanco: (id: number) => void;
}

export const RegistroCuenta = forwardRef<RegistroCuentaRef, Props>(
  (
    { idProveedor, bancos, loadingBancos, onCuentaAdded, onBancoAdded },
    ref,
  ) => {
    const {
      payload,
      handleChangeStr,
      handleSelectBanco,
      handleToggleDetraccion,
      submit,
      isSubmitting,
      error,
      autoSelectBanco,
    } = useRegistroCuentaBancaria(idProveedor, onCuentaAdded);

    const [openBanco, setOpenBanco] = useState(false);

    useImperativeHandle(ref, () => ({
      autoSelectBanco,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectMonedas = Object.values(MONEDAS).map((m: any) => ({
      value: m.label,
      label: `${m.label} (${m.symbol})`,
    }));

    const selectBancos = bancos.map((b) => ({
      value: b.id_banco.toString(),
      label: `${b.nombre} ${b.abreviatura ? `(${b.abreviatura})` : ""}`,
    }));

    return (
      <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-linear-to-b from-blue-500 to-indigo-600" />
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <IconNotes size={20} className="text-blue-400" />
          Vincular Nueva Cuenta
        </h3>

        {error && (
          <Alert
            icon={<IconExclamationCircle size={16} />}
            color="red"
            variant="filled"
            className="mb-4"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <div className="flex items-end gap-2">
                <Select
                  label="Banco"
                  placeholder="Seleccione un banco"
                  data={selectBancos}
                  disabled={loadingBancos}
                  searchable
                  className="flex-1"
                  rightSection={
                    loadingBancos ? <Loader size={16} /> : undefined
                  }
                  value={payload.id_banco ? payload.id_banco.toString() : null}
                  onChange={handleSelectBanco}
                  classNames={{
                    input: "bg-zinc-950 border-zinc-700 text-white",
                    label: "text-zinc-400 font-medium",
                  }}
                />
                <Tooltip label="Añadir nuevo banco" withArrow>
                  <ActionIcon
                    size="input-sm"
                    variant="light"
                    color="blue"
                    onClick={() => setOpenBanco(true)}
                    className="mb-[2px] bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30"
                  >
                    <IconPlus size={18} />
                  </ActionIcon>
                </Tooltip>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Moneda"
                data={selectMonedas}
                value={payload.moneda}
                onChange={(val) => handleChangeStr("moneda", val || "")}
                classNames={{
                  input: "bg-zinc-950 border-zinc-700 text-white",
                  label: "text-zinc-400 font-medium",
                }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Número de Cuenta"
                placeholder="Ej. 191-23132-..."
                value={payload.numero_cuenta || ""}
                onChange={(e) =>
                  handleChangeStr("numero_cuenta", e.target.value)
                }
                classNames={{
                  input: "bg-zinc-950 border-zinc-700 text-white font-mono",
                  label: "text-zinc-400 font-medium",
                }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="CCI (Código de Cuenta Interbancario)"
                placeholder="Opcional"
                value={payload.cci || ""}
                onChange={(e) => handleChangeStr("cci", e.target.value)}
                classNames={{
                  input: "bg-zinc-950 border-zinc-700 text-white font-mono",
                  label: "text-zinc-400 font-medium",
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                <Switch
                  label="Es cuenta de detracción"
                  color="yellow"
                  checked={payload.es_para_detraccion === 1}
                  onChange={(e) =>
                    handleToggleDetraccion(e.currentTarget.checked)
                  }
                  classNames={{ label: "text-zinc-300 font-medium" }}
                />
                {payload.es_para_detraccion === 1 && (
                  <Alert
                    variant="light"
                    color="yellow"
                    title="Atención"
                    icon={<IconInfoCircle size={16} />}
                    className="py-1 px-3 ml-auto text-xs"
                  >
                    Por lo general, esto solo aplica para Banco de la Nación
                    (Soles).
                  </Alert>
                )}
              </div>
            </Grid.Col>
          </Grid>

          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              loading={isSubmitting}
              leftSection={<IconPlus size={18} />}
              variant="gradient"
              gradient={{ from: "blue.7", to: "indigo.7", deg: 45 }}
            >
              Agregar Cuenta
            </Button>
          </div>
        </form>

        <RegistroBanco
          opened={openBanco}
          onClose={() => setOpenBanco(false)}
          onSuccess={onBancoAdded}
        />
      </div>
    );
  },
);

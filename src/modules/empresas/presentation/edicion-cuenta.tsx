import {
  Button,
  Group,
  Select,
  Stack,
  Switch,
  TextInput,
  Alert,
  Tooltip,
} from "@mantine/core";
import { IconDeviceFloppy, IconExclamationCircle } from "@tabler/icons-react";
import { Moneda } from "../../../shared/enums/_generic/moneda";
import { useEdicionCuenta } from "../hooks/useEdicionCuenta";
import { useEffect } from "react";
import type { RES_CuentaEmpresa } from "../../../service/responses/cuenta-empresa";

interface EdicionCuentaProps {
  hook: ReturnType<typeof useEdicionCuenta>;
  onCancel: () => void;
}

export const EdicionCuenta = ({ hook, onCancel }: EdicionCuentaProps) => {
  const {
    bancos,
    cargarBancos,
    idBanco,
    setIdBanco,
    moneda,
    setMoneda,
    numeroCuenta,
    setNumeroCuenta,
    cci,
    setCci,
    esParaDetraccion,
    setEsParaDetraccion,
    detraccionHabilitada,
    error,
    loading,
    handleGuardar,
    reset,
  } = hook;

  useEffect(() => {
    cargarBancos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium text-xs",
  };

  const bancosOptions = bancos.map((b) => ({
    value: String(b.id_banco),
    label: `${b.nombre}${b.es_nacional ? " (Nacional)" : ""}`,
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleGuardar();
      }}
      className="flex flex-col gap-6"
    >
      {error && (
        <Alert
          icon={<IconExclamationCircle size={16} />}
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
      )}

      <Stack gap="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Select
              label="Banco"
              placeholder="Seleccione un banco"
              withAsterisk
              required
              radius="lg"
              searchable
              disabled={loading}
              data={bancosOptions}
              value={idBanco}
              onChange={setIdBanco}
              classNames={inputClasses}
              comboboxProps={{ withinPortal: true }}
            />
          </div>
          <Select
            label="Moneda"
            withAsterisk
            required
            radius="lg"
            disabled={loading}
            data={Object.values(Moneda)}
            value={moneda}
            onChange={(val) => setMoneda(val as Moneda | null)}
            classNames={inputClasses}
            comboboxProps={{ withinPortal: true }}
          />
        </div>

        <div className="flex items-end gap-4">
          <TextInput
            className="flex-1"
            label="Número de Cuenta"
            placeholder="Ej. 1234567890"
            withAsterisk
            required
            maxLength={20}
            disabled={loading}
            radius="lg"
            classNames={inputClasses}
            value={numeroCuenta}
            onChange={(e) => {
              setNumeroCuenta(e.currentTarget.value.replace(/\D/g, ""));
              if (error) reset();
            }}
          />
          <Tooltip
            label={
              detraccionHabilitada
                ? "Marca si esta cuenta se usará para detracciones"
                : "Solo aplica para cuentas en Soles del Banco de la Nación"
            }
            withArrow
            position="top"
            multiline
            w={220}
          >
            <div className="pb-2">
              <Switch
                label="Detracción"
                checked={esParaDetraccion}
                onChange={(e) =>
                  setEsParaDetraccion(e.currentTarget.checked)
                }
                disabled={loading || !detraccionHabilitada}
                color="yellow"
                size="sm"
              />
            </div>
          </Tooltip>
        </div>

        <TextInput
          label="CCI (opcional)"
          placeholder="Ej. 00212345678901234567"
          maxLength={23}
          disabled={loading}
          radius="lg"
          classNames={inputClasses}
          value={cci}
          onChange={(e) => {
            setCci(e.currentTarget.value.replace(/\D/g, ""));
            if (error) reset();
          }}
        />
      </Stack>

      <Group justify="flex-end" gap="md" mt="xs">
        <Button
          variant="subtle"
          onClick={() => {
            reset();
            onCancel();
          }}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          radius="lg"
          size="sm"
          leftSection={<IconDeviceFloppy size={16} />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 border-0 px-8"
        >
          Guardar Cambios
        </Button>
      </Group>
    </form>
  );
};

export type { RES_CuentaEmpresa };
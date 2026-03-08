import {
  Badge,
  Button,
  Group,
  NumberInput,
  Stack,
  Text,
  Textarea,
  Paper,
} from "@mantine/core";
import { useState } from "react";
import {
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useLote } from "../../../services/lote/useLote";
import type { RES_Lote } from "../service/responses";

interface AjusteStockModalProps {
  lote: RES_Lote;
  onSuccess: (updatedLote: RES_Lote) => void;
  onCancel: () => void;
}

export const AjusteStockModal = ({
  lote,
  onSuccess,
  onCancel,
}: AjusteStockModalProps) => {
  const [nuevoStock, setNuevoStock] = useState<number | string>(
    lote.stock_actual,
  );
  const [nuevoStockBase, setNuevoStockBase] = useState<number | string>(
    lote.stock_actual_base,
  );
  const [motivo, setMotivo] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const [loading, setLoading] = useState(false);

  const { ajustarStock } = useLote({ setError: setErrorLocal });

  const factor = Number(lote.contenido_por_presentacion) || 1;

  // Sincronizar Nuevo Stock -> Nuevo Stock Base
  const handleStockChange = (val: number | string) => {
    setNuevoStock(val);
    if (typeof val === "number") {
      setNuevoStockBase(Number((val * factor).toFixed(2)));
      setErrorLocal("");
    }
  };

  // Sincronizar Nuevo Stock Base -> Nuevo Stock
  const handleStockBaseChange = (val: number | string) => {
    setNuevoStockBase(val);
    if (typeof val === "number") {
      setNuevoStock(Number((val / factor).toFixed(2)));
      setErrorLocal("");
    }
  };

  const isSame = Number(nuevoStockBase) === Number(lote.stock_actual_base);
  const diff = Number(nuevoStockBase) - Number(lote.stock_actual_base);

  const handleGuardar = async () => {
    if (isSame) {
      setErrorLocal(
        "El stock ingresado es idéntico al actual. No se requiere ajuste.",
      );
      return;
    }

    setLoading(true);
    const res = await ajustarStock({
      id_lote: lote.id_lote,
      nuevo_stock: Number(nuevoStock),
      nuevo_stock_base: Number(nuevoStockBase),
      motivo: motivo.trim() || undefined,
    });

    if (res) {
      onSuccess(res);
    }
    setLoading(false);
  };

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
    dropdown: "bg-zinc-900 border-zinc-800",
    option:
      "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <Stack gap="lg" className="p-1">
      {/* Header con Info del Lote */}
      <Paper
        withBorder
        p="md"
        radius="lg"
        bg="zinc.9/20"
        className="border-zinc-800"
      >
        <Group justify="space-between">
          <Text
            fw={800}
            size="md"
            className="text-zinc-100 uppercase tracking-tight"
          >
            {lote.producto}
          </Text>
          <Badge
            variant="light"
            color="violet"
            size="sm"
            radius="sm"
            className="font-bold border border-violet-500/20"
          >
            {lote.codigo_lote}
          </Badge>
        </Group>
      </Paper>

      {/* 1. Inputs de Cantidades (Grid Superior) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberInput
          label={`Stock de ${lote.unidad_medida}`}
          placeholder="0.00"
          decimalScale={2}
          min={0}
          value={nuevoStock}
          onChange={handleStockChange}
          radius="lg"
          classNames={inputClasses}
        />

        <NumberInput
          label={`Nuevo Stock Total (${lote.producto.split(" - ").pop()})`}
          placeholder="0.00"
          decimalScale={2}
          min={0}
          value={nuevoStockBase}
          onChange={handleStockBaseChange}
          radius="lg"
          classNames={inputClasses}
        />

        <NumberInput
          label={`Contenido por ${lote.unidad_medida}`}
          value={lote.contenido_por_presentacion}
          readOnly
          disabled
          radius="lg"
          classNames={inputClasses}
        />
      </div>

      {/* 2. Panel de Variación (Horizontal en el medio) */}
      <Paper
        withBorder
        p="sm"
        radius="lg"
        bg="zinc.9/10"
        className={`w-full transition-all duration-300 border-zinc-800 ${
          !isSame
            ? diff > 0
              ? "bg-teal-950/20 border-teal-500/30"
              : "bg-red-950/20 border-red-500/30"
            : ""
        }`}
      >
        <Group justify="center" gap="xl">
          <div
            className={`p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
              isSame
                ? "bg-zinc-800"
                : diff > 0
                  ? "bg-teal-500/10"
                  : "bg-red-500/10"
            }`}
          >
            {isSame ? (
              <CalculatorIcon className="w-5 h-5 text-zinc-600" />
            ) : diff > 0 ? (
              <CheckCircleIcon className="w-5 h-5 text-teal-500" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            )}
          </div>

          <div className="flex flex-col items-center">
            <Text
              size="10px"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest leading-none mb-1"
            >
              Variación
            </Text>
            <Group gap="xs" align="baseline">
              <Text
                size="lg"
                fw={800}
                color={isSame ? "zinc.5" : diff > 0 ? "teal" : "red"}
                className="leading-none"
              >
                {isSame
                  ? "0.00"
                  : diff > 0
                    ? `+${diff.toFixed(2)}`
                    : diff.toFixed(2)}
              </Text>
              <Text size="xs" c="zinc.4" fw={600} className="italic opacity-80">
                {lote.producto.split(" - ").pop()}
              </Text>
            </Group>
          </div>

          {!isSame && (
            <Badge
              variant="light"
              color={diff > 0 ? "teal" : "red"}
              size="sm"
              className="font-black px-4 py-3"
            >
              {diff > 0 ? "INGRESO" : "SALIDA"}
            </Badge>
          )}
        </Group>
      </Paper>

      {/* 3. Motivo (Full Width al fondo) */}
      <Textarea
        label="Motivo (Opc.)"
        placeholder="Ej: Error de digitación, merma por derrame, etc."
        minRows={3}
        value={motivo}
        onChange={(e) => setMotivo(e.currentTarget.value)}
        radius="lg"
        classNames={inputClasses}
      />

      {/* Avisos y Errores */}
      {isSame && (
        <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0" />
          <Text size="xs" c="amber.5" fw={600}>
            Aviso: No has realizado ningún cambio. Ingresa una cantidad
            diferente para aplicar el ajuste.
          </Text>
        </div>
      )}

      {errorLocal && (
        <Text color="red" size="xs" fw={700} ta="center" className="italic">
          {errorLocal}
        </Text>
      )}

      {/* Footer Buttons */}
      <Group
        justify="flex-end"
        mt="md"
        gap="md"
        className="pt-6 border-t border-zinc-800"
      >
        <Button
          variant="subtle"
          color="zinc"
          onClick={onCancel}
          radius="md"
          className="text-zinc-400 hover:text-white px-8 font-bold"
        >
          Cancelar
        </Button>
        <Button
          color="indigo"
          radius="lg"
          className="px-10 font-bold shadow-lg"
          onClick={handleGuardar}
          loading={loading}
          disabled={isSame || loading}
        >
          Confirmar Ajuste
        </Button>
      </Group>
    </Stack>
  );
};

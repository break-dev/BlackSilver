import { Loader, Stack, Text } from "@mantine/core";
import { useRegistrarEntregaBatch } from "../../hooks/useRegistrarEntrega";
import type {
  RES_DetalleRequerimiento,
  DetalleRequerimientoExtendido,
} from "../../service/atencion.responses";
import { ReceptorInfo, ProductoEntregaCard, FormActions } from "./components";

interface RegistrarEntregaProps {
  idRequerimiento: number;
  idAlmacen: number;
  selectedItemsIds: number[];
  detallesRequerimiento: RES_DetalleRequerimiento[];
  idEmpleadoSolicitante: number;
  onSuccess: (entregados: Record<number, number>) => void;
  onCancel: () => void;
}

export const RegistrarEntrega = ({
  idRequerimiento,
  idAlmacen,
  selectedItemsIds,
  detallesRequerimiento,
  idEmpleadoSolicitante,
  onSuccess,
  onCancel,
}: RegistrarEntregaProps) => {
  const {
    loading,
    selectedDetalles,
    lotesPorProducto,
    entregaCantidades,
    empleados,
    idEmpleadoRecibe,
    setIdEmpleadoRecibe,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    error,
    isProcessing,
    totalEntregaGeneralBase,
    handleCantChange,
    handleCantLoteChange,
    handleConfirmar,
  } = useRegistrarEntregaBatch({
    idRequerimiento,
    idAlmacen,
    selectedItemsIds,
    detallesRequerimiento,
    idEmpleadoSolicitante,
    onSuccess: (entregados) => {
      onSuccess(entregados);
    },
  });

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );

  if (selectedDetalles.length === 0)
    return <Text c="red">No hay ítems seleccionados o válidos.</Text>;

  // Grouping logic for products
  const groupedByProduct: Record<
    number,
    {
      name: string;
      stock_minimo: number;
      stock_disponible: number;
      unidad_medida_base_abv: string;
      details: DetalleRequerimientoExtendido[];
    }
  > = {};

  selectedDetalles.forEach((d) => {
    if (!groupedByProduct[d.id_producto]) {
      groupedByProduct[d.id_producto] = {
        name: d.producto,
        stock_minimo: d.stock_minimo,
        stock_disponible: d.stock_disponible,
        unidad_medida_base_abv: d.unidad_medida_base_abv,
        details: [],
      };
    }
    groupedByProduct[d.id_producto].details.push(d);
  });

  return (
    <Stack gap="lg" className="font-sans">
      <ReceptorInfo
        empleados={empleados}
        idEmpleadoRecibe={idEmpleadoRecibe}
        setIdEmpleadoRecibe={setIdEmpleadoRecibe}
        observacion={observacion}
        setObservacion={setObservacion}
        evidencias={evidencias}
        setEvidencias={setEvidencias}
      />

      <Stack gap="xl">
        {Object.entries(groupedByProduct).map(([id_prod, group]) => (
          <ProductoEntregaCard
            key={id_prod}
            idProducto={Number(id_prod)}
            group={group}
            lotesPorProducto={lotesPorProducto}
            entregaCantidades={entregaCantidades}
            handleCantChange={handleCantChange}
            handleCantLoteChange={handleCantLoteChange}
          />
        ))}
      </Stack>

      <FormActions
        onCancel={onCancel}
        handleConfirmar={handleConfirmar}
        isProcessing={isProcessing}
        canSave={!!idEmpleadoRecibe && totalEntregaGeneralBase > 0}
      />

      {error && (
        <Text
          c="red"
          size="xs"
          ta="center"
          fw={800}
          className="italic bg-red-950/10 py-3 rounded-2xl border border-red-900/30 font-mono tracking-wide"
        >
          {error}
        </Text>
      )}
    </Stack>
  );
};

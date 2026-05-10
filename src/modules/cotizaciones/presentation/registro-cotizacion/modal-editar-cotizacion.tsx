import { Group, Button } from "@mantine/core";
import { useEditarCotizacion } from "../../hooks/registro-cotizacion/useEditarCotizacion";
import { ComparativoTabla } from "./components/comparativo-tabla/comparativo-tabla";
import type {
  RES_Cotizacion,
  RES_Comparativo,
} from "../../../../service/responses/cotizaciones/cotizacion";

interface ModalEditarCotizacionProps {
  cotizacion: RES_Cotizacion;
  onSuccess: (data: RES_Comparativo[]) => void;
  onCancel: () => void;
}

export const ModalEditarCotizacion = ({
  cotizacion,
  onSuccess,
  onCancel,
}: ModalEditarCotizacionProps) => {
  const {
    productos,
    cotizaciones,
    loading,
    loadingMaestros,
    updateCotizacionHeader,
    updateCotizacionDetail,
    toggleCotizacionNoCotiza,
    handleSave,
    maestros,
    updateGlobalLogistica,
    copySource,
    iniciarCopia,
    cancelarCopia,
    pegarCopia,
  } = useEditarCotizacion(cotizacion, onSuccess);

  const productosEnriquecidos = productos.map((p, idx) => {
    const maestro = maestros.catalogo.find(
      (m) => m.id_producto === p.id_producto,
    );
    const originalDet = cotizacion.detalles[idx];

    return {
      ...p,
      nombre:
        maestro?.nombre || originalDet?.producto || "Producto desconocido",
      codigo: "",
      id_unidad_medida_base:
        maestro?.id_unidad_medida_base ||
        originalDet?.id_unidad_medida_base ||
        0,
      unidad_medida_base:
        maestro?.unidad_medida_base ||
        originalDet?.unidad_medida_base ||
        "unidades",
      unidad_medida_abreviatura:
        maestro?.unidad_medida_base_abv ||
        originalDet?.unidad_medida_base_abv ||
        "UND",
    };
  });

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden">
      <div className="flex-1 min-h-0 pr-1">
        <ComparativoTabla
          productos={productosEnriquecidos}
          cotizaciones={cotizaciones}
          unidadesMedida={maestros.unidades.map((u) => ({
            value: String(u.id_unidad_medida),
            label: u.nombre,
            abreviatura: u.abreviatura,
          }))}
          almacenes={maestros.almacenes}
          proveedores={maestros.proveedores}
          empresas={maestros.empresas}
          loadingProveedores={loadingMaestros}
          onUpdateHeader={updateCotizacionHeader}
          onUpdateDetail={updateCotizacionDetail}
          onToggleNoCotiza={toggleCotizacionNoCotiza}
          onRemoveCotizacion={() => {}} // Deshabilitado en edición individual
          onDuplicarFila={() => {}} // Deshabilitado en edición individual
          onEliminarFila={() => {}} // Deshabilitado en edición individual
          onUpdateGlobalLogistica={updateGlobalLogistica}
          copySource={copySource}
          onIniciarCopia={iniciarCopia}
          onCancelarCopia={cancelarCopia}
          onPegarCopia={pegarCopia}
          isReadOnlyRows={true} // Nueva prop para bloquear manipulación de filas
          isSingleMode={true} // Nueva prop para ocultar botón de eliminar cotización
        />
      </div>

      <div className="pt-2 flex-none bg-zinc-950">
        <Group justify="flex-end" gap="md">
          <Button
            variant="subtle"
            onClick={onCancel}
            disabled={loading}
            radius="xl"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            loading={loading}
            onClick={handleSave}
            radius="xl"
            size="sm"
            className="bg-amber-500 text-zinc-950 font-extrabold hover:bg-amber-400 shadow-lg border-0 px-8"
          >
            Guardar Cambios
          </Button>
        </Group>
      </div>
    </div>
  );
};

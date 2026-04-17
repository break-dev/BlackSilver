import { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Button,
  Group,
  Checkbox,
  Select,
  Badge,
  Stepper,
} from "@mantine/core";
import { CheckBadgeIcon, DocumentCheckIcon } from "@heroicons/react/24/solid";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import type {
  DTO_RegistrarComparativo,
  DTO_CotizacionRequest,
} from "../../service/cotizaciones.requests";
import { CotizacionesService } from "../../service/cotizaciones.service";
import { useNotify } from "../../../../hooks/useNotify";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { usePrint } from "../../../../hooks/usePrint";
import { CotizacionPDF } from "../cotizacion-pdf";
import { Estado_Cotizacion, Estado_Cotizacion_Detalle } from "../../../../shared/enums/cotizacion/cotizacion";
import type { RES_Cotizacion, RES_CotizacionDetalle, RES_MaestroEmpresa } from "../../service/cotizaciones.responses";

// Tipos para el estado local del Wizard
interface WizardAprobacionState {
  originalIndex: number;
  cotizacion: DTO_CotizacionRequest;
  selectedEmpresaId: string | null;
  selectedDetalles: number[]; // IDs de productos
}

interface ModalAsistenteAprobacionProps {
  opened: boolean;
  onClose: () => void;
  // Todo el formulario original (para registrar la base primero)
  payloadOriginal: DTO_RegistrarComparativo | null;
  // Lista de todas las cotizaciones con sus índices para mapearlas al Wizard
  todasLasCotizaciones: DTO_CotizacionRequest[];
  // Todos los maestros para resolver nombres
  maestros: {
    proveedores: import("../../service/cotizaciones.responses").RES_MaestroProveedor[];
    catalogo: import("../../service/cotizaciones.responses").RES_MaestroProducto[];
    unidades: import("../../service/cotizaciones.responses").RES_MaestroUnidadMedida[];
    empresas: import("../../service/cotizaciones.responses").RES_MaestroEmpresa[];
  };
  onSuccessCompleto: () => Promise<void> | void;
}

export const ModalAsistenteAprobacion = ({
  opened,
  onClose,
  payloadOriginal,
  todasLasCotizaciones,
  maestros,
  onSuccessCompleto,
}: ModalAsistenteAprobacionProps) => {
  const { notifySuccess, notifyError } = useNotify();
  const { print } = usePrint();
  const [wizardSteps, setWizardSteps] = useState<WizardAprobacionState[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Inicializar Wizard basándose en las cotizaciones que llegaron marcadas como Aprobada
  useEffect(() => {
    if (opened && todasLasCotizaciones.length > 0) {
      const steps: WizardAprobacionState[] = [];
      todasLasCotizaciones.forEach((cot, index) => {
        if (cot.estado === "Aprobada") {
          steps.push({
            originalIndex: index,
            cotizacion: cot,
            selectedEmpresaId:
              cot.empresas_ids.length > 0
                ? cot.empresas_ids[0].toString()
                : null,
            // Preseleccionar todos los habilitados
            selectedDetalles: cot.detalles
              .filter((d) => !d.no_cotiza)
              .map((d) => d.id_producto),
          });
        }
      });
      setWizardSteps(steps);
      setActiveStep(0);
    }
  }, [opened, todasLasCotizaciones]);

  if (!opened || !payloadOriginal) return null;

  const handleNext = () => {
    // Validar el step actual
    const current = wizardSteps[activeStep];
    if (!current.selectedEmpresaId) {
      notifyError("Debe seleccionar una empresa facturadora.");
      return;
    }
    if (current.selectedDetalles.length === 0) {
      notifyError("Debe seleccionar al menos un producto.");
      return;
    }
    setActiveStep((curr) => curr + 1);
  };

  const handlePrev = () => setActiveStep((curr) => curr - 1);

  // Manejar edición local
  const updateCurrentStep = (
    updater: (prev: WizardAprobacionState) => WizardAprobacionState,
  ) => {
    setWizardSteps((prev) => {
      const copy = [...prev];
      copy[activeStep] = updater(copy[activeStep]);
      return copy;
    });
  };

  const toggleDetalle = (idProducto: number) => {
    updateCurrentStep((prev) => ({
      ...prev,
      selectedDetalles: prev.selectedDetalles.includes(idProducto)
        ? prev.selectedDetalles.filter((id) => id !== idProducto)
        : [...prev.selectedDetalles, idProducto],
    }));
  };

  const currentStepData = wizardSteps[activeStep] || null;
  const proveedor = currentStepData
    ? maestros.proveedores.find(
        (p) => p.id_proveedor === currentStepData.cotizacion.id_proveedor,
      )
    : null;

  // Lista de empresas para el select basadas en los IDs configurados
  const empresasDisponibles = currentStepData
    ? maestros.empresas.filter((e) =>
        currentStepData.cotizacion.empresas_ids.includes(e.id_empresa),
      )
    : [];

  const handleFinalSubmit = async () => {
    // Validar el ultimo step
    const current = wizardSteps[activeStep];
    if (!current.selectedEmpresaId) {
      notifyError("Debe seleccionar una empresa facturadora.");
      return;
    }
    if (current.selectedDetalles.length === 0) {
      notifyError("Debe seleccionar al menos un producto.");
      return;
    }

    // 1. Preparar Payload Ficticio: Convertir TODAS a Generada.
    // El backend se encarga de registrarlas formalmente listas para su futura aprobacion
    const payloadRegistrar: DTO_RegistrarComparativo = {
      ...payloadOriginal,
      cotizaciones: payloadOriginal.cotizaciones.map((c) => ({
        ...c,
        estado:
          "Generada" as import("../../../../shared/enums/cotizacion/cotizacion").Estado_Cotizacion,
      })),
    };

    setLoading(true);

    try {
      // 2. Disparar registro
      const respBase =
        await CotizacionesService.registrar_comparativo(payloadRegistrar);
      if (!respBase.success) {
        notifyError(respBase.message || "Error al registrar el comparativo.");
        setLoading(false);
        return;
      }

      // 3. Obtener el mapeo de IDs (Backend debe darnos cotizaciones_ids)
      const creadas = respBase.data.cotizaciones_ids || [];

      // 4. Procesar Aprobaciones Secuencialmente
      for (let i = 0; i < wizardSteps.length; i++) {
        const step = wizardSteps[i];
        // Buscar el id_cotizacion real que corresponde a esta cotizacion original
        const dataCreada = creadas.find((c) => c.index === step.originalIndex);
        if (!dataCreada) continue;

        const mapDetalles = dataCreada.detalles_map || [];
        const idsDetallesAprobadosBD = step.selectedDetalles
          .map(
            (idProd) =>
              mapDetalles.find((m) => m.id_producto === idProd)?.id_cot_det,
          )
          .filter((id): id is number => id !== undefined);

        // Mandar el POST a aprobar_cotizacion_parcial
        const resAprob = await CotizacionesService.aprobar_cotizacion(
          dataCreada.id,
          {
            id_empresa_compradora: Number(step.selectedEmpresaId),
            detalles_aprobados: idsDetallesAprobadosBD,
          },
        );

        if (!resAprob.success) {
          notifyError(
            `Fallo al aprobar orden para proveedor ${proveedor?.razon_social}`,
          );
        }
      }

      // --- AUTO-PRINT: FORMATO COTIZACIÓN (Todas las registradas) ---
      const cotizacionesPDFData = payloadRegistrar.cotizaciones.map((c, idx) => {
        const dataCreada = creadas.find((rc: { index: number; id: number; correlativo: string }) => rc.index === idx);
        const nombresEmpresas = (c.empresas_ids || []).map((id: number) => 
          (maestros?.empresas || []).find((e: RES_MaestroEmpresa) => e.id_empresa === id)?.razon_social || "---"
        );
        const cotRes: RES_Cotizacion = {
          id: dataCreada?.id || 0,
          correlativo: dataCreada?.correlativo || "---",
          numero_correlativo: 0,
          id_proveedor: c.id_proveedor,
          proveedor_nombre: maestros.proveedores.find(p => p.id_proveedor === c.id_proveedor)?.razon_social || "Desconocido",
          id_comparativo: respBase.data.id_comparativo,
          comparativo_fecha: new Date().toISOString(),
          moneda: c.moneda,
          metodo_pago: c.metodo_pago,
          fecha_vencimiento_pago: c.fecha_vencimiento_pago ?? null,
          total_antes_igv: c.total_antes_igv,
          incluye_igv: c.incluye_igv,
          porcentaje_igv: c.porcentaje_igv,
          monto_igv: c.monto_igv,
          total_despues_igv: c.total_despues_igv,
          observacion: c.observacion ?? null,
          estado: Estado_Cotizacion.Generada,
          evidencias: null,
          fecha_hora_cotizacion: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        const detallesRes: RES_CotizacionDetalle[] = c.detalles.map(d => {
           const maestro = maestros.catalogo.find(m => m.id_producto === d.id_producto);
           const uni = maestros.unidades.find(u => u.id_unidad_medida === d.id_unidad_medida);
           return {
              id: 0,
              id_cotizacion: cotRes.id,
              id_producto: d.id_producto,
              id_comparativo_detalle: 0,
              producto_nombre: maestro?.nombre || "---",
              cantidad: d.cantidad,
              id_unidad_medida: d.id_unidad_medida,
              unidad_medida_nombre: uni?.nombre || "---",
              unidad_medida_abv: uni?.abreviatura || "---",
              unidad_medida_base_abv: uni?.abreviatura || "---",
              contenido_por_presentacion: d.contenido_por_presentacion,
              cantidad_base: d.cantidad_base,
              precio_unitario: d.precio_unitario,
              precio_unitario_base: d.precio_unitario_base,
              no_cotiza: 0,
              comentario: d.comentario ?? null,
              estado: Estado_Cotizacion_Detalle.Pendiente
           } as unknown as RES_CotizacionDetalle;
        });
        return { cotizacion: cotRes, detalles: detallesRes, empresas: nombresEmpresas };
      });

      if (cotizacionesPDFData.length > 0) {
        print(<CotizacionPDF cotizaciones={cotizacionesPDFData} />, {
          documentTitle: "Cotizaciones Consolidadas",
        });
      }

      // --- TODO: AUTO-PRINT: ORDEN DE COMPRA (Solo las aprobadas) ---
      // Se abrirá en una pestaña separada cuando el formato esté listo.

      notifySuccess("Registro y Aprobación completados correctamente.");
      onSuccessCompleto();
      onClose();
    } catch (e) {
      console.error(e);
      notifyError("Ocurrió un error general en el Asistente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalEstandar
      opened={opened}
      close={onClose}
      onClose={onClose}
      title="Asistente de Aprobación"
      size="xl"
    >
      {wizardSteps.length === 0 ? (
        <Stack align="center" py="xl">
          <Text c="dimmed">
            Cargando asistente o no hay cotizaciones aprobadas...
          </Text>
        </Stack>
      ) : (
        <div className="flex flex-col h-[70vh]">
          {/* Header con el Stepper */}
          <div className="flex-none p-4 bg-zinc-900 border-b border-zinc-800">
            <Stepper
              active={activeStep}
              onStepClick={setActiveStep}
              size="sm"
              iconSize={24}
              color="green"
              allowNextStepsSelect={false}
            >
              {wizardSteps.map((step, idx) => {
                const prov = maestros.proveedores.find(
                  (p) => p.id_proveedor === step.cotizacion.id_proveedor,
                );
                return (
                  <Stepper.Step
                    key={`step-${idx}`}
                    label={`Cotización #${idx + 1}`}
                    description={prov?.razon_social || "Desconocido"}
                  />
                );
              })}
            </Stepper>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <DocumentCheckIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <Text
                  size="sm"
                  fw={800}
                  className="text-indigo-100 uppercase tracking-widest"
                >
                  Generación de Orden de Compra
                </Text>
                <Text size="xs" className="text-zinc-400">
                  Seleccione la empresa compradora y verifique los productos que desea incluir en esta compra.
                </Text>
              </div>
            </div>

            {/* Seleccion de Empresa */}
            <Stack gap={4}>
              <Text size="sm" fw={800} className="text-zinc-200">
                Empresa Compradora
              </Text>
              <Select
                placeholder="Seleccione la empresa para la factura"
                data={empresasDisponibles.map((e) => ({
                  value: e.id_empresa.toString(),
                  label: e.razon_social,
                }))}
                value={currentStepData?.selectedEmpresaId || null}
                onChange={(val) =>
                  updateCurrentStep((p) => ({ ...p, selectedEmpresaId: val }))
                }
                classNames={{
                  input:
                    "bg-zinc-900 border-zinc-800 text-white focus:border-indigo-500",
                  dropdown: "bg-zinc-900 border-zinc-800 dark",
                  option: "hover:bg-indigo-500/20 data-[checked]:bg-indigo-500",
                }}
              />
            </Stack>

            {/* Selección de Productos */}
            {(() => {
              const detallesCotizables =
                currentStepData?.cotizacion.detalles
                  .filter((d) => !d.no_cotiza)
                  .map((d) => d.id_producto) || [];
              const numSelected = currentStepData?.selectedDetalles.length || 0;
              const allSelected =
                detallesCotizables.length > 0 &&
                numSelected === detallesCotizables.length;
              const indeterminate =
                numSelected > 0 && numSelected < detallesCotizables.length;

              return (
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Text size="sm" fw={800} className="text-zinc-200">
                      Productos a Adquirir
                    </Text>
                    <Checkbox
                      size="sm"
                      color="indigo"
                      checked={allSelected}
                      indeterminate={indeterminate}
                      label={
                        <Text size="xs" c="dimmed" fw={700}>
                          Seleccionar Todos
                        </Text>
                      }
                      onChange={() => {
                        updateCurrentStep((prev) => ({
                          ...prev,
                          selectedDetalles: allSelected
                            ? []
                            : detallesCotizables,
                        }));
                      }}
                      classNames={{ label: "cursor-pointer" }}
                    />
                  </Group>
                  <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden max-h-[30vh] overflow-y-auto custom-scrollbar">
                    {currentStepData?.cotizacion.detalles
                      .filter((d) => !d.no_cotiza)
                      .map((det) => {
                        const prodMaestro = maestros.catalogo.find(
                          (p) => p.id_producto === det.id_producto,
                        );
                        const isChecked =
                          currentStepData.selectedDetalles.includes(
                            det.id_producto,
                          );
                        const subtotal =
                          Number(det.cantidad) * Number(det.precio_unitario);

                        return (
                          <div
                            key={det.id_producto}
                            className={`p-3 border-b border-zinc-800/50 transition-colors last:border-b-0 cursor-pointer ${
                              isChecked
                                ? "bg-indigo-500/5"
                                : "hover:bg-white/5 opacity-80 hover:opacity-100"
                            }`}
                            onClick={() => toggleDetalle(det.id_producto)}
                          >
                            <Group wrap="nowrap" justify="space-between">
                              <Group gap="sm">
                                <Checkbox
                                  size="sm"
                                  checked={isChecked}
                                  onChange={() =>
                                    toggleDetalle(det.id_producto)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  color="indigo"
                                  radius="sm"
                                />
                                <Stack gap={0}>
                                  <Text
                                    size="xs"
                                    fw={800}
                                    className={
                                      isChecked
                                        ? "text-indigo-100"
                                        : "text-zinc-300"
                                    }
                                  >
                                    {prodMaestro?.nombre ||
                                      `Producto ${det.id_producto}`}
                                  </Text>
                                  <Text size="11px" c="dimmed">
                                    {formatNumber(det.cantidad)} unidades a S/.{" "}
                                    {formatNumber(Number(det.precio_unitario))}{" "}
                                    c/u
                                  </Text>
                                </Stack>
                              </Group>
                              <Badge
                                variant="light"
                                color={isChecked ? "indigo" : "gray"}
                                size="sm"
                              >
                                Sub: S/. {formatNumber(subtotal)}
                              </Badge>
                            </Group>
                          </div>
                        );
                      })}
                  </div>
                </Stack>
              );
            })()}

            <Group justify="space-between" mt="md">
              <Button
                variant="subtle"
                color="zinc"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar Registro
              </Button>

              <Group gap="sm">
                {activeStep > 0 && (
                  <Button
                    variant="outline"
                    color="indigo"
                    onClick={handlePrev}
                    disabled={loading}
                  >
                    Atrás
                  </Button>
                )}

                {activeStep < wizardSteps.length - 1 ? (
                  <Button variant="filled" color="indigo" onClick={handleNext}>
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    variant="filled"
                    color="green"
                    leftSection={<CheckBadgeIcon className="w-4 h-4" />}
                    onClick={handleFinalSubmit}
                    loading={loading}
                    className="shadow-lg shadow-green-900/20"
                  >
                    Finalizar Registro y Órdenes
                  </Button>
                )}
              </Group>
            </Group>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}</style>
    </ModalEstandar>
  );
};

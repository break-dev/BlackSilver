import { useState } from "react";
import {
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Table,
  Badge,
  ActionIcon,
  Tooltip,
  SegmentedControl,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import type { DateValue } from "@mantine/dates";
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useRegistrarMantenimiento } from "../hooks/useRegistrarMantenimiento";
import { FormPersonalExterno } from "./form-personal-externo";
import { MultiFilePicker } from "../../../presentation/utils/archivo/multifile-picker";
import { formatNumber } from "../../../shared/functions/formatNumber";

interface RegistroMantenimientoProps {
  initialActivoId?: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RegistroMantenimiento = ({
  initialActivoId,
  onSuccess,
  onCancel,
}: RegistroMantenimientoProps) => {
  const {
    state: {
      activos,
      minas,
      almacenes,
      empleados,
      proveedores,
      personalExterno,
      idActivoFijo,
      setIdActivoFijo,
      tipoLugar,
      setTipoLugar,
      idMina,
      setIdMina,
      idAlmacen,
      setIdAlmacen,
      lugarOtro,
      setLugarOtro,
      tipoEjecutor,
      setTipoEjecutor,
      idEmpleadoEjecutor,
      setIdEmpleadoEjecutor,
      idProveedor,
      setIdProveedor,
      idPersonalExterno,
      setIdPersonalExterno,
      idEmpleadoSupervisor,
      setIdEmpleadoSupervisor,
      fechaHoraMantenimiento,
      setFechaHoraMantenimiento,
      observacion,
      setObservacion,
      serieFactura,
      setSerieFactura,
      numeroFactura,
      setNumeroFactura,
      costoManoObra,
      setCostoManoObra,
      otrosGastos,
      productosConsumidos,
      evidencias,
      setEvidencias,
    },
    status: {
      loadingCatalogs,
      loadingPersonal,
      loadingDespachados,
      submitting,
    },
    actions: {
      agregarGasto,
      eliminarGasto,
      actualizarGasto,
      actualizarCantidadProducto,
      actualizarComentarioProducto,
      handleConfirmarPersonalExterno,
      handleSubmit,
    },
  } = useRegistrarMantenimiento({ initialActivoId, onSuccess });

  const [personalExternoModalOpen, setPersonalExternoModalOpen] = useState(false);

  const inputClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl ",
    option:
      "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
    label: "text-zinc-300 mb-1 font-semibold text-xs ml-0.5",
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in text-zinc-200">
      <Stack gap={28}>
        {/* Section: Activo Fijo */}
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 shadow-inner">
          <Group gap="md" align="flex-end" className="w-full">
            <div className="flex-1">
              <Select
                label="Activo Fijo a Mantener"
                placeholder={loadingCatalogs ? "Cargando activos..." : "Seleccione maquinaria o activo..."}
                data={activos.map((a) => ({
                  value: String(a.id_activo),
                  label: `${a.correlativo} - ${a.producto}`,
                }))}
                value={idActivoFijo ? String(idActivoFijo) : null}
                onChange={(val) => setIdActivoFijo(val ? Number(val) : null)}
                searchable
                required
                classNames={inputClasses}
                radius="lg"
              />
            </div>
            <DateTimePicker
              label="Fecha y Hora de Mantenimiento"
              placeholder="Seleccione fecha y hora..."
              value={fechaHoraMantenimiento}
              onChange={(val: DateValue) => setFechaHoraMantenimiento(val ? new Date(val) : null)}
              required
              maxDate={new Date()}
              classNames={inputClasses}
              radius="lg"
              className="w-64"
            />
          </Group>
        </div>

        {/* Grid: Lugar de Trabajo & Ejecución */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box: Lugar de Trabajo */}
          <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
            <Text size="sm" fw={800} className="text-zinc-300 uppercase tracking-wider">
              Lugar de Trabajo
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Tipo de Lugar"
                placeholder="Seleccione..."
                data={[
                  { value: "almacen", label: "Almacén" },
                  { value: "mina", label: "Mina" },
                  { value: "otro", label: "Otro Lugar" },
                ]}
                value={tipoLugar}
                onChange={(val) => {
                  setTipoLugar((val as "almacen" | "mina" | "otro" | null) || "");
                  setIdMina(null);
                  setIdAlmacen(null);
                  setLugarOtro("");
                }}
                classNames={inputClasses}
                radius="md"
              />

              {tipoLugar === "almacen" && (
                <Select
                  label="Seleccione Almacén"
                  placeholder="Buscar almacén..."
                  data={almacenes.map((a) => ({
                    value: String(a.id_almacen),
                    label: a.nombre,
                  }))}
                  value={idAlmacen ? String(idAlmacen) : null}
                  onChange={(val) => setIdAlmacen(val ? Number(val) : null)}
                  required
                  searchable
                  classNames={inputClasses}
                  radius="md"
                  className="animate-fade-in"
                />
              )}

              {tipoLugar === "mina" && (
                <Select
                  label="Seleccione Mina"
                  placeholder="Buscar mina..."
                  data={minas.map((m) => ({
                    value: String(m.id_mina),
                    label: m.nombre,
                  }))}
                  value={idMina ? String(idMina) : null}
                  onChange={(val) => setIdMina(val ? Number(val) : null)}
                  required
                  searchable
                  classNames={inputClasses}
                  radius="md"
                  className="animate-fade-in"
                />
              )}

              {tipoLugar === "otro" && (
                <TextInput
                  label="Especifique Lugar"
                  placeholder="Describa el lugar..."
                  value={lugarOtro}
                  onChange={(e) => setLugarOtro(e.currentTarget.value)}
                  required
                  classNames={inputClasses}
                  radius="md"
                  className="animate-fade-in"
                />
              )}
            </div>
          </div>

          {/* Box: Ejecución del Mantenimiento */}
          <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
            <Group justify="space-between" align="center">
              <Text size="sm" fw={800} className="text-zinc-300 uppercase tracking-wider">
                Ejecutado por
              </Text>
              <SegmentedControl
                value={tipoEjecutor}
                onChange={(val) => setTipoEjecutor(val as "interno" | "externo")}
                data={[
                  { label: "Personal Interno", value: "interno" },
                  { label: "Proveedor Externo", value: "externo" },
                ]}
                radius="md"
                classNames={{
                  root: "bg-zinc-950/80 border border-zinc-800 p-0.5",
                  indicator: "bg-indigo-600",
                  control: "text-zinc-300 data-[active]:text-white font-semibold text-xs",
                }}
              />
            </Group>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipoEjecutor === "interno" ? (
                <Select
                  label="Ejecutor (Empleado)"
                  placeholder="Seleccione empleado..."
                  data={empleados.map((e) => ({
                    value: String(e.id_empleado),
                    label: e.nombre_completo,
                  }))}
                  value={idEmpleadoEjecutor ? String(idEmpleadoEjecutor) : null}
                  onChange={(val) => setIdEmpleadoEjecutor(val ? Number(val) : null)}
                  required
                  searchable
                  classNames={inputClasses}
                  radius="md"
                />
              ) : (
                <>
                  <Select
                    label="Proveedor Externo"
                    placeholder="Seleccione proveedor..."
                    data={proveedores.map((p) => ({
                      value: String(p.id_proveedor),
                      label: p.razon_social,
                    }))}
                    value={idProveedor ? String(idProveedor) : null}
                    onChange={(val) => setIdProveedor(val ? Number(val) : null)}
                    required
                    searchable
                    classNames={inputClasses}
                    radius="md"
                  />
                  <Group gap="xs" align="flex-end" className="w-full">
                    <div className="flex-1">
                      <Select
                        label="Personal del Proveedor"
                        placeholder={
                          !idProveedor
                            ? "Seleccione proveedor primero"
                            : loadingPersonal
                              ? "Cargando..."
                              : personalExterno.length > 0
                                ? "Seleccione ejecutor..."
                                : "Sin personal registrado"
                        }
                        data={personalExterno.map((pe) => ({
                          value: String(pe.id_personal),
                          label: pe.nombre_completo,
                        }))}
                        value={idPersonalExterno ? String(idPersonalExterno) : null}
                        onChange={(val) => setIdPersonalExterno(val ? Number(val) : null)}
                        disabled={!idProveedor || loadingPersonal}
                        required
                        searchable
                        classNames={inputClasses}
                        radius="md"
                      />
                    </div>
                    <Tooltip label="Registrar Personal Externo" withArrow radius="md">
                      <ActionIcon
                        color="indigo"
                        variant="filled"
                        size="36px"
                        radius="md"
                        disabled={!idProveedor}
                        onClick={() => setPersonalExternoModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </>
              )}

              <Select
                label="Supervisor del Mantenimiento"
                placeholder="Seleccione supervisor..."
                data={empleados.map((e) => ({
                  value: String(e.id_empleado),
                  label: e.nombre_completo,
                }))}
                value={idEmpleadoSupervisor ? String(idEmpleadoSupervisor) : null}
                onChange={(val) => setIdEmpleadoSupervisor(val ? Number(val) : null)}
                searchable
                classNames={inputClasses}
                radius="md"
              />
            </div>
          </div>
        </div>

        {/* Grid: Facturación e Insumos Consumidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata Factura */}
          <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
            <Text size="sm" fw={800} className="text-zinc-300 uppercase tracking-wider">
              Datos de Factura / Costos
            </Text>
            <Stack gap="md">
              <Group gap="xs" grow>
                <TextInput
                  label="Serie Factura"
                  placeholder="F001"
                  value={serieFactura}
                  onChange={(e) => setSerieFactura(e.currentTarget.value)}
                  classNames={inputClasses}
                  radius="md"
                />
                <TextInput
                  label="Número Factura"
                  placeholder="000123"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.currentTarget.value)}
                  classNames={inputClasses}
                  radius="md"
                />
              </Group>
              <NumberInput
                label="Costo de Mano de Obra"
                placeholder="0.00"
                value={costoManoObra}
                onChange={(val) => setCostoManoObra(val)}
                min={0}
                classNames={inputClasses}
                radius="md"
              />
            </Stack>
          </div>

          {/* Otros Gastos Dinámicos */}
          <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
            <Group justify="space-between" align="center">
              <Text size="sm" fw={800} className="text-zinc-300 uppercase tracking-wider">
                Otros Gastos Adicionales
              </Text>
              <Button
                size="xs"
                variant="light"
                color="indigo"
                radius="md"
                leftSection={<PlusIcon className="w-3.5 h-3.5" />}
                onClick={agregarGasto}
                className="font-bold border border-indigo-500/10"
              >
                Agregar Gasto
              </Button>
            </Group>

            <Stack gap="xs" className="max-h-52 overflow-y-auto pr-1">
              {otrosGastos.length === 0 ? (
                <Text size="xs" c="dimmed" className="italic py-3 text-center">
                  Sin gastos adicionales declarados.
                </Text>
              ) : (
                otrosGastos.map((g, idx) => (
                  <Group key={idx} gap="xs" wrap="nowrap" className="animate-fade-in">
                    <TextInput
                      placeholder="Concepto (Ej: Repuestos, lubricantes adicionales)"
                      value={g.concepto}
                      onChange={(e) => actualizarGasto(idx, "concepto", e.currentTarget.value)}
                      required
                      className="flex-1"
                      classNames={inputClasses}
                      radius="md"
                    />
                    <NumberInput
                      placeholder="Costo"
                      value={g.costo}
                      onChange={(val) => actualizarGasto(idx, "costo", Number(val))}
                      required
                      min={0}
                      className="w-32"
                      classNames={inputClasses}
                      radius="md"
                    />
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => eliminarGasto(idx)}
                      radius="md"
                      size="lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </ActionIcon>
                  </Group>
                ))
              )}
            </Stack>
          </div>
        </div>

        {/* Section: Productos Despachados para Mantenimiento */}
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
          <Text size="sm" fw={800} className="text-zinc-300 uppercase tracking-wider">
            Declaración de Consumos de Materiales / Insumos
          </Text>
          {loadingDespachados ? (
            <Text size="xs" c="dimmed" className="italic text-center py-6">
              Cargando productos despachados...
            </Text>
          ) : productosConsumidos.length === 0 ? (
            <Text size="xs" c="dimmed" className="italic text-center py-6">
              Este equipo no tiene materiales entregados pendientes por consumir para mantenimiento.
            </Text>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <Table variant="unstyled" className="w-full text-zinc-300 text-xs">
                <thead className="bg-zinc-950 text-zinc-400 font-bold">
                  <tr>
                    <th className="px-4 py-3 text-left">Insumo / Repuesto</th>
                    <th className="px-4 py-3 text-center">Por Consumir (Base)</th>
                    <th className="px-4 py-3 text-center w-40">Cantidad Consumida</th>
                    <th className="px-4 py-3 text-left">Comentario / Justificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900/20">
                  {productosConsumidos.map((p, idx) => (
                    <tr key={p.id_entrega_detalle} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">
                        {p.producto}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="light" color="teal" size="sm" className="font-bold">
                          {formatNumber(p.maxCantidad)} {p.unidad}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <NumberInput
                          placeholder="0"
                          value={p.cantidad}
                          onChange={(val) => actualizarCantidadProducto(idx, Number(val))}
                          min={0}
                          max={p.maxCantidad}
                          decimalScale={4}
                          clampBehavior="strict"
                          rightSection={
                            <Text size="10px" fw={900} c="zinc.5" className="mr-3">
                              {p.unidad}
                            </Text>
                          }
                          rightSectionWidth={45}
                          classNames={{
                            input: `bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 font-black text-xs h-9 shadow-inner text-right pr-12 text-white`,
                          }}
                          radius="md"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <TextInput
                          placeholder="Indique estado, merma, etc..."
                          value={p.comentario}
                          onChange={(e) => actualizarComentarioProducto(idx, e.currentTarget.value)}
                          classNames={inputClasses}
                          radius="md"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>

        {/* Observaciones generales & Evidencias */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Textarea
              label="Observaciones Generales"
              placeholder="Describa el estado del mantenimiento..."
              value={observacion}
              onChange={(e) => setObservacion(e.currentTarget.value)}
              minRows={4}
              classNames={inputClasses}
              radius="lg"
            />
          </div>
          <div className="lg:col-span-2">
            <MultiFilePicker
              label="Evidencias / Facturas / Informes de Mantenimiento"
              files={evidencias}
              onFilesChange={setEvidencias}
            />
          </div>
        </div>

        {/* Buttons */}
        <Group justify="flex-end" className="pt-4 border-t border-zinc-800">
          <Button
            variant="subtle"
            color="gray"
            onClick={onCancel}
            disabled={submitting}
            radius="lg"
            className="text-zinc-400 hover:text-white px-6 font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={!idActivoFijo}
            radius="lg"
            className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
            leftSection={<WrenchScrewdriverIcon className="w-5 h-5 text-zinc-900" />}
          >
            Guardar Mantenimiento
          </Button>
        </Group>
      </Stack>

      {/* Modal: FormPersonalExterno */}
      {idProveedor && (
        <FormPersonalExterno
          opened={personalExternoModalOpen}
          onClose={() => setPersonalExternoModalOpen(false)}
          idProveedor={idProveedor}
          onSuccess={handleConfirmarPersonalExterno}
        />
      )}
    </form>
  );
};

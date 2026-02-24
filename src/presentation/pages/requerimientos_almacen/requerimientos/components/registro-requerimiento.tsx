import { Button, Group, NumberInput, Select, Text, TextInput, Table, ActionIcon, Stack, Badge, MultiSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { PlusIcon, TrashIcon, BoltIcon, FireIcon, HandThumbUpIcon, BuildingStorefrontIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

// Removed DateInput import as CustomDatePicker is now used
import { ClipboardDocumentListIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";

import { useRequerimientos } from "../../../../../services/requerimientos_almacen/requerimientos/useRequerimientos";
import { useLote } from "../../../../../services/inventario/lote/useLote";
import { useLabores } from "../../../../../services/empresas/labores/useLabores";
import { Premura, EstadoBase } from "../../../../../shared/enums";
import { SelectMina } from "../../../../utils/select-mina";
import { SelectProducto } from "../../../../utils/select-producto";
import { SelectUnidadMedida } from "../../../../utils/select-unidad-medida";
import { CustomDatePicker } from "../../../../utils/date-picker-input";
import type { RES_Almacen } from "../../../../../services/empresas/almacenes/dtos/responses";
import type { RES_RequerimientoAlmacen } from "../../../../../services/requerimientos_almacen/requerimientos/dtos/responses";
import type { RES_Labor } from "../../../../../services/empresas/labores/dtos/responses";

interface RegistroRequerimientoProps {
    initialMinaId?: number | null;
    onSuccess: (requerimiento: RES_RequerimientoAlmacen) => void;
    onCancel: () => void;
}

interface ItemDetalle {
    id_producto: string;
    producto_nombre: string;
    id_unidad_medida: string;
    unidad_medida_nombre: string;
    cantidad_solicitada: number;
    comentario: string;
}

export const RegistroRequerimiento = ({ initialMinaId, onSuccess, onCancel }: RegistroRequerimientoProps) => {
    const [submitting, setSubmitting] = useState(false);
    const [, setError] = useState("");
    const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
    const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
    const [loadingLabores, setLoadingLabores] = useState(false);
    const [labores, setLabores] = useState<RES_Labor[]>([]);
    const [items, setItems] = useState<ItemDetalle[]>([]);

    // Listas maestras para lookup
    const [productosMaster, setProductosMaster] = useState<any[]>([]);
    const [unidadesMaster, setUnidadesMaster] = useState<any[]>([]);

    const { crear, listarAlmacenesPorMina } = useRequerimientos({ setError });
    const { listarProductosDisponibles, listarUnidadesMedida } = useLote({ setError: () => { } });
    const { listar: listarLabores } = useLabores({ setError: () => { } });

    const form = useForm({
        initialValues: {
            id_mina: initialMinaId ? String(initialMinaId) : "",
            id_labores: [] as string[],
            id_almacen_destino: "",
            premura: Premura.Normal,
            fecha_entrega_requerida: null as Date | null,
        },
        validate: {
            id_mina: (val) => (!val ? "Seleccione una mina" : null),
            id_almacen_destino: (val) => (!val ? "Seleccione un almacén" : null),
        }
    });

    const formItem = useForm({
        initialValues: {
            id_producto: "",
            id_unidad_medida: "",
            cantidad_solicitada: 0,
            comentario: "",
        },
        validate: {
            id_producto: (val) => (!val ? "Seleccione un producto" : null),
            id_unidad_medida: (val) => (!val ? "Seleccione unidad" : null),
            cantidad_solicitada: (val) => (val <= 0 ? "Debe ser > 0" : null),
        }
    });

    // Cargar listas maestras
    useEffect(() => {
        listarProductosDisponibles().then(res => res && setProductosMaster(res));
        listarUnidadesMedida().then(res => res && setUnidadesMaster(res));
    }, []);

    // Cargar datos cuando cambia la mina
    useEffect(() => {
        if (form.values.id_mina) {
            const idMinaNum = Number(form.values.id_mina);

            // Cargar almacenes
            setLoadingAlmacenes(true);
            listarAlmacenesPorMina(idMinaNum)
                .then(res => {
                    setAlmacenes(res || []);
                })
                .finally(() => setLoadingAlmacenes(false));

            // Cargar labores
            setLoadingLabores(true);
            listarLabores({ id_mina: idMinaNum })
                .then(res => {
                    setLabores(res || []);
                })
                .finally(() => setLoadingLabores(false));

            form.setFieldValue("id_almacen_destino", "");
            form.setFieldValue("id_labores", []);
        } else {
            setAlmacenes([]);
            setLabores([]);
        }
    }, [form.values.id_mina]);

    const addItem = () => {
        const validation = formItem.validate();
        if (validation.hasErrors) {
            notifications.show({
                title: "Atención",
                message: "Por favor, seleccione un producto, unidad y cantidad válida antes de agregar.",
                color: "orange",
                position: "bottom-center"
            });
            return;
        }

        const { id_producto, id_unidad_medida, cantidad_solicitada, comentario } = formItem.values;

        const existingItemIndex = items.findIndex(
            item => item.id_producto === id_producto && item.id_unidad_medida === id_unidad_medida
        );

        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].cantidad_solicitada += cantidad_solicitada;
            if (comentario) {
                newItems[existingItemIndex].comentario = newItems[existingItemIndex].comentario
                    ? `${newItems[existingItemIndex].comentario} / ${comentario}`
                    : comentario;
            }
            setItems(newItems);

            notifications.show({
                title: "Actualizado",
                message: `Se sumó la cantidad al producto ya existente`,
                color: "cyan",
                autoClose: 2000
            });
        } else {
            const productoObj = productosMaster.find(p => String(p.id_producto) === id_producto);
            const unidadObj = unidadesMaster.find(u => String(u.id_unidad_medida) === id_unidad_medida);

            const newItem: ItemDetalle = {
                id_producto,
                producto_nombre: productoObj ? productoObj.nombre : "Producto",
                id_unidad_medida,
                unidad_medida_nombre: unidadObj ? unidadObj.nombre : "Unidad",
                cantidad_solicitada,
                comentario: comentario || "",
            };

            setItems([...items, newItem]);
            notifications.show({
                title: "Agregado",
                message: `${newItem.producto_nombre} añadido a la lista`,
                color: "blue",
                autoClose: 2000
            });
        }

        formItem.reset();
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const validation = form.validate();

        if (validation.hasErrors) {
            notifications.show({
                title: "Error",
                message: "Por favor complete los campos requeridos",
                color: "red"
            });
            return;
        }

        if (items.length === 0) {
            notifications.show({
                title: "Error",
                message: "Debe agregar al menos un producto al requerimiento",
                color: "red"
            });
            return;
        }

        const idAlmacen = Number(form.values.id_almacen_destino);
        if (!idAlmacen || isNaN(idAlmacen)) {
            notifications.show({
                title: "Error",
                message: "Seleccione un almacén de destino válido",
                color: "red"
            });
            return;
        }

        setSubmitting(true);
        try {
            const dto = {
                id_mina: Number(form.values.id_mina),
                id_labores: form.values.id_labores.map(Number),
                id_almacen_destino: idAlmacen,
                premura: form.values.premura,
                fecha_entrega_requerida: form.values.fecha_entrega_requerida instanceof Date
                    ? form.values.fecha_entrega_requerida.toISOString().split('T')[0]
                    : null,
                detalles: items.map(item => ({
                    id_producto: Number(item.id_producto),
                    id_unidad_medida: Number(item.id_unidad_medida),
                    cantidad_solicitada: item.cantidad_solicitada,
                    comentario: item.comentario
                }))
            };

            console.log("[DEBUG] Solicitud POST /requerimientos:", dto);

            const res = await crear(dto);
            if (res) {
                notifications.show({
                    title: "Éxito",
                    message: "Requerimiento generado correctamente",
                    color: "green"
                });
                onSuccess(res);
            }
        } catch (err) {
            console.error("[ERROR] handleSubmit:", err);
            setError("Error al procesar el requerimiento");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses = {
        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
        dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl ",
        option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
        label: "text-zinc-300 mb-1.5 font-semibold tracking-tight",
    };

    const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-amber-500" />
                <Text fw={700} size="sm" c="white" className="tracking-tight uppercase">{title}</Text>
            </div>
            <div className="h-0.5 w-full bg-linear-to-r from-amber-500/50 to-transparent rounded-full" />
        </div>
    );

    return (
        <Stack gap={32} p="md">
            {/* Sección: Datos de la solicitud */}
            <section>
                <SectionHeader icon={ClipboardDocumentListIcon} title="Datos de la solicitud" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8">
                    {/* Fila 1: Mina | Almacén | Fecha */}
                    <SelectMina
                        withAsterisk
                        disabled={!!initialMinaId}
                        key={form.key("id_mina")}
                        {...form.getInputProps("id_mina")}
                        classNames={inputClasses}
                        className="lg:col-span-1"
                    />

                    <Select
                        label="Almacén Destino"
                        placeholder="Seleccione almacén"
                        withAsterisk
                        data={almacenes.map(a => ({
                            value: String(a.id_almacen || (a as any).id || ""),
                            label: a.nombre
                        }))}
                        disabled={!form.values.id_mina || loadingAlmacenes}
                        key={form.key("id_almacen_destino")}
                        {...form.getInputProps("id_almacen_destino")}
                        radius="lg"
                        size="sm"
                        classNames={inputClasses}
                        leftSection={<BuildingStorefrontIcon className="w-4 h-4 text-zinc-400" />}
                        className="lg:col-span-1"
                    />

                    <CustomDatePicker
                        label="Fecha de Entrega (Opcional)"
                        placeholder="Seleccione fecha"
                        key={form.key("fecha_entrega_requerida")}
                        value={form.values.fecha_entrega_requerida}
                        onChange={(date) => form.setFieldValue("fecha_entrega_requerida", date as unknown as Date)}
                        radius="lg"
                        size="sm"
                        minDate={new Date()}
                        clearable
                        className="lg:col-span-1"
                    />

                    {/* Fila 2: Labores Destino */}
                    <div className="lg:col-span-3">
                        <MultiSelect
                            label="Labores Destino (Opcional)"
                            placeholder={loadingLabores ? "Cargando labores..." : "Asigne labores..."}
                            description="Seleccione las labores donde se emplearán estos materiales"
                            data={labores
                                .filter(l => l.estado === EstadoBase.Activo)
                                .map(l => ({ value: String(l.id_labor), label: l.nombre }))
                            }
                            disabled={!form.values.id_mina || loadingLabores}
                            hidePickedOptions
                            searchable
                            leftSection={<WrenchScrewdriverIcon className="w-4 h-4 text-zinc-400" />}
                            key={form.key("id_labores")}
                            {...form.getInputProps("id_labores")}
                            radius="lg"
                            size="sm"
                            styles={{
                                pill: {
                                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    color: '#fef3c7',
                                    fontWeight: 600,
                                    height: '24px',
                                    lineHeight: '22px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    paddingLeft: '10px',
                                    paddingRight: '4px'
                                },
                                pillsList: {
                                    gap: '6px',
                                    padding: '4px 0'
                                },
                                input: {
                                    minHeight: '48px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }}
                            classNames={inputClasses}
                        />
                    </div>

                    {/* Fila 3: Prioridad / Premura */}
                    <div className="lg:col-span-3 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
                        <Group justify="space-between" align="center" wrap="nowrap">
                            <Stack gap={0}>
                                <Text size="xs" fw={700} className="text-zinc-400 uppercase tracking-widest">Prioridad</Text>
                                <Text size="sm" fw={600} className="text-white">Nivel de Urgencia</Text>
                            </Stack>
                            <Group gap="xs">
                                <Button
                                    size="xs"
                                    variant={form.values.premura === Premura.Normal ? "filled" : "light"}
                                    color="blue"
                                    onClick={() => form.setFieldValue("premura", Premura.Normal)}
                                    leftSection={<HandThumbUpIcon className="w-3.5 h-3.5" />}
                                    radius="md"
                                    className="h-10 px-5 font-bold"
                                >
                                    NORMAL
                                </Button>
                                <Button
                                    size="xs"
                                    variant={form.values.premura === Premura.Urgente ? "filled" : "light"}
                                    color="orange"
                                    onClick={() => form.setFieldValue("premura", Premura.Urgente)}
                                    leftSection={<BoltIcon className="w-3.5 h-3.5" />}
                                    radius="md"
                                    className="h-10 px-5 font-bold"
                                >
                                    URGENTE
                                </Button>
                                <Button
                                    size="xs"
                                    variant={form.values.premura === Premura.Emergencia ? "filled" : "light"}
                                    color="red"
                                    onClick={() => form.setFieldValue("premura", Premura.Emergencia)}
                                    leftSection={<FireIcon className="w-3.5 h-3.5" />}
                                    radius="md"
                                    className="h-10 px-5 font-bold"
                                >
                                    EMERGENCIA
                                </Button>
                            </Group>
                        </Group>
                    </div>
                </div>
            </section>

            {/* Sección: Items a solicitar */}
            <section>
                <SectionHeader icon={ShoppingCartIcon} title="Items a solicitar" />

                <div className="space-y-6">
                    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-5">
                                <SelectProducto
                                    key={formItem.key("id_producto")}
                                    {...formItem.getInputProps("id_producto")}
                                    error={formItem.errors.id_producto ? true : null} // Solo borde rojo, sin texto
                                    classNames={inputClasses}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <SelectUnidadMedida
                                    key={formItem.key("id_unidad_medida")}
                                    {...formItem.getInputProps("id_unidad_medida")}
                                    error={formItem.errors.id_unidad_medida ? true : null} // Solo borde rojo
                                    classNames={inputClasses}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <NumberInput
                                    label="Cantidad"
                                    placeholder="0.00"
                                    min={0.01}
                                    decimalScale={2}
                                    key={formItem.key("cantidad_solicitada")}
                                    {...formItem.getInputProps("cantidad_solicitada")}
                                    error={formItem.errors.cantidad_solicitada ? true : null} // Solo borde rojo
                                    classNames={inputClasses}
                                    radius="lg"
                                    size="sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button
                                    onClick={addItem}
                                    variant="light"
                                    color="pink"
                                    size="sm"
                                    className="w-full shadow-sm"
                                    leftSection={<PlusIcon className="w-4 h-4" />}
                                    radius="lg"
                                    h={36}
                                >
                                    Agregar
                                </Button>
                            </div>
                            <div className="md:col-span-12">
                                <TextInput
                                    label="Comentario del Producto"
                                    placeholder="Detalles adicionales del producto para el almacén..."
                                    key={formItem.key("comentario")}
                                    {...formItem.getInputProps("comentario")}
                                    classNames={inputClasses}
                                    radius="lg"
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Lista de Items (Carrito) */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-sm">
                <Table variant="unstyled" className="w-full text-zinc-300">
                    <thead className="bg-zinc-900 text-zinc-400 text-xs font-medium">
                        <tr>
                            <th className="px-4 py-3 text-center w-10">#</th>
                            <th className="px-4 py-3 text-left">PRODUCTO</th>
                            <th className="px-4 py-3 text-right">CANTIDAD</th>
                            <th className="px-4 py-3 text-center">UNIDAD</th>
                            <th className="px-4 py-3 text-left">COMENTARIO</th>
                            <th className="px-4 py-3 text-center w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-900/40">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500 italic">
                                    No hay productos agregados al requerimiento
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-xs text-center text-zinc-500">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-zinc-100">{item.producto_nombre}</td>
                                    <td className="px-4 py-3 text-sm text-right font-bold text-white tracking-wide">
                                        {item.cantidad_solicitada.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <Badge variant="light" color="gray" size="sm">{item.unidad_medida_nombre}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-zinc-400">
                                        {item.comentario || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            onClick={() => removeItem(index)}
                                            radius="md"
                                            size="sm"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </ActionIcon>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            <Group justify="flex-end" mt="md">
                <Button
                    variant="subtle"
                    onClick={onCancel}
                    disabled={submitting}
                    radius="lg"
                    className="text-zinc-400 hover:text-white"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={items.length === 0}
                    radius="lg"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 px-8"
                >
                    Guardar
                </Button>
            </Group>
        </Stack>
    );
};

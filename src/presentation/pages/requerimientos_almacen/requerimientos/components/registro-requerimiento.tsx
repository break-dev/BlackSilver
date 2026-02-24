import { Button, Group, NumberInput, Select, Text, TextInput, Table, ActionIcon, Stack, Paper, Badge, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { PlusIcon, TrashIcon, CalendarIcon, BoltIcon, FireIcon, HandThumbUpIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import { DateInput } from "@mantine/dates";

import { useRequerimientos } from "../../../../../services/requerimientos_almacen/requerimientos/useRequerimientos";
import { useLote } from "../../../../../services/inventario/lote/useLote";
import { Premura } from "../../../../../shared/enums";
import { SelectMina } from "../../../../utils/select-mina";
import { SelectLabor } from "../../../../utils/select-labor";
import { SelectProducto } from "../../../../utils/select-producto";
import { SelectUnidadMedida } from "../../../../utils/select-unidad-medida";
import type { RES_Almacen } from "../../../../../services/empresas/almacenes/dtos/responses";
import type { RES_RequerimientoAlmacen } from "../../../../../services/requerimientos_almacen/requerimientos/dtos/responses";

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
    const [items, setItems] = useState<ItemDetalle[]>([]);

    // Listas maestras para lookup
    const [productosMaster, setProductosMaster] = useState<any[]>([]);
    const [unidadesMaster, setUnidadesMaster] = useState<any[]>([]);

    const { crear, listarAlmacenesPorMina } = useRequerimientos({ setError });
    const { listarProductosDisponibles, listarUnidadesMedida } = useLote({ setError: () => { } });

    const form = useForm({
        initialValues: {
            id_mina: initialMinaId ? String(initialMinaId) : "",
            id_labor: "",
            id_almacen_destino: "",
            premura: Premura.Normal,
            fecha_entrega_requerida: new Date(Date.now() + 86400000), // Mañana
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

    // Cargar almacenes cuando cambia la mina
    useEffect(() => {
        if (form.values.id_mina) {
            setLoadingAlmacenes(true);
            listarAlmacenesPorMina(Number(form.values.id_mina))
                .then(res => {
                    setAlmacenes(res || []);
                })
                .finally(() => setLoadingAlmacenes(false));

            form.setFieldValue("id_almacen_destino", "");
            form.setFieldValue("id_labor", "");
        } else {
            setAlmacenes([]);
        }
    }, [form.values.id_mina]);

    const addItem = () => {
        const validation = formItem.validate();
        if (validation.hasErrors) return;

        const { id_producto, id_unidad_medida, cantidad_solicitada, comentario } = formItem.values;

        // Buscar si ya existe el mismo producto con la misma unidad en la lista
        const existingItemIndex = items.findIndex(
            item => item.id_producto === id_producto && item.id_unidad_medida === id_unidad_medida
        );

        if (existingItemIndex > -1) {
            // Si existe, actualizamos la cantidad
            const newItems = [...items];
            newItems[existingItemIndex].cantidad_solicitada += cantidad_solicitada;
            // Si el nuevo comentario tiene texto, lo concatenamos o reemplazamos? 
            // Por ahora vamos a mantener el comentario previo o actualizar si el nuevo no es vacio.
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
            // Si no existe, lo agregamos normal
            const productoObj = productosMaster.find(p => String(p.id_producto) === id_producto);
            const unidadObj = unidadesMaster.find(u => String(u.id_unidad_medida) === id_unidad_medida);

            const newItem: ItemDetalle = {
                id_producto,
                producto_nombre: productoObj ? productoObj.nombre : "Producto",
                id_unidad_medida,
                unidad_medida_nombre: unidadObj ? unidadObj.abreviatura : "Und",
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

        // Convertir y validar IDs
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
                id_labor: form.values.id_labor ? Number(form.values.id_labor) : null,
                id_almacen_destino: idAlmacen,
                premura: form.values.premura,
                fecha_entrega_requerida: form.values.fecha_entrega_requerida instanceof Date
                    ? form.values.fecha_entrega_requerida.toISOString().split('T')[0]
                    : String(form.values.fecha_entrega_requerida),
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
        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
        dropdown: "bg-zinc-900 border-zinc-800",
        option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
        label: "text-zinc-300 mb-1 font-medium"
    };

    return (
        <Stack gap="xl">
            {/* Cabecera */}
            <Paper p="md" radius="lg" bg="zinc.9" className="border border-zinc-800">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Fila 1 */}
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

                    <SelectLabor
                        idMina={form.values.id_mina ? Number(form.values.id_mina) : null}
                        key={form.key("id_labor")}
                        {...form.getInputProps("id_labor")}
                        classNames={inputClasses}
                        className="lg:col-span-1"
                    />

                    {/* Fila 2 */}
                    <Stack gap={4} className="lg:col-span-2">
                        <Text size="sm" fw={500} c="zinc.3">Prioridad (Premura)</Text>
                        <Group gap="xs" grow>
                            <Button
                                size="sm"
                                variant={form.values.premura === Premura.Normal ? "filled" : "light"}
                                color="cyan"
                                onClick={() => form.setFieldValue("premura", Premura.Normal)}
                                leftSection={<HandThumbUpIcon className="w-4 h-4" />}
                                radius="md"
                            >
                                Normal
                            </Button>
                            <Button
                                size="sm"
                                variant={form.values.premura === Premura.Urgente ? "filled" : "light"}
                                color="orange"
                                onClick={() => form.setFieldValue("premura", Premura.Urgente)}
                                leftSection={<BoltIcon className="w-4 h-4" />}
                                radius="md"
                            >
                                Urgente
                            </Button>
                            <Button
                                size="sm"
                                variant={form.values.premura === Premura.Emergencia ? "filled" : "light"}
                                color="red"
                                onClick={() => form.setFieldValue("premura", Premura.Emergencia)}
                                leftSection={<FireIcon className="w-4 h-4" />}
                                radius="md"
                            >
                                Emergencia
                            </Button>
                        </Group>
                    </Stack>

                    <DateInput
                        label="Fecha Requerida"
                        placeholder="01/01/2026"
                        leftSection={<CalendarIcon className="w-4 h-4 text-zinc-400" />}
                        key={form.key("fecha_entrega_requerida")}
                        {...form.getInputProps("fecha_entrega_requerida")}
                        classNames={inputClasses}
                        radius="lg"
                        size="sm"
                        minDate={new Date()}
                        className="lg:col-span-1"
                    />
                </div>
            </Paper>

            {/* Selector de Productos */}
            <Paper p="md" radius="lg" bg="zinc.9" className="border border-zinc-800">
                <Text fw={600} size="sm" c="white" mb="md">Agregar Productos</Text>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                        <SelectProducto
                            key={formItem.key("id_producto")}
                            {...formItem.getInputProps("id_producto")}
                            classNames={inputClasses}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <SelectUnidadMedida
                            key={formItem.key("id_unidad_medida")}
                            {...formItem.getInputProps("id_unidad_medida")}
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
                            className="w-full"
                            leftSection={<PlusIcon className="w-4 h-4" />}
                            radius="lg"
                        >
                            Agregar
                        </Button>
                    </div>
                    <div className="md:col-span-12">
                        <TextInput
                            label="Comentario del Producto"
                            placeholder="Ej: Para el refuerzo de la zona sur..."
                            key={formItem.key("comentario")}
                            {...formItem.getInputProps("comentario")}
                            classNames={inputClasses}
                            radius="lg"
                            size="sm"
                        />
                    </div>
                </div>
            </Paper>

            {/* Lista de Items (Carrito) */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <Table variant="unstyled" className="w-full text-zinc-300">
                    <thead className="bg-zinc-900 text-zinc-400 text-xs font-medium">
                        <tr>
                            <th className="px-4 py-3 text-center w-10">#</th>
                            <th className="px-4 py-3 text-left">Producto</th>
                            <th className="px-4 py-3 text-center">Unidad</th>
                            <th className="px-4 py-3 text-right">Cantidad</th>
                            <th className="px-4 py-3 text-left">Comentario</th>
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
                                    <td className="px-4 py-3 text-sm text-center">
                                        <Badge variant="light" color="gray" size="sm">{item.unidad_medida_nombre}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-bold text-white tracking-wide">
                                        {item.cantidad_solicitada.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-zinc-400 max-w-xs">
                                        <span className="truncate block">{item.comentario || "-"}</span>
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

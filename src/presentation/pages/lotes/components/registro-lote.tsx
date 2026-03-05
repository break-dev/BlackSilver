import { Button, Group, NumberInput, Select, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { z } from "zod";

import { useLote } from "../../../../services/lote/useLote";
import type { RES_Lote, RES_ProductoDisponible, RES_UnidadMedida } from "../../../../services/lote/dtos/responses";
import { CustomDatePicker } from "../../../utils/date-picker-input";
import { SelectAlmacen } from "../../../utils/select-almacen";

interface RegistroLoteProps {
    onSuccess: (lote: RES_Lote) => void;
    onCancel: () => void;
    initialAlmacenId?: number | null;
}

// Define Schema locally
const LocalSchema = z.object({
    id_producto: z.coerce.number().min(1, "Seleccione un producto"),
    id_unidad_medida: z.coerce.number().min(1, "Seleccione una unidad de medida"),
    id_almacen: z.coerce.number().min(1, "Seleccione un almacén"),
    descripcion: z.string().optional().nullable(),
    stock_inicial: z.coerce.number().min(0, "El stock no puede ser negativo").default(0),
    contenido_por_presentacion: z.coerce.number().min(0.0001, "El contenido debe ser mayor a 0").default(1),
    fecha_hora_ingreso: z.any().refine((val) => val !== null && val !== undefined && new Date(val).toString() !== 'Invalid Date', { message: "Fecha requerida" }).transform((val) => new Date(val)),
    fecha_vencimiento: z.any().transform((val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }).nullable(),
});

type FormValues = {
    id_producto: string;
    id_unidad_medida: string;
    id_almacen: string;
    descripcion: string;
    stock_inicial: number;
    contenido_por_presentacion: number;
    fecha_hora_ingreso: Date;
    fecha_vencimiento: Date | null;
};

export const RegistroLote = ({ onSuccess, onCancel, initialAlmacenId }: RegistroLoteProps) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Data State
    const [productos, setProductos] = useState<RES_ProductoDisponible[]>([]);
    const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);

    // Hooks
    const { crear, listarProductosDisponibles, listarUnidadesMedida } = useLote({ setError });

    const form = useForm<FormValues>({
        initialValues: {
            id_producto: "",
            id_unidad_medida: "",
            id_almacen: initialAlmacenId ? String(initialAlmacenId) : "",
            descripcion: "",
            stock_inicial: 0,
            contenido_por_presentacion: 1,
            fecha_hora_ingreso: new Date(),
            fecha_vencimiento: null,
        },
        validate: (values) => {
            const result = LocalSchema.safeParse(values);
            const errors: Record<string, string> = {};

            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    const path = issue.path[0];
                    if (path) {
                        errors[path.toString()] = issue.message;
                    }
                });
            }

            // Validar fecha de vencimiento si el producto es perecible
            if (values.id_producto) {
                const product = productos.find(p => String(p.id_producto) === values.id_producto);
                if (product?.es_perecible && !values.fecha_vencimiento) {
                    errors.fecha_vencimiento = "Fecha de vencimiento requerida";
                }
            }

            return errors;
        },
    });

    const productoSeleccionado = productos.find(p => String(p.id_producto) === form.values.id_producto);
    const unidadSeleccionada = unidades.find(u => String(u.id_unidad_medida) === form.values.id_unidad_medida);
    const stockTotalBase = Number((form.values.stock_inicial * form.values.contenido_por_presentacion).toFixed(2));

    const sonUnidadesIdenticas = productoSeleccionado && unidadSeleccionada &&
        Number(productoSeleccionado.id_unidad_medida_base) === Number(unidadSeleccionada.id_unidad_medida);

    // Efecto para bloquear contenido a 1 si las unidades son iguales
    useEffect(() => {
        if (sonUnidadesIdenticas) {
            form.setFieldValue("contenido_por_presentacion", 1);
        }
    }, [sonUnidadesIdenticas]);

    // Detectar si el producto seleccionado es perecible
    const esPerecible = Boolean(productoSeleccionado?.es_perecible);

    // Función simple de pluralización para las unidades en español
    const pluralizar = (nombre: string | undefined) => {
        if (!nombre) return "";
        const lower = nombre.toLowerCase();
        if (lower.endsWith('s')) return nombre; // Ya parece plural
        const vocales = ['a', 'e', 'i', 'o', 'u'];
        const ultimaLetra = lower.charAt(lower.length - 1);
        return vocales.includes(ultimaLetra) ? `${nombre}s` : `${nombre}es`;
    };

    // Cargar catálogos (Productos y Unidades)
    useEffect(() => {
        const loadCatalogs = async () => {
            setLoading(true);
            try {
                const [prodData, unitData] = await Promise.all([
                    listarProductosDisponibles(),
                    listarUnidadesMedida()
                ]);

                if (prodData && Array.isArray(prodData)) {
                    setProductos(prodData);
                } else {
                    setProductos([]);
                }

                if (unitData && Array.isArray(unitData)) {
                    setUnidades(unitData);
                } else {
                    setUnidades([]);
                }
            } catch (err) {
                console.error("Error loading catalogs", err);
            } finally {
                setLoading(false);
            }
        };
        loadCatalogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (values: FormValues) => {
        setSubmitting(true);
        const dto = {
            ...values,
            id_producto: Number(values.id_producto),
            id_unidad_medida: Number(values.id_unidad_medida),
            id_almacen: Number(values.id_almacen),
            stock_inicial: Number(values.stock_inicial),
            contenido_por_presentacion: Number(values.contenido_por_presentacion),
        };

        const nuevoLote = await crear(dto as any);
        if (nuevoLote) {
            notifications.show({
                title: "Éxito",
                message: "Lote registrado correctamente.",
                color: "green",
            });
            onSuccess(nuevoLote);
        }
        setSubmitting(false);
    };

    const inputClasses = {
        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
        dropdown: "bg-zinc-900 border-zinc-800",
        option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
        label: "text-zinc-300 mb-1 font-medium"
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className="relative space-y-4 min-h-[300px]">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectAlmacen
                    placeholder="Seleccione almacén"
                    withAsterisk
                    disabled={loading}
                    className="md:col-span-2"
                    {...form.getInputProps("id_almacen")}
                    classNames={inputClasses}
                />

                <Select
                    label="Producto"
                    placeholder="Buscar producto..."
                    data={(productos || []).map(p => ({
                        value: String(p.id_producto),
                        label: p.nombre
                    }))}
                    searchable
                    withAsterisk
                    disabled={loading}
                    radius="lg"
                    size="sm"
                    className="md:col-span-2"
                    {...form.getInputProps("id_producto")}
                    classNames={inputClasses}
                />

                <Select
                    label="Unidad de Medida del Lote"
                    placeholder="Seleccione unidad (ej: Caja, Bolsa)"
                    data={(unidades || []).map(u => ({
                        value: String(u.id_unidad_medida),
                        label: `${u.nombre} (${u.abreviatura})`
                    }))}
                    searchable
                    withAsterisk
                    disabled={loading}
                    radius="lg"
                    size="sm"
                    {...form.getInputProps("id_unidad_medida")}
                    classNames={inputClasses}
                />

                <NumberInput
                    label={`Stock Inicial en ${unidadSeleccionada?.nombre || 'Unidades'}`}
                    placeholder="0.00"
                    min={0}
                    decimalScale={2}
                    fixedDecimalScale
                    radius="lg"
                    size="sm"
                    withAsterisk
                    {...form.getInputProps("stock_inicial")}
                    classNames={inputClasses}
                />

                <NumberInput
                    label="Contenido"
                    placeholder="1.00"
                    description={sonUnidadesIdenticas
                        ? "Misma unidad que la base (Bloqueado)"
                        : `Indique cuánt@s ${pluralizar(productoSeleccionado?.nombre_unidad_medida_base) || 'unidades'} contiene cada ${unidadSeleccionada?.nombre || 'unidad de lote'}`
                    }
                    min={0.01}
                    decimalScale={2}
                    fixedDecimalScale
                    radius="lg"
                    size="sm"
                    withAsterisk
                    disabled={sonUnidadesIdenticas || loading}
                    {...form.getInputProps("contenido_por_presentacion")}
                    classNames={inputClasses}
                />

                <div className="md:col-span-2">
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 space-y-3">
                        <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                            Resumen de Conversión
                        </Text>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Text size="xs" c="cyan.4" fw={600}>Ingreso en Lote</Text>
                                <Text fw={700} size="xl" className="text-white">
                                    {form.values.stock_inicial || 0} <span className="text-sm font-normal text-zinc-500">{unidadSeleccionada?.abreviatura || '---'}</span>
                                </Text>
                            </div>
                            <div className="space-y-1">
                                <Text size="xs" c="pink.4" fw={600}>Total en Unidades Base</Text>
                                <Text fw={700} size="xl" className="text-pink-500">
                                    {stockTotalBase} <span className="text-sm font-normal text-zinc-500">{productoSeleccionado?.unidad_medida_base || '---'}</span>
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>

                <CustomDatePicker
                    label="Fecha de Ingreso"
                    placeholder="Seleccione fecha"
                    radius="lg"
                    size="sm"
                    withAsterisk
                    value={form.values.fecha_hora_ingreso}
                    onChange={(date) => form.setFieldValue("fecha_hora_ingreso", date as unknown as Date)}
                    error={form.errors.fecha_hora_ingreso as string}
                />

                {esPerecible ? (
                    <CustomDatePicker
                        label="Fecha de Vencimiento"
                        placeholder="Seleccione fecha"
                        radius="lg"
                        size="sm"
                        withAsterisk
                        minDate={new Date(form.values.fecha_hora_ingreso)}
                        value={form.values.fecha_vencimiento}
                        onChange={(date) => form.setFieldValue("fecha_vencimiento", date as unknown as Date)}
                        error={form.errors.fecha_vencimiento as string}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full pt-6">
                        <Text size="xs" c="dimmed" className="italic">Este producto no requiere fecha de vencimiento</Text>
                    </div>
                )}

                <TextInput
                    label="Descripción / Referencia"
                    placeholder="Ej: Compra Famesa F-504"
                    radius="lg"
                    size="sm"
                    className="md:col-span-2"
                    {...form.getInputProps("descripcion")}
                    classNames={inputClasses}
                />
            </div>

            {error && <Text c="red" size="sm">{error}</Text>}

            <Group justify="flex-end" mt="md">
                <Button variant="subtle" onClick={onCancel} disabled={submitting} radius="lg" className="text-zinc-400 hover:text-white">
                    Cancelar
                </Button>
                <Button type="submit" loading={submitting} radius="lg" className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0">
                    Guardar
                </Button>
            </Group>
        </form>
    );
};

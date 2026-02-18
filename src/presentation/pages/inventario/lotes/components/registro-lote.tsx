import { Button, Group, NumberInput, Select, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { z } from "zod";

import { useLote } from "../../../../../services/inventario/lote/useLote";
import type { RES_Lote, RES_ProductoDisponible, RES_UnidadMedida } from "../../../../../services/inventario/lote/dtos/responses";
import { CustomDatePicker } from "../../../../utils/date-picker-input";
import { SelectAlmacen } from "../../../../utils/select-almacen";

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
    descripcion: z.string().optional(),
    stock_inicial: z.coerce.number().min(0, "El stock no puede ser negativo").default(0),
    fecha_ingreso: z.any().refine((val) => val !== null && val !== undefined && new Date(val).toString() !== 'Invalid Date', { message: "Fecha requerida" }).transform((val) => new Date(val)),
    fecha_vencimiento: z.any().transform((val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }),
});

export const RegistroLote = ({ onSuccess, onCancel, initialAlmacenId }: RegistroLoteProps) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Data State
    const [productos, setProductos] = useState<RES_ProductoDisponible[]>([]);
    const [unidades, setUnidades] = useState<RES_UnidadMedida[]>([]);

    // Hooks
    const { crear, listarProductosDisponibles, listarUnidadesMedida } = useLote({ setError });

    const form = useForm({
        initialValues: {
            id_producto: "", // Use empty string for Select compatibility
            id_unidad_medida: "",
            id_almacen: initialAlmacenId ? String(initialAlmacenId) : "",
            descripcion: "",
            stock_inicial: 0,
            fecha_ingreso: new Date(),
            fecha_vencimiento: null as Date | null,
        },
        validate: (values) => {
            const result = LocalSchema.safeParse(values);
            if (result.success) return {};

            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0];
                if (path) {
                    errors[path.toString()] = issue.message;
                }
            });
            return errors;
        },
    });

    // Detectar si el producto seleccionado es perecible
    const esPerecible = (() => {
        if (!form.values.id_producto) return false;
        const p = productos.find(x => String(x.id_producto) === form.values.id_producto);
        return p ? Boolean(p.es_perecible) : false;
    })();

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
                    if (prodData === null) notifications.show({ title: "Atención", message: "No se pudieron cargar los productos.", color: "red" });
                }

                if (unitData && Array.isArray(unitData)) {
                    setUnidades(unitData);
                } else {
                    setUnidades([]);
                    if (unitData === null) notifications.show({ title: "Atención", message: "No se pudieron cargar las unidades.", color: "red" });
                }
            } catch (err) {
                console.error("Error loading catalogs", err);
                notifications.show({ title: "Error", message: "Error cargando datos.", color: "red" });
            } finally {
                setLoading(false);
            }
        };
        loadCatalogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (values: typeof form.values) => {
        setSubmitting(true);
        const dto = {
            ...values,
            id_producto: Number(values.id_producto),
            id_unidad_medida: Number(values.id_unidad_medida),
            id_almacen: Number(values.id_almacen),
            stock_inicial: Number(values.stock_inicial),
        };

        const nuevoLote = await crear(dto);
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
                {/* Almacén (Reusable Component) */}
                <SelectAlmacen
                    // label="Almacén de Destino" // Default is "Almacén", user didn't ask to change
                    placeholder="Seleccione almacén"
                    withAsterisk
                    disabled={loading}
                    className="md:col-span-2" // Apply grid span to wrapper
                    {...form.getInputProps("id_almacen")}
                    classNames={inputClasses} // Override styles to match form
                />

                {/* Producto */}
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

                {/* Unidad */}
                <Select
                    label="Unidad de Medida"
                    placeholder="Seleccione unidad"
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

                {/* Stock Inicial */}
                <NumberInput
                    label="Stock Inicial"
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

                {/* Fecha Ingreso */}
                <CustomDatePicker
                    label="Fecha de Ingreso"
                    placeholder="Seleccione fecha"
                    radius="lg"
                    size="sm"
                    value={form.values.fecha_ingreso as Date}
                    onChange={(date) => form.setFieldValue("fecha_ingreso", date || new Date())}
                    error={form.errors.fecha_ingreso as string}
                />

                {/* Fecha Vencimiento (Condicional) */}
                {esPerecible ? (
                    <CustomDatePicker
                        label="Fecha de Vencimiento"
                        placeholder="Seleccione fecha"
                        radius="lg"
                        size="sm"
                        value={form.values.fecha_vencimiento as Date | null}
                        onChange={(date) => form.setFieldValue("fecha_vencimiento", date)}
                        error={form.errors.fecha_vencimiento as string}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full pt-6">
                        <Text size="xs" c="dimmed" className="italic">Este producto no requiere fecha de vencimiento</Text>
                    </div>
                )}

                {/* Descripción */}
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
                    type="submit"
                    loading={submitting}
                    radius="lg"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
                >
                    Guardar Lote
                </Button>
            </Group>
        </form>
    );
};

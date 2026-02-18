import { Button, Checkbox, Group, Select, Text, TextInput, ActionIcon, Tooltip } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useDisclosure } from "@mantine/hooks";

import { useProductos } from "../../../../../services/inventario/productos/useProductos";
import { Schema_CrearProducto } from "../../../../../services/inventario/productos/dtos/requests";
import { useCategoria } from "../../../../../services/inventario/categorias/useCategoria";
import { ModalRegistro } from "../../../../utils/modal-registro";
import { RegistroCategoria } from "../../categorias/components/registro-categoria";
import type { RES_Producto } from "../../../../../services/inventario/productos/dtos/responses";

interface RegistroProductoProps {
    onSuccess: (producto: RES_Producto) => void;
    onCancel: () => void;
}

export const RegistroProducto = ({ onSuccess, onCancel }: RegistroProductoProps) => {
    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);
    const [error, setError] = useState("");

    // Category Modal
    const [openedCat, { open: openCat, close: closeCat }] = useDisclosure(false);

    const { crear } = useProductos({ setError });
    const { listar: listarCategorias } = useCategoria({ setError });

    const form = useForm({
        initialValues: {
            id_categoria: "", // Mantine select uses string
            nombre: "",
            es_fiscalizado: false,
            es_perecible: false,
        },
        validate: zodResolver(Schema_CrearProducto as any),
    });

    useEffect(() => {
        const cargarCategorias = async () => {
            const data = await listarCategorias();
            if (data) {
                setCategorias(data.map((c) => ({ value: String(c.id_categoria), label: c.nombre })));
            }
        };
        cargarCategorias();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        const dto = {
            ...values,
            id_categoria: Number(values.id_categoria),
        };

        const result = await crear(dto);
        if (result) {
            notifications.show({
                title: "Éxito",
                message: "Producto registrado correctamente.",
                color: "green",
            });
            onSuccess(result);
        } else {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">

            {/* Category Select with Quick Add */}
            <div className="flex items-end gap-2">
                <Select
                    label="Categoría"
                    placeholder="Seleccione categoría"
                    data={categorias}
                    searchable
                    nothingFoundMessage="No hay categorías"
                    withAsterisk
                    className="flex-1"
                    radius="lg"
                    size="sm"
                    key={form.key("id_categoria")}
                    {...form.getInputProps("id_categoria")}
                    classNames={{
                        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                        dropdown: "bg-zinc-900 border-zinc-800",
                        option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
                        label: "text-zinc-300 mb-1 font-medium"
                    }}
                />
                <Tooltip label="Crear nueva categoría" withArrow>
                    <ActionIcon
                        variant="light"
                        color="indigo"
                        size="lg"
                        className="mb-[2px]"
                        onClick={openCat}
                    >
                        <PlusIcon className="w-5 h-5" />
                    </ActionIcon>
                </Tooltip>
            </div>

            <TextInput
                label="Nombre del Producto"
                placeholder="Ej: Dinamita 7/8 Famesa"
                withAsterisk
                radius="lg"
                size="sm"
                key={form.key("nombre")}
                {...form.getInputProps("nombre")}
                classNames={{
                    input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                    label: "text-zinc-300 mb-1 font-medium"
                }}
            />

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-3">
                <Text size="sm" className="font-medium text-zinc-400 mb-2">Atributos del producto</Text>

                <Checkbox
                    label="Producto Fiscalizado (IQBF)"
                    description="Requiere control y reporte a SUCAMEC"
                    color="red"
                    key={form.key("es_fiscalizado")}
                    {...form.getInputProps("es_fiscalizado", { type: "checkbox" })}
                    classNames={{
                        label: "text-zinc-200 font-medium",
                        description: "text-zinc-500",
                        input: "bg-zinc-900 border-zinc-700 checked:bg-red-600 checked:border-red-600"
                    }}
                />

                <Checkbox
                    label="Producto Perecible"
                    description="Requiere fecha de vencimiento al ingresar stock"
                    color="orange"
                    key={form.key("es_perecible")}
                    {...form.getInputProps("es_perecible", { type: "checkbox" })}
                    classNames={{
                        label: "text-zinc-200 font-medium",
                        description: "text-zinc-500",
                        input: "bg-zinc-900 border-zinc-700 checked:bg-orange-500 checked:border-orange-500"
                    }}
                />
            </div>

            {error && <Text c="red" size="sm">{error}</Text>}

            <Group justify="flex-end" mt="md">
                <Button
                    variant="subtle"
                    onClick={onCancel}
                    disabled={loading}
                    radius="lg"
                    className="text-zinc-400 hover:text-white"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    loading={loading}
                    radius="lg"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
                >
                    Guardar
                </Button>
            </Group>

            {/* Nested Modal for Category */}
            <ModalRegistro opened={openedCat} close={closeCat} title="Nueva Categoría">
                <div className="p-1">
                    <RegistroCategoria
                        onSuccess={(newCat) => {
                            // Add to list
                            const newItem = { value: String(newCat.id_categoria), label: newCat.nombre };
                            setCategorias((prev) => [...prev, newItem]);
                            // Select it
                            form.setFieldValue("id_categoria", newItem.value);
                            // Close modal
                            closeCat();
                            notifications.show({ title: "Categoría creada", message: "Categoría seleccionada automáticamente.", color: "blue" });
                        }}
                        onCancel={closeCat}
                    />
                </div>
            </ModalRegistro>
        </form>
    );
};

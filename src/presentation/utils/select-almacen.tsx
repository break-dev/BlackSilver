import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";

import { useAlmacenes } from "../../services/empresas/almacenes/useAlmacenes";
import type { RES_Almacen } from "../../services/empresas/almacenes/dtos/responses";

interface SelectAlmacenProps extends Omit<SelectProps, "data"> {
    value?: string | null;
    onChange?: (value: string | null) => void;
    /** If true, triggers data loading on mount autonomously. Default: true */
    autoLoad?: boolean;
}

export const SelectAlmacen = ({
    value,
    onChange,
    autoLoad = true,
    className,
    ...props
}: SelectAlmacenProps) => {
    const [loading, setLoading] = useState(false);
    const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
    const { listar } = useAlmacenes({ setError: () => { } });

    useEffect(() => {
        if (autoLoad) {
            setLoading(true);
            listar()
                .then((data) => {
                    if (data) setAlmacenes(data);
                })
                .finally(() => setLoading(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoLoad]);

    return (
        <Select
            label="Almacén"
            {...props}
            placeholder={props.placeholder || "Seleccione almacén"}
            leftSection={<CubeIcon className="w-4 h-4 text-zinc-400" />}
            data={almacenes.map(a => ({
                value: String(a.id_almacen),
                label: a.nombre
            }))}
            value={value}
            onChange={onChange}
            searchable
            clearable
            nothingFoundMessage="No se encontraron almacenes"
            radius="lg"
            size="sm"
            maxDropdownHeight={300}
            disabled={loading || props.disabled}
            className={className}
            classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
                label: "text-zinc-300 mb-1 font-medium"
            }}
            {...props}
        />
    );
};

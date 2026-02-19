import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import { useLabores } from "../../services/empresas/labores/useLabores";
import type { RES_TipoLabor } from "../../services/empresas/labores/dtos/responses";
import { TagIcon } from "@heroicons/react/24/outline";

interface SelectTipoLaborProps extends Omit<SelectProps, "data"> {
    value?: string | null;
    onChange?: (value: string | null) => void;
}

export const SelectTipoLabor = ({ value, onChange, className, ...props }: SelectTipoLaborProps) => {
    const [loading, setLoading] = useState(true);
    const [tipos, setTipos] = useState<RES_TipoLabor[]>([]);
    const { listarTipos } = useLabores({ setError: () => { } });

    useEffect(() => {
        setLoading(true);
        listarTipos()
            .then(data => { if (data) setTipos(data); })
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Select
            label="Tipo de Labor"
            placeholder="Seleccione..."
            leftSection={<TagIcon className="w-4 h-4 text-zinc-400" />}
            data={tipos.map(t => ({
                value: String(t.id_tipo_labor),
                label: `${t.nombre} (${t.codigo})`
            }))}
            value={value}
            onChange={onChange}
            disabled={loading || props.disabled}
            searchable
            clearable
            nothingFoundMessage="No se encontraron tipos"
            radius="lg"
            size="sm"
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

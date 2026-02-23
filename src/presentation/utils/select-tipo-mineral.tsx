import { Select, type SelectProps, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import { useConcesiones } from "../../services/empresas/concesiones/useConcesiones";

export const SelectTipoMineral = (props: SelectProps) => {
    const [tipos, setTipos] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { listarTiposMineral } = useConcesiones({ setError: () => { } });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await listarTiposMineral();
            if (data) setTipos(data);
            setLoading(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const data = tipos.map(t => ({ value: t, label: t }));

    return (
        <Select
            label="Tipo de Mineral"
            placeholder="Seleccionar"
            data={data}
            rightSection={loading ? <Loader size={14} color="gray" /> : null}
            radius="lg"
            size="sm"
            searchable
            nothingFoundMessage="No encontrado"
            withCheckIcon={false}
            classNames={{
                input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
        focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
                dropdown: "bg-zinc-900 border-zinc-800",
                option: `hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 
        data-[selected]:text-zinc-900 rounded-md my-1`,
                label: "text-zinc-300 mb-1 font-medium",
            }}
            {...props}
        />
    );
};

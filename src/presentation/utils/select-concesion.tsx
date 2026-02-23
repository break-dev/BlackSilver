import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import type { RES_Concesion } from "../../services/empresas/concesiones/dtos/responses";
import { useConcesiones } from "../../services/empresas/concesiones/useConcesiones";

interface SelectConcesionProps extends Omit<SelectProps, "data"> {
    value?: string | null;
    onChange?: (value: string | null) => void;
}

export const SelectConcesion = ({
    value,
    onChange,
    ...props
}: SelectConcesionProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [, setError] = useState("");
    const { listar } = useConcesiones({ setError });
    const [data, setData] = useState<RES_Concesion[]>([]);

    useEffect(() => {
        setIsLoading(true);
        listar()
            .then((res) => {
                if (res) setData(res);
            })
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Select
            label="Concesión"
            placeholder="Seleccione concesión"
            data={data.map((c) => ({
                value: c.id_concesion.toString(),
                label: c.nombre,
            }))}
            value={value}
            onChange={onChange}
            disabled={isLoading || props.disabled}
            searchable
            nothingFoundMessage="No hay concesiones"
            withCheckIcon={false}
            radius="lg"
            size="sm"
            classNames={{
                input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 
        focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
                dropdown: "bg-zinc-900 border-zinc-800",
                option: `hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 
        data-[selected]:text-zinc-900 rounded-md my-1`,
                label: "text-zinc-300 mb-1 font-medium",
            }}
            {...props}
        />
    );
};

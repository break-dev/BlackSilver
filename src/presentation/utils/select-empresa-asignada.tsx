import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import type { RES_Asignacion } from "../../services/empresas/concesiones/dtos/responses";
import { useConcesion } from "../../services/empresas/concesiones/useConcesion";

interface SelectEmpresaAsignadaProps extends Omit<SelectProps, "data"> {
    idConcesion?: number | null; // Filter by concession
    value?: string | null;
    onChange?: (value: string | null) => void;
}

export const SelectEmpresaAsignada = ({
    idConcesion,
    value,
    onChange,
    ...props
}: SelectEmpresaAsignadaProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [, setError] = useState("");
    const { listar_asignaciones } = useConcesion({ setError });
    const [data, setData] = useState<RES_Asignacion[]>([]);

    useEffect(() => {
        if (!idConcesion) {
            setData([]);
            return;
        }

        setIsLoading(true);
        listar_asignaciones(idConcesion)
            .then((res) => {
                if (res) setData(res);
            })
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idConcesion]);

    return (
        <Select
            label="Empresa (Asignada)"
            placeholder={idConcesion ? "Seleccione empresa" : "Primero seleccione una concesión"}
            data={data.map((a) => ({
                // We return id_empresa_concesion (the relation ID) because that's what backend needs
                value: a.id_empresa_concesion.toString(),
                label: `${a.razon_social} (${a.ruc})`, // Show Clear Name
            }))}
            value={value}
            onChange={onChange}
            disabled={isLoading || !idConcesion || props.disabled}
            searchable
            nothingFoundMessage="No hay empresas asignadas a esta concesión"
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

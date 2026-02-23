import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import type { RES_Concesion } from "../../services/empresas/concesiones/dtos/responses";
import { useConcesiones } from "../../services/empresas/concesiones/useConcesiones";

interface SelectConcesionAsignadaProps extends Omit<SelectProps, "data"> {
    idEmpresa?: number | null; // Dependent on Company
    value?: string | null; // This will hold the 'id_asignacion' ideally, or we return the object
    onChange?: (value: string | null) => void;
    onSelectOption?: (option: RES_Concesion) => void; // Callback to return full object including id_asignacion
}

export const SelectConcesionAsignada = ({
    idEmpresa,
    value,
    onChange,
    onSelectOption,
    ...props
}: SelectConcesionAsignadaProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [, setError] = useState("");
    const { listarPorEmpresa } = useConcesiones({ setError });
    const [data, setData] = useState<RES_Concesion[]>([]);

    useEffect(() => {
        if (!idEmpresa) {
            setData([]);
            return;
        }

        setIsLoading(true);
        listarPorEmpresa(idEmpresa)
            .then((res) => {
                if (res) setData(res);
            })
            .finally(() => setIsLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idEmpresa]);

    return (
        <Select
            label="Concesión"
            placeholder={isLoading ? "Cargando concesiones..." : (idEmpresa ? "Seleccione concesión" : "Primero seleccione una empresa")}
            data={data.map((c) => ({
                // We use id_asignacion if available as the value, OR fallback to id_concesion if that's what we want to track
                // BUT Backend Guide says: "Valor a guardar: id_asignacion".
                value: c.id_asignacion?.toString() || c.id_concesion.toString(),
                label: c.nombre,
            }))}
            value={value}
            onChange={(val) => {
                onChange?.(val);
                const selected = data.find(c => (c.id_asignacion?.toString() || c.id_concesion.toString()) === val);
                if (selected && onSelectOption) {
                    onSelectOption(selected);
                }
            }}
            disabled={isLoading || !idEmpresa || props.disabled}
            searchable
            nothingFoundMessage="No hay concesiones asignadas"
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

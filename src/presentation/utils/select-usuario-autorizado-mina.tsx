import { Select, type SelectProps, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";

// Services
import { useMinas } from "../../services/empresas/minas/useMinas";
import type { RES_UsuarioAutorizadoMina } from "../../services/empresas/minas/dtos/responses";

interface SelectUsuarioAutorizadoMinaProps extends Omit<SelectProps, "data"> {
    idMina: number;
    value?: string | null;
    onChange?: (value: string | null) => void;
}

export const SelectUsuarioAutorizadoMina = ({
    idMina,
    value,
    onChange,
    className,
    ...props
}: SelectUsuarioAutorizadoMinaProps) => {
    const [loading, setLoading] = useState(false);
    const [usuarios, setUsuarios] = useState<RES_UsuarioAutorizadoMina[]>([]);
    const { listarUsuariosAutorizados } = useMinas({ setError: () => { } });

    useEffect(() => {
        let mounted = true;
        if (idMina) {
            setLoading(true);
            listarUsuariosAutorizados(idMina)
                .then((data) => {
                    if (mounted && data) setUsuarios(data);
                })
                .finally(() => {
                    if (mounted) setLoading(false);
                });
        }
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idMina]);

    return (
        <Select
            label="Responsable / Jefe Autorizado"
            placeholder={props.placeholder || "Seleccione un responsable..."}
            leftSection={loading ? <Loader size={14} color="gray" /> : <UserIcon className="w-4 h-4 text-zinc-400" />}
            data={usuarios.map(u => ({
                value: String(u.id_usuario_empresa),
                label: `${u.apellido} ${u.nombre}`.trim(),
                description: u.empresa
            }))}
            value={value}
            onChange={onChange}
            searchable
            clearable
            nothingFoundMessage="No se encontraron usuarios autorizados para esta mina"
            radius="lg"
            size="sm"
            maxDropdownHeight={300}
            disabled={loading || props.disabled}
            className={className}
            classNames={{
                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                dropdown: "bg-zinc-900 border-zinc-800",
                option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
                label: "text-zinc-300 mb-1 font-medium",
                description: "text-zinc-500 text-xs"
            }}
            {...props}
        />
    );
};

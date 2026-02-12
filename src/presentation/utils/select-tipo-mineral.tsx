import { Select, type SelectProps } from "@mantine/core";

export const SelectTipoMineral = (props: SelectProps) => {
    return (
        <Select
            label="Tipo de Mineral"
            placeholder="Seleccionar"
            data={[
                { value: "Polimetalico", label: "Polimetálico" },
                { value: "Carbon", label: "Carbón" },
            ]}
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

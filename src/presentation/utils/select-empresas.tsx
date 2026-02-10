import { Select, type SelectProps } from "@mantine/core";
import { useEffect, useState } from "react";
import type { RES_Empresa } from "../../services/empresas/empresas/dtos/responses";
import { useEmpresas } from "../../services/empresas/empresas/useEmpresas";

interface SelectEmpresasProps extends Omit<SelectProps, "data"> {
  value?: string | null;
  onChange?: (value: string | null) => void;
}

export const SelectEmpresas = ({
  value,
  onChange,
  ...props
}: SelectEmpresasProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState("");
  const { get_empresas_by_session } = useEmpresas({ setIsLoading, setError });
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);

  useEffect(() => {
    get_empresas_by_session().then((data) => {
      if (data) setEmpresas(data);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Select
      label="Empresa"
      placeholder="Seleccione empresa"
      data={empresas.map((empresa) => ({
        value: empresa.id_empresa.toString(),
        label: empresa.nombre_comercial,
      }))}
      value={value}
      onChange={onChange}
      disabled={isLoading || props.disabled}
      searchable
      nothingFoundMessage="No se encontraron empresas"
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

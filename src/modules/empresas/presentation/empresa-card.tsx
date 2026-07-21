import { useState } from "react";
import {
  Avatar,
  FileButton,
  Stack,
  Text,
  Badge,
  Loader,
  ActionIcon,
  Tooltip,
  Divider,
} from "@mantine/core";
import {
  BuildingOffice2Icon,
  PencilSquareIcon,
  MapPinIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import type { RES_Empresa } from "../../../service/responses/empresa";

interface EmpresaCardProps {
  empresa: RES_Empresa;
  onUpdateLogo: (id: number, file: File) => Promise<boolean>;
  onAddOficina: (empresa: RES_Empresa) => void;
}

export const EmpresaCard = ({
  empresa,
  onUpdateLogo,
  onAddOficina,
}: EmpresaCardProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpdateLogo(empresa.id_empresa, file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-zinc-900/40 border border-zinc-800/60 
      rounded-[32px] p-5 gap-4 hover:border-indigo-500/40 hover:bg-zinc-900/60 
      transition-all duration-500 overflow-hidden shadow-xl hover:shadow-indigo-500/10"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 blur-[60px] group-hover:bg-indigo-500/10 transition-colors duration-700" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/5 blur-[60px] group-hover:bg-purple-500/10 transition-colors duration-700" />

      <div className="flex items-center justify-start relative z-10">
        <Badge
          variant="filled"
          color="indigo"
          size="xs"
          radius="md"
          className="font-bold tracking-tight px-3"
        >
          RUC: {empresa.ruc}
        </Badge>
      </div>

      <div className="flex items-center gap-5 relative z-10">
        <div className="relative group/logo shrink-0">
          <FileButton
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/jpg"
            disabled={isUploading}
          >
            {(props) => (
              <div {...props} className="cursor-pointer relative">
                <Avatar
                  src={empresa.url_logo}
                  size={80}
                  radius={100}
                  className="border-2 border-zinc-800 group-hover:border-indigo-500/40 transition-all duration-500 shadow-xl"
                >
                  <BuildingOffice2Icon className="w-8 h-8 text-zinc-600" />
                </Avatar>

                {isUploading ? (
                  <div className="absolute inset-0 bg-zinc-950/80 rounded-full flex items-center justify-center backdrop-blur-xs border border-indigo-500/30">
                    <Loader size="sm" color="indigo" variant="bars" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-indigo-950/60 rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <PencilSquareIcon className="w-5 h-5 text-white mb-1" />
                    <Text
                      size="8px"
                      fw={800}
                      className="text-white uppercase tracking-tighter"
                    >
                      Cambiar
                    </Text>
                  </div>
                )}
              </div>
            )}
          </FileButton>
        </div>

        <Stack gap={0} className="flex-1 min-w-0">
          <Text
            size="sm"
            fw={700}
            className="text-white group-hover:text-indigo-200 transition-colors leading-tight"
          >
            {empresa.razon_social}
          </Text>
        </Stack>
      </div>

      <Divider
        color="zinc.8"
        variant="dashed"
        className="relative z-10 my-1"
      />

      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-3.5 h-3.5 text-zinc-500" />
            <Text
              size="10px"
              fw={700}
              className="text-zinc-500 uppercase tracking-wider"
            >
              Oficinas ({empresa.oficinas?.length ?? 0})
            </Text>
          </div>
          <Tooltip label="Agregar oficina" position="left" withArrow>
            <ActionIcon
              variant="subtle"
              color="indigo"
              size="sm"
              radius="md"
              onClick={() => onAddOficina(empresa)}
              className="hover:bg-indigo-500/10"
            >
              <PlusIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </div>

        {empresa.oficinas && empresa.oficinas.length > 0 ? (
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
            {empresa.oficinas.map((oficina) => (
              <div
                key={oficina.id_oficina}
                className="flex items-center justify-between gap-2 px-3 py-2 
                rounded-lg bg-zinc-950/50 border border-zinc-800/50 
                hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {oficina.es_principal && (
                    <StarIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <Text size="xs" fw={600} className="text-zinc-200 truncate">
                    {oficina.nombre}
                  </Text>
                </div>
                {oficina.estado === EstadoBase.Inactivo && (
                  <Badge
                    size="xs"
                    radius="sm"
                    variant="light"
                    color="gray"
                    className="shrink-0"
                  >
                    Inactivo
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-3 
            rounded-lg border border-dashed border-zinc-800/60 bg-zinc-950/30"
          >
            <Text size="10px" className="text-zinc-600">
              Sin oficinas registradas
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

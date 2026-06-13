import { Badge, Stack } from "@mantine/core";
import {
  TruckIcon,
  WrenchScrewdriverIcon,
  InboxStackIcon,
  Cog8ToothIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import type { RES_CategoriaResumen } from "../../service/categorias.responses";
import { TipoBien } from "../../../../shared/enums/_generic/tipo-bien";
import { TipoProducto } from "../../../../shared/enums/_generic/tipo-producto";

interface CategoriaGroupCardProps {
  clasif: string;
  grupo: RES_CategoriaResumen[];
  loading: boolean;
  columns: DataTableColumn<RES_CategoriaResumen>[];
}

const getGroupConfig = (clasif: string) => {
  switch (clasif) {
    case TipoBien.ActivoFijo:
      return {
        label: "Activos Fijos",
        sub: "Maquinaria, Equipos y Vehículos",
        icon: TruckIcon,
        iconBgClass: "bg-indigo-500/10 border-indigo-500/20",
        iconTextClass: "text-indigo-400",
      };
    case TipoBien.Herramienta:
      return {
        label: "Herramientas",
        sub: "Equipos de mano y utensilios de trabajo",
        icon: WrenchScrewdriverIcon,
        iconBgClass: "bg-emerald-500/10 border-emerald-500/20",
        iconTextClass: "text-emerald-400",
      };
    case TipoBien.Suministro:
      return {
        label: "Suministros",
        sub: "Combustibles, insumos y materiales consumibles",
        icon: InboxStackIcon,
        iconBgClass: "bg-sky-500/10 border-sky-500/20",
        iconTextClass: "text-sky-400",
      };
    case TipoBien.Repuesto:
      return {
        label: "Repuestos",
        sub: "Piezas de repuesto y componentes",
        icon: Cog8ToothIcon,
        iconBgClass: "bg-violet-500/10 border-violet-500/20",
        iconTextClass: "text-violet-400",
      };
    case TipoBien.EPP:
      return {
        label: "EPPs / Equipos de Protección",
        sub: "Equipos de protección y seguridad personal",
        icon: ShieldCheckIcon,
        iconBgClass: "bg-rose-500/10 border-rose-500/20",
        iconTextClass: "text-rose-400",
      };
    case TipoProducto.Servicio:
      return {
        label: "Servicios",
        sub: "Servicios generales y mantenimiento",
        icon: BriefcaseIcon,
        iconBgClass: "bg-cyan-500/10 border-cyan-500/20",
        iconTextClass: "text-cyan-400",
      };
    default:
      return {
        label: clasif,
        sub: "Clasificación general",
        icon: TagIcon,
        iconBgClass: "bg-zinc-500/10 border-zinc-500/20",
        iconTextClass: "text-zinc-400",
      };
  }
};

export const CategoriaGroupCard = ({
  clasif,
  grupo,
  loading,
  columns,
}: CategoriaGroupCardProps) => {
  const {
    label,
    sub,
    icon: IconComponent,
    iconBgClass,
    iconTextClass,
  } = getGroupConfig(clasif);

  return (
    <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md animate-fade-in">
      {/* Header matching ProductGroupHeader premium styling */}
      <div className="p-4 bg-zinc-900/20 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl border ${iconBgClass} flex items-center justify-center`}
          >
            <IconComponent className={`w-4 h-4 ${iconTextClass}`} />
          </div>
          <Stack gap={2}>
            <span className="uppercase tracking-widest text-zinc-500 text-[10px] font-black block">
              {clasif === TipoProducto.Servicio ? "Servicio" : "Bien"}
            </span>
            <span className="text-md font-black text-white tracking-tight block">
              {label}
            </span>
            <span className="text-xs text-zinc-500 font-medium block">
              {sub}
            </span>
          </Stack>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="gradient"
              gradient={{ from: "indigo.8", to: "cyan.8" }}
              radius="md"
              size="md"
              className="h-9 px-6 border-0 shadow-lg shadow-indigo-900/20"
            >
              <span className="text-[10px] font-extrabold text-center block">
                {grupo.length} {grupo.length === 1 ? "Categoría" : "Categorías"}
              </span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative shadow-inner">
        <DataTableEstandar
          idAccessor="id_categoria"
          columns={columns}
          records={grupo}
          loading={loading}
          initialPageSize={10}
          minHeight={0}
        />
      </div>
    </div>
  );
};

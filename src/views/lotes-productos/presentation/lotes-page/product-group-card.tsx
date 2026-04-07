import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import type { RES_Lote } from "../../service/lotes.responses";
import type { GroupedProduct } from "./types";
import { useProductGroupSelection } from "./hooks/useProductGroupSelection";
import { ProductGroupHeader } from "../components/product-group-header.component";

interface ProductGroupCardProps {
  product: GroupedProduct;
  columns: DataTableColumn<RES_Lote>[];
  loading: boolean;
  onPrint: (lotes: RES_Lote | RES_Lote[]) => void;
}

export const ProductGroupCard = ({
  product,
  columns,
  loading,
  onPrint,
}: ProductGroupCardProps) => {
  const { enhancedColumns } = useProductGroupSelection({
    lotes: product.lotes,
    columns,
    onPrint,
  });

  return (
    <div className="bg-zinc-900/65 border border-zinc-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col backdrop-blur-md">
      <ProductGroupHeader product={product} />

      <div className="relative shadow-inner">
        <DataTableEstandar
          idAccessor="id_lote"
          columns={enhancedColumns}
          records={product.lotes}
          loading={loading}
          initialPageSize={5}
          minHeight={0}
        />
      </div>
    </div>
  );
};

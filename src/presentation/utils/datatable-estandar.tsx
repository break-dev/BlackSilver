/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { PAGE_SIZE } from "../constants";

interface DataTableEstandarProps {
  idAccessor: string;
  columns: DataTableColumn<any>[];
  records: any[];
  totalRecords: number;
  page: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export const DataTableEstandar = ({
  idAccessor,
  columns,
  records,
  totalRecords,
  page,
  onPageChange,
  loading,
}: DataTableEstandarProps) => {
  return (
    <div
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden 
        backdrop-blur-sm"
    >
      <DataTable
        columns={columns}
        records={records}
        totalRecords={totalRecords}
        recordsPerPage={PAGE_SIZE}
        page={page}
        striped={true}
        onPageChange={onPageChange}
        highlightOnHover={true}
        fetching={loading}
        idAccessor={idAccessor}
        noRecordsText="No se encontraron registros..."
        loadingText="Cargando..."
        minHeight={300}
        paginationText={({ from, to, totalRecords }) =>
          `${from} - ${to} de ${totalRecords}`
        }
        classNames={{
          root: "bg-transparent",
          table: "bg-transparent",
          header: "bg-zinc-900/80",
          pagination: "bg-zinc-900/50 border-t border-zinc-800",
        }}
        styles={{
          header: {
            "--mantine-color-text": "var(--mantine-color-zinc-3, #d4d4d8)",
          },
        }}
      />
    </div>
  );
};

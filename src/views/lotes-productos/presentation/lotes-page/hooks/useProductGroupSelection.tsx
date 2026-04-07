import { useState, useMemo, useCallback } from "react";
import { ActionIcon, Checkbox, Group, Tooltip } from "@mantine/core";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import type { RES_Lote } from "../../../service/lotes.responses";

interface UseProductGroupSelectionProps {
  lotes: RES_Lote[];
  columns: DataTableColumn<RES_Lote>[];
  onPrint: (lotes: RES_Lote | RES_Lote[]) => void;
}

export const useProductGroupSelection = ({
  lotes,
  columns,
  onPrint,
}: UseProductGroupSelectionProps) => {
  const [selectedRecords, setSelectedRecords] = useState<RES_Lote[]>([]);

  const handlePrintSelected = useCallback(() => {
    if (selectedRecords.length === 0) return;
    onPrint(selectedRecords);
  }, [selectedRecords, onPrint]);

  const allSelected =
    selectedRecords.length === lotes.length && lotes.length > 0;
  const isIndeterminate =
    selectedRecords.length > 0 && selectedRecords.length < lotes.length;

  const enhancedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.accessor === "ticket") {
        return {
          ...col,
          width: 90, // Ajustado para el checkbox y botón
          title: (
            <Group gap={16} wrap="nowrap">
              <Checkbox
                size="xs"
                color="indigo"
                checked={allSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => {
                  if (e.currentTarget.checked) setSelectedRecords(lotes);
                  else setSelectedRecords([]);
                }}
              />
              {selectedRecords.length > 0 && (
                <Tooltip
                  label={`Imprimir ${selectedRecords.length} seleccionados`}
                  position="top"
                  withArrow
                >
                  <ActionIcon
                    variant="filled"
                    color="indigo"
                    size="sm"
                    onClick={handlePrintSelected}
                    className="shadow-md animate-in zoom-in-50 duration-200"
                  >
                    <PrinterIcon className="w-3.5 h-3.5" />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          ),
          render: (record: RES_Lote) => (
            <Group gap={8} wrap="nowrap" className="pl-0.5">
              <Checkbox
                size="xs"
                color="indigo"
                className="cursor-pointer"
                checked={selectedRecords.some(
                  (r) => r.id_lote === record.id_lote,
                )}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    setSelectedRecords((prev) => [...prev, record]);
                  } else {
                    setSelectedRecords((prev) =>
                      prev.filter((r) => r.id_lote !== record.id_lote),
                    );
                  }
                }}
              />
              {col.render && col.render(record, 0)}
            </Group>
          ),
        };
      }
      return col;
    });
  }, [
    columns,
    selectedRecords,
    handlePrintSelected,
    allSelected,
    isIndeterminate,
    lotes,
  ]);

  return { enhancedColumns, selectedRecords, setSelectedRecords };
};

import { Badge, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";

import { useKardex } from "../../../../../services/inventario/kardex/useKardex";
import type { RES_MovimientoKardex } from "../../../../../services/inventario/kardex/dtos/responses";
import { DataTableClassic } from "../../../../utils/datatable-classic";

interface ModalKardexProps {
    idLote: number;
}

export const ModalKardex = ({ idLote }: ModalKardexProps) => {
    const [loading, setLoading] = useState(true);
    const [movimientos, setMovimientos] = useState<RES_MovimientoKardex[]>([]);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    const { listarPorLote } = useKardex({ setError: () => { } });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await listarPorLote(idLote);
            if (data) {
                setMovimientos(data);
            }
            setLoading(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idLote]);

    const paginatedRecords = movimientos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const columns: DataTableColumn<RES_MovimientoKardex>[] = [
        {
            accessor: "created_at",
            title: "Fecha",
            width: 150,
            render: (record) => (
                <Text size="sm" className="text-zinc-300">
                    {dayjs(record.created_at).format("DD/MM/YYYY HH:mm")}
                </Text>
            )
        },
        {
            accessor: "tipo_movimiento",
            title: "Movimiento",
            width: 140,
            render: (record) => {
                const isIngreso = record.tipo_movimiento.toLowerCase().includes("ingreso");
                return (
                    <Badge
                        color={isIngreso ? "green" : "red"}
                        variant="light"
                        leftSection={isIngreso ? <ArrowDownIcon className="w-3 h-3" /> : <ArrowUpIcon className="w-3 h-3" />}
                    >
                        {record.codigo_movimiento}
                    </Badge>
                );
            }
        },
        {
            accessor: "cantidad_movimiento",
            title: "Cantidad",
            textAlign: "right",
            width: 100,
            render: (record) => (
                <Text fw={700} c={record.tipo_movimiento.toLowerCase().includes("ingreso") ? "green" : "red"}>
                    {record.tipo_movimiento.toLowerCase().includes("ingreso") ? "+" : "-"}
                    {record.cantidad_movimiento}
                </Text>
            )
        },
        {
            accessor: "cantidad_resultante",
            title: "Saldo",
            textAlign: "right",
            width: 100,
            render: (record) => (
                <Text fw={600} className="text-zinc-200">{record.cantidad_resultante}</Text>
            )
        },
        {
            accessor: "glosa",
            title: "Referencia / Glosa",
            render: (record) => (
                <Text size="xs" className="text-zinc-400 italic truncate max-w-[200px]" title={record.glosa}>
                    {record.glosa || "-"}
                </Text>
            )
        }
    ];

    return (
        <div className="h-[500px] flex flex-col">
            <DataTableClassic
                idAccessor="id"
                columns={columns}
                records={paginatedRecords}
                totalRecords={movimientos.length}
                page={page}
                onPageChange={setPage}
                loading={loading}
            />
        </div>
    );
};

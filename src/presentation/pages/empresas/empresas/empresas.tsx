import { useState, useMemo, useEffect } from "react";
import { Button, TextInput, Badge } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { type DataTableColumn } from "mantine-datatable";
import {
    PlusIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useEmpresas } from "../../../../services/empresas/empresas/useEmpresas";
import type { RES_Empresa } from "../../../../services/empresas/empresas/dtos/responses";
import { RegistroEmpresa } from "./components/registro-empresa";
import { UIStore } from "../../../../stores/ui.store";
import { DataTableClassic } from "../../../utils/datatable-classic";
import { ModalRegistro } from "../../../utils/modal-registro";

const PAGE_SIZE = 35;

export const EmpresasPage = () => {
    const setTitle = UIStore((state) => state.setTitle);

    // Estado local
    const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
    const [loading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);

    // Filtros
    const [busqueda, setBusqueda] = useState("");

    // Modal
    const [opened, { open, close }] = useDisclosure(false);

    // Servicio
    const { listar } = useEmpresas({ setError });

    // Carga inicial
    useEffect(() => {
        let cancelled = false;
        listar()
            .then((data) => {
                if (!cancelled) setEmpresas(data || []);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Title
    useEffect(() => {
        setTimeout(() => {
            setTitle("Empresas");
        }, 0);
    }, [setTitle]);

    // Datos filtrados
    const empresasFiltradas = useMemo(() => {
        return empresas.filter((c) => {
            const term = busqueda.toLowerCase();
            const matchBusqueda =
                !busqueda ||
                c.razon_social.toLowerCase().includes(term) ||
                c.nombre_comercial.toLowerCase().includes(term) ||
                c.ruc.includes(term) ||
                c.abreviatura.toLowerCase().includes(term);

            return matchBusqueda;
        });
    }, [empresas, busqueda]);

    // Paginación
    const registrosPaginados = useMemo(() => {
        const inicio = (page - 1) * PAGE_SIZE;
        return empresasFiltradas.slice(inicio, inicio + PAGE_SIZE);
    }, [empresasFiltradas, page]);

    // Callback al registrar exitosamente
    const handleRegistroExitoso = (empresa: RES_Empresa) => {
        close();
        setEmpresas([...empresas, empresa]);
    };

    const columns: DataTableColumn<RES_Empresa>[] = [
        {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 50,
            render: (_record, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
        {
            accessor: "ruc",
            title: "RUC",
            width: 120,
            render: (record) => (
                <span className="font-mono text-zinc-300">{record.ruc}</span>
            ),
        },
        {
            accessor: "nombre_comercial",
            title: "Nombre Comercial",
            render: (record) => (
                <span className="text-zinc-200 font-semibold">{record.nombre_comercial}</span>
            ),
        },
        {
            accessor: "razon_social",
            title: "Razón Social",
            render: (record) => (
                <span className="text-zinc-400 text-sm">{record.razon_social}</span>
            ),
        },
        {
            accessor: "abreviatura",
            title: "Abrev.",
            textAlign: "center",
            width: 100,
            render: (record) => (
                <Badge variant="light" color="cyan" radius="sm">
                    {record.abreviatura}
                </Badge>
            ),
        },
        {
            accessor: "logo",
            title: "Logo",
            textAlign: "center",
            width: 80,
            render: (_record) => (
                <span className="text-xs text-zinc-600">Logo</span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Encabezado y Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-4 flex-1">
                    <TextInput
                        placeholder="Buscar por RUC, Nombre o Abrev..."
                        leftSection={
                            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
                        }
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.currentTarget.value);
                            setPage(1);
                        }}
                        className="flex-1 min-w-64"
                        radius="lg"
                        size="sm"
                        classNames={{
                            input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 
            focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
                        }}
                    />
                </div>

                <Button
                    leftSection={<PlusIcon className="w-5 h-5" />}
                    onClick={open}
                    radius="lg"
                    size="sm"
                    className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 
        font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0 shrink-0"
                >
                    Nueva Empresa
                </Button>
            </div>

            {/* DataTable */}
            <DataTableClassic
                idAccessor="id_empresa"
                columns={columns}
                records={registrosPaginados}
                totalRecords={empresasFiltradas.length}
                page={page}
                onPageChange={setPage}
                loading={loading}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Modal de Registro */}
            <ModalRegistro opened={opened} close={close} title="Nueva Empresa">
                <RegistroEmpresa onSuccess={handleRegistroExitoso} onCancel={close} />
            </ModalRegistro>
        </div>
    );
};

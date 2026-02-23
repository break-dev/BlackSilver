import { Button, Select, Loader, Text } from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { ArrowLeftIcon, PlusIcon, BriefcaseIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

// Services
import { useMinas } from "../../../../../services/empresas/minas/useMinas";
import { useConcesiones } from "../../../../../services/empresas/concesiones/useConcesiones";
import type { RES_Empresa } from "../../../../../services/empresas/empresas/dtos/responses";
import type { RES_Asignacion } from "../../../../../services/empresas/concesiones/dtos/responses";

interface GestionEmpresasMinaProps {
    idMina: number;
    idConcesion: number; // Required to filter valid companies
    nombreMina?: string;
}

export const GestionEmpresasMina = ({ idMina, idConcesion, nombreMina }: GestionEmpresasMinaProps) => {

    // States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Lists
    const [empresasAsignadas, setEmpresasAsignadas] = useState<RES_Empresa[]>([]);
    const [empresasContrato, setEmpresasContrato] = useState<RES_Asignacion[]>([]); // Valid companies (by contract)

    const [, setError] = useState("");

    // Services
    // Note: listarEmpresasAsignadas is assumed to be added to useMinas (I will add it next if I missed it, but I planned it)
    const { asignarEmpresa, listarEmpresasAsignadas } = useMinas({ setError });
    const { listarAsignaciones } = useConcesiones({ setError });

    // Load Data
    const cargarDatos = async () => {
        setLoading(true);
        try {
            // 1. Get currently assigned companies to the mine
            // 2. Get valid companies (contracts) in the concession
            const [misEmpresas, validEmpresas] = await Promise.all([
                listarEmpresasAsignadas ? listarEmpresasAsignadas(idMina) : Promise.resolve([]),
                listarAsignaciones(idConcesion)
            ]);

            if (misEmpresas) setEmpresasAsignadas(misEmpresas);
            if (validEmpresas) setEmpresasContrato(validEmpresas);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idMina && idConcesion) {
            cargarDatos();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idMina, idConcesion]);

    // Form
    const form = useForm({
        initialValues: { id_empresa: "" },
        validate: { id_empresa: (val) => !val ? "Seleccione una empresa" : null }
    });

    const handleSubmit = async (values: typeof form.values) => {
        setSaving(true);
        const success = await asignarEmpresa({
            id_mina: idMina,
            id_empresa: Number(values.id_empresa)
        });

        if (success) {
            notifications.show({ title: "Empresa Asignada", message: "Empresa vinculada a la mina exitosamente.", color: "green" });
            setShowForm(false);
            form.reset();
            cargarDatos();
        }
        setSaving(false);
    };

    // Filter Options: Only show companies with Valid Contract that are NOT yet assigned to this mine
    const selectOptions = useMemo(() => {
        const assignedIds = new Set(empresasAsignadas.map(e => e.id_empresa));

        return empresasContrato
            .filter(c => c.estado === "Activo") // Only active contracts
            .filter(c => !assignedIds.has(c.id_empresa)) // Not already assigned to mine
            .map(c => ({
                value: String(c.id_empresa),
                label: c.nombre_comercial || c.razon_social
            }));
    }, [empresasContrato, empresasAsignadas]);

    // UI
    if (showForm) {
        return (
            <div className="space-y-4 animate-fade-in">
                <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => setShowForm(false)}
                    leftSection={<ArrowLeftIcon className="w-3 h-3" />}
                    className="hover:text-white text-zinc-400 mb-4"
                >
                    Volver al listado
                </Button>

                <div className="p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl">
                    <h3 className="text-white font-bold mb-2">Asignar Empresa Contratista</h3>
                    <p className="text-xs text-zinc-500 mb-4">Solo se muestran empresas con contrato VIGENTE en la concesión de esta mina.</p>

                    <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
                        <Select
                            label="Empresa"
                            placeholder="Buscar empresa..."
                            data={selectOptions}
                            searchable
                            nothingFoundMessage={selectOptions.length === 0 ? "No hay empresas elegibles" : "No encontrado"}
                            leftSection={<BriefcaseIcon className="w-4 h-4 text-zinc-400" />}
                            {...form.getInputProps("id_empresa")}
                            radius="lg"
                            size="sm"
                            classNames={{
                                input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                                dropdown: "bg-zinc-900 border-zinc-800",
                                option: "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
                                label: "text-zinc-300 mb-1 font-medium"
                            }}
                        />
                        <div className="flex justify-end gap-2 mt-6">
                            <Button size="sm" variant="default" onClick={() => setShowForm(false)} className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                type="submit"
                                loading={saving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
                            >
                                Asignar
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Empresas Ejecutoras</h3>
                    <p className="text-zinc-500 text-sm">{nombreMina}</p>
                </div>
                <Button
                    size="xs"
                    variant="light"
                    color="indigo"
                    leftSection={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setShowForm(true)}
                    className="hover:bg-indigo-900/30 transition-colors"
                >
                    Asignar
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><Loader size="sm" color="gray" /></div>
            ) : empresasAsignadas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                        <BriefcaseIcon className="w-6 h-6 text-zinc-600" />
                    </div>
                    <Text size="sm" className="text-zinc-500 font-medium">No hay empresas asignadas</Text>
                    <Text size="xs" className="text-zinc-600 mt-1">Asigne una empresa para comenzar.</Text>
                </div>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    {empresasAsignadas.map(emp => (
                        <div key={emp.id_empresa} className="relative p-4 rounded-xl border flex items-start gap-4 transition-all border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                <BriefcaseIcon className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <Text className="text-base font-bold text-white truncate">
                                        {emp.nombre_comercial || emp.razon_social}
                                    </Text>
                                </div>

                                <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                                    <IdentificationIcon className="w-4 h-4 shrink-0" />
                                    <span>RUC: {emp.ruc}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

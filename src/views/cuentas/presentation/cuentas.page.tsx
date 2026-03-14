import { ActionIcon, Badge, Button, Group, TextInput, Avatar, Text, Stack } from '@mantine/core';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    UserIcon,
    KeyIcon,
    BuildingOffice2Icon,
    PencilSquareIcon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useTitlePage } from '../../../hooks/useTitlePage';
import { useCuentas } from '../hooks/useCuentas';
import { ModalEstandar } from '../../../presentation/utils/modal-estandar';
import { RegistroCuenta } from './registro-cuenta';
import { GestionEmpresas } from './gestion-empresas';

export const CuentasPage = () => {
    useTitlePage("Gestión de Cuentas");

    const {
        cuentasFiltradas,
        loading,
        busqueda,
        setBusqueda,
        openedCreate,
        openCreate,
        closeCreate,
        openedEmpresas,
        closeEmpresas,
        selectedCuenta,
        setSelectedCuenta,
        handleOpenEmpresas,
        handleOpenEdit,
        refresh
    } = useCuentas();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <TextInput
                    placeholder="Buscar por usuario, empleado o rol..."
                    leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.currentTarget.value)}
                    className="flex-1 min-w-64"
                    radius="lg"
                    size="sm"
                    classNames={{
                        input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                    }}
                />
                <Button
                    leftSection={<PlusIcon className="w-5 h-5" />}
                    onClick={() => { setSelectedCuenta(null); openCreate(); }}
                    radius="lg"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
                >
                    Nueva Cuenta
                </Button>
            </div>

            {/* Grid de Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-2xl bg-zinc-900/30 animate-pulse border border-zinc-800/50" />
                    ))}
                </div>
            ) : cuentasFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
                    <Squares2X2Icon className="w-10 h-10 text-zinc-700 mb-3" />
                    <p className="text-zinc-500 text-sm font-medium">No se encontraron cuentas registradas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {cuentasFiltradas.map((cuenta) => {
                        const isActive = cuenta.estado === "Activo";
                        return (
                            <div
                                key={cuenta.id_usuario}
                                className="group flex flex-col bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-5 gap-4 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

                                {/* Row 1: Badges superiores (Empresa y Estado) */}
                                <div className="flex items-center justify-between mb-1">
                                    <Badge
                                        size="xs"
                                        variant="filled"
                                        radius="sm"
                                        className="bg-indigo-500/20 text-indigo-300 font-bold border-none"
                                    >
                                        {cuenta.empresa_pertenece}
                                    </Badge>
                                    <Badge
                                        color={isActive ? "green" : "gray"}
                                        variant="light"
                                        radius="md"
                                        size="sm"
                                    >
                                        {cuenta.estado}
                                    </Badge>
                                </div>

                                {/* Row 2: Employee Avatar & Identity */}
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        src={cuenta.path_foto}
                                        size="xl"
                                        radius="xl"
                                        className="border-2 border-zinc-800 group-hover:border-indigo-500/40 transition-colors"
                                    >
                                        <UserIcon className="w-8 h-8 text-zinc-700" />
                                    </Avatar>
                                    <Stack gap={2}>
                                        <Text size="sm" fw={800} className="text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
                                            {cuenta.apellido_empleado}, {cuenta.nombre_empleado}
                                        </Text>
                                        <Badge
                                            size="xs"
                                            variant="filled"
                                            radius="sm"
                                            className="bg-zinc-800 text-zinc-400 font-bold border-none w-fit"
                                        >
                                            {cuenta.nombre_rol}
                                        </Badge>
                                    </Stack>
                                </div>

                                {/* Row 2: Account Details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-zinc-950/40 rounded-2xl p-3 border border-zinc-800/40">
                                        <Text size="10px" fw={800} color="dimmed" className="uppercase tracking-widest mb-1">Usuario</Text>
                                        <Group gap={6}>
                                            <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                                            <Text size="xs" fw={700} className="text-zinc-200">{cuenta.username}</Text>
                                        </Group>
                                    </div>
                                    <div className="bg-zinc-950/40 rounded-2xl p-3 border border-zinc-800/40 relative group/pwd">
                                        <Text size="10px" fw={800} color="dimmed" className="uppercase tracking-widest mb-1">Contraseña</Text>
                                        <Group justify="space-between">
                                            <Group gap={6}>
                                                <KeyIcon className="w-3.5 h-3.5 text-amber-400" />
                                                <Text size="xs" fw={700} className="text-zinc-200 italic">••••••••</Text>
                                            </Group>
                                            <ActionIcon
                                                variant="subtle"
                                                size="xs"
                                                color="zinc"
                                                onClick={() => handleOpenEdit(cuenta)}
                                                className="hover:bg-zinc-800"
                                            >
                                                <PencilSquareIcon className="w-3.5 h-3.5 text-zinc-500 hover:text-white" />
                                            </ActionIcon>
                                        </Group>
                                    </div>
                                </div>

                                {/* Row 3: Acción de Accesos a Empresas */}
                                <div className="bg-cyan-500/[0.03] rounded-2xl p-3 border border-cyan-500/10 flex items-center justify-between group/access hover:bg-cyan-500/[0.06] transition-colors cursor-pointer" onClick={() => handleOpenEmpresas(cuenta)}>
                                    <Group gap="xs" className="min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover/access:border-cyan-500/40 transition-colors">
                                            <BuildingOffice2Icon className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <div>
                                            <Text size="xs" fw={700} className="text-cyan-200">
                                                Empresas Asignadas
                                            </Text>
                                            <Text size="10px" color="dimmed" className="line-clamp-1">
                                                Asignar acceso a otras empresas
                                            </Text>
                                        </div>
                                    </Group>
                                    <ActionIcon
                                        variant="filled"
                                        color="cyan"
                                        size="md"
                                        radius="lg"
                                        className="shadow-lg shadow-cyan-900/20"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </ActionIcon>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modales */}
            <ModalEstandar
                opened={openedCreate}
                close={closeCreate}
                title={selectedCuenta ? `Cambiar Contraseña: ${selectedCuenta.username}` : "Registrar Nueva Cuenta"}
                size="md"
            >
                <RegistroCuenta
                    cuentaEdit={selectedCuenta}
                    onClose={closeCreate}
                    refresh={refresh}
                />
            </ModalEstandar>

            <ModalEstandar
                opened={openedEmpresas}
                close={closeEmpresas}
                title="Empresas con Acceso"
                size="sm"
            >
                {selectedCuenta && (
                    <GestionEmpresas
                        id_usuario={selectedCuenta.id_usuario}
                        id_empresa_pertenece={selectedCuenta.id_empresa_pertenece}
                        nombre_empleado={`${selectedCuenta.nombre_empleado} ${selectedCuenta.apellido_empleado}`}
                        refreshParent={refresh}
                    />
                )}
            </ModalEstandar>
        </div>
    );
};

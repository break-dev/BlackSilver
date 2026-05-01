import {
  Button,
  TextInput,
  Skeleton,
  Text,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useTitlePage } from "../../../hooks/useTitlePage";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroEmpresa } from "./registro-empresa";
import { useEmpresas } from "../hooks/useEmpresas";
import { useRegistroEmpresa } from "../hooks/useRegistroEmpresa";
import { EmpresaCard } from "./empresa-card";

export const EmpresasPage = () => {
  useTitlePage("Empresas");

  const {
    loading,
    busqueda,
    setBusqueda,
    empresasFiltradas,
    openedCreate,
    openCreate,
    closeCreate,
    onEmpresaCreada,
    handleUpdateLogo,
  } = useEmpresas();

  const registro = useRegistroEmpresa({
    onSuccess: onEmpresaCreada,
    onClose: closeCreate,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <TextInput
          label="Buscar Empresa"
          placeholder="Buscar empresas por nombre o RUC..."
          leftSection={
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
          }
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          className="flex-1 min-w-64"
          radius="xl"
          size="sm"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 h-11",
          }}
        />
        <Button
          leftSection={<PlusIcon className="w-5 h-5" />}
          onClick={openCreate}
          radius="xl"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-900/20 shrink-0 h-11 px-6"
        >
          Nueva Empresa
        </Button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-[32px] p-6 space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton height={20} width={60} radius="md" />
                <Skeleton height={20} width={20} circle />
              </div>
              <div className="flex flex-col items-center gap-4">
                <Skeleton height={100} width={100} circle />
                <Skeleton height={20} width="70%" radius="md" />
                <Skeleton height={14} width="40%" radius="md" />
              </div>
              <Skeleton height={60} width="100%" radius="2xl" />
            </div>
          ))}
        </div>
      ) : empresasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/10 rounded-[40px] border border-dashed border-zinc-800/50">
          <div className="bg-zinc-900/50 p-6 rounded-full mb-4 border border-zinc-800">
            <Squares2X2Icon className="w-10 h-10 text-zinc-700" />
          </div>
          <Text size="sm" fw={600} className="text-zinc-500">
            No se encontraron empresas registradas
          </Text>
          <Text size="xs" className="text-zinc-600 mt-1">
            Intenta con otro término de búsqueda o registra una nueva
          </Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresasFiltradas.map((empresa) => (
            <EmpresaCard 
              key={empresa.id_empresa} 
              empresa={empresa} 
              onUpdateLogo={handleUpdateLogo} 
            />
          ))}
        </div>
      )}

      {/* Registration Modal */}
      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Registrar Empresa"
        size="md"
      >
        <RegistroEmpresa
          ruc={registro.ruc}
          setRuc={registro.setRuc}
          razonSocial={registro.razonSocial}
          setRazonSocial={registro.setRazonSocial}
          nombreComercial={registro.nombreComercial}
          setNombreComercial={registro.setNombreComercial}
          abreviatura={registro.abreviatura}
          setAbreviatura={registro.setAbreviatura}
          logoFile={registro.logoFile}
          setLogoFile={registro.setLogoFile}
          error={registro.error}
          loading={registro.loading}
          onSave={registro.handleGuardar}
          onCancel={() => {
            closeCreate();
            registro.reset();
          }}
        />
      </ModalEstandar>
    </div>
  );
};

export default EmpresasPage;

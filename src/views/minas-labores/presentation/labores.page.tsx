import { Badge, Button, Text, TextInput } from "@mantine/core";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroLaborMina } from "./registro-labor-mina";
import { useGestionLabores } from "../hooks/useGestionLabores";
import type { RES_Labor, RES_ResumenMina } from "../service/minas.responses";

interface Props {
  mina: RES_ResumenMina;
}

export const GestionLabores = ({ mina }: Props) => {
  const {
    laboresFiltradas,
    loading,
    busqueda,
    setBusqueda,
    openedCreate,
    openCreate,
    closeCreate,
    handleLaborCreada,
  } = useGestionLabores({ idMina: mina.id_mina });

  const columns: DataTableColumn<RES_Labor>[] = [
    {
      accessor: "index",
      title: "#",
      textAlign: "center",
      width: 50,
    },
    {
      accessor: "nombre",
      title: "Labor",
      width: 220,
      render: (r) => (
        <div className="flex flex-col">
          <Text size="sm" fw={600} className="text-zinc-200">
            {r.nombre}
          </Text>
          <Text size="xs" c="dimmed" className="font-mono">
            {r.correlativo}
          </Text>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" color="cyan" size="xs">
              {r.tipo_labor}
            </Badge>
            {r.es_de_produccion == 1 && (
              <Badge color="pink" size="xs" variant="light">
                Producción
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessor: "empresa",
      title: "Empresa",
      width: 250,
      render: (r) =>
        r.empresa ? (
          <Badge variant="light" color="indigo" size="sm" radius="sm">
            {r.empresa}
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">
            Sin asignar
          </Text>
        ),
    },
    {
      accessor: "fecha_inicio",
      title: "Inicio",
      width: 120,
      render: (r) => (
        <Text size="xs" className="text-zinc-500">
          {r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString() : "-"}
        </Text>
      ),
    },
    {
      accessor: "fecha_fin",
      title: "Término",
      width: 120,
      render: (r) => (
        <Text size="xs" className="text-zinc-500">
          {r.fecha_fin ? new Date(r.fecha_fin).toLocaleDateString() : "-"}
        </Text>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 120,
      render: (r) => (
        <Badge
          color={r.estado === "Activo" ? "green" : "gray"}
          variant="light"
          size="sm"
        >
          {r.estado === "Activo" ? "Activa" : "Terminada"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">
            Labores Operativas
          </h3>
          <p className="text-zinc-500 text-sm">{mina.nombre}</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <TextInput
            placeholder="Buscar por nombre, veta o nivel..."
            leftSection={
              <MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-500" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            className="flex-1 sm:w-64"
            radius="md"
            size="sm"
            classNames={{
              input:
                "bg-zinc-900 border-zinc-800 focus:border-indigo-500/50 text-white placeholder:text-zinc-600",
            }}
          />
          <Button
            size="sm"
            variant="light"
            color="indigo"
            leftSection={<PlusIcon className="w-4 h-4" />}
            onClick={openCreate}
            radius="md"
            className="hover:bg-indigo-900/30 shrink-0"
          >
            Nueva Labor
          </Button>
        </div>
      </div>

      <DataTableEstandar
        idAccessor="id_labor"
        columns={columns}
        records={laboresFiltradas}
        loading={loading}
      />

      <ModalEstandar
        opened={openedCreate}
        close={closeCreate}
        title="Nueva Labor"
        size="lg"
      >
        <RegistroLaborMina
          idMina={mina.id_mina}
          onSuccess={handleLaborCreada}
          onCancel={closeCreate}
        />
      </ModalEstandar>
    </div>
  );
};

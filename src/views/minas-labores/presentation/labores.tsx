import { Badge, Button, Text, TextInput } from "@mantine/core";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroLabor } from "./registro-labor";
import { useLabores } from "../hooks/useLabores";
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
  } = useLabores({ idMina: mina.id_mina });

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
      width: 240,
      render: (r) => (
        <div className="flex flex-col gap-1 py-1">
          <Text size="sm" fw={600} className="text-zinc-200">
            {r.nombre}
          </Text>
          <Text size="xs" c="dimmed" className="font-mono">
            {r.correlativo}
          </Text>
          <div className="flex gap-1.5 flex-wrap mt-0.5">
            <Badge variant="outline" color="cyan" size="xs">
              {r.tipo_labor}
            </Badge>
            {r.es_de_produccion == 1 && (
              <Badge color="pink" size="xs" variant="light">
                Producción
              </Badge>
            )}
            {r.tipo_sostenimiento && (
              <Badge color="gray" size="xs" variant="outline">
                {r.tipo_sostenimiento}
              </Badge>
            )}
          </div>
          {/* Detalles técnicos opcionales */}
          {(r.veta || r.nivel || r.ancho || r.alto) && (
            <div className="flex gap-2 flex-wrap text-[10px] text-zinc-600 mt-0.5">
              {r.veta && <span>Veta: <span className="text-zinc-500">{r.veta}</span></span>}
              {r.nivel && <span>Nivel: <span className="text-zinc-500">{r.nivel}</span></span>}
              {r.ancho && <span>{r.ancho}m ancho</span>}
              {r.alto && <span>{r.alto}m alto</span>}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "empresa",
      title: "Empresa",
      width: 200,
      render: (r) =>
        r.empresa ? (
          <Text size="sm" className="text-zinc-300 font-medium">
            {r.empresa}
          </Text>
        ) : (
          <Text size="xs" c="dimmed">
            Sin asignar
          </Text>
        ),
    },
    {
      accessor: "fecha_inicio",
      title: "Período",
      width: 160,
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <Text size="xs" className="text-zinc-400">
            Inicio:{" "}
            <span className="text-zinc-300">
              {r.fecha_inicio
                ? new Date(r.fecha_inicio).toLocaleDateString("es-PE")
                : "—"}
            </span>
          </Text>
          <Text size="xs" className="text-zinc-400">
            Fin:{" "}
            <span className={r.fecha_fin ? "text-zinc-300" : "text-zinc-600 italic"}>
              {r.fecha_fin
                ? new Date(r.fecha_fin).toLocaleDateString("es-PE")
                : "En curso"}
            </span>
          </Text>
        </div>
      ),
    },
    {
      accessor: "estado",
      title: "Estado",
      textAlign: "center",
      width: 110,
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
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            className="flex-1"
            radius="lg"
            size="sm"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            }}
          />
          <Button
            leftSection={<PlusIcon className="w-5 h-5" />}
            onClick={openCreate}
            radius="lg"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 shrink-0"
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
        title="Registrar Labor"
        size="lg"
      >
        <RegistroLabor
          idMina={mina.id_mina}
          onSuccess={handleLaborCreada}
          onCancel={closeCreate}
        />
      </ModalEstandar>
    </div>
  );
};

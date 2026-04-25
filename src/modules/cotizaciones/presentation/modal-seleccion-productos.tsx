import { useState, useMemo } from "react";
import {
  Stack,
  TextInput,
  Checkbox,
  Button,
  Group,
  Text,
  Badge,
  Select,
} from "@mantine/core";
import {
  MagnifyingGlassIcon,
  CubeIcon,
  LockClosedIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";
import type { RES_Producto } from "../../../service/responses/producto";

interface ModalSeleccionProductosProps {
  opened: boolean;
  onClose: () => void;
  onToggle: (id_producto: number) => void;
  seleccionadosActuales: number[];
  productosBloqueados?: number[];
  catalogoProductos: RES_Producto[];
}

export const ModalSeleccionProductos = ({
  opened,
  onClose,
  onToggle,
  seleccionadosActuales,
  productosBloqueados = [],
  catalogoProductos,
}: ModalSeleccionProductosProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);

  // Extraemos categorías únicas del catálogo cargado
  const categoriasDisponibles = useMemo(() => {
    const list = catalogoProductos.map((p) => p.categoria);
    const unique = Array.from(new Set(list)).sort();
    return unique.map((c) => ({ value: c, label: c }));
  }, [catalogoProductos]);

  const filtrados = useMemo(() => {
    return catalogoProductos.filter((p) => {
      const matchTexto =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.id_producto.toString().toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = !categoriaId || p.categoria === categoriaId;

      return matchTexto && matchCategoria;
    });
  }, [catalogoProductos, busqueda, categoriaId]);

  const handleToggle = (id: number) => {
    const isChecked = seleccionadosActuales.includes(id);
    const isBlocked = productosBloqueados.includes(id);

    if (isChecked && isBlocked) return;

    onToggle(id);
  };

  const columns = [
    {
      accessor: "seleccion",
      title: "",
      textAlign: "center" as const,
      width: 40,
      render: (p: RES_Producto) => {
        const isBlocked = productosBloqueados.includes(p.id_producto);
        const isChecked = seleccionadosActuales.includes(p.id_producto);
        return (
          <Checkbox
            checked={isChecked}
            onChange={() => handleToggle(p.id_producto)}
            color="indigo"
            radius="sm"
            size="xs"
            disabled={isChecked && isBlocked}
            className={`flex justify-center transition-opacity ${isChecked && isBlocked ? "opacity-40 cursor-no-drop" : ""}`}
          />
        );
      },
    },
    {
      accessor: "index",
      title: "#",
      textAlign: "center" as const,
      width: 40,
    },
    {
      accessor: "nombre",
      title: "Producto",
      render: (p: RES_Producto) => {
        const isChecked = seleccionadosActuales.includes(p.id_producto);
        const isBlocked = productosBloqueados.includes(p.id_producto);
        return (
          <Group
            gap="md"
            wrap="nowrap"
            onClick={() => handleToggle(p.id_producto)}
            className="cursor-pointer group"
          >
            <div
              className={`p-2 rounded-xl border transition-all ${isChecked ? "bg-indigo-500/20 border-indigo-400/50" : "bg-zinc-800/30 border-zinc-700/50"}`}
            >
              <CubeIcon
                className={`w-4 h-4 ${isChecked ? "text-indigo-400" : "text-zinc-500"}`}
              />
            </div>
            <Stack gap={0}>
              <Group gap={6} align="center">
                <Text
                  size="sm"
                  fw={700}
                  className={isChecked ? "text-indigo-200" : "text-zinc-100"}
                >
                  {p.nombre}
                </Text>
                {isChecked && isBlocked && (
                  <LockClosedIcon className="w-3.5 h-3.5 text-red-400 opacity-70" />
                )}
              </Group>
            </Stack>
          </Group>
        );
      },
    },
    {
      accessor: "categoria_nombre",
      title: "Categoría",
      render: (p: RES_Producto) => (
        <Badge
          variant="filled"
          color="violet.7"
          size="xs"
          radius="md"
          className="font-bold uppercase px-3 shadow-md"
          style={{ color: "white" }}
        >
          {p.categoria}
        </Badge>
      ),
    },
  ];

  return (
    <ModalEstandar
      opened={opened}
      close={onClose}
      title="Añadir Productos al Comparativo"
      size="xl"
    >
      <Stack gap="md" className="relative">
        <Group grow gap="sm">
          <TextInput
            placeholder="Buscar producto por nombre..."
            leftSection={
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.currentTarget.value)}
            radius="lg"
            variant="filled"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-600 transition-all h-10",
            }}
          />
          <Select
            placeholder="Todas las categorías"
            leftSection={<Squares2X2Icon className="w-4 h-4 text-zinc-400" />}
            data={categoriasDisponibles}
            value={categoriaId}
            onChange={setCategoriaId}
            clearable
            searchable
            radius="lg"
            variant="filled"
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-600 h-10",
              dropdown: "bg-zinc-900 border-zinc-800 shadow-2xl rounded-xl",
              option:
                "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-indigo-600 data-[selected]:text-white rounded-lg my-1 transition-colors mx-2",
            }}
          />
        </Group>

        <DataTableEstandar
          idAccessor="id_producto"
          columns={columns}
          records={filtrados}
          loading={false}
          initialPageSize={10}
          minHeight={350}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="gradient"
            gradient={{ from: "indigo.6", to: "indigo.8" }}
            onClick={onClose}
            radius="xl"
            size="sm"
            className="px-8 font-bold shadow-lg shadow-indigo-900/20"
          >
            Finalizar Selección
          </Button>
        </Group>
      </Stack>
    </ModalEstandar>
  );
};

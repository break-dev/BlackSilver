import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Stack, 
  TextInput, 
  Checkbox, 
  Button, 
  Group, 
  Text, 
  Badge
} from "@mantine/core";
import { MagnifyingGlassIcon, CubeIcon } from "@heroicons/react/24/outline";
import { CotizacionesService } from "../service/cotizaciones.service";
import type { RES_MaestroProducto } from "../service/cotizaciones.responses";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { DataTableEstandar } from "../../../presentation/utils/datatable-estandar";

interface ModalSeleccionProductosProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (id_producto: number) => void;
  seleccionadosActuales: number[];
}

export const ModalSeleccionProductos = ({
  opened,
  onClose,
  onSelect,
  seleccionadosActuales,
}: ModalSeleccionProductosProps) => {
  const [productos, setProductos] = useState<RES_MaestroProducto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await CotizacionesService.get_productos_maestro();
      if (resp.success) {
        setProductos(resp.data);
      }
    } catch (error) {
      console.error("Error al cargar productos", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (opened) cargarProductos();
  }, [opened, cargarProductos]);

  const filtrados = useMemo(() => {
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      p.codigo?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [productos, busqueda]);

  const columns = [
    {
      accessor: "seleccion",
      title: "",
      textAlign: "center" as const,
      width: 40,
      render: (p: RES_MaestroProducto) => (
        <Checkbox 
          checked={seleccionadosActuales.includes(p.id_producto)} 
          onChange={() => onSelect(p.id_producto)}
          color="indigo"
          radius="sm"
          size="xs"
        />
      )
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
      render: (p: RES_MaestroProducto) => {
        const isChecked = seleccionadosActuales.includes(p.id_producto);
        return (
          <Group gap="md" wrap="nowrap" onClick={() => onSelect(p.id_producto)} className="cursor-pointer">
            <div className={`p-2 rounded-xl border transition-colors ${isChecked ? 'bg-indigo-500/20 border-indigo-400/50' : 'bg-zinc-800/30 border-zinc-700/50'}`}>
              <CubeIcon className={`w-4 h-4 ${isChecked ? 'text-indigo-400' : 'text-zinc-500'}`} />
            </div>
            <Stack gap={0}>
              <Text size="sm" fw={700} className={isChecked ? 'text-indigo-200' : 'text-zinc-100'}>
                {p.nombre}
              </Text>
            </Stack>
          </Group>
        );
      }
    },
    {
      accessor: "categoria_nombre",
      title: "Categoría",
      render: (p: RES_MaestroProducto) => (
        <Badge 
          variant="filled" 
          color="violet.7" 
          size="xs" 
          radius="md" 
          className="font-bold uppercase px-3 shadow-md"
          style={{ color: 'white' }}
        >
          {p.categoria_nombre}
        </Badge>
      )
    }
  ];

  return (
    <ModalEstandar
      opened={opened}
      close={onClose}
      title="Añadir Productos al Comparativo"
      size="xl"
    >
      <Stack gap="md">
        <TextInput
          placeholder="Buscar producto por nombre o código..."
          leftSection={<MagnifyingGlassIcon className="w-4 h-4 text-zinc-400" />}
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          radius="lg"
          variant="filled"
          classNames={{
            input: "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-600 transition-all"
          }}
        />

        <DataTableEstandar
          idAccessor="id_producto"
          columns={columns}
          records={filtrados}
          loading={loading}
          initialPageSize={10}
          minHeight={350}
        />

        <Group justify="flex-end" mt="md">
          <Button 
            variant="gradient" 
            gradient={{ from: 'indigo.6', to: 'indigo.8' }} 
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

import { useState, useEffect, useCallback } from "react";
import { 
  Modal, 
  Stack, 
  TextInput, 
  Table, 
  Checkbox, 
  Button, 
  Group, 
  Text, 
  Loader,
  ScrollArea
} from "@mantine/core";
import { MagnifyingGlassIcon, CubeIcon } from "@heroicons/react/24/outline";
import { api } from "../../../service/api"; // Usamos la api base para traer productos

interface ModalSeleccionProductosProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (id_producto: number) => void;
  seleccionadosActuales: number[];
}

interface ProductoCargado {
  id_producto: number;
  nombre: string;
  codigo: string;
  categoria_nombre: string;
}

export const ModalSeleccionProductos = ({
  opened,
  onClose,
  onSelect,
  seleccionadosActuales,
}: ModalSeleccionProductosProps) => {
  const [productos, setProductos] = useState<ProductoCargado[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    try {
      // Asumimos que existe este endpoint que ya usas en otros módulos
      const { data } = await api.get("/productos");
      if (data.success) {
        setProductos(data.data);
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

  const filtrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.codigo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Añadir Productos al Comparativo"
      size="xl"
      radius="xl"
      classNames={{ header: "bg-zinc-950", content: "bg-zinc-950 border border-zinc-800 shadow-2xl" }}
    >
      <Stack gap="md">
        <TextInput
          placeholder="Buscar producto..."
          leftSection={<MagnifyingGlassIcon className="w-4 h-4" />}
          value={busqueda}
          onChange={(e) => setBusqueda(e.currentTarget.value)}
          radius="lg"
          variant="filled"
          className="bg-zinc-900"
        />

        <ScrollArea h={400} type="auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader color="indigo" size="sm" /></div>
          ) : (
            <Table verticalSpacing="sm" className="text-zinc-300">
              <Table.Thead className="bg-zinc-900/50 sticky top-0 z-10">
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}></Table.Th>
                  <Table.Th>Producto</Table.Th>
                  <Table.Th>Categoría</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtrados.map((p) => {
                  const isChecked = seleccionadosActuales.includes(p.id_producto);
                  return (
                    <Table.Tr 
                      key={p.id_producto} 
                      className="hover:bg-zinc-800/30 cursor-pointer transition-colors"
                      onClick={() => onSelect(p.id_producto)}
                    >
                      <Table.Td>
                        <Checkbox 
                          checked={isChecked} 
                          onChange={() => {}} 
                          color="indigo" 
                          radius="xs" 
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <CubeIcon className="w-4 h-4 text-zinc-500" />
                          <Stack gap={0}>
                            <Text size="sm" fw={600}>{p.nombre}</Text>
                            <Text size="xs" className="text-zinc-500 font-mono">{p.codigo}</Text>
                          </Stack>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" className="text-zinc-400 capitalize">{p.categoria_nombre}</Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
        </ScrollArea>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onClose} radius="lg">Listo</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

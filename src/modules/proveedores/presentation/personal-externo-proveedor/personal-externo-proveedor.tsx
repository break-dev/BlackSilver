import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { ProveedoresService } from "../../service/proveedores.service";
import { useNotify } from "../../../../hooks/useNotify";
import { DataTableEstandar } from "../../../../presentation/utils/datatable-estandar";
import { ModalPersonalExterno } from "../../../../presentation/utils/modal-personal-externo";
import type { ProveedorResponse } from "../../service/proveedores.responses";
import type { RES_PersonalExterno } from "../../../../service/responses/personal-externo";

interface Props {
  proveedor: ProveedorResponse;
}

/**
 * Lista TODO el personal externo del proveedor (incluye o no
 * representantes). El switch "Es representante" se muestra siempre
 * para que el usuario pueda decidir al dar de alta si lo es o no.
 *
 * El backend expone el flag es_representante en cada fila
 * (campo agregado en la query de PersonalExternoData::get_personal).
 */
export const PersonalExternoProveedor = ({ proveedor }: Props) => {
  const { notifyError } = useNotify();
  const [personal, setPersonal] = useState<RES_PersonalExterno[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await ProveedoresService.getRepresentantesPorProveedor(
        proveedor.id_proveedor,
      );
      setPersonal(data);
    } catch (e) {
      console.error(e);
      notifyError("No se pudo cargar el personal del proveedor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedor.id_proveedor]);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Text size="sm" fw={600} className="text-zinc-200">
            {proveedor.razon_social}
          </Text>
          <Text size="xs" className="text-zinc-500">
            Personal externo vinculado al proveedor
          </Text>
        </div>
        <Button
          leftSection={<IconUserPlus size={16} />}
          radius="xl"
          size="xs"
          color="indigo"
          onClick={() => setOpenAdd(true)}
        >
          Agregar personal
        </Button>
      </Group>

      <DataTableEstandar
        idAccessor="id_personal"
        records={personal}
        loading={loading}
        columns={[
          {
            accessor: "index",
            title: "#",
            textAlign: "center",
            width: 50,
            render: (_: RES_PersonalExterno, index: number) => index + 1,
          },
          {
            accessor: "nombre_completo",
            title: "Persona",
            render: (r: RES_PersonalExterno) => (
              <Group gap="sm">
                <Badge variant="light" color="indigo" radius="xl" size="sm">
                  <IconUser size={12} stroke={1.5} />
                </Badge>
                <Text size="sm" className="text-zinc-200">
                  {r.nombre_completo}
                </Text>
              </Group>
            ),
          },
          {
            accessor: "dni",
            title: "DNI",
            width: 120,
            textAlign: "center",
            render: (r: RES_PersonalExterno) => (
              <Text size="sm" className="text-zinc-400">
                {r.dni || "—"}
              </Text>
            ),
          },
          {
            accessor: "es_representante",
            title: "Rol",
            width: 140,
            textAlign: "center",
            render: (r: RES_PersonalExterno) =>
              r.es_representante ? (
                <Badge
                  color="indigo"
                  variant="light"
                  size="sm"
                  radius="xl"
                >
                  Representante
                </Badge>
              ) : (
                <Text size="sm" className="text-zinc-500">
                  —
                </Text>
              ),
          },
          {
            accessor: "estado",
            title: "Estado",
            width: 100,
            textAlign: "center",
            render: (r: RES_PersonalExterno) => (
              <Badge
                color={r.estado === "Activo" ? "green" : "gray"}
                variant="light"
                size="sm"
                radius="lg"
              >
                {r.estado}
              </Badge>
            ),
          },
        ]}
      />

      {/* Modal reusado: Nuevo Personal Externo en modo BACKEND */}
      <ModalPersonalExterno
        opened={openAdd}
        close={() => setOpenAdd(false)}
        title="Agregar personal externo"
        idProveedor={proveedor.id_proveedor}
        onCreatedBackend={() => {
          setOpenAdd(false);
          fetch();
        }}
      />
    </Stack>
  );
};
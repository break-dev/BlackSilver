import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconCheck, IconFlame, IconX } from "@tabler/icons-react";

import { useNotify } from "../../../../hooks/useNotify";
import { TipoCarbonService } from "../../../tipo-carbon/service/tipo-carbon.service";
import type { RES_TipoCarbon } from "../../../tipo-carbon/service/tipo-carbon.responses";
import { ProveedoresService } from "../../service/proveedores.service";
import type {
  ProveedorResponse,
  TipoCarbonProveedorResponse,
} from "../../service/proveedores.responses";

interface Props {
  proveedor: ProveedorResponse;
  onGuardados?: (tipos: TipoCarbonProveedorResponse[]) => void;
}

/**
 * Gestion de tipos de carbon asociados a un proveedor.
 *
 * Patron: Select (uno a la vez) -> se agrega a la lista -> X para quitar.
 * Al dar Guardar, persiste con setTiposCarbonPorProveedor (PUT, reemplaza).
 */
export const TiposCarbonProveedor = ({ proveedor, onGuardados }: Props) => {
  const { notifyError, notifySuccess } = useNotify();

  const [todos, setTodos] = useState<RES_TipoCarbon[]>([]);
  const [seleccionados, setSeleccionados] = useState<RES_TipoCarbon[]>([]);
  const [pendiente, setPendiente] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const [listaTiposRes, asociadosRes] = await Promise.all([
        TipoCarbonService.getTipos(),
        ProveedoresService.getTiposCarbonPorProveedor(
          proveedor.id_proveedor,
        ),
      ]);
      if (listaTiposRes.success) setTodos(listaTiposRes.data);
      if (asociadosRes.success) setSeleccionados(asociadosRes.data);
    } catch (e) {
      console.error(e);
      notifyError("No se pudieron cargar los tipos de carbon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedor.id_proveedor]);

  const disponibles = useMemo(
    () =>
      todos.filter(
        (t) => !seleccionados.some((s) => s.id_tipo_carbon === t.id_tipo_carbon),
      ),
    [todos, seleccionados],
  );

  const opcionesSelect = useMemo(
    () =>
      disponibles.map((t) => ({
        value: String(t.id_tipo_carbon),
        label: t.codigo ? `${t.nombre} (${t.codigo})` : t.nombre,
      })),
    [disponibles],
  );

  const handleAgregar = (value: string | null) => {
    if (!value) return;
    const id = Number(value);
    const tipo = todos.find((t) => t.id_tipo_carbon === id);
    if (!tipo) return;
    if (seleccionados.some((s) => s.id_tipo_carbon === id)) return;
    setSeleccionados((prev) => [...prev, tipo]);
    setPendiente(null);
  };

  const handleQuitar = (id: number) => {
    setSeleccionados((prev) =>
      prev.filter((s) => s.id_tipo_carbon !== id),
    );
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const resp = await ProveedoresService.setTiposCarbonPorProveedor(
        proveedor.id_proveedor,
        { tipos_carbon: seleccionados.map((s) => s.id_tipo_carbon) },
      );
      if (resp.success) {
        setSeleccionados(resp.data);
        onGuardados?.(resp.data);
        notifySuccess(resp.message || "Tipos de carbon actualizados");
      } else {
        notifyError(resp.message || "No se pudieron guardar los tipos");
      }
    } catch (e) {
      console.error(e);
      notifyError("Error al guardar los tipos de carbon");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={600} className="text-zinc-200">
          {proveedor.razon_social}
        </Text>
        <Text size="xs" className="text-zinc-500">
          Tipos de carbon que ofrece este proveedor
        </Text>
      </div>

      <Select
        label="Agregar tipo de carbon"
        placeholder={
          loading
            ? "Cargando tipos..."
            : disponibles.length === 0
              ? "Todos los tipos ya estan agregados"
              : "Selecciona un tipo para agregarlo"
        }
        radius="xl"
        searchable
        clearable
        disabled={!loading && disponibles.length === 0}
        data={opcionesSelect}
        value={pendiente}
        onChange={handleAgregar}
        nothingFoundMessage="Sin tipos disponibles"
        classNames={{
          input:
            "bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder:text-zinc-500",
          label: "text-zinc-300 mb-1 font-medium text-xs",
        }}
      />

      {seleccionados.length === 0 ? (
        <div className="text-zinc-500 text-xs italic px-3 py-2 border border-dashed border-zinc-800 rounded-lg">
          Sin tipos seleccionados.
        </div>
      ) : (
        <Stack gap="xs">
          {seleccionados.map((t) => (
            <div
              key={t.id_tipo_carbon}
              className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-zinc-900/60 to-zinc-900/30 border border-zinc-800 rounded-xl hover:border-indigo-700/60 transition-colors"
            >
              <Group gap="sm" wrap="nowrap">
                <Badge variant="filled" color="orange" radius="xl" size="lg">
                  <IconFlame size={14} stroke={1.8} />
                </Badge>
                <div className="flex flex-col min-w-0">
                  <Text size="sm" fw={500} className="text-zinc-100 truncate">
                    {t.nombre}
                  </Text>
                  {t.codigo && (
                    <Text size="xs" className="text-zinc-500">
                      Codigo: {t.codigo}
                    </Text>
                  )}
                </div>
              </Group>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                radius="xl"
                leftSection={<IconX size={14} />}
                onClick={() => handleQuitar(t.id_tipo_carbon)}
              >
                Quitar
              </Button>
            </div>
          ))}
        </Stack>
      )}

      <Text size="xs" className="text-zinc-500">
        Actualmente {seleccionados.length} tipo(s) seleccionado(s).
      </Text>

      <Group justify="flex-end" mt="sm">
        <Button
          leftSection={<IconCheck size={16} />}
          radius="xl"
          loading={saving}
          onClick={handleGuardar}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
        >
          Guardar tipos
        </Button>
      </Group>
    </Stack>
  );
};
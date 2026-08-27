import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Group,
  MultiSelect,
  Stack,
  Text,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

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
 * MultiSelect unico: los tipos seleccionados aparecen como pills dentro
 * del componente. Al dar Guardar, persiste con setTiposCarbonPorProveedor
 * (PUT, reemplaza).
 */
export const TiposCarbonProveedor = ({ proveedor, onGuardados }: Props) => {
  const { notifyError, notifySuccess } = useNotify();

  const [todos, setTodos] = useState<RES_TipoCarbon[]>([]);
  const [seleccionados, setSeleccionados] = useState<RES_TipoCarbon[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [listaTiposRes, asociadosRes] = await Promise.all([
          TipoCarbonService.getTipos({ para_compra: true }),
          ProveedoresService.getTiposCarbonPorProveedor(
            proveedor.id_proveedor,
          ),
        ]);
        if (cancel) return;
        if (listaTiposRes.success) setTodos(listaTiposRes.data);
        if (asociadosRes.success) setSeleccionados(asociadosRes.data);
      } catch (e) {
        console.error(e);
        notifyError("No se pudieron cargar los tipos de carbon");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedor.id_proveedor]);

  const tiposData = useMemo(
    () =>
      todos.map((t) => ({
        value: String(t.id_tipo_carbon),
        label: t.codigo ? `${t.nombre} (${t.codigo})` : t.nombre,
      })),
    [todos],
  );

  const handleTiposChange = (values: string[]) => {
    const ids = new Set(values.map(Number));
    const mapa = new Map(todos.map((t) => [t.id_tipo_carbon, t]));
    setSeleccionados(
      todos.filter((t) => ids.has(t.id_tipo_carbon)).map(
        (t) => mapa.get(t.id_tipo_carbon)!,
      ),
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
        <Text size="xs" className="text-zinc-400">
          Tipos de carbon que ofrece este proveedor
        </Text>
      </div>

      <MultiSelect
        label="Tipos de carbon"
        placeholder={
          loading
            ? "Cargando tipos..."
            : "Selecciona uno o varios tipos"
        }
        radius="xl"
        searchable
        clearable
        data={tiposData}
        value={seleccionados.map((s) => String(s.id_tipo_carbon))}
        onChange={handleTiposChange}
        nothingFoundMessage="Sin tipos disponibles"
        disabled={loading && todos.length === 0}
        classNames={{
          input:
            "bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder:text-zinc-500",
          label: "text-zinc-300 mb-1 font-medium text-xs",
          pill: "bg-indigo-500/20 text-indigo-200",
        }}
      />

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
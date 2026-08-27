import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconCheck,
  IconExclamationCircle,
  IconMapPin,
  IconX,
} from "@tabler/icons-react";

import { useNotify } from "../../../../hooks/useNotify";
import { AuxService } from "../../../../service/auxiliar.service";
import { getCoincidencias } from "../../../../shared/functions/get-coincidencias";
import type {
  RES_Departamento,
  RES_Distrito,
  RES_Provincia,
} from "../../../../service/responses/ubicacion";
import { ProveedoresService } from "../../service/proveedores.service";
import type {
  LugarExtraccionResponse,
  ProveedorResponse,
} from "../../service/proveedores.responses";

interface Props {
  proveedor: ProveedorResponse;
  onGuardados?: (lugares: LugarExtraccionResponse[]) => void;
}

interface LugarTemp {
  id_departamento: number;
  departamento_nombre: string;
  id_provincia: number;
  provincia_nombre: string;
  id_distrito: number;
  distrito_nombre: string;
  direccion: string;
}

const fieldClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
  label: "text-zinc-400 font-medium text-xs",
};

/**
 * Gestion de lugares de extraccion de un proveedor.
 * Patron: Select dpto/prov/dist + input direccion -> agregar a lista -> X para quitar.
 * Al dar Guardar, persiste con setLugaresExtraccionPorProveedor (PUT, reemplaza).
 */
export const LugaresExtraccionProveedor = ({
  proveedor,
  onGuardados,
}: Props) => {
  const { notifyError, notifySuccess } = useNotify();

  const [departamentos, setDepartamentos] = useState<RES_Departamento[]>([]);
  const [provincias, setProvincias] = useState<RES_Provincia[]>([]);
  const [distritos, setDistritos] = useState<RES_Distrito[]>([]);
  const [loadingUbigeo, setLoadingUbigeo] = useState(false);
  const [searchDpto, setSearchDpto] = useState("");
  const [searchProv, setSearchProv] = useState("");
  const [searchDist, setSearchDist] = useState("");

  const [lugarDpto, setLugarDpto] = useState<string | null>(null);
  const [lugarProv, setLugarProv] = useState<string | null>(null);
  const [lugarDist, setLugarDist] = useState<string | null>(null);
  const [lugarDireccion, setLugarDireccion] = useState("");
  const [lugarError, setLugarError] = useState<string | null>(null);

  const [seleccionados, setSeleccionados] = useState<LugarTemp[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carga inicial: dptos + TODAS las provincias + TODOS los distritos
  // + lugares actuales del proveedor, en paralelo. Despues el filtrado
  // se hace en cliente (instantaneo).
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setLoadingUbigeo(true);
      try {
        const [dptosRes, provsRes, distsRes, lugaresRes] = await Promise.all([
          AuxService.get_departamentos(),
          AuxService.get_provincias(),
          AuxService.get_distritos(),
          ProveedoresService.getLugaresExtraccionPorProveedor(
            proveedor.id_proveedor,
          ),
        ]);
        if (cancel) return;
        if (dptosRes.success) {
          setDepartamentos((dptosRes.data ?? []) as RES_Departamento[]);
        }
        if (provsRes.success) {
          setProvincias((provsRes.data ?? []) as RES_Provincia[]);
        }
        if (distsRes.success) {
          setDistritos((distsRes.data ?? []) as RES_Distrito[]);
        }
        if (lugaresRes.success && lugaresRes.data) {
          setSeleccionados(
            lugaresRes.data.map((l) => ({
              id_departamento: l.id_departamento,
              departamento_nombre: l.departamento_nombre,
              id_provincia: l.id_provincia,
              provincia_nombre: l.provincia_nombre,
              id_distrito: l.id_distrito,
              distrito_nombre: l.distrito_nombre,
              direccion: l.direccion,
            })),
          );
        }
      } catch (e) {
        console.error(e);
        notifyError("No se pudieron cargar los lugares de extraccion");
      } finally {
        if (!cancel) {
          setLoading(false);
          setLoadingUbigeo(false);
        }
      }
    })();
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedor.id_proveedor]);

  const dptosVisibles = useMemo(() => {
    const q = searchDpto.trim();
    if (!q) return departamentos;
    return getCoincidencias(departamentos, q, { keys: ["nombre"] }).map(
      (r) => r.item,
    );
  }, [departamentos, searchDpto]);

  const provVisibles = useMemo(() => {
    const base = lugarDpto
      ? provincias.filter((p) => String(p.id_departamento) === lugarDpto)
      : provincias;
    const q = searchProv.trim();
    if (!q) return base;
    return getCoincidencias(base, q, { keys: ["nombre"] }).map((r) => r.item);
  }, [provincias, lugarDpto, searchProv]);

  const distVisibles = useMemo(() => {
    const base = lugarProv
      ? distritos.filter((d) => String(d.id_provincia) === lugarProv)
      : distritos;
    const q = searchDist.trim();
    if (!q) return base;
    return getCoincidencias(base, q, { keys: ["nombre"] }).map((r) => r.item);
  }, [distritos, lugarProv, searchDist]);

  const handleDptoChange = (v: string | null) => {
    setLugarDpto(v);
    setLugarProv(null);
    setLugarDist(null);
    setLugarError(null);
  };

  const handleProvChange = (v: string | null) => {
    setLugarProv(v);
    setLugarDist(null);
    setLugarError(null);
  };

  const handleDistChange = (v: string | null) => {
    setLugarDist(v);
    setLugarError(null);
  };

  const handleDireccionChange = (v: string) => {
    setLugarDireccion(v);
    if (lugarError) setLugarError(null);
  };

  const handleAgregar = () => {
    if (!lugarDpto || !lugarProv || !lugarDist) {
      setLugarError("Selecciona departamento, provincia y distrito");
      return;
    }
    const dirTrim = lugarDireccion.trim();
    if (!dirTrim) {
      setLugarError("La direccion es obligatoria");
      return;
    }
    const dep = departamentos.find((d) => String(d.id) === lugarDpto);
    const prov = provincias.find((p) => String(p.id) === lugarProv);
    const dist = distritos.find((d) => String(d.id) === lugarDist);
    if (!dep || !prov || !dist) {
      setLugarError("Ubicacion invalida");
      return;
    }

    const key = `${dep.id}-${prov.id}-${dist.id}-${dirTrim.toLowerCase()}`;
    if (
      seleccionados.some(
        (x) =>
          `${x.id_departamento}-${x.id_provincia}-${x.id_distrito}-${x.direccion
            .trim()
            .toLowerCase()}` === key,
      )
    ) {
      setLugarError("Ese lugar ya esta en la lista");
      return;
    }

    setSeleccionados((prev) => [
      ...prev,
      {
        id_departamento: dep.id,
        departamento_nombre: dep.nombre,
        id_provincia: prov.id,
        provincia_nombre: prov.nombre,
        id_distrito: dist.id,
        distrito_nombre: dist.nombre,
        direccion: dirTrim,
      },
    ]);
    setLugarDpto(null);
    setLugarProv(null);
    setLugarDist(null);
    setLugarDireccion("");
    setLugarError(null);
  };

  const handleQuitar = (idx: number) => {
    setSeleccionados((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const resp = await ProveedoresService.setLugaresExtraccionPorProveedor(
        proveedor.id_proveedor,
        {
          lugares: seleccionados.map((l) => ({
            id_departamento: l.id_departamento,
            id_provincia: l.id_provincia,
            id_distrito: l.id_distrito,
            direccion: l.direccion.trim(),
          })),
        },
      );
      if (resp.success) {
        notifySuccess(resp.message || "Lugares de extraccion actualizados");
        onGuardados?.(resp.data);
      } else {
        notifyError(resp.message || "No se pudieron guardar los lugares");
      }
    } catch (e) {
      console.error(e);
      notifyError("Error al guardar los lugares de extraccion");
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
          Zonas de extraccion declaradas por este proveedor.
        </Text>
      </div>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Departamento"
            placeholder={
              loadingUbigeo && departamentos.length === 0
                ? "Cargando..."
                : "Seleccione"
            }
            radius="xl"
            clearable
            searchable
            searchValue={searchDpto}
            onSearchChange={setSearchDpto}
            nothingFoundMessage="Sin coincidencias"
            data={dptosVisibles.map((d) => ({
              value: String(d.id),
              label: d.nombre,
            }))}
            value={lugarDpto}
            onChange={handleDptoChange}
            disabled={loadingUbigeo && departamentos.length === 0}
            classNames={fieldClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Provincia"
            placeholder={
              !lugarDpto
                ? "Seleccione un departamento"
                : "Seleccione"
            }
            radius="xl"
            clearable
            searchable
            searchValue={searchProv}
            onSearchChange={setSearchProv}
            nothingFoundMessage="Sin coincidencias"
            data={provVisibles.map((p) => ({
              value: String(p.id),
              label: p.nombre,
            }))}
            value={lugarProv}
            onChange={handleProvChange}
            disabled={!lugarDpto}
            classNames={fieldClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Distrito"
            placeholder={
              !lugarProv
                ? "Seleccione una provincia"
                : "Seleccione"
            }
            radius="xl"
            clearable
            searchable
            searchValue={searchDist}
            onSearchChange={setSearchDist}
            nothingFoundMessage="Sin coincidencias"
            data={distVisibles.map((d) => ({
              value: String(d.id),
              label: d.nombre,
            }))}
            value={lugarDist}
            onChange={handleDistChange}
            disabled={!lugarProv}
            classNames={fieldClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 9 }}>
          <TextInput
            label="Direccion"
            placeholder="Ej. Av. Principal 123, Ciudad"
            radius="xl"
            value={lugarDireccion}
            onChange={(e) => handleDireccionChange(e.currentTarget.value)}
            classNames={fieldClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <div className="flex h-full items-end">
            <Button
              leftSection={<IconMapPin size={14} />}
              radius="xl"
              size="sm"
              variant="filled"
              color="orange"
              onClick={handleAgregar}
              className="w-full font-semibold shadow-md shadow-orange-900/30"
            >
              Agregar
            </Button>
          </div>
        </Grid.Col>
      </Grid>

      {lugarError && (
        <Alert
          icon={<IconExclamationCircle size={16} />}
          color="red"
          variant="light"
        >
          {lugarError}
        </Alert>
      )}

      {loading ? (
        <div className="text-zinc-500 text-xs italic px-3 py-2 border border-dashed border-zinc-800 rounded-lg">
          Cargando lugares...
        </div>
      ) : seleccionados.length === 0 ? (
        <div className="text-zinc-500 text-xs italic px-3 py-2 border border-dashed border-zinc-800 rounded-lg">
          Sin lugares registrados.
        </div>
      ) : (
        <Stack gap="xs">
          {seleccionados.map((l, idx) => (
            <div
              key={`${l.id_departamento}-${l.id_provincia}-${l.id_distrito}-${idx}`}
              className="flex items-center justify-between gap-3 p-3 bg-linear-to-r from-zinc-900/60 to-zinc-900/30 border border-zinc-800 rounded-xl hover:border-orange-700/60 transition-colors"
            >
              <Group gap="sm" wrap="nowrap">
                <Badge
                  variant="filled"
                  color="orange"
                  radius="xl"
                  size="lg"
                  className="shrink-0"
                >
                  <IconMapPin size={14} stroke={1.8} />
                </Badge>
                <div className="flex flex-col min-w-0">
                  <Text size="sm" fw={500} className="text-zinc-100 truncate">
                    {l.departamento_nombre} / {l.provincia_nombre} /{" "}
                    {l.distrito_nombre}
                  </Text>
                  <Text size="xs" className="text-zinc-500 truncate">
                    {l.direccion}
                  </Text>
                </div>
              </Group>
              <Button
                variant="subtle"
                color="red"
                size="xs"
                radius="xl"
                leftSection={<IconX size={14} />}
                onClick={() => handleQuitar(idx)}
              >
                Quitar
              </Button>
            </div>
          ))}
        </Stack>
      )}

      <Text size="xs" className="text-zinc-500">
        Actualmente {seleccionados.length} lugar(es) seleccionado(s).
      </Text>

      <Group justify="flex-end" mt="sm">
        <Button
          leftSection={<IconCheck size={16} />}
          radius="xl"
          loading={saving}
          onClick={handleGuardar}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
        >
          Guardar lugares
        </Button>
      </Group>
    </Stack>
  );
};
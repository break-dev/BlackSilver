import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Grid,
  Group,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";

import { getCoincidencias } from "../../../shared/functions/get-coincidencias";
import { AuxService } from "../../../service/auxiliar.service";
import type {
  RES_Departamento,
  RES_Distrito,
  RES_Provincia,
} from "../../../service/responses/ubicacion";

interface RegistroAlmacenCarbonProps {
  nombre: string;
  setNombre: (val: string) => void;
  descripcion: string;
  setDescripcion: (val: string) => void;
  // Ubicacion (opcional, en cascada)
  id_departamento: number | null;
  setIdDepartamento: (val: number | null) => void;
  id_provincia: number | null;
  setIdProvincia: (val: number | null) => void;
  id_distrito: number | null;
  setIdDistrito: (val: number | null) => void;
  direccion: string;
  setDireccion: (val: string) => void;
  formError: string;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Registro de almacen de carbon.
 *
 * Para carbon NO hay switch de "es principal" ni modales de responsables /
 * almacenes vecinos / minas a abastecer. Solo se piden los datos basicos
 * y, opcionalmente, su ubicacion geografica.
 */
export const RegistroAlmacenCarbon = ({
  nombre,
  setNombre,
  descripcion,
  setDescripcion,
  id_departamento,
  setIdDepartamento,
  id_provincia,
  setIdProvincia,
  id_distrito,
  setIdDistrito,
  direccion,
  setDireccion,
  formError,
  loading,
  onSubmit,
  onCancel,
}: RegistroAlmacenCarbonProps) => {
  const [departamentos, setDepartamentos] = useState<RES_Departamento[]>([]);
  const [provincias, setProvincias] = useState<RES_Provincia[]>([]);
  const [distritos, setDistritos] = useState<RES_Distrito[]>([]);
  const [loadingDptos, setLoadingDptos] = useState(false);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);

  const [searchDpto, setSearchDpto] = useState("");
  const [searchProv, setSearchProv] = useState("");
  const [searchDist, setSearchDist] = useState("");

  // Departamentos: carga unica al montar.
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingDptos(true);
      const res = await AuxService.get_departamentos();
      if (cancel) return;
      if (res.success) {
        setDepartamentos((res.data ?? []) as RES_Departamento[]);
      }
      setLoadingDptos(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // Provincias: cargar SOLO si hay departamento.
  useEffect(() => {
    if (!id_departamento) return;
    let cancel = false;
    (async () => {
      setLoadingProv(true);
      const res = await AuxService.get_provincias({
        id_departamento: id_departamento ?? undefined,
      });
      if (cancel) return;
      if (res.success) {
        setProvincias((res.data ?? []) as RES_Provincia[]);
      }
      setLoadingProv(false);
    })();
    return () => {
      cancel = true;
    };
  }, [id_departamento]);

  // Distritos: cargar SOLO si hay provincia.
  useEffect(() => {
    if (!id_provincia) return;
    let cancel = false;
    (async () => {
      setLoadingDist(true);
      const res = await AuxService.get_distritos({
        id_provincia: id_provincia ?? undefined,
      });
      if (cancel) return;
      if (res.success) {
        setDistritos((res.data ?? []) as RES_Distrito[]);
      }
      setLoadingDist(false);
    })();
    return () => {
      cancel = true;
    };
  }, [id_provincia]);

  const dptosVisibles = useMemo(() => {
    const q = searchDpto.trim();
    if (!q) return departamentos;
    return getCoincidencias(departamentos, q, { keys: ["nombre"] }).map(
      (r) => r.item,
    );
  }, [departamentos, searchDpto]);

  const provVisibles = useMemo(() => {
    const q = searchProv.trim();
    if (!q) return provincias;
    return getCoincidencias(provincias, q, { keys: ["nombre"] }).map(
      (r) => r.item,
    );
  }, [provincias, searchProv]);

  const distVisibles = useMemo(() => {
    const q = searchDist.trim();
    if (!q) return distritos;
    return getCoincidencias(distritos, q, { keys: ["nombre"] }).map(
      (r) => r.item,
    );
  }, [distritos, searchDist]);

  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300
    focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="relative space-y-5">
      {formError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="filled"
        >
          {formError}
        </Alert>
      )}

      <Stack gap="md">
        <TextInput
          label="Nombre del Almacén de Carbón"
          placeholder="Ej. Almacén Carbón - Zona Sur"
          required
          withAsterisk
          disabled={loading}
          radius="lg"
          classNames={inputClasses}
          value={nombre}
          onChange={(e) => setNombre(e.currentTarget.value)}
        />

        <Textarea
          label="Descripción"
          placeholder="Detalles adicionales..."
          radius="lg"
          minRows={3}
          disabled={loading}
          classNames={inputClasses}
          value={descripcion}
          onChange={(e) => setDescripcion(e.currentTarget.value)}
        />

        <div className="space-y-3">
          <div>
            <span className="text-zinc-300 text-sm font-medium">
              Ubicación (opcional)
            </span>
            <span className="block text-xs text-zinc-500 mt-0.5">
              Si registras la ubicación, podrás consultarla desde cualquier
              catálogo o reporte que muestre este almacén.
            </span>
          </div>

          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Departamento"
                placeholder={loadingDptos ? "Cargando..." : "Seleccione"}
                radius="lg"
                clearable
                searchable
                searchValue={searchDpto}
                onSearchChange={setSearchDpto}
                nothingFoundMessage={
                  loadingDptos ? "Cargando..." : "Sin coincidencias"
                }
                data={dptosVisibles.map((d) => ({
                  value: String(d.id),
                  label: d.nombre,
                }))}
                value={id_departamento ? String(id_departamento) : null}
                onChange={(v) => {
                  const num = v ? Number(v) : null;
                  setIdDepartamento(num);
                  setIdProvincia(null);
                  setIdDistrito(null);
                }}
                disabled={loadingDptos && departamentos.length === 0}
                classNames={inputClasses}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Provincia"
                placeholder={
                  !id_departamento
                    ? "Seleccione un departamento"
                    : loadingProv
                      ? "Cargando..."
                      : "Seleccione"
                }
                radius="lg"
                clearable
                searchable
                searchValue={searchProv}
                onSearchChange={setSearchProv}
                nothingFoundMessage={
                  loadingProv ? "Cargando..." : "Sin coincidencias"
                }
                data={provVisibles.map((p) => ({
                  value: String(p.id),
                  label: p.nombre,
                }))}
                value={id_provincia ? String(id_provincia) : null}
                onChange={(v) => {
                  const num = v ? Number(v) : null;
                  setIdProvincia(num);
                  setIdDistrito(null);
                }}
                disabled={!id_departamento || loadingProv}
                classNames={inputClasses}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Distrito"
                placeholder={
                  !id_provincia
                    ? "Seleccione una provincia"
                    : loadingDist
                      ? "Cargando..."
                      : "Seleccione"
                }
                radius="lg"
                clearable
                searchable
                searchValue={searchDist}
                onSearchChange={setSearchDist}
                nothingFoundMessage={
                  loadingDist ? "Cargando..." : "Sin coincidencias"
                }
                data={distVisibles.map((d) => ({
                  value: String(d.id),
                  label: d.nombre,
                }))}
                value={id_distrito ? String(id_distrito) : null}
                onChange={(v) => setIdDistrito(v ? Number(v) : null)}
                disabled={!id_provincia || loadingDist}
                classNames={inputClasses}
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Dirección (opcional)"
            placeholder="Ej. Av. Principal 123"
            radius="lg"
            disabled={loading}
            classNames={inputClasses}
            value={direccion}
            onChange={(e) => setDireccion(e.currentTarget.value)}
          />
        </div>

        <Group justify="flex-end" gap="md" mt="xl">
          <Button
            variant="subtle"
            onClick={onCancel}
            disabled={loading}
            radius="lg"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            radius="lg"
            size="sm"
            leftSection={<IconDeviceFloppy size={16} />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 font-semibold"
          >
            Guardar
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
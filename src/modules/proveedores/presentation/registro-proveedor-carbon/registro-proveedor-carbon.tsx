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
  IconDeviceFloppy,
  IconExclamationCircle,
  IconFlame,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react";

import { useRegistroProveedorCarbon } from "../../hooks/useRegistroProveedorCarbon";
import { TipoEntidad } from "../../../../shared/enums/_generic/tipo-entidad";
import { getCoincidencias } from "../../../../shared/functions/get-coincidencias";
import { ModalPersonalExterno, type PersonalLocal } from "../../../../presentation/utils/modal-personal-externo";
import type { RES_Departamento, RES_Distrito, RES_Provincia } from "../../../../service/responses/ubicacion";
import type { ProveedorResponse } from "../../service/proveedores.responses";
import { AuxService } from "../../../../service/auxiliar.service";
import { TipoCarbonService } from "../../../tipo-carbon/service/tipo-carbon.service";
import type { RES_TipoCarbon } from "../../../tipo-carbon/service/tipo-carbon.responses";

interface Props {
  onCancel: () => void;
  onSuccess: (p: ProveedorResponse) => void;
}

export const RegistroProveedorCarbon = ({ onCancel, onSuccess }: Props) => {
  const {
    payload,
    representantes,
    tiposCarbon,
    loading,
    error,
    handleChange,
    handleSelectChange,
    handleSelectNumber,
    addRepresentante,
    removeRepresentante,
    addTipoCarbon,
    removeTipoCarbon,
    submit,
  } = useRegistroProveedorCarbon((p) => onSuccess(p));

  const [departamentos, setDepartamentos] = useState<RES_Departamento[]>([]);
  const [provincias, setProvincias] = useState<RES_Provincia[]>([]);
  const [distritos, setDistritos] = useState<RES_Distrito[]>([]);
  const [loadingDptos, setLoadingDptos] = useState(false);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);

  const [searchDpto, setSearchDpto] = useState("");
  const [searchProv, setSearchProv] = useState("");
  const [searchDist, setSearchDist] = useState("");

  const [openRepresentante, setOpenRepresentante] = useState(false);

  const [todosTipos, setTodosTipos] = useState<RES_TipoCarbon[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [tipoPendiente, setTipoPendiente] = useState<string | null>(null);
  const [searchTipo, setSearchTipo] = useState("");

  // Cargar catalogo de tipos de carbon una sola vez al montar.
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingTipos(true);
      const res = await TipoCarbonService.getTipos();
      if (cancel) return;
      if (res.success) setTodosTipos(res.data);
      setLoadingTipos(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // Departamentos: carga unica al montar
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

  // Provincias: cargar SOLO si hay departamento
  useEffect(() => {
    if (!payload.id_departamento) return;
    let cancel = false;
    (async () => {
      setLoadingProv(true);
      const res = await AuxService.get_provincias({
        id_departamento: payload.id_departamento ?? undefined,
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
  }, [payload.id_departamento]);

  // Distritos: cargar SOLO si hay provincia
  useEffect(() => {
    if (!payload.id_provincia) return;
    let cancel = false;
    (async () => {
      setLoadingDist(true);
      const res = await AuxService.get_distritos({
        id_provincia: payload.id_provincia ?? undefined,
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
  }, [payload.id_provincia]);

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

  const tiposDisponibles = useMemo(() => {
    const q = searchTipo.trim();
    const libres = todosTipos.filter(
      (t) => !tiposCarbon.some((x) => x.id_tipo_carbon === t.id_tipo_carbon),
    );
    if (!q) return libres;
    return getCoincidencias(libres, q, { keys: ["nombre", "codigo"] }).map(
      (r) => r.item,
    );
  }, [todosTipos, tiposCarbon, searchTipo]);

  const handleRepresentanteCreado = (p: PersonalLocal) => {
    addRepresentante(p);
  };

  const handleAgregarTipo = (value: string | null) => {
    if (!value) return;
    const id = Number(value);
    const tipo = todosTipos.find((t) => t.id_tipo_carbon === id);
    if (!tipo) return;
    addTipoCarbon(tipo);
    setTipoPendiente(null);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {error && (
        <Alert
          icon={<IconExclamationCircle size={16} />}
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
      )}

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Select
            label="Tipo de Entidad"
            placeholder="Seleccione"
            searchable
            withAsterisk
            radius="xl"
            data={Object.values(TipoEntidad)}
            value={payload.tipo_entidad}
            onChange={handleSelectChange}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            withAsterisk
            label={payload.tipo_entidad === TipoEntidad.Natural ? "DNI" : "RUC"}
            placeholder={
              payload.tipo_entidad === TipoEntidad.Natural
                ? "12345678"
                : "20345678901"
            }
            radius="xl"
            maxLength={payload.tipo_entidad === TipoEntidad.Natural ? 8 : 11}
            value={
              payload.tipo_entidad === TipoEntidad.Natural
                ? payload.dni || ""
                : payload.ruc || ""
            }
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (payload.tipo_entidad === TipoEntidad.Natural) {
                handleChange("dni", val);
              } else {
                handleChange("ruc", val);
              }
            }}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12 }}>
          <TextInput
            label={
              payload.tipo_entidad === TipoEntidad.Natural
                ? "Nombre Completo"
                : "Razon Social"
            }
            placeholder={
              payload.tipo_entidad === TipoEntidad.Natural
                ? "Ej. Juan Perez"
                : "Ej. Comercializadora XYZ S.A.C."
            }
            radius="xl"
            withAsterisk
            value={payload.razon_social || ""}
            onChange={(e) => handleChange("razon_social", e.target.value)}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
        {/* Direccion: arriba de geografia, fila completa */}
        <Grid.Col span={{ base: 12 }}>
          <TextInput
            label="Direccion (opc)"
            placeholder="Ej. Av. Principal 123, Ciudad"
            radius="xl"
            value={payload.direccion || ""}
            onChange={(e) => handleChange("direccion", e.target.value)}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
      </Grid>

      {/* Ubicacion geografica (cascada) */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Departamento"
            placeholder={loadingDptos ? "Cargando..." : "Seleccione"}
            radius="xl"
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
            value={payload.id_departamento ? String(payload.id_departamento) : null}
            onChange={(v) => handleSelectNumber("id_departamento", v)}
            disabled={loadingDptos && departamentos.length === 0}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Provincia"
            placeholder={
              !payload.id_departamento
                ? "Seleccione un departamento"
                : loadingProv
                  ? "Cargando..."
                  : "Seleccione"
            }
            radius="xl"
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
            value={payload.id_provincia ? String(payload.id_provincia) : null}
            onChange={(v) => handleSelectNumber("id_provincia", v)}
            disabled={!payload.id_departamento || loadingProv}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Select
            label="Distrito"
            placeholder={
              !payload.id_provincia
                ? "Seleccione una provincia"
                : loadingDist
                  ? "Cargando..."
                  : "Seleccione"
            }
            radius="xl"
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
            value={payload.id_distrito ? String(payload.id_distrito) : null}
            onChange={(v) => handleSelectNumber("id_distrito", v)}
            disabled={!payload.id_provincia || loadingDist}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
      </Grid>

      {/* Telefono y correo (debajo de geografia) */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Telefono (opc)"
            placeholder="Ej. 987654321"
            radius="xl"
            value={payload.telefono || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              handleChange("telefono", val);
            }}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Correo Electronico (opc)"
            placeholder="Ej. contacto@empresa.com"
            radius="xl"
            value={payload.correo || ""}
            onChange={(e) => handleChange("correo", e.target.value)}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
              label: "text-zinc-400 font-medium text-xs",
            }}
          />
        </Grid.Col>
      </Grid>

      {/* Tipos de Carbon (opcional, antes de Representantes) */}
      <div className="flex flex-col gap-3">
        <div>
          <Text size="sm" fw={600} className="text-zinc-300">
            Tipos de Carbon que ofrece
          </Text>
          <Text size="xs" className="text-zinc-500">
            Selecciona los tipos que este proveedor puede suministrar.
          </Text>
        </div>

        <Select
          label="Agregar tipo de carbon"
          placeholder={
            loadingTipos
              ? "Cargando tipos..."
              : tiposDisponibles.length === 0
                ? "Todos los tipos ya estan agregados"
                : "Selecciona un tipo para agregarlo"
          }
          radius="xl"
          searchable
          clearable
          disabled={!loadingTipos && tiposDisponibles.length === 0}
          data={tiposDisponibles.map((t) => ({
            value: String(t.id_tipo_carbon),
            label: t.codigo ? `${t.nombre} (${t.codigo})` : t.nombre,
          }))}
          value={tipoPendiente}
          onChange={handleAgregarTipo}
          searchValue={searchTipo}
          onSearchChange={setSearchTipo}
          nothingFoundMessage="Sin tipos disponibles"
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder:text-zinc-500",
            label: "text-zinc-300 mb-1 font-medium text-xs",
          }}
        />

        {tiposCarbon.length === 0 ? (
          <div className="text-zinc-500 text-xs italic px-3 py-2 border border-dashed border-zinc-800 rounded-lg">
            Sin tipos seleccionados.
          </div>
        ) : (
          <Stack gap="xs">
            {tiposCarbon.map((t) => (
              <div
                key={t.id_tipo_carbon}
                className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-zinc-900/60 to-zinc-900/30 border border-zinc-800 rounded-xl hover:border-indigo-700/60 transition-colors"
              >
                <Group gap="sm" wrap="nowrap">
                  <Badge
                    variant="filled"
                    color="orange"
                    radius="xl"
                    size="lg"
                    className="shrink-0"
                  >
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
                  onClick={() => removeTipoCarbon(t.id_tipo_carbon)}
                  className="shrink-0"
                >
                  Quitar
                </Button>
              </div>
            ))}
          </Stack>
        )}
      </div>

      {/* Representantes (opcional, antes de guardar) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Text size="sm" fw={600} className="text-zinc-300">
            Representantes
          </Text>
          <Button
            leftSection={<IconUser size={14} />}
            radius="xl"
            size="xs"
            variant="filled"
            color="pink"
            onClick={() => setOpenRepresentante(true)}
            className="font-semibold shadow-md shadow-pink-900/30"
          >
            Añadir representante
          </Button>
        </div>

        {representantes.length === 0 ? (
          <div className="text-zinc-500 text-xs italic px-3 py-2 border border-dashed border-zinc-800 rounded-lg">
            Sin representantes.
          </div>
        ) : (
          <Stack gap="xs">
            {representantes.map((r, idx) => (
              <div
                key={`${r.nombre}-${idx}`}
                className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-zinc-900/60 to-zinc-900/30 border border-zinc-800 rounded-xl hover:border-indigo-700/60 transition-colors"
              >
                <Group gap="sm" wrap="nowrap">
                  <Badge
                    variant="filled"
                    color="pink"
                    radius="xl"
                    size="lg"
                    className="shrink-0"
                  >
                    <IconUser size={14} stroke={1.8} />
                  </Badge>
                  <div className="flex flex-col min-w-0">
                    <Text size="sm" fw={500} className="text-zinc-100 truncate">
                      {[r.nombre, r.apellido].filter(Boolean).join(" ")}
                    </Text>
                    <Text size="xs" className="text-zinc-500">
                      DNI: {r.dni || "—"}
                    </Text>
                  </div>
                </Group>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  radius="xl"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => removeRepresentante(idx)}
                  className="shrink-0"
                >
                  Quitar
                </Button>
              </div>
            ))}
          </Stack>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-800">
        <Button
          variant="subtle"
          color="gray"
          radius="xl"
          onClick={onCancel}
          classNames={{ root: "text-zinc-400 hover:bg-zinc-800" }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          radius="xl"
          leftSection={<IconDeviceFloppy size={18} />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
        >
          Guardar Proveedor
        </Button>
      </div>

      <ModalPersonalExterno
        opened={openRepresentante}
        close={() => setOpenRepresentante(false)}
        title="Añadir representante"
        initialEsRepresentante={true}
        onCreateLocal={handleRepresentanteCreado}
      />
    </form>
  );
};
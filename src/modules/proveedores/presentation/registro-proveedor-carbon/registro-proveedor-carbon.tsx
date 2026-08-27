import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Grid,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconDeviceFloppy,
  IconExclamationCircle,
  IconMapPin,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react";

import { useRegistroProveedorCarbon } from "../../hooks/useRegistroProveedorCarbon";
import type { LugarExtraccionTemporal } from "../../hooks/useRegistroProveedorCarbon";
import { TipoEntidad } from "../../../../shared/enums/_generic/tipo-entidad";
import { getCoincidencias } from "../../../../shared/functions/get-coincidencias";
import {
  ModalPersonalExterno,
  type PersonalLocal,
} from "../../../../presentation/utils/modal-personal-externo";
import type {
  RES_Departamento,
  RES_Distrito,
  RES_Provincia,
} from "../../../../service/responses/ubicacion";
import type { ProveedorResponse } from "../../service/proveedores.responses";
import { AuxService } from "../../../../service/auxiliar.service";
import { TipoCarbonService } from "../../../tipo-carbon/service/tipo-carbon.service";
import type { RES_TipoCarbon } from "../../../tipo-carbon/service/tipo-carbon.responses";

interface Props {
  onCancel: () => void;
  onSuccess: (p: ProveedorResponse) => void;
}

const fieldClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
  label: "text-zinc-400 font-medium text-xs",
};

const selectClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-300 transition-all",
  label: "text-zinc-400 font-medium text-xs",
};

export const RegistroProveedorCarbon = ({ onCancel, onSuccess }: Props) => {
  const {
    payload,
    personal,
    tiposCarbon,
    lugaresExtraccion,
    loading,
    error,
    handleChange,
    handleSelectChange,
    addpersonal,
    removepersonal,
    setTiposCarbonSeleccionados,
    addLugarExtraccion,
    removeLugarExtraccion,
    submit,
  } = useRegistroProveedorCarbon((p) => onSuccess(p));

  const [openRepresentante, setOpenRepresentante] = useState(false);

  const [todosTipos, setTodosTipos] = useState<RES_TipoCarbon[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [searchTipo, setSearchTipo] = useState("");

  // Ubigeo: las 3 listas se cargan al montar y se filtran en cliente.
  const [departamentos, setDepartamentos] = useState<RES_Departamento[]>([]);
  const [provincias, setProvincias] = useState<RES_Provincia[]>([]);
  const [distritos, setDistritos] = useState<RES_Distrito[]>([]);
  const [loadingUbigeo, setLoadingUbigeo] = useState(false);
  const [searchDpto, setSearchDpto] = useState("");
  const [searchProv, setSearchProv] = useState("");
  const [searchDist, setSearchDist] = useState("");

  // Estado local del formulario de "nuevo lugar".
  const [lugarDpto, setLugarDpto] = useState<string | null>(null);
  const [lugarProv, setLugarProv] = useState<string | null>(null);
  const [lugarDist, setLugarDist] = useState<string | null>(null);
  const [lugarDireccion, setLugarDireccion] = useState("");
  const [lugarError, setLugarError] = useState<string | null>(null);

  // Carga unica al montar: tipos de carbon + dptos + provs + dists en paralelo.
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingTipos(true);
      setLoadingUbigeo(true);
      const [tiposRes, dptosRes, provsRes, distsRes] = await Promise.all([
        TipoCarbonService.getTipos({ para_compra: true }),
        AuxService.get_departamentos(),
        AuxService.get_provincias(),
        AuxService.get_distritos(),
      ]);
      if (cancel) return;
      if (tiposRes.success) setTodosTipos(tiposRes.data);
      if (dptosRes.success)
        setDepartamentos((dptosRes.data ?? []) as RES_Departamento[]);
      if (provsRes.success)
        setProvincias((provsRes.data ?? []) as RES_Provincia[]);
      if (distsRes.success)
        setDistritos((distsRes.data ?? []) as RES_Distrito[]);
      setLoadingTipos(false);
      setLoadingUbigeo(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

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

  const tiposData = useMemo(
    () =>
      todosTipos.map((t) => ({
        value: String(t.id_tipo_carbon),
        label: t.codigo ? `${t.nombre} (${t.codigo})` : t.nombre,
      })),
    [todosTipos],
  );

  const tiposFiltrados = useMemo(() => {
    const q = searchTipo.trim();
    if (!q) return tiposData;
    return getCoincidencias(todosTipos, q, {
      keys: ["nombre", "codigo"],
    }).map((r) => ({
      value: String(r.item.id_tipo_carbon),
      label: r.item.codigo ? `${r.item.nombre} (${r.item.codigo})` : r.item.nombre,
    }));
  }, [tiposData, todosTipos, searchTipo]);

  const handleRepresentanteCreado = (p: PersonalLocal) => {
    addpersonal(p);
  };

  const handleTiposChange = (values: string[]) => {
    const ids = values.map((v) => Number(v));
    setTiposCarbonSeleccionados(ids, todosTipos);
  };

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

  const handleAgregarLugar = () => {
    if (!lugarDpto || !lugarProv || !lugarDist) {
      setLugarError("Selecciona departamento, provincia y distrito");
      return;
    }
    const dirTrim = lugarDireccion.trim();
    if (!dirTrim) {
      setLugarError("La dirección es obligatoria");
      return;
    }
    const dep = departamentos.find((d) => String(d.id) === lugarDpto);
    const prov = provincias.find((p) => String(p.id) === lugarProv);
    const dist = distritos.find((d) => String(d.id) === lugarDist);
    if (!dep || !prov || !dist) {
      setLugarError("Ubicación inválida");
      return;
    }

    const nuevo: LugarExtraccionTemporal = {
      id_departamento: dep.id,
      departamento_nombre: dep.nombre,
      id_provincia: prov.id,
      provincia_nombre: prov.nombre,
      id_distrito: dist.id,
      distrito_nombre: dist.nombre,
      direccion: dirTrim,
    };
    addLugarExtraccion(nuevo);

    setLugarDpto(null);
    setLugarProv(null);
    setLugarDist(null);
    setLugarDireccion("");
    setLugarError(null);
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
            classNames={selectClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            withAsterisk
            label="RUC"
            placeholder={
              payload.tipo_entidad === TipoEntidad.Natural
                ? "10xxxxxxxxx (persona natural)"
                : "20xxxxxxxxx (persona jurídica)"
            }
            radius="xl"
            maxLength={11}
            value={payload.ruc || ""}
            onChange={(e) => {
              const val = e.currentTarget.value.replace(/\D/g, "");
              handleChange("ruc", val);
            }}
            classNames={fieldClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="DNI (opc)"
            placeholder="12345678"
            radius="xl"
            maxLength={8}
            value={payload.dni || ""}
            onChange={(e) => {
              const val = e.currentTarget.value.replace(/\D/g, "");
              handleChange("dni", val);
            }}
            classNames={fieldClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label={
              payload.tipo_entidad === TipoEntidad.Natural
                ? "Nombre Completo"
                : "Razón Social"
            }
            placeholder={
              payload.tipo_entidad === TipoEntidad.Natural
                ? "Ej. Juan Perez"
                : "Ej. Comercializadora XYZ S.A.C."
            }
            radius="xl"
            withAsterisk
            value={payload.razon_social || ""}
            onChange={(e) => handleChange("razon_social", e.currentTarget.value)}
            classNames={fieldClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12 }}>
          <TextInput
            label="Dirección Principal (opc)"
            placeholder="Ej. Av. Principal 123, Ciudad"
            radius="xl"
            value={payload.direccion || ""}
            onChange={(e) => handleChange("direccion", e.currentTarget.value)}
            classNames={fieldClasses}
          />
        </Grid.Col>
      </Grid>

      {/* Telefono y correo */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Teléfono (opc)"
            placeholder="Ej. 987654321"
            radius="xl"
            value={payload.telefono || ""}
            onChange={(e) => {
              const val = e.currentTarget.value.replace(/\D/g, "");
              handleChange("telefono", val);
            }}
            classNames={fieldClasses}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Correo Electrónico (opc)"
            placeholder="Ej. contacto@empresa.com"
            radius="xl"
            value={payload.correo || ""}
            onChange={(e) => handleChange("correo", e.currentTarget.value)}
            classNames={fieldClasses}
          />
        </Grid.Col>
      </Grid>

      {/* Tipos de Carbon (opcional) */}
      <div className="flex flex-col gap-3">
        <div>
          <Text size="sm" fw={600} className="text-zinc-300">
            Tipos de Carbón que ofrece
          </Text>
          <Text size="xs" className="text-zinc-500">
            Selecciona los tipos que este proveedor puede suministrar.
          </Text>
        </div>

        <MultiSelect
          label="Tipos de carbón"
          placeholder={
            loadingTipos
              ? "Cargando tipos..."
              : "Selecciona uno o varios tipos"
          }
          radius="xl"
          searchable
          clearable
          data={tiposFiltrados}
          value={tiposCarbon.map((t) => String(t.id_tipo_carbon))}
          onChange={handleTiposChange}
          searchValue={searchTipo}
          onSearchChange={setSearchTipo}
          nothingFoundMessage="Sin tipos disponibles"
          disabled={loadingTipos && todosTipos.length === 0}
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-white placeholder:text-zinc-500",
            label: "text-zinc-300 mb-1 font-medium text-xs",
            pill: "bg-indigo-500/20 text-indigo-200",
          }}
        />
      </div>

      {/* Lugares de Extraccion */}
      <div className="flex flex-col gap-3">
        <div>
          <Text size="sm" fw={600} className="text-zinc-300">
            Lugares de extracción
          </Text>
          <Text size="xs" className="text-zinc-500">
            Añade las zonas de donde este proveedor extrae carbón. Cada lugar
            guarda su departamento, provincia, distrito y dirección.
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
              classNames={selectClasses}
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
              classNames={selectClasses}
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
              classNames={selectClasses}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <TextInput
              label="Dirección"
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
                onClick={handleAgregarLugar}
                className="w-full font-semibold shadow-md shadow-orange-900/30"
              >
                Agregar lugar
              </Button>
            </div>
          </Grid.Col>
        </Grid>

        {lugarError && (
          <Alert
            icon={<IconExclamationCircle size={16} />}
            color="red"
            variant="light"
            className="mt-1"
          >
            {lugarError}
          </Alert>
        )}

        {lugaresExtraccion.length === 0 ? (
          <div className="text-zinc-500 text-xs italic px-3 py-2 border border-dashed border-zinc-800 rounded-lg">
            Sin lugares registrados.
          </div>
        ) : (
          <Stack gap="xs">
            {lugaresExtraccion.map((l, idx) => (
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
                  onClick={() => removeLugarExtraccion(idx)}
                  className="shrink-0"
                >
                  Quitar
                </Button>
              </div>
            ))}
          </Stack>
        )}
      </div>

      {/* personal (opcional, antes de guardar) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Text size="sm" fw={600} className="text-zinc-300">
            Personal/Contactos
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

        {personal.length === 0 ? (
          <div className="text-zinc-500 text-xs italic px-3 py-2 border border-dashed border-zinc-800 rounded-lg">
            Sin personal.
          </div>
        ) : (
          <Stack gap="xs">
            {personal.map((r, idx) => (
              <div
                key={`${r.nombre}-${idx}`}
                className="flex items-center justify-between gap-3 p-3 bg-linear-to-r from-zinc-900/60 to-zinc-900/30 border border-zinc-800 rounded-xl hover:border-indigo-700/60 transition-colors"
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
                  onClick={() => removepersonal(idx)}
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
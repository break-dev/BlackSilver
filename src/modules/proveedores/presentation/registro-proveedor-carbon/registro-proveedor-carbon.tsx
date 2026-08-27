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
    addTipoCarbon,
    removeTipoCarbon,
    addLugarExtraccion,
    removeLugarExtraccion,
    submit,
  } = useRegistroProveedorCarbon((p) => onSuccess(p));

  const [openRepresentante, setOpenRepresentante] = useState(false);

  const [todosTipos, setTodosTipos] = useState<RES_TipoCarbon[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [tipoPendiente, setTipoPendiente] = useState<string | null>(null);
  const [searchTipo, setSearchTipo] = useState("");

  // Ubicacion geografica para los lugares de extraccion.
  const [departamentos, setDepartamentos] = useState<RES_Departamento[]>([]);
  const [provincias, setProvincias] = useState<RES_Provincia[]>([]);
  const [distritos, setDistritos] = useState<RES_Distrito[]>([]);
  const [loadingDptos, setLoadingDptos] = useState(false);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [searchDpto, setSearchDpto] = useState("");
  const [searchProv, setSearchProv] = useState("");
  const [searchDist, setSearchDist] = useState("");

  // Estado local del formulario de "nuevo lugar".
  const [lugarDpto, setLugarDpto] = useState<string | null>(null);
  const [lugarProv, setLugarProv] = useState<string | null>(null);
  const [lugarDist, setLugarDist] = useState<string | null>(null);
  const [lugarDireccion, setLugarDireccion] = useState("");
  const [lugarError, setLugarError] = useState<string | null>(null);

  // Cargar catalogo de tipos de carbon una sola vez al montar.
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingTipos(true);
      const res = await TipoCarbonService.getTipos({ para_compra: true });
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

  // Provincias: cargar SOLO si hay departamento seleccionado en el form de lugar.
  useEffect(() => {
    if (!lugarDpto) {
      setProvincias([]);
      return;
    }
    let cancel = false;
    (async () => {
      setLoadingProv(true);
      const res = await AuxService.get_provincias({
        id_departamento: Number(lugarDpto),
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
  }, [lugarDpto]);

  // Distritos: cargar SOLO si hay provincia seleccionada en el form de lugar.
  useEffect(() => {
    if (!lugarProv) {
      setDistritos([]);
      return;
    }
    let cancel = false;
    (async () => {
      setLoadingDist(true);
      const res = await AuxService.get_distritos({
        id_provincia: Number(lugarProv),
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
  }, [lugarProv]);

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
    addpersonal(p);
  };

  const handleAgregarTipo = (value: string | null) => {
    if (!value) return;
    const id = Number(value);
    const tipo = todosTipos.find((t) => t.id_tipo_carbon === id);
    if (!tipo) return;
    addTipoCarbon(tipo);
    setTipoPendiente(null);
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

    // limpiar
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
              value={lugarDpto}
              onChange={handleDptoChange}
              disabled={loadingDptos && departamentos.length === 0}
              classNames={selectClasses}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Provincia"
              placeholder={
                !lugarDpto
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
              value={lugarProv}
              onChange={handleProvChange}
              disabled={!lugarDpto || loadingProv}
              classNames={selectClasses}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Distrito"
              placeholder={
                !lugarProv
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
              value={lugarDist}
              onChange={handleDistChange}
              disabled={!lugarProv || loadingDist}
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

        <Select
          label="Agregar tipo de carbón"
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
                className="flex items-center justify-between gap-3 p-3 bg-linear-to-r from-zinc-900/60 to-zinc-900/30 border border-zinc-800 rounded-xl hover:border-indigo-700/60 transition-colors"
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

      {/* personal (opcional, antes de guardar) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Text size="sm" fw={600} className="text-zinc-300">
            personal
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
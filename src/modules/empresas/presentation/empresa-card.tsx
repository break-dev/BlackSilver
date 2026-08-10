import { useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  FileButton,
  Stack,
  Text,
  Badge,
  Loader,
  ActionIcon,
  Tooltip,
  Group,
  Modal,
  Image,
  Popover,
  ColorInput,
  Button,
} from "@mantine/core";
import {
  BanknotesIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PlusIcon,
  StarIcon,
  DocumentTextIcon,
  HomeModernIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import { Moneda } from "../../../shared/enums/_generic/moneda";
import type { RES_EmpresaResumen } from "../service/empresas.responses";
import type { RES_CuentaEmpresa } from "../../../service/responses/cuenta-empresa";
import { ArchivoService } from "../../../service/archivo.service";

const obtenerUrlAbsoluta = (url: string): string => {
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || "";
  const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const path = url.startsWith("/") ? url : "/" + url;
  return `${base}${path}`;
};

/**
 * Convierte un Blob a data URL (base64) sin restricciones de CORS.
 */
const blobToDataUrl = (blob: Blob): Promise<string | null> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string) ?? null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });

/**
 * Extrae el path relativo a /storage/ desde una URL completa.
 */
const obtenerPathRelativo = (url: string): string | null => {
  const idx = url.indexOf("/storage/");
  if (idx !== -1) return url.substring(idx + "/storage/".length);
  return null;
};

const descargarLogoComoBlob = async (url: string): Promise<string | null> => {
  if (!url) return null;
  if (url.startsWith("data:")) return url;

  const pathRelativo = obtenerPathRelativo(url);
  if (pathRelativo) {
    const pathsToTry = [
      pathRelativo,
      `storage/${pathRelativo}`,
      `public/${pathRelativo}`,
      `storage/app/public/${pathRelativo}`,
      `public/storage/${pathRelativo}`,
    ];
    for (const path of pathsToTry) {
      try {
        const blob = await ArchivoService.descargarArchivo(path, "imagen");
        if (blob && blob.type.startsWith("image/")) {
          // Devolvemos DATA URL (no blob URL) para evitar problemas de
          // revocación y para que colorthief pueda leer los píxeles
          // sin restricciones de CORS (el origen data: es local).
          return await blobToDataUrl(blob);
        }
      } catch {
        // continuar al siguiente
      }
    }
  }

  // Fallback: fetch directo sin auth
  try {
    const fullUrl = obtenerUrlAbsoluta(url);
    const res = await fetch(fullUrl);
    if (res.ok) {
      const blob = await res.blob();
      if (blob.type.startsWith("image/")) {
        return await blobToDataUrl(blob);
      }
    }
  } catch {
    // no se pudo descargar
  }

  return null;
};


interface EmpresaCardProps {
  empresa: RES_EmpresaResumen;
  onUpdateLogo: (id: number, file: File) => Promise<boolean>;
  onRemoveLogo: (id: number) => Promise<boolean>;
  onUpdateColorPredominante: (
    id: number,
    color: string | null,
  ) => Promise<boolean>;
  onAddOficina: (empresa: RES_EmpresaResumen) => void;
  onOpenDocumentos: (empresa: RES_EmpresaResumen) => void;
  onAddCuenta: () => void;
  onEditCuenta: (cuenta: RES_CuentaEmpresa) => void;
  onToggleEstadoCuenta: (
    id_cuenta_bancaria: number,
    estadoActual: EstadoBase,
  ) => Promise<boolean>;
}

export const EmpresaCard = ({
  empresa,
  onUpdateLogo,
  onRemoveLogo,
  onUpdateColorPredominante,
  onAddOficina,
  onOpenDocumentos,
  onAddCuenta,
  onEditCuenta,
  onToggleEstadoCuenta,
}: EmpresaCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [logoPreviewOpen, setLogoPreviewOpen] = useState(false);

  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [colorDraft, setColorDraft] = useState<string | null>(
    empresa.color_predominante ?? null,
  );
  const [savingColor, setSavingColor] = useState(false);
  const [extrayendoColor, setExtrayendoColor] = useState(false);
  const colorthiefRef = useRef<typeof import("colorthief") | null>(null);

  // Sincroniza el draft si cambia el color desde fuera (registro nuevo, refetch, etc.)
  useEffect(() => {
    setColorDraft(empresa.color_predominante ?? null);
  }, [empresa.color_predominante]);

  // Blob URL para extraer color del logo actual sin re-subir nada.
  const logoPreview = useMemo(() => {
    return empresa.url_logo ? empresa.url_logo : null;
  }, [empresa.url_logo]);

  const extraerColorDelLogo = async () => {
    if (!logoPreview) {
      setColorDraft(null);
      return;
    }
    setExtrayendoColor(true);
    try {
      const dataUrl = await descargarLogoComoBlob(logoPreview);
      if (!dataUrl) {
        console.warn("[color_predominante] no se pudo descargar el logo");
        return;
      }

      const mod = await import("colorthief");
      colorthiefRef.current = mod;
      const img = new globalThis.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("No se pudo cargar el logo para extraer color"));
        img.src = dataUrl;
        setTimeout(() => {
          if (!img.complete) reject(new Error("Timeout cargando logo"));
        }, 5000);
      });
      const color = await mod.getColor(img);
      if (color) {
        setColorDraft(color.hex());
      } else {
        console.warn(
          "[color_predominante] colorthief no devolvió color para el logo",
        );
      }
    } catch (err) {
      console.warn("[color_predominante] no se pudo extraer del logo:", err);
    } finally {
      setExtrayendoColor(false);
    }
  };


  const guardarColor = async () => {
    setSavingColor(true);
    try {
      const ok = await onUpdateColorPredominante(
        empresa.id_empresa,
        colorDraft,
      );
      if (ok) setColorPopoverOpen(false);
    } finally {
      setSavingColor(false);
    }
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpdateLogo(empresa.id_empresa, file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsRemoving(true);
    try {
      await onRemoveLogo(empresa.id_empresa);
    } finally {
      setIsRemoving(false);
    }
  };

  const totalDocs = empresa.documentos?.length ?? 0;
  const tieneImagen = !!empresa.url_logo;
  const isBusy = isUploading || isRemoving;

  return (
    <>
      <div
        className="group relative flex flex-col bg-zinc-900/40 border border-zinc-800/60 
        rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-zinc-900/60 
        transition-all duration-300 shadow-lg hover:shadow-indigo-500/5"
      >
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/5 blur-[50px] group-hover:bg-indigo-500/10 transition-colors duration-700 pointer-events-none" />

        {/* Header: logo + info */}
        <div className="flex items-center gap-3 p-4 pb-3">

          {/* Logo con controles de hover */}
          <div className="relative group/logo shrink-0">
            {/* Capa de loading */}
            {isBusy && (
              <div className="absolute inset-0 z-20 bg-zinc-950/80 rounded-xl flex items-center justify-center">
                <Loader size="xs" color="indigo" variant="bars" />
              </div>
            )}

            {/* Avatar base */}
            <Avatar
              src={empresa.url_logo}
              size={52}
              radius={12}
              className="border border-zinc-800 transition-all duration-300"
            >
              <BuildingOffice2Icon className="w-6 h-6 text-zinc-600" />
            </Avatar>

            {/* Overlay de hover: ojo en el centro */}
            {!isBusy && (
              <div
                className="absolute inset-0 rounded-xl bg-zinc-950/75 backdrop-blur-[1px]
                opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200
                flex items-center justify-center cursor-pointer"
                onClick={() => tieneImagen && setLogoPreviewOpen(true)}
              >
                <EyeIcon className="w-5 h-5 text-white drop-shadow" />
              </div>
            )}

            {/* Botones esquina superior derecha (editar + quitar) — solo en hover */}
            {!isBusy && (
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200 z-10">
                <FileButton
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/jpg"
                >
                  {(props) => (
                    <Tooltip label="Cambiar logo" position="top" withArrow>
                      <ActionIcon
                        {...props}
                        size="xs"
                        radius="md"
                        variant="filled"
                        color="indigo"
                        className="shadow-lg shadow-indigo-900/40 bg-indigo-600 hover:bg-indigo-500"
                      >
                        <PencilSquareIcon className="w-3 h-3" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </FileButton>

                {/* Botón de color predominante */}
                <Popover
                  opened={colorPopoverOpen}
                  onChange={setColorPopoverOpen}
                  position="bottom-end"
                  withArrow
                  shadow="lg"
                  width={280}
                >
                  <Popover.Target>
                    <Tooltip
                      label={
                        empresa.color_predominante
                          ? "Editar color predominante"
                          : "Asignar color predominante"
                      }
                      position="top"
                      withArrow
                    >
                      <ActionIcon
                        size="xs"
                        radius="md"
                        variant="filled"
                        color="teal"
                        onClick={() => setColorPopoverOpen((v) => !v)}
                        className="shadow-lg shadow-teal-900/40 bg-teal-600 hover:bg-teal-500"
                      >
                        <SwatchIcon className="w-3 h-3" />
                      </ActionIcon>
                    </Tooltip>
                  </Popover.Target>
                  <Popover.Dropdown className="bg-zinc-950 border border-zinc-800 p-3">
                    <Stack gap="xs">
                      <Text size="xs" fw={700} className="text-zinc-400 uppercase tracking-wider">
                        Color Predominante
                      </Text>
                      <ColorInput
                        size="xs"
                        radius="md"
                        format="hex"
                        fixOnBlur
                        value={colorDraft ?? ""}
                        onChange={(hex) => setColorDraft(hex || null)}
                        placeholder="#52525b"
                        disabled={savingColor}
                        swatches={[
                          "#52525b",
                          "#71717a",
                          "#18181b",
                          "#0c4a6e",
                          "#0e7490",
                          "#166534",
                          "#14532d",
                          "#854d0e",
                          "#7c2d12",
                          "#7f1d1d",
                          "#6b21a8",
                          "#9d174d",
                          "#1e293b",
                        ]}
                      />
                      <Group gap="xs" justify="space-between">
                        <Button
                          size="xs"
                          variant="subtle"
                          color="indigo"
                          onClick={extraerColorDelLogo}
                          disabled={!tieneImagen || savingColor || extrayendoColor}
                          loading={extrayendoColor}
                        >
                          Extraer del logo
                        </Button>
                        <Button
                          size="xs"
                          color="indigo"
                          onClick={guardarColor}
                          loading={savingColor}
                        >
                          Guardar
                        </Button>
                      </Group>
                    </Stack>
                  </Popover.Dropdown>
                </Popover>

                {tieneImagen && (
                  <Tooltip label="Quitar logo" position="top" withArrow>
                    <ActionIcon
                      size="xs"
                      radius="md"
                      variant="filled"
                      color="red"
                      onClick={handleRemoveLogo}
                      className="shadow-lg shadow-red-900/40 bg-red-700 hover:bg-red-600"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </ActionIcon>
                  </Tooltip>
                )}
              </div>
            )}
          </div>

          {/* Nombre, RUC y badges */}
          <Stack gap={2} className="flex-1 min-w-0">
            <Text
              size="sm"
              fw={700}
              lineClamp={2}
              className="text-white leading-snug group-hover:text-indigo-100 transition-colors"
            >
              {empresa.razon_social}
            </Text>
            <Group gap={6} align="center">
              <Badge
                variant="dot"
                color="indigo"
                size="sm"
                className="font-mono tracking-tight"
              >
                {empresa.ruc}
              </Badge>

              {/* Badge documentos — clicable */}
              {totalDocs > 0 ? (
                <Tooltip label="Ver documentos" withArrow position="top">
                  <Badge
                    variant="light"
                    color="teal"
                    size="xs"
                    leftSection={<DocumentTextIcon className="w-2.5 h-2.5" />}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onOpenDocumentos(empresa)}
                  >
                    {totalDocs}
                  </Badge>
                </Tooltip>
              ) : (
                <Tooltip label="Agregar documentos" withArrow position="top">
                  <Badge
                    variant="outline"
                    color="gray"
                    size="xs"
                    leftSection={<DocumentTextIcon className="w-2.5 h-2.5" />}
                    className="cursor-pointer hover:opacity-80 transition-opacity opacity-40"
                    onClick={() => onOpenDocumentos(empresa)}
                  >
                    Docs
                  </Badge>
                </Tooltip>
              )}
            </Group>

            {/* Domicilio fiscal */}
            {empresa.domicilio_fiscal && (
              <Group gap={4} mt={2}>
                <HomeModernIcon className="w-3 h-3 text-zinc-500 shrink-0" />
                <Text size="11px" className="text-zinc-400 truncate">
                  {empresa.domicilio_fiscal}
                </Text>
              </Group>
            )}
          </Stack>
        </div>

        {/* Sección Oficinas */}
        <div className="px-4 pb-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Group gap={4}>
              <MapPinIcon className="w-3 h-3 text-zinc-500" />
              <Text
                size="10px"
                fw={700}
                className="text-zinc-500 uppercase tracking-wider"
              >
                Oficinas ({empresa.oficinas?.length ?? 0})
              </Text>
            </Group>
            <Tooltip label="Agregar oficina" position="left" withArrow>
              <ActionIcon
                variant="subtle"
                color="indigo"
                size="xs"
                radius="md"
                onClick={() => onAddOficina(empresa)}
                className="hover:bg-indigo-500/10"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </ActionIcon>
            </Tooltip>
          </div>

          {empresa.oficinas && empresa.oficinas.length > 0 ? (
            <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
              {empresa.oficinas.map((oficina) => (
                <div
                  key={oficina.id_oficina}
                  className="flex items-center gap-2 px-2.5 py-1.5 
                  rounded-lg bg-zinc-950/40 border border-zinc-800/40 
                  hover:border-indigo-500/20 transition-colors"
                >
                  {oficina.es_principal == true && (
                    <StarIcon className="w-3 h-3 text-amber-400 shrink-0" />
                  )}
                  <Text size="xs" fw={600} className="text-zinc-300 truncate flex-1">
                    {oficina.nombre}
                  </Text>
                  {oficina.direccion && (
                    <Text size="9px" className="text-zinc-600 truncate max-w-20 shrink-0">
                      {oficina.direccion}
                    </Text>
                  )}
                  {oficina.estado === EstadoBase.Inactivo && (
                    <Badge size="xs" radius="sm" variant="light" color="gray" className="shrink-0">
                      Inactivo
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-2 py-2.5
              rounded-lg border border-dashed border-zinc-800/50 bg-zinc-950/20
              cursor-pointer hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-colors group/add"
              onClick={() => onAddOficina(empresa)}
            >
              <PlusIcon className="w-3.5 h-3.5 text-zinc-600 group-hover/add:text-indigo-400 transition-colors" />
              <Text size="xs" className="text-zinc-600 group-hover/add:text-zinc-400 transition-colors">
                Agregar primera oficina
              </Text>
            </div>
          )}
        </div>

        {/* Sección Cuentas Bancarias */}
        <div className="px-4 pb-4 pt-2 border-t border-zinc-800/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Group gap={4}>
              <BanknotesIcon className="w-3 h-3 text-zinc-500" />
              <Text
                size="10px"
                fw={700}
                className="text-zinc-500 uppercase tracking-wider"
              >
                Cuentas Bancarias ({empresa.cuentas_bancarias?.length ?? 0})
              </Text>
            </Group>
            <Tooltip label="Agregar cuenta bancaria" position="left" withArrow>
              <ActionIcon
                variant="subtle"
                color="indigo"
                size="xs"
                radius="md"
                onClick={() => onAddCuenta()}
                className="hover:bg-indigo-500/10"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </ActionIcon>
            </Tooltip>
          </div>

          {empresa.cuentas_bancarias && empresa.cuentas_bancarias.length > 0 ? (
            <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
              {empresa.cuentas_bancarias.map((cuenta) => (
                <div
                  key={cuenta.id_cuenta_bancaria}
                  className="flex items-center gap-2 px-2.5 py-1.5
                  rounded-lg bg-zinc-950/40 border border-zinc-800/40
                  hover:border-indigo-500/20 transition-colors"
                >
                  <Badge
                    variant="light"
                    color={cuenta.moneda === Moneda.Soles ? "teal" : "indigo"}
                    size="xs"
                    radius="sm"
                    className="shrink-0 font-mono"
                  >
                    {cuenta.moneda}
                  </Badge>
                  <Text size="xs" fw={600} className="text-zinc-300 truncate flex-1">
                    {cuenta.banco_abv} · {cuenta.numero_cuenta}
                  </Text>
                  {cuenta.es_para_detraccion == true && (
                    <Tooltip label="Cuenta para detracción" withArrow position="top">
                      <StarIcon className="w-3 h-3 text-amber-400 shrink-0" />
                    </Tooltip>
                  )}
                  {cuenta.estado === EstadoBase.Inactivo && (
                    <Badge size="xs" radius="sm" variant="light" color="gray" className="shrink-0">
                      Inactivo
                    </Badge>
                  )}
                  <Tooltip label="Editar" withArrow position="top">
                    <ActionIcon
                      variant="subtle"
                      color="indigo"
                      size="xs"
                      radius="md"
                      onClick={() => onEditCuenta(cuenta)}
                      className="hover:bg-indigo-500/10 shrink-0"
                    >
                      <PencilSquareIcon className="w-3 h-3" />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip
                    label={cuenta.estado === EstadoBase.Activo ? "Desactivar" : "Reactivar"}
                    withArrow
                    position="top"
                  >
                    <ActionIcon
                      variant="subtle"
                      color={cuenta.estado === EstadoBase.Activo ? "red" : "teal"}
                      size="xs"
                      radius="md"
                      onClick={() => onToggleEstadoCuenta(cuenta.id_cuenta_bancaria, cuenta.estado)}
                      className="hover:bg-zinc-800/50 shrink-0"
                    >
                      {cuenta.estado === EstadoBase.Activo ? (
                        <XMarkIcon className="w-3 h-3" />
                      ) : (
                        <PlusIcon className="w-3 h-3" />
                      )}
                    </ActionIcon>
                  </Tooltip>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-2 py-2.5
              rounded-lg border border-dashed border-zinc-800/50 bg-zinc-950/20
              cursor-pointer hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-colors group/add"
              onClick={() => onAddCuenta()}
            >
              <PlusIcon className="w-3.5 h-3.5 text-zinc-600 group-hover/add:text-indigo-400 transition-colors" />
              <Text size="xs" className="text-zinc-600 group-hover/add:text-zinc-400 transition-colors">
                Agregar primera cuenta bancaria
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Modal preview del logo */}
      <Modal
        opened={logoPreviewOpen}
        onClose={() => setLogoPreviewOpen(false)}
        centered
        withCloseButton
        size="sm"
        radius="xl"
        title={
          <Text size="sm" fw={700} className="text-zinc-200">
            {empresa.razon_social}
          </Text>
        }
        classNames={{
          content: "bg-zinc-950 border border-zinc-800/60",
          header: "bg-zinc-950 border-b border-zinc-800/40",
        }}
      >
        {empresa.url_logo && (
          <Image
            src={empresa.url_logo}
            alt={empresa.razon_social}
            radius="lg"
            className="w-full max-h-80 object-contain"
          />
        )}
      </Modal>
    </>
  );
};

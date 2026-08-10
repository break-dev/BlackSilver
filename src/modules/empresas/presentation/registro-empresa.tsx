import {
  Button,
  Group,
  TextInput,
  Stack,
  Avatar,
  FileButton,
  Text,
  Divider,
  ColorInput,
} from "@mantine/core";
import { PhotoIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";
import { MultiFilePicker } from "../../../presentation/utils/archivo/multifile-picker";

interface RegistroEmpresaProps {
  ruc: string;
  setRuc: (val: string) => void;
  razonSocial: string;
  setRazonSocial: (val: string) => void;
  domicilioFiscal: string;
  setDomicilioFiscal: (val: string) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  colorPredominante: string | null;
  setColorPredominante: (val: string | null) => void;
  documentosFiles: File[];
  setDocumentosFiles: (files: File[]) => void;
  error: string;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const RegistroEmpresa = ({
  ruc,
  setRuc,
  razonSocial,
  setRazonSocial,
  domicilioFiscal,
  setDomicilioFiscal,
  logoFile,
  setLogoFile,
  colorPredominante,
  setColorPredominante,
  documentosFiles,
  setDocumentosFiles,
  error,
  loading,
  onSave,
  onCancel,
}: RegistroEmpresaProps) => {
  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300
    focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  // Importante: useMemo para que el blob URL no se regenere en cada render
  // y dispare el useEffect múltiples veces.
  const logoPreview = useMemo(() => {
    return logoFile ? URL.createObjectURL(logoFile) : null;
  }, [logoFile]);

  // Liberar el blob URL cuando cambia el logo o se desmonta.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const [extrayendoColor, setExtrayendoColor] = useState(false);
  const colorthiefRef = useRef<typeof import("colorthief") | null>(null);

  useEffect(() => {
    if (!logoPreview) return;
    let activo = true;
    setExtrayendoColor(true);

    (async () => {
      try {
        const mod = await import("colorthief");
        colorthiefRef.current = mod;
        const img = new Image();
        // No usar crossOrigin con blob URLs (no soportan CORS) — causa onload nunca disparado.
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error("No se pudo cargar la imagen del logo"));
          img.src = logoPreview;
          // Timeout de seguridad: si la imagen no carga en 5s, fallar.
          setTimeout(() => {
            if (!img.complete) {
              reject(new Error("Timeout cargando imagen del logo"));
            }
          }, 5000);
        });
        if (!activo) return;
        const color = await mod.getColor(img);
        if (activo && color) {
          const hex = color.hex();
          console.info("[color_predominante] extraído del logo:", hex);
          setColorPredominante(hex);
        } else if (activo && !color) {
          console.warn("[color_predominante] colorthief no devolvió color");
        }
      } catch (err) {
        console.warn("[color_predominante] no se pudo extraer:", err);
      } finally {
        if (activo) setExtrayendoColor(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [logoPreview, setColorPredominante]);

  return (
    <Stack gap="md">
      {/* Selector de Logo */}
      <div className="flex flex-col items-center justify-center py-4">
        <FileButton
          onChange={setLogoFile}
          accept="image/png,image/jpeg,image/jpg"
        >
          {(props) => (
            <div
              {...props}
              className="relative cursor-pointer group rounded-full overflow-hidden border-2 border-indigo-500/30 bg-indigo-600/10 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-600/20"
              style={{ width: 100, height: 100 }}
            >
              <Avatar
                src={logoPreview}
                size={100}
                radius={100}
                className="bg-transparent"
              >
                <PhotoIcon className="w-10 h-10 text-indigo-400/40" />
              </Avatar>

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 text-center">
                <PencilIcon className="w-5 h-5 text-white mb-1 drop-shadow-md" />
                <Text size="10px" fw={700} className="text-white leading-tight">
                  {logoFile ? "Cambiar" : "Subir logo"}
                </Text>
              </div>
            </div>
          )}
        </FileButton>
        {logoFile && (
          <Text size="xs" c="zinc.5" mt={6}>
            {logoFile.name}
          </Text>
        )}
      </div>

      <TextInput
        label="RUC"
        placeholder="Ej. 20123456789"
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        size="xs"
        maxLength={11}
        classNames={inputClasses}
        value={ruc}
        onChange={(e) => setRuc(e.currentTarget.value)}
      />

      <TextInput
        label="Razón Social"
        placeholder="Ej. Cupper & Hannia S.A.C."
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        size="xs"
        classNames={inputClasses}
        value={razonSocial}
        onChange={(e) => setRazonSocial(e.currentTarget.value)}
      />

      <TextInput
        label="Domicilio Fiscal"
        placeholder="Ej. Av. Javier Prado Este 2450, San Isidro"
        disabled={loading}
        radius="lg"
        size="xs"
        classNames={inputClasses}
        value={domicilioFiscal}
        onChange={(e) => setDomicilioFiscal(e.currentTarget.value)}
      />

      <ColorInput
        label="Color"
        description={
          logoFile
            ? extrayendoColor
              ? "Extrayendo del logo..."
              : "Sugerido automáticamente desde el logo. Puedes ajustarlo."
            : "Opcional. Define el color en los PDF emitidos por esta empresa."
        }
        placeholder="#52525b"
        format="hex"
        fixOnBlur
        disabled={loading}
        radius="lg"
        size="xs"
        value={colorPredominante ?? ""}
        onChange={(hex) => setColorPredominante(hex || null)}
        classNames={inputClasses}
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

      <Divider color="zinc.9" variant="dashed" my={4} />

      <MultiFilePicker
        files={documentosFiles}
        onFilesChange={setDocumentosFiles}
        label="Documentos"
        description="Adjunta contratos, licencias u otros documentos de la empresa"
        accept="image/png,image/jpeg,image/jpg,application/pdf,.docx,.xlsx"
        multiple
      />

      {error && (
        <div className="text-red-500 text-sm font-medium px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      <Group justify="flex-end" gap="md" mt="xs">
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
          loading={loading}
          onClick={onSave}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 border-0 px-8"
        >
          Registrar Empresa
        </Button>
      </Group>
    </Stack>
  );
};

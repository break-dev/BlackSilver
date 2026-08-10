import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { EmpresasService } from "../service/empresas.service";
import type { RES_EmpresaResumen } from "../service/empresas.responses";

interface UseRegistroEmpresaProps {
  onSuccess?: (nueva: RES_EmpresaResumen) => void;
  onClose: () => void;
}

export const useRegistroEmpresa = ({
  onSuccess,
  onClose,
}: UseRegistroEmpresaProps) => {
  const { notifySuccess, notifyError } = useNotify();

  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [domicilioFiscal, setDomicilioFiscal] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [colorPredominante, setColorPredominante] = useState<string | null>(
    null,
  );
  const [documentosFiles, setDocumentosFiles] = useState<File[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setRuc("");
    setRazonSocial("");
    setDomicilioFiscal("");
    setLogoFile(null);
    setColorPredominante(null);
    setDocumentosFiles([]);
    setError("");
  }, []);

  const handleGuardar = async () => {
    setError("");

    if (!ruc || ruc.length !== 11) {
      setError("El RUC debe tener 11 dígitos");
      return;
    }

    if (!razonSocial) {
      setError("La razón social es obligatoria");
      return;
    }

    const formData = new FormData();
    formData.append("ruc", ruc);
    formData.append("razon_social", razonSocial);

    if (domicilioFiscal.trim()) {
      formData.append("domicilio_fiscal", domicilioFiscal.trim());
    }

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    if (colorPredominante) {
      formData.append("color_predominante", colorPredominante);
    }

    documentosFiles.forEach((doc) => {
      formData.append("documentos[]", doc);
    });

    setLoading(true);
    try {
      const result = await EmpresasService.crear_empresa(formData);
      if (result.success) {
        notifySuccess("Empresa registrada correctamente");
        onSuccess?.(result.data);
        onClose();
        reset();
      } else {
        setError(result.message);
      }
    } catch (err) {
      notifyError("Error inesperado al registrar la empresa");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
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
    handleGuardar,
    reset,
  };
};

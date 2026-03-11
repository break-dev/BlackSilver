import { useState, useCallback } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { EmpresasService } from "../service/empresas.service";
import { Schema_RegistroEmpresa } from "../service/empresas.requests";
import type { RES_Empresa } from "../service/empresas.responses";

interface UseRegistroEmpresaProps {
  onSuccess?: (nueva: RES_Empresa) => void;
  onClose: () => void;
}

export const useRegistroEmpresa = ({
  onSuccess,
  onClose,
}: UseRegistroEmpresaProps) => {
  const { notify } = useNotify();

  // Estado del formulario
  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [nombreComercial, setNombreComercial] = useState("");
  const [abreviatura, setAbreviatura] = useState("");
  const [pathLogo, setPathLogo] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setRuc("");
    setRazonSocial("");
    setNombreComercial("");
    setAbreviatura("");
    setPathLogo("");
    setError("");
  }, []);

  const handleGuardar = async () => {
    setError("");
    const data = {
      ruc,
      razon_social: razonSocial,
      nombre_comercial: nombreComercial,
      abreviatura,
      path_logo: pathLogo,
    };

    const validation = Schema_RegistroEmpresa.safeParse(data);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const result = await EmpresasService.crear_empresa(validation.data);
      if (result.success) {
        notify({
          type: "success",
          content: "Empresa registrada correctamente",
        });
        onSuccess?.(result.data);
        onClose();
        reset();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error inesperado al registrar la empresa");
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
    nombreComercial,
    setNombreComercial,
    abreviatura,
    setAbreviatura,
    pathLogo,
    setPathLogo,
    error,
    loading,
    handleGuardar,
    reset,
  };
};

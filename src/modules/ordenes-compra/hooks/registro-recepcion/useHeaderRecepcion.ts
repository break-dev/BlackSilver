import { useState } from "react";

export const useHeaderRecepcion = () => {
  const [fechaHoraRecepcion, setFechaHoraRecepcion] = useState<Date | null>(
    new Date(),
  );
  const [conIncidencia, setConIncidencia] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [serieGuia, setSerieGuia] = useState("");
  const [numeroGuia, setNumeroGuia] = useState("");

  return {
    fechaHoraRecepcion,
    setFechaHoraRecepcion,
    conIncidencia,
    setConIncidencia,
    observacion,
    setObservacion,
    evidencias,
    setEvidencias,
    serieGuia,
    setSerieGuia,
    numeroGuia,
    setNumeroGuia,
  };
};

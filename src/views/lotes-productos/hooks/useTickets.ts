import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LotesService } from "../service/lotes.service";
import type { RES_Ticket } from "../service/lotes.responses";

export const useTickets = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<RES_Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idsParam = searchParams.get("ids");

  useEffect(() => {
    if (!idsParam) {
      setLoading(false);
      setError("No se proporcionaron IDs de lotes");
      return;
    }

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const ids = idsParam.split(",").map(Number);
        const response = await LotesService.getTicketsInfo(ids);

        if (response.success) {
          setTickets(response.data);
        } else {
          setError(
            response.message || "Error al obtener información de los tickets",
          );
        }
      } catch (err) {
        setError("Error de red o del servidor");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [idsParam]);

  return { tickets, loading, error };
};

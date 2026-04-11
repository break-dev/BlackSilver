import { useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { usePrinterStore, type PrintJob } from "../../stores/printer.store";

const PrintJobRunner = ({ job }: { job: PrintJob }) => {
  const dequeueJob = usePrinterStore((s) => s.dequeueJob);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const blob = await pdf(job.document).toBlob();
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        const win = window.open(url, job.config.target || "_blank");

        // Liberar el object URL. 
        // Si no hay target (es _blank), intentamos el listener, sino un timeout.
        const revoke = () => URL.revokeObjectURL(url);
        if (win && !job.config.target) {
          win.addEventListener("load", revoke, { once: true });
        } else {
          setTimeout(revoke, 10_000);
          if (!win && !job.config.target) {
            console.warn(
              "Permite ventanas emergentes en este sitio para abrir el PDF.",
            );
          }
        }
      } catch (err) {
        console.error("Error al generar el PDF:", err);
      } finally {
        if (!cancelled) {
          await job.config.onAfterPrint?.();
          dequeueJob(job.id);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

/** Montar una sola vez en AuthLayout. Procesa la cola de trabajos de impresión. */
export const GlobalPrinterPortal = () => {
  const jobs = usePrinterStore((s) => s.jobs);
  return (
    <>
      {jobs.map((job) => (
        <PrintJobRunner key={job.id} job={job} />
      ))}
    </>
  );
};

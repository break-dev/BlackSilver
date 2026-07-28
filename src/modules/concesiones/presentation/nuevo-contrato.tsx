import { Select, Button, Text, Stack, Group, Box, Divider } from "@mantine/core";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import { MultiFilePicker } from "../../../presentation/utils/archivo/multifile-picker";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Empresa } from "../../../service/responses/empresa";


interface NuevoContratoProps {
  idConcesion: number;
  nombreConcesion: string;
  empresasConContratoActivo: number[];
  onSubmit: (
    idEmpresa: number,
    fechaInicio: string,
    fechaFin: string | null,
    evidencias: File[],
  ) => Promise<void>;
}

export const NuevoContrato = ({
  idConcesion,
  nombreConcesion,
  empresasConContratoActivo,
  onSubmit,
}: NuevoContratoProps) => {
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loading, setLoading] = useState(false);

  const [idEmpresa, setIdEmpresa] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [evidencias, setEvidencias] = useState<File[]>([]);

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setLoadingEmpresas(true);
      try {
        const resp = await AuxService.get_empresas();
        if (!cancelado && resp.success) setEmpresas(resp.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelado) setLoadingEmpresas(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [idConcesion]);

  const handleSubmit = async () => {
    if (!idEmpresa || !fechaInicio) return;
    setLoading(true);
    try {
      const fechaStr = dayjs(fechaInicio).format("YYYY-MM-DD");
      await onSubmit(parseInt(idEmpresa), fechaStr, null, evidencias);
      setIdEmpresa(null);
      setFechaInicio(new Date());
      setEvidencias([]);
    } finally {
      setLoading(false);
    }
  };

  const selectData = empresas.map((e) => ({
    value: e.id_empresa.toString(),
    label: e.razon_social,
    disabled: empresasConContratoActivo.includes(e.id_empresa),
  }));

  return (
    <Stack
      gap="md"
      className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50"
    >
      <Group gap="sm" align="center">
        <Box className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
        </Box>
        <Stack gap={0}>
          <Text size="xs" fw={700} className="text-zinc-300 uppercase tracking-wider">
            Registrar Contrato
          </Text>
          <Text size="xs" className="text-zinc-500">
            {nombreConcesion}
          </Text>
        </Stack>
      </Group>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Empresa"
          placeholder={loadingEmpresas ? "Cargando..." : "Seleccione empresa"}
          data={selectData}
          value={idEmpresa}
          onChange={setIdEmpresa}
          radius="lg"
          size="sm"
          searchable
          required
          disabled={loadingEmpresas}
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            dropdown: "bg-zinc-900 border-zinc-800",
            option:
              "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 data-[disabled]:text-zinc-600 data-[disabled]:cursor-not-allowed rounded-md my-1",
            label: "text-zinc-300 mb-1 font-medium",
          }}
        />

        <CustomDatePicker
          label="Fecha Inicio"
          placeholder="Seleccione fecha"
          value={fechaInicio}
          onChange={(val) => setFechaInicio(val as Date | null)}
          required
        />
      </div>

      <Divider color="zinc.9" variant="dashed" my={2} />

      <MultiFilePicker
        files={evidencias}
        onFilesChange={setEvidencias}
        label="Evidencias"
        description="Contratos firmados, actas u otros documentos de respaldo (opcional)"
        accept="image/png,image/jpeg,image/jpg,application/pdf,.docx,.xlsx"
        multiple
      />

      <Group justify="flex-end">
        <Button
          onClick={handleSubmit}
          loading={loading}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
          disabled={!idEmpresa || !fechaInicio}
        >
          Registrar Contrato
        </Button>
      </Group>
    </Stack>
  );
};
import {
  Stack,
  Group,
  TextInput,
  Select,
  Button,
  NumberInput,
  Text,
  ActionIcon,
  Checkbox,
} from "@mantine/core";
import { PlusIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useRegistroProducto } from "../hooks/useRegistroProducto";
import type { RES_Producto } from "../service/productos.responses";
import { Periodo } from "../../../shared/enums/otros";
import { useDisclosure } from "@mantine/hooks";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistroCategoria } from "../../categorias/presentation/registro-categoria";
import { useRegistroCategoria } from "../../categorias/hooks/useRegistroCategoria";

interface RegistroProductoProps {
  onSuccess: (nuevo: RES_Producto) => void;
  onCancel?: () => void;
}

export const RegistroProducto = ({
  onSuccess,
  onCancel,
}: RegistroProductoProps) => {
  const {
    form,
    setField,
    categorias,
    unidades,
    loading,
    loadingCategorias,
    loadingUnidades,
    cargarCategorias,
    handleSubmit,
  } = useRegistroProducto(onSuccess);

  const [openedAddCat, { open: openAddCat, close: closeAddCat }] =
    useDisclosure(false);

  const registroCat = useRegistroCategoria({
    onSuccess: (nueva) => {
      cargarCategorias();
      setField("id_categoria", nueva.id_categoria);
    },
    onClose: closeAddCat,
  });

  const getDiasVencimiento = () => {
    if (!form.tiempo_espera_vencimiento) return 0;
    const qty = form.tiempo_espera_vencimiento;
    switch (form.periodo_espera_vencimiento) {
      case Periodo.Diario:
        return qty;
      case Periodo.Semanal:
        return qty * 7;
      case Periodo.Mensual:
        return qty * 30;
      case Periodo.Anual:
        return qty * 365;
      default:
        return 0;
    }
  };

  const LabelForm = ({
    text,
    required = false,
  }: {
    text: string;
    required?: boolean;
  }) => (
    <Text size="sm" fw={500} className="text-zinc-300 mb-1.5 font-medium">
      {text} {required && <span className="text-red-500">*</span>}
    </Text>
  );

  return (
    <Stack gap="lg" mt="xs">
      <div className="flex flex-col gap-1 w-full">
        <LabelForm text="Categoría" required />
        <div className="flex gap-2 items-center">
          <Select
            placeholder={
              loadingCategorias
                ? "Cargando..."
                : "Seleccione categoría de bienes"
            }
            data={categorias.map((c) => ({
              value: c.id_categoria.toString(),
              label: c.nombre,
            }))}
            value={
              form.id_categoria === 0 ? null : form.id_categoria.toString()
            }
            onChange={(val) => setField("id_categoria", Number(val))}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            }}
            radius="lg"
            searchable
            clearable
            comboboxProps={{
              withinPortal: true,
              transitionProps: { transition: "pop", duration: 200 },
            }}
            disabled={loadingCategorias}
            className="flex-1"
          />
          <ActionIcon
            size={36}
            radius="md"
            variant="filled"
            color="indigo"
            className="shrink-0"
            onClick={openAddCat}
          >
            <PlusIcon className="w-5 h-5" />
          </ActionIcon>
        </div>
      </div>

      <Select
        label={<LabelForm text="Unidad de Medida" required />}
        placeholder={
          loadingUnidades ? "Cargando..." : "Seleccione Unidad de Medida"
        }
        data={unidades.map((u) => ({
          value: u.id_unidad_medida.toString(),
          label: `${u.nombre} (${u.abreviatura})`,
        }))}
        value={
          form.id_unidad_medida_base === 0
            ? null
            : form.id_unidad_medida_base.toString()
        }
        onChange={(val) => setField("id_unidad_medida_base", Number(val))}
        classNames={{
          input:
            "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
        }}
        radius="lg"
        searchable
        clearable
        comboboxProps={{
          withinPortal: true,
          transitionProps: { transition: "pop", duration: 200 },
        }}
        disabled={loadingUnidades}
      />

      <TextInput
        label={<LabelForm text="Nombre del Producto" required />}
        placeholder="Ej: Dinamita 7/8 Famesa"
        value={form.nombre}
        onChange={(e) => setField("nombre", e.currentTarget.value)}
        classNames={{
          input:
            "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
        }}
        radius="lg"
      />

      <Group justify="flex-start" align="flex-start" gap="xl">
        <Text size="sm" fw={500} className="text-zinc-300 mt-2">
          Stock Mínimo
        </Text>
        <div className="flex flex-col">
          <NumberInput
            placeholder="0"
            value={form.stock_minimo}
            onChange={(val) => setField("stock_minimo", Number(val))}
            classNames={{
              input:
                "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 text-center",
            }}
            radius="lg"
            min={0}
            className="w-32"
          />
          <Text
            size="xs"
            className="text-zinc-600 mt-1 italic w-full text-center"
          >
            Límite para alertas de reposición
          </Text>
        </div>
      </Group>

      <div className="border border-zinc-800/80 rounded-2xl p-5 space-y-6 mt-2 bg-zinc-950/20">
        <Text
          size="xs"
          fw={700}
          className="text-zinc-300 tracking-widest uppercase"
        >
          Indicadores del Producto
        </Text>

        <Stack gap="md">
          <Checkbox
            label="Producto Fiscalizado (IQBF)"
            description="Requiere control y reporte a SUCAMEC"
            checked={form.es_fiscalizado}
            onChange={(e) =>
              setField("es_fiscalizado", e.currentTarget.checked)
            }
            color="red"
            radius="sm"
            size="sm"
            classNames={{
              label:
                "text-zinc-300 text-[13px] font-medium leading-none mt-0.5",
              description: "text-zinc-600 text-[11px] mt-0.5",
            }}
          />

          <Checkbox
            label="Producto Perecible"
            description="Habilita campos de vencimiento estimado"
            checked={form.es_perecible}
            onChange={(e) => setField("es_perecible", e.currentTarget.checked)}
            color="orange"
            radius="sm"
            size="sm"
            classNames={{
              label:
                "text-zinc-300 text-[13px] font-medium leading-none mt-0.5",
              description: "text-zinc-600 text-[11px] mt-0.5",
            }}
          />
        </Stack>

        {form.es_perecible && (
          <div className="pt-2 border-t border-zinc-800/80 space-y-5 animate-fade-in">
            <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 flex gap-3">
              <InformationCircleIcon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <Text size="sm" className="text-indigo-100 font-medium">
                Define con cuánta antelación deseas recibir avisos antes del
                vencimiento real.
              </Text>
            </div>

            <Group grow align="flex-start">
              <NumberInput
                label={<LabelForm text="Anticipar alerta por" required />}
                placeholder="Ej. 2"
                value={form.tiempo_espera_vencimiento || undefined}
                onChange={(val) =>
                  setField("tiempo_espera_vencimiento", Number(val))
                }
                classNames={{
                  input:
                    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                }}
                radius="lg"
                min={1}
                withAsterisk={false}
              />
              <Select
                label={<LabelForm text="Periodo" required />}
                placeholder="Seleccione"
                data={[
                  { value: Periodo.Diario, label: "Días" },
                  { value: Periodo.Semanal, label: "Semanas" },
                  { value: Periodo.Mensual, label: "Meses" },
                  { value: Periodo.Anual, label: "Años" },
                ]}
                value={form.periodo_espera_vencimiento}
                onChange={(val) => setField("periodo_espera_vencimiento", val)}
                classNames={{
                  input:
                    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
                }}
                radius="lg"
                comboboxProps={{
                  withinPortal: true,
                  transitionProps: { transition: "pop", duration: 200 },
                }}
                withAsterisk={false}
              />
            </Group>

            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl py-3 px-4 text-center mt-2">
              <Text size="sm" fw={600} className="text-zinc-200">
                Resumen de la Configuración:
              </Text>
              <Text size="sm" className="text-zinc-300 mt-0.5">
                Se avisará el vencimiento de{" "}
                <span className="text-indigo-400 font-medium">
                  este producto
                </span>{" "}
                con{" "}
                <span className="text-indigo-400 font-medium">
                  {getDiasVencimiento()} días
                </span>{" "}
                de anticipación.
              </Text>
            </div>
          </div>
        )}
      </div>

      <Group justify="flex-end" gap="md" mt="xl">
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
          onClick={handleSubmit}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
        >
          Registrar Producto
        </Button>
      </Group>
      <ModalEstandar
        opened={openedAddCat}
        close={closeAddCat}
        title="Nueva Categoría"
        size="md"
        zIndex={1001} // Para que se vea por encima del modal de producto
      >
        <RegistroCategoria
          nombre={registroCat.nombre}
          setNombre={registroCat.setNombre}
          descripcion={registroCat.descripcion}
          setDescripcion={registroCat.setDescripcion}
          tipoRequerimiento={registroCat.tipoRequerimiento}
          setTipoRequerimiento={registroCat.setTipoRequerimiento}
          clasificacionBien={registroCat.clasificacionBien}
          setClasificacionBien={registroCat.setClasificacionBien}
          error={registroCat.error}
          loading={registroCat.loading}
          onSave={registroCat.handleGuardar}
          onCancel={() => {
            closeAddCat();
            registroCat.reset();
          }}
        />
      </ModalEstandar>
    </Stack>
  );
};

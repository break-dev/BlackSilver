import React, { useRef, useState } from "react";
import { TextInput, Flex, Text } from "@mantine/core";

interface SegmentedInputProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  label?: string;
  lengths: number[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SegmentedInput: React.FC<SegmentedInputProps> = ({
  label,
  lengths,
  value,
  onChange,
  disabled = false,
  ...props
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Dividir el valor actual en segmentos según las longitudes proporcionadas
  const getSegmentsFromValue = (val: string) => {
    const segments: string[] = [];
    let currentIndex = 0;
    lengths.forEach((len) => {
      segments.push(val.slice(currentIndex, currentIndex + len));
      currentIndex += len;
    });
    return segments;
  };

  const [prevValue, setPrevValue] = useState(value);
  const [segmentValues, setSegmentValues] = useState<string[]>(() =>
    getSegmentsFromValue(value),
  );

  if (value !== prevValue) {
    setPrevValue(value);
    setSegmentValues(getSegmentsFromValue(value));
  }

  const handleInputChange = (index: number, val: string) => {
    // Solo permitir números
    const cleanVal = val.replace(/\D/g, "").slice(0, lengths[index]);

    const newValues = [...segmentValues];
    newValues[index] = cleanVal;

    setSegmentValues(newValues);
    onChange(newValues.join(""));

    // Salto automático al siguiente input si se llena
    if (cleanVal.length === lengths[index] && index < lengths.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Retroceso automático si el campo está vacío
    if (e.key === "Backspace" && segmentValues[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("Text").replace(/\D/g, "");

    let currentIndex = 0;
    const newValues = lengths.map((len) => {
      const part = pastedData.slice(currentIndex, currentIndex + len);
      currentIndex += len;
      return part;
    });

    setSegmentValues(newValues);
    onChange(newValues.join(""));

    // Enfocar el último campo con contenido o el último total
    const lastFilledIndex = newValues.findIndex(
      (v, i) => v.length < lengths[i],
    );
    const focusIndex =
      lastFilledIndex === -1 ? lengths.length - 1 : lastFilledIndex;
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex flex-col gap-1 w-full" {...props}>
      {label && (
        <Text className="text-zinc-400 font-medium text-xs mb-1">{label}</Text>
      )}
      <Flex gap="xs" align="center" className="w-full">
        {lengths.map((len, index) => (
          <React.Fragment key={index}>
            <TextInput
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              value={segmentValues[index] || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={disabled}
              maxLength={len}
              autoComplete="off"
              radius="xl"
              placeholder={"0".repeat(len)}
              style={{ flex: index === 2 && lengths.length === 4 ? 2 : 1 }} // El segmento largo del CCI (12) es más ancho
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 text-white font-mono text-center placeholder:text-zinc-700 focus:border-indigo-500 transition-all",
              }}
            />
            {index < lengths.length - 1 && (
              <span className="text-zinc-700 font-bold select-none">-</span>
            )}
          </React.Fragment>
        ))}
      </Flex>
    </div>
  );
};

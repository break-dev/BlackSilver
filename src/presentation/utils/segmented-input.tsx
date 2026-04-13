import React, { useRef, useMemo } from "react";
import { Flex, Text, PinInput, Box } from "@mantine/core";

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
  // Almacenamos refs para cada PinInput para manejar el salto de foco entre segmentos
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Dividir el valor en segmentos según las longitudes proporcionadas
  const segments = useMemo(() => {
    const parts: string[] = [];
    let currentIndex = 0;
    lengths.forEach((len) => {
      parts.push(value.slice(currentIndex, currentIndex + len));
      currentIndex += len;
    });
    return parts;
  }, [value, lengths]);

  const handleSegmentChange = (index: number, val: string) => {
    const newSegments = [...segments];
    newSegments[index] = val;
    onChange(newSegments.join(""));
  };

  const handleComplete = (index: number) => {
    if (index < lengths.length - 1) {
      // Al completar un segmento, saltar al primer box del siguiente PinInput
      pinInputRefs.current[index + 1]?.focus();
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

    onChange(newValues.join(""));

    // Enfocar el último campo con contenido o el último total
    const lastFilledIndex = newValues.findIndex(
      (v, i) => v.length < lengths[i],
    );
    const focusIndex =
      lastFilledIndex === -1 ? lengths.length - 1 : lastFilledIndex;

    pinInputRefs.current[focusIndex]?.focus();
  };

  return (
    <Box className="flex flex-col gap-1 w-full" {...props}>
      {label && (
        <Text className="text-zinc-400 font-medium text-xs mb-1">{label}</Text>
      )}
      <Flex gap="xs" align="center" className="w-full flex-wrap sm:flex-nowrap">
        {lengths.map((len, index) => (
          <React.Fragment key={index}>
            <PinInput
              length={len}
              type="number"
              value={segments[index]}
              onChange={(val) => handleSegmentChange(index, val)}
              onComplete={() => handleComplete(index)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={disabled}
              placeholder=""
              ref={(el) => {
                pinInputRefs.current[index] = el;
              }}
              aria-label={`${label} - Parte ${index + 1}`}
              radius="md"
              size="xs"
              gap={2}
              classNames={{
                input:
                  "bg-zinc-900/50 border-zinc-800 text-white font-mono text-center focus:border-indigo-500 transition-all",
              }}
            />
            {index < lengths.length - 1 && (
              <span className="text-zinc-700 font-bold select-none hidden sm:inline">
                -
              </span>
            )}
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );
};

"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
  type ColorPickerProps,
} from "@/components/ui/color-picker";

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function rgbToHex(c: ArrayLike<number>): string {
  const toHex = (n: number) => {
    const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`;
}

type ColorPickerChangeValue = NonNullable<ColorPickerProps["onChange"]> extends (
  value: infer V,
) => void
  ? V
  : never;

interface ColorPickerFieldProps {
  value: string;
  onChange: (hex: string) => void;
  /** Show an editable hex input next to the swatch (default: true). */
  showHexInput?: boolean;
  /** Extra classes for the swatch trigger button. */
  swatchClassName?: string;
}

/**
 * Compact color field: a swatch button that opens the full ColorPicker in a
 * popover, with an optional editable hex input. Wires two-way sync safely:
 *  - `pickerValue` is always a valid hex so `Color(invalid)` never throws.
 *  - the picker `onChange` handler is stable (useCallback) so the ColorPicker's
 *    internal effect does not loop on every render.
 */
export function ColorPickerField({
  value,
  onChange,
  showHexInput = true,
  swatchClassName,
}: ColorPickerFieldProps) {
  const pickerValue = HEX_RE.test(value) ? value : "#000000";

  const handlePickerChange = useCallback(
    (c: ColorPickerChangeValue) => onChange(rgbToHex(c as unknown as ArrayLike<number>)),
    [onChange],
  );

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="选择颜色"
            className={`size-9 shrink-0 cursor-pointer rounded-md border border-input ${swatchClassName ?? ""}`}
            style={{ background: value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <ColorPicker value={pickerValue} onChange={handlePickerChange}>
            <ColorPickerSelection className="h-36 rounded-lg" />
            <ColorPickerHue />
            <div className="flex items-center gap-2">
              <ColorPickerEyeDropper />
              <ColorPickerOutput />
              <ColorPickerFormat className="flex-1" />
            </div>
          </ColorPicker>
        </PopoverContent>
      </Popover>
      {showHexInput && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-24 font-mono text-xs"
          spellCheck={false}
        />
      )}
    </div>
  );
}

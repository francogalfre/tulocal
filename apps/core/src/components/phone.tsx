"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { extractArgentinePhoneDigits } from "@/lib/phone/digits";
import { formatArgentinePhone } from "@/lib/phone/format";

type PhoneProps = {
  id: string;
  name: string;
  defaultValue: string | null;
  isRequired?: boolean;
};

const COUNTRY_PREFIX = "+54";
const FORMATTED_MAX_LENGTH = 12;

export function Phone({ id, name, defaultValue, isRequired = false }: PhoneProps) {
  const [digits, setDigits] = useState(
    defaultValue === null ? "" : extractArgentinePhoneDigits(defaultValue),
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setDigits(extractArgentinePhoneDigits(event.target.value));
  }

  return (
    <InputGroup className="h-11">
      <InputGroupAddon>
        <InputGroupText className="text-foreground">{COUNTRY_PREFIX}</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="11 2345-6789"
        maxLength={FORMATTED_MAX_LENGTH}
        value={formatArgentinePhone(digits)}
        onChange={handleChange}
        required={isRequired}
      />
    </InputGroup>
  );
}

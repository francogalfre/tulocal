import { readAreaCodeLength } from "@/lib/phone/area";
import { ARGENTINE_PHONE_DIGITS_LENGTH } from "@/lib/phone/digits";

const LOCAL_NUMBER_TAIL_LENGTH = 4;

export function formatArgentinePhone(digits: string): string {
  const areaCodeLength = readAreaCodeLength(digits);

  if (digits.length <= areaCodeLength) {
    return digits;
  }

  const areaCode = digits.slice(0, areaCodeLength);
  const localNumber = digits.slice(areaCodeLength);
  const localNumberLength = ARGENTINE_PHONE_DIGITS_LENGTH - areaCodeLength;
  const hyphenIndex = localNumberLength - LOCAL_NUMBER_TAIL_LENGTH;

  if (localNumber.length <= hyphenIndex) {
    return `${areaCode} ${localNumber}`;
  }

  return `${areaCode} ${localNumber.slice(0, hyphenIndex)}-${localNumber.slice(hyphenIndex)}`;
}

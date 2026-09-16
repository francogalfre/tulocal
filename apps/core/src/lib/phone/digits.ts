import { readAreaCodeLength } from "@/lib/phone/area";

export const ARGENTINE_PHONE_DIGITS_LENGTH = 10;

const COUNTRY_CODE = "54";
const MOBILE_PREFIX = "9";
const TRUNK_PREFIX = "0";
const LEGACY_MOBILE_PREFIX = "15";

function stripLeading(digits: string, prefix: string): string {
  if (digits.startsWith(prefix) && digits.length > ARGENTINE_PHONE_DIGITS_LENGTH) {
    return digits.slice(prefix.length);
  }

  return digits;
}

function stripLegacyMobilePrefix(digits: string): string {
  if (digits.length <= ARGENTINE_PHONE_DIGITS_LENGTH) {
    return digits;
  }

  const areaCodeLength = readAreaCodeLength(digits);
  const areaCode = digits.slice(0, areaCodeLength);
  const localNumber = digits.slice(areaCodeLength);

  if (!localNumber.startsWith(LEGACY_MOBILE_PREFIX)) {
    return digits;
  }

  return `${areaCode}${localNumber.slice(LEGACY_MOBILE_PREFIX.length)}`;
}

export function extractArgentinePhoneDigits(raw: string): string {
  const onlyDigits = raw.replaceAll(/\D/g, "");
  const withoutCountry = stripLeading(onlyDigits, COUNTRY_CODE);
  const withoutMobilePrefix = stripLeading(withoutCountry, MOBILE_PREFIX);
  const withoutTrunkPrefix = stripLeading(withoutMobilePrefix, TRUNK_PREFIX);

  return stripLegacyMobilePrefix(withoutTrunkPrefix).slice(0, ARGENTINE_PHONE_DIGITS_LENGTH);
}

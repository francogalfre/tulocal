import { z } from "zod";

import { ARGENTINE_PHONE_DIGITS_LENGTH, extractArgentinePhoneDigits } from "@/lib/phone/digits";

const WHATSAPP_ARGENTINA_PREFIX = "+549";

export const argentinePhoneSchema = z
  .string()
  .transform(extractArgentinePhoneDigits)
  .pipe(z.string().length(ARGENTINE_PHONE_DIGITS_LENGTH))
  .transform((digits) => `${WHATSAPP_ARGENTINA_PREFIX}${digits}`);

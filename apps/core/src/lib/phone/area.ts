const BUENOS_AIRES_AREA_CODE = "11";
const THREE_DIGIT_AREA_CODES = new Set([
  "220",
  "221",
  "223",
  "230",
  "236",
  "237",
  "249",
  "260",
  "261",
  "263",
  "264",
  "266",
  "280",
  "291",
  "294",
  "297",
  "298",
  "299",
  "336",
  "341",
  "342",
  "343",
  "345",
  "348",
  "351",
  "353",
  "358",
  "362",
  "364",
  "370",
  "376",
  "379",
  "380",
  "381",
  "383",
  "385",
  "387",
  "388",
]);

export function readAreaCodeLength(digits: string): number {
  if (digits.startsWith(BUENOS_AIRES_AREA_CODE)) {
    return 2;
  }

  if (THREE_DIGIT_AREA_CODES.has(digits.slice(0, 3))) {
    return 3;
  }

  return 4;
}

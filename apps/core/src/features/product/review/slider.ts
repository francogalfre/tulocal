export function readSliderValue(sliderValue: number | readonly number[]): number {
  if (Array.isArray(sliderValue)) {
    return sliderValue[0] ?? 0;
  }

  return Number(sliderValue);
}

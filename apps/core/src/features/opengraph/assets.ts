import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ASSETS_DIRECTORY = join(process.cwd(), "src/features/opengraph");

const DISPLAY_FONT_WEIGHT = 600;

const BODY_FONT_WEIGHT = 500;

type OpengraphFont = {
  name: string;
  data: Buffer;
  weight: typeof DISPLAY_FONT_WEIGHT | typeof BODY_FONT_WEIGHT;
  style: "normal";
};

export type OpengraphAssets = {
  fonts: OpengraphFont[];
  skylineUrl: string;
};

function readAsset(fileName: string): Promise<Buffer> {
  return readFile(join(ASSETS_DIRECTORY, fileName));
}

export async function loadOpengraphAssets(): Promise<OpengraphAssets> {
  const [outfit, jakarta, skyline] = await Promise.all([
    readAsset("outfit.woff"),
    readAsset("jakarta.woff"),
    readAsset("skyline.jpg"),
  ]);

  return {
    fonts: [
      { name: "Outfit", data: outfit, weight: DISPLAY_FONT_WEIGHT, style: "normal" },
      { name: "Plus Jakarta Sans", data: jakarta, weight: BODY_FONT_WEIGHT, style: "normal" },
    ],
    skylineUrl: `data:image/jpeg;base64,${skyline.toString("base64")}`,
  };
}

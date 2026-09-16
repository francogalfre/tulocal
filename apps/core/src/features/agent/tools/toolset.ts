import { showPhotos } from "@/features/agent/tools/album";
import { askSeller } from "@/features/agent/tools/ask";
import { signalBuyIntent } from "@/features/agent/tools/intent";
import { respondToOffer } from "@/features/agent/tools/offer";
import { inspectPhotos } from "@/features/agent/tools/photos";
import { flagScam } from "@/features/agent/tools/scam";

export const agentTools = {
  respondToOffer,
  askSeller,
  inspectPhotos,
  showPhotos,
  signalBuyIntent,
  flagScam,
};

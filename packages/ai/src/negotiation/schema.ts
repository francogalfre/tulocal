export type NegotiationContext = {
  product: {
    id: string;
    title: string;
    description: string;
    category: string | null;
    brand: string | null;
    model: string | null;
    condition: "new" | "used";
    qualityPercent: number | null;
    conditionNotes: string[];
    attributes: Record<string, string>;
    sellingPoints: string[];
    listPrice: number;
    minPrice: number;
    marketMinPrice: number | null;
    marketMaxPrice: number | null;
    marketSummary: string | null;
  };
  store: { name: string; whatsappPhone: string };
  state: {
    round: number;
    currentAsk: number | null;
    lastOffer: number | null;
    status: "open" | "deal" | "closed";
    agreedPrice: number | null;
  };
  photos: { url: string; mediaType: string }[];
  productUrl: string;
};

export type NegotiationHooks = {
  onOffer: (state: { round: number; currentAsk: number; lastOffer: number }) => Promise<void>;
  onDeal: (deal: { agreedPrice: number; summary: string; whatsappUrl: string }) => Promise<void>;
};

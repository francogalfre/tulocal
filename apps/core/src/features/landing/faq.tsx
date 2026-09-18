"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Fold } from "@/components/motion/fold";
import { InView } from "@/components/motion/inview";
import { Rise } from "@/components/motion/rise";
import { EASE_OUT_EXPO, STATE_DURATION_IN_SECONDS } from "@/lib/motion/timing";

type FaqEntry = {
  question: string;
  answer: string;
};

const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: "¿Cómo vendo productos online gratis?",
    answer:
      "Entrás con Google, sacás una foto y la IA arma la publicación con fotos, título y precio. Los primeros 3 productos no cuestan nada.",
  },
  {
    question: "¿Necesito saber de fotografía o de marketing?",
    answer:
      "No. La IA mejora tus fotos y busca precios de productos iguales al tuyo para sugerirte cuánto pedir.",
  },
  {
    question: "¿tulocal cobra comisión por lo que vendo?",
    answer:
      "No. tulocal no procesa el pago entre comprador y vendedor, así que no cobra comisión sobre ninguna venta.",
  },
];

type FaqQuestionSchema = {
  "@type": "Question";
  name: string;
  acceptedAnswer: { "@type": "Answer"; text: string };
};

type FaqPageSchema = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: FaqQuestionSchema[];
};

type FaqItemProps = {
  entry: FaqEntry;
  isOpen: boolean;
  onToggle: () => void;
};

function buildFaqPageSchema(): FaqPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ENTRIES.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

function FaqItem({ entry, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <h3 className="font-heading text-base font-medium">{entry.question}</h3>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: STATE_DURATION_IN_SECONDS, ease: EASE_OUT_EXPO }}
          className="shrink-0 text-muted-foreground"
        >
          <tulocalIcons.chevronDown className="size-4" />
        </motion.span>
      </button>
      <Fold isOpen={isOpen}>
        <p className="pt-3 text-sm leading-relaxed text-muted-foreground">{entry.answer}</p>
      </Fold>
    </div>
  );
}

export function Faq() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <section id="preguntas-frecuentes" className="border-t px-6 py-24">
      <script type="application/ld+json">{JSON.stringify(buildFaqPageSchema())}</script>
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-10 sm:flex-row">
        <Rise className="w-full sm:w-2/5">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border">
            <Image
              src="/landing/faq-illustration.webp"
              alt="Tienda atendida por un agente de inteligencia artificial"
              fill
              className="scale-130 object-cover"
            />
          </div>
        </Rise>
        <InView className="flex w-full flex-col gap-1 sm:w-3/5">
          <h2 className="mb-3 text-3xl">Preguntas frecuentes</h2>
          {FAQ_ENTRIES.map((entry) => (
            <FaqItem
              key={entry.question}
              entry={entry}
              isOpen={openQuestion === entry.question}
              onToggle={() =>
                setOpenQuestion((current) => (current === entry.question ? null : entry.question))
              }
            />
          ))}
        </InView>
      </div>
    </section>
  );
}

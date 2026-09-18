import { appOrigin } from "@/lib/origin";

const SITE_NAME = "tulocal";

const SITE_DESCRIPTION =
  "tulocal es la plataforma argentina para vender productos online: sacás una foto, la inteligencia artificial arma la publicación y tu tienda queda lista con link, QR y un agente que negocia por vos.";

type SchemaReference = { "@id": string };

type OrganizationSchemaNode = {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo: string;
  description: string;
};

type WebSiteSchemaNode = {
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  inLanguage: string;
  publisher: SchemaReference;
};

type ServiceOfferNode = {
  "@type": "Offer";
  price: string;
  priceCurrency: string;
};

type ServiceSchemaNode = {
  "@type": "Service";
  "@id": string;
  name: string;
  provider: SchemaReference;
  areaServed: string;
  description: string;
  offers: ServiceOfferNode;
};

type OrganizationGraph = {
  "@context": "https://schema.org";
  "@graph": [OrganizationSchemaNode, WebSiteSchemaNode, ServiceSchemaNode];
};

function buildOrganizationGraph(): OrganizationGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${appOrigin}/#organization`,
        name: SITE_NAME,
        url: appOrigin,
        logo: `${appOrigin}/favicon-dark.ico`,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${appOrigin}/#website`,
        name: SITE_NAME,
        url: appOrigin,
        inLanguage: "es-AR",
        publisher: { "@id": `${appOrigin}/#organization` },
      },
      {
        "@type": "Service",
        "@id": `${appOrigin}/#service`,
        name: "Creación de tiendas online con inteligencia artificial",
        provider: { "@id": `${appOrigin}/#organization` },
        areaServed: "AR",
        description: SITE_DESCRIPTION,
        offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
      },
    ],
  };
}

export function OrganizationSchema() {
  return <script type="application/ld+json">{JSON.stringify(buildOrganizationGraph())}</script>;
}

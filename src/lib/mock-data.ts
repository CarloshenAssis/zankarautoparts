import { Lightbulb, Radio, Eye, Shield, CarFront, Wrench, type LucideIcon } from "lucide-react";

export type Category = {
  slug: string;
  name: string;
  icon: LucideIcon;
  count: number;
};

export const categories: Category[] = [
  { slug: "farois", name: "Faróis", icon: Lightbulb, count: 42 },
  { slug: "lanternas", name: "Lanternas", icon: Radio, count: 36 },
  { slug: "retrovisores", name: "Retrovisores", icon: Eye, count: 28 },
  { slug: "parachoques", name: "Parachoques", icon: Shield, count: 51 },
  { slug: "lataria", name: "Lataria", icon: CarFront, count: 64 },
  { slug: "acessorios", name: "Acessórios", icon: Wrench, count: 87 },
];

export type Product = {
  id: string;
  name: string;
  code: string;
  category: string;
  categorySlug: string;
  brand: string;
  compatibility: string[];
  price: number;
  stock: number;
  description: string;
  extra: string;
  featured?: boolean;
  views: number;
  images: string[]; // gradient tokens for placeholder art
};

// Placeholder "images" are represented as gradient palettes so we can render
// tasteful stylized cards without needing generated artwork. All variations
// stay inside the Zankar palette (roxo / preto / branco).
const grad = {
  red: "from-[#6c2bd9] via-[#4b1e78] to-[#1f1f1f]",
  blue: "from-[#2a2440] via-[#4b1e78] to-[#141018]",
  steel: "from-[#8a8aba] via-[#ffffff] to-[#5c5c7a]",
  night: "from-[#1f1f1f] via-[#2a1f35] to-[#0f0f12]",
};

export const products: Product[] = [
  {
    id: "far-001",
    name: "Farol Dianteiro LED Cristal",
    code: "FR-2451",
    category: "Faróis",
    categorySlug: "farois",
    brand: "Arteb",
    compatibility: ["Gol G6 2013-2016", "Voyage 2013-2016"],
    price: 489.9,
    stock: 12,
    description:
      "Farol dianteiro com lente de cristal e tecnologia LED de alta luminosidade. Fabricado em ABS reforçado com refletor multiparabólico. Instalação plug-and-play sem necessidade de adaptações.",
    extra: "Garantia: 12 meses. Homologado pelo INMETRO. Não acompanha lâmpadas.",
    featured: true,
    views: 1240,
    images: [grad.red, grad.night, grad.steel],
  },
  {
    id: "lan-002",
    name: "Lanterna Traseira Fumê Esportiva",
    code: "LT-8823",
    category: "Lanternas",
    categorySlug: "lanternas",
    brand: "Fitam",
    compatibility: ["Civic 2012-2015", "Civic Si 2013"],
    price: 329.0,
    stock: 8,
    description:
      "Lanterna traseira em acrílico fumê escurecido, visual esportivo. LED integrado para pisca, freio e lanterna de posição.",
    extra: "Vendido a unidade (lado direito). Requer par para instalação completa.",
    featured: true,
    views: 980,
    images: [grad.night, grad.red, grad.steel],
  },
  {
    id: "ret-003",
    name: "Retrovisor Elétrico com Pisca",
    code: "RT-1092",
    category: "Retrovisores",
    categorySlug: "retrovisores",
    brand: "Metagal",
    compatibility: ["HB20 2015-2019", "HB20S 2015-2019"],
    price: 279.5,
    stock: 15,
    description:
      "Retrovisor externo elétrico com repetidor de seta integrado. Espelho azulado antirreflexo.",
    extra: "Lado motorista. Conector original de fábrica.",
    featured: true,
    views: 645,
    images: [grad.steel, grad.blue, grad.night],
  },
  {
    id: "par-004",
    name: "Parachoque Dianteiro Preparado",
    code: "PC-5510",
    category: "Parachoques",
    categorySlug: "parachoques",
    brand: "TG Poli",
    compatibility: ["Onix 2013-2016", "Prisma 2013-2016"],
    price: 649.0,
    stock: 5,
    description:
      "Parachoque dianteiro em polipropileno virgem, preparado para pintura. Encaixes originais e furação para sensores de estacionamento.",
    extra: "Enviado sem pintura. Recomenda-se pintura profissional.",
    featured: true,
    views: 1520,
    images: [grad.red, grad.night, grad.blue],
  },
  {
    id: "lat-005",
    name: "Paralama Dianteiro Direito",
    code: "LA-3341",
    category: "Lataria",
    categorySlug: "lataria",
    brand: "IMP",
    compatibility: ["Corolla 2014-2019"],
    price: 419.0,
    stock: 6,
    description:
      "Paralama dianteiro direito estampado em aço carbono, tratamento antioxidante eletroforético.",
    extra: "Encaixe original. Sem pintura.",
    views: 432,
    images: [grad.steel, grad.night, grad.red],
  },
  {
    id: "ace-006",
    name: "Kit Friso Lateral Cromado",
    code: "AC-7720",
    category: "Acessórios",
    categorySlug: "acessorios",
    brand: "TFP",
    compatibility: ["Universal - 4 portas"],
    price: 129.9,
    stock: 32,
    description:
      "Kit de 4 frisos laterais cromados com adesivo 3M automotivo. Acabamento em ABS cromado de alta resistência.",
    extra: "Fácil instalação. Não risca a pintura na remoção.",
    views: 812,
    images: [grad.steel, grad.night, grad.red],
  },
  {
    id: "far-007",
    name: "Farol Auxiliar Milha LED Redondo",
    code: "FR-9012",
    category: "Faróis",
    categorySlug: "farois",
    brand: "JR8",
    compatibility: ["Universal 12V"],
    price: 189.9,
    stock: 24,
    description:
      "Par de faróis auxiliares tipo milha com 18 LEDs de alta potência. Carcaça em alumínio fundido.",
    extra: "Acompanha chicote e relê. Prova d'água IP67.",
    views: 703,
    images: [grad.night, grad.steel, grad.red],
  },
  {
    id: "par-008",
    name: "Grade Frontal com Emblema",
    code: "PC-4477",
    category: "Parachoques",
    categorySlug: "parachoques",
    brand: "Original",
    compatibility: ["Palio 2012-2016", "Siena 2012-2016"],
    price: 289.0,
    stock: 9,
    description:
      "Grade dianteira superior com emblema, acabamento preto brilhante. Encaixe perfeito.",
    extra: "Peça nova, não recuperada.",
    views: 356,
    images: [grad.red, grad.night, grad.steel],
  },
];

export const brands = ["Arteb", "Fitam", "Metagal", "TG Poli", "IMP", "TFP", "JR8", "Original"];
export const vehicles = ["Gol", "Voyage", "Civic", "HB20", "Onix", "Corolla", "Palio", "Universal"];

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

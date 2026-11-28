// ===== Girls Like Us — shop data =====
// One entry per piece. Content ported from the reference site.
// Fill in WHATSAPP_NUMBER and each product's `img` when photos are ready.

export type ProductType = "Exclusive" | "Dresses" | "Tops" | "Sets" | "Shirts";
export type ProductStatus = "available" | "sold";

/** The sizes the shop stocks. Used by the admin stock editor and the size filter. */
export type Size = "S" | "M" | "L" | "XL" | "Free size";
export const SIZES: Size[] = ["S", "M", "L", "XL", "Free size"];

export type Product = {
  /** DB row id — present on products loaded from Supabase; absent for the static seed */
  id?: string;
  name: string;
  type: ProductType;
  price: number;
  status: ProductStatus;
  fit: string;
  colours: string[];
  /** sizes that currently have stock (derived from `stock`); kept for display */
  sizes?: string[];
  /** quantity in stock per size, e.g. { S: 2, M: 0, "Free size": 1 } */
  stock?: Partial<Record<Size, number>>;
  /** two tones that build the card's gradient backdrop */
  tones: [string, string];
  /** bow fallback colour when there's no photo yet */
  bow: string;
  /** first photo URL; "" shows the bow fallback */
  img: string;
  /** all photo URLs (Supabase Storage); the card shows img = images[0] */
  images?: string[];
  desc: string;
};

// ---- Edit these for the live site. WhatsApp: country code first, digits only, e.g. "919876543210".
export const WHATSAPP_NUMBER = "916383929959";
export const INSTAGRAM = "girlslikeus.store";

export const FILTERS: Array<"All" | ProductType> = ["All", "Exclusive", "Dresses", "Tops", "Sets", "Shirts"];

export const PRODUCTS: Product[] = [
  {
    name: "Rosalie", type: "Dresses", price: 2095, status: "available",
    fit: "Free size", colours: ["Rouge & Ivory", "Ivory"], tones: ["#C4485E", "#F6EEE4"], bow: "#FFFFFF", img: "",
    desc: "A one-piece dress with a soft knit top and a flowy tulle skirt. Comes with a pearl belt and two brooches.",
  },
  {
    name: "Daphne", type: "Dresses", price: 2095, status: "available",
    fit: "Free size", colours: ["Ivory", "Sage"], tones: ["#F6F0E4", "#B9CBB0"], bow: "#7A2E48", img: "",
    desc: "Floral tulle that moves like a whisper. Light, flowy and easy to dress up.",
  },
  {
    name: "Nora", type: "Sets", price: 2099, status: "available",
    fit: "Fit details on request", colours: ["Green", "Marble pink"], tones: ["#EFE2D0", "#EBC6CC"], bow: "#7A2E48", img: "",
    desc: "A cream blazer with a slip underneath. Wear it to work, or out for the evening.",
  },
  {
    name: "Belle", type: "Dresses", price: 1199, status: "available",
    fit: 'XS/S, bust 32"', colours: ["Black"], tones: ["#2B2326", "#5C4A52"], bow: "#FFFFFF", img: "",
    desc: "A little black dress with a bib collar and a bow. Made for petite frames.",
  },
  {
    name: "Polka side-knot shirt", type: "Tops", price: 1095, status: "available",
    fit: 'Free size, fits bust up to 38"', colours: ["Black", "White", "Blue", "Pink"], tones: ["#F3C0CB", "#A8C3E0"], bow: "#7A2E48", img: "",
    desc: "A polka shirt with a side knot that shapes the waist.",
  },
  {
    name: "Plain wrap shirt", type: "Tops", price: 1095, status: "available",
    fit: 'Free size, fits bust up to 38"', colours: ["Black", "White", "Green", "Blue", "Pink"], tones: ["#E4EEF8", "#F6EFE4"], bow: "#7A2E48", img: "",
    desc: "A clean wrap shirt that ties at the side. Sharp enough for work, soft enough for brunch.",
  },
  {
    name: "Polka tee", type: "Tops", price: 895, status: "available",
    fit: "Free size", colours: ["Black", "White", "Green", "Blue", "Pink"], tones: ["#B7CDE6", "#F1C3CF"], bow: "#7A2E48", img: "",
    desc: "A soft polka top with a draped neckline and long sleeves.",
  },
  {
    name: "Juliet", type: "Dresses", price: 2599, status: "sold",
    fit: 'Free size, fits bust 28" to 38"', colours: ["Blush", "Rouge"], tones: ["#F6CFC8", "#C4485E"], bow: "#FFFFFF", img: "",
    desc: "A full-sleeve netted dress, soft, light and flowy from the waist.",
  },
  {
    name: "Margot", type: "Dresses", price: 1995, status: "sold",
    fit: "Free size", colours: ["Chocolate"], tones: ["#5B3A2E", "#9A6B55"], bow: "#FFFFFF", img: "",
    desc: "A draped chocolate maxi with a rich, elegant fall.",
  },
];

export const SWATCH: Record<string, string> = {
  Rouge: "#B5384F", Ivory: "#F4ECDD", Sage: "#AEBFA2", Black: "#2B2326", Cream: "#EDE0CC",
  "Marble pink": "#EBC8CD", Green: "#8FAA8A", Blue: "#A8C3E0", Pink: "#F1B7C7", White: "#FFFFFF",
  Blush: "#F4C9C3", Chocolate: "#5B3A2E",
  "Rouge & Ivory": "linear-gradient(135deg, #B5384F 50%, #F4ECDD 50%)",
};

/** A wa.me link with a pre-filled message. Falls back to no number until WHATSAPP_NUMBER is set. */
export function waLink(text: string): string {
  const digits = /^\d{10,15}$/.test(WHATSAPP_NUMBER) ? WHATSAPP_NUMBER : "";
  return "https://wa.me/" + digits + "?text=" + encodeURIComponent(text);
}

export function rupees(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export const IG_URL = "https://instagram.com/" + INSTAGRAM;

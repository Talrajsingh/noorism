import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export const STORE = {
  name: "Noorism",
  tagline: "Wrist Charms",
  email: "shopnoorism@gmail.com",
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  customizable?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "name-charm",
    name: "Name Charm",
    price: 899,
    description: "Custom letter beads spelling your name on a soft pastel band.",
    image: product1,
    customizable: true,
  },
  {
    id: "pearl-stack",
    name: "Pearl Stack",
    price: 1299,
    description: "A delicate stack of pearls and gold-tone beads — quietly elegant.",
    image: product2,
  },
  {
    id: "onyx-pearl",
    name: "Onyx & Pearl",
    price: 1499,
    description: "Matte black onyx with a single freshwater pearl. Made for everyday.",
    image: product3,
  },
  {
    id: "candy-band",
    name: "Candy Band",
    price: 699,
    description: "Polymer clay heishi beads in a soft rainbow palette.",
    image: product4,
    customizable: true,
  },
];

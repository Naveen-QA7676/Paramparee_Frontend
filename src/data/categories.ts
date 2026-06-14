export interface CategoryItem {
  label: string;
  href: string;
}

export interface CategoryGroup {
  heading: string;
  items: CategoryItem[];
}

export const sareesCategories: CategoryGroup[] = [
  {
    heading: "Based on Pallu Style",
    items: [
      { label: "Tope Teni Ilkal Saree", href: "/products?pallu=tope-teni" },
      { label: "Zari Pallu Ilkal Saree", href: "/products?pallu=zari" },
      { label: "Simple / Plain Pallu Ilkal Saree", href: "/products?pallu=simple" },
    ],
  },
  {
    heading: "Based on Border Type",
    items: [
      { label: "Temple Border Ilkal Saree", href: "/products?border=temple" },
      { label: "Zari Border Ilkal Saree", href: "/products?border=zari" },
      { label: "Contrast Border Ilkal Saree", href: "/products?border=contrast" },
    ],
  },
  {
    heading: "Based on Fabric",
    items: [
      { label: "Cotton Ilkal Saree", href: "/products?fabric=cotton" },
      { label: "Cotton Silk Ilkal Saree", href: "/products?fabric=cotton-silk" },
      { label: "Silk Ilkal Saree", href: "/products?fabric=silk" },
      { label: "Art Silk Ilkal Saree", href: "/products?fabric=art-silk" },
    ],
  },
  {
    heading: "Based on Body Design",
    items: [
      { label: "Striped Ilkal Saree", href: "/products?design=striped" },
      { label: "Checked Ilkal Saree", href: "/products?design=checked" },
      { label: "Plain Body Ilkal Saree", href: "/products?design=plain" },
      { label: "Butta / Motif Ilkal Saree", href: "/products?design=butta" },
    ],
  },
  {
    heading: "Based on Weaving",
    items: [
      { label: "Handloom Ilkal Saree", href: "/products?weave=handloom" },
      { label: "Jacquard Ilkal Saree", href: "/products?weave=jacquard" },
    ],
  },
];

export const dressMaterialsCategories: CategoryItem[] = [
  { label: "Cotton Sarees", href: "/products?fabric=cotton" },
  { label: "Cotton Silk Sarees", href: "/products?fabric=cotton-silk" },
  { label: "Silk Sarees", href: "/products?fabric=silk" },
  { label: "Art Silk Sarees", href: "/products?fabric=art-silk" },
];

export const occasionsCategories: CategoryItem[] = [
  { label: "Daily Wear Sarees", href: "/products?occasion=daily" },
  { label: "Festive Wear Sarees", href: "/products?occasion=festive" },
  { label: "Wedding Sarees", href: "/products?occasion=wedding" },
];
//fixing the deployment
import Link from "next/link";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts, getProductsByCategory } from "@/lib/products";
import type { ProductCategory } from "@/lib/types";

export const revalidate = 60;

const CATEGORIES: { key: ProductCategory | "all"; label: string }[] = [
  { key: "all", label: "All Products" },
  { key: "serums", label: "Serums" },
  { key: "sunscreen", label: "Sunscreen" },
  { key: "creams", label: "Creams" },
  { key: "moisturizers", label: "Moisturizers" },
  { key: "cleansers", label: "Cleansers" },
  { key: "exfoliants", label: "Exfoliants" },
];

interface ShopPageProps {
  searchParams: { cat?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const requested = (searchParams.cat ?? "all") as ProductCategory | "all";
  const isValid = CATEGORIES.some((c) => c.key === requested);
  const cat = isValid ? requested : "all";

  const products =
    cat === "all" ? await getAllProducts() : await getProductsByCategory(cat);
  const totalCount =
    cat === "all" ? products.length : (await getAllProducts()).length;

  return (
    <>
      <section className="bg-gradient-to-br from-veliscos-secondary to-[#162447] text-white pt-32 pb-16 text-center">
        <Container>
          <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
            Full Collection
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold mb-3">
            All Products
          </h1>
          <p className="text-white/70 text-sm">
            {totalCount} clinically formulated products. Transparently priced.
            Dermatologist-informed.
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="flex justify-center gap-3 flex-wrap mb-12">
            {CATEGORIES.map((c) => {
              const active = cat === c.key;
              return (
                <Link
                  key={c.key}
                  href={c.key === "all" ? "/shop" : `/shop?cat=${c.key}`}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    active
                      ? "bg-veliscos-accent text-white border-veliscos-accent"
                      : "bg-veliscos-card text-veliscos-text-muted border-veliscos-border hover:bg-veliscos-accent hover:text-white hover:border-veliscos-accent"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-veliscos-text-muted mb-4">
                No products in this category yet.
              </p>
              <Link
                href="/shop"
                className="text-veliscos-accent font-semibold hover:underline"
              >
                Back to all products →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

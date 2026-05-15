import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { QtyAddToCart } from "@/components/QtyAddToCart";
import { pkr, categoryLabel } from "@/lib/format";
import { getProductById, getRelatedProducts } from "@/lib/products";

export const revalidate = 60;

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductById(params.id);
  if (!product) return { title: "Product — Veliscos Skincare" };
  return {
    title: `${product.name} — Veliscos Skincare`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 3);
  const image = product.image || "/images/brightening-cream.png";
  const isOOS = product.stock <= 0;
  const isLow = !isOOS && product.stock <= 10;

  return (
    <>
      <section className="pt-32 pb-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="bg-veliscos-surface-alt rounded-veliscos p-12 flex items-center justify-center min-h-[500px]">
              <Image
                src={image}
                alt={product.name}
                width={500}
                height={500}
                className="max-h-[400px] w-auto object-contain"
                priority
              />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
                {categoryLabel(product.category)}
                {product.size && ` · ${product.size}`}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-4">
                {product.name}
              </h1>
              <div className="font-bold text-2xl mb-6">{pkr(product.price)}</div>

              {product.keyActives.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.keyActives.map((a) => (
                    <span
                      key={a}
                      className="bg-gradient-to-br from-veliscos-accent/10 to-veliscos-accent/5 border border-veliscos-accent/20 text-veliscos-accent text-sm font-semibold px-4 py-2 rounded-full"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {product.description && (
                <p className="text-veliscos-text-muted leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              <QtyAddToCart
                productId={product.id}
                productName={product.name}
                price={product.price}
                disabled={isOOS}
              />

              {isLow && (
                <p className="text-amber-600 text-sm mb-4">
                  ⚠️ Only {product.stock} left in stock
                </p>
              )}

              <div className="border-t border-veliscos-border pt-6 space-y-3 text-sm">
                {product.howToUse && (
                  <div className="text-veliscos-text-muted">
                    🧴{" "}
                    <strong className="text-veliscos-text">How to Use:</strong>{" "}
                    {product.howToUse}
                  </div>
                )}
                {product.skinType.length > 0 && (
                  <div className="text-veliscos-text-muted">
                    👤{" "}
                    <strong className="text-veliscos-text">Skin Type:</strong>{" "}
                    {product.skinType.join(", ")}
                  </div>
                )}
                {product.badges.length > 0 && (
                  <div className="text-veliscos-text-muted">
                    ✓ {product.badges.join(" · ")}
                  </div>
                )}
                {product.ingredients && (
                  <div className="text-veliscos-text-muted pt-3 mt-3 border-t border-veliscos-border">
                    <strong className="text-veliscos-text">
                      Full Ingredients:
                    </strong>{" "}
                    {product.ingredients}
                  </div>
                )}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <div className="text-center mb-8">
                <div className="text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-3">
                  You May Also Like
                </div>
                <h2 className="font-heading text-3xl font-semibold">
                  Related Products
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

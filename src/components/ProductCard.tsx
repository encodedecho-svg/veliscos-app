import Image from "next/image";
import Link from "next/link";
import { pkr, categoryLabel } from "@/lib/format";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  const isOOS = product.stock <= 0;
  const isLow = !isOOS && product.stock <= 10;
  const image = product.image || "/images/brightening-cream.png";

  return (
    <div
      className={`group bg-veliscos-card rounded-veliscos border border-veliscos-border overflow-hidden transition-all hover:-translate-y-2 hover:shadow-lift hover:border-veliscos-accent ${
        isOOS ? "opacity-90" : ""
      }`}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative bg-veliscos-surface-alt aspect-square flex items-center justify-center p-8 overflow-hidden">
          {product.type && (
            <span className="absolute top-4 left-4 bg-veliscos-accent text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
              {product.type}
            </span>
          )}
          {isOOS && (
            <span className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
              Out of Stock
            </span>
          )}
          {isLow && (
            <span className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
              Low Stock
            </span>
          )}
          <Image
            src={image}
            alt={product.name}
            width={300}
            height={300}
            className={`max-h-[250px] w-auto object-contain transition-transform group-hover:scale-105 ${
              isOOS ? "opacity-50" : ""
            }`}
          />
        </div>
      </Link>

      <div className="p-6">
        <Link
          href={`/product/${product.id}`}
          className="block text-xs font-semibold uppercase tracking-widest text-veliscos-accent mb-2"
        >
          {categoryLabel(product.category)}
        </Link>
        <Link
          href={`/product/${product.id}`}
          className="block font-semibold text-base text-veliscos-text mb-2 hover:text-veliscos-accent transition-colors"
        >
          {product.name}
        </Link>

        {product.keyActives.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {product.keyActives.slice(0, 3).map((a) => (
              <span
                key={a}
                className="bg-veliscos-surface-alt text-veliscos-text-muted text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="font-bold text-lg text-veliscos-primary">
            {pkr(product.price)}
            {product.size && (
              <span className="text-xs font-normal text-veliscos-text-muted ml-1">
                / {product.size}
              </span>
            )}
          </div>
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            disabled={isOOS}
            variant="card"
          >
            {isOOS ? "Sold Out" : "Add to Cart"}
          </AddToCartButton>
        </div>
      </div>
    </div>
  );
}

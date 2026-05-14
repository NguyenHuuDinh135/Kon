"use client";

import { useState } from "react";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { getProductImage, formatCategory } from "@/lib/product-images";

interface ProductCardProps {
  product: {
    id: string | number;
    name: string;
    price?: number;
    category?: string;
    image?: string;
    weight?: number;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const productImage =
    product.image ||
    getProductImage(String(product.id), product.category || "_default");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      image: productImage,
    });
  };

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/60 bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imgError ? (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Package className="h-12 w-12 text-muted-foreground/40" />
          </div>
        ) : (
          <img
            src={productImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-3 right-3 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          {product.category && (
            <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wider">
              {formatCategory(product.category)}
            </Badge>
          )}
          {product.price != null && (
            <span className="text-base font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium text-foreground">
          {product.name}
        </h3>
        {product.weight != null && product.weight > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {product.weight >= 1000
              ? `${(product.weight / 1000).toFixed(1)} kg`
              : `${product.weight} g`}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

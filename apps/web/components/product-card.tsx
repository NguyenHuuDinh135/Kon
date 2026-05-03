"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@workspace/ui/components/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    category?: string;
    image?: string;
    quantityPerUnit?: string;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <Card className={cn("overflow-hidden group border-muted hover:border-primary/50 transition-all duration-300", className)}>
      <div className="aspect-square relative overflow-hidden bg-muted flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-4xl opacity-20">📦</span>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          {product.category ? (
            <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-wider">
              {product.category}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">
              ID: {product.id}
            </Badge>
          )}
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
        </div>
        <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
        {product.quantityPerUnit && (
          <p className="text-xs text-muted-foreground mt-1">{product.quantityPerUnit}</p>
        )}
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

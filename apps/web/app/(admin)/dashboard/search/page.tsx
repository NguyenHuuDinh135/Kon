"use client";

import { useState } from "react";
import { searchBehavior } from "@/lib/api";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Search, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const response = await searchBehavior(query);
      // Backend returns string representation of list of dicts: "[{...}, {...}]"
      // or actual list if we fixed it. The tool currently returns str(rows).
      let parsedResults = [];
      if (typeof response.results === "string") {
        try {
          // Replace single quotes with double quotes for JSON parsing if it looks like a list
          const jsonStr = response.results.replace(/'/g, '"');
          parsedResults = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse results string", e);
        }
      } else {
        parsedResults = response.results;
      }
      setResults(parsedResults);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tìm kiếm ngữ nghĩa</h2>
        <p className="text-muted-foreground">
          Tìm khách hàng dựa trên hành vi, không chỉ sản phẩm họ mua.
          Sử dụng Gemini Text Embeddings & pgvector.
        </p>
      </div>

      <div className="max-w-xl mx-auto flex gap-2">
        <Input 
          placeholder="VD: 'Khách hàng chi tiêu cao trên 40 tuổi'" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="h-12"
        />
        <Button onClick={handleSearch} disabled={isLoading} className="h-12 px-6">
          {isLoading ? <Loader2 className="animate-spin" /> : <Search className="size-4" />}
          <span className="ml-2">Tìm kiếm</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {results.map((result, i) => (
            <motion.div
              key={result.CustomerID || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Customer #{result.CustomerID}</CardTitle>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline">{result.Gender}</Badge>
                      <Badge variant="secondary">Tier {result.CityTier}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thời gian (tháng):</span>
                    <span className="font-semibold">{result.Tenure}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hài lòng:</span>
                    <span className="font-semibold text-primary">{result.SatisfactionScore}/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Đơn hàng:</span>
                    <span className="font-semibold">{result.OrderCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Danh mục:</span>
                    <span className="font-semibold">{result.PreferedOrderCat}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cashback:</span>
                    <span className="font-semibold">${result.CashbackAmount}</span>
                  </div>
                  <div className="pt-2">
                     <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${(result.SatisfactionScore / 5) * 100}%` }}
                        />
                     </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {results.length === 0 && !isLoading && (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="size-12 mx-auto mb-4 opacity-20" />
          <p>Thử tìm &quot;khách hàng trung thành hài lòng cao&quot; hoặc &quot;thời gian ngắn cashback cao&quot;</p>
        </div>
      )}
    </div>
  );
}

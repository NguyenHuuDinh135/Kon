"use client";

import { useState, useEffect, useCallback } from "react";
import { Megaphone, Plus, Loader2, CheckCircle2, Play } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { fetchCampaigns, createCampaign, approveCampaign, executeCampaign } from "@/lib/api";

interface Campaign {
  id: number;
  name: string;
  segment_target: string;
  discount_pct: number;
  status: "draft" | "approved" | "executed";
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  approved: "bg-primary/10 text-primary border-primary/20",
  executed: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    segment_target: "",
    discount_pct: 10,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCampaign(formData);
      setIsDialogOpen(false);
      setFormData({ name: "", segment_target: "", discount_pct: 10 });
      loadCampaigns();
    } catch {
      alert("Tạo chiến dịch thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveCampaign(id);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c))
      );
    } catch {
      alert("Phê duyệt chiến dịch thất bại");
    }
  };

  const handleExecute = async (id: number) => {
    if (!confirm("Thực thi chiến dịch này? Giảm giá sẽ được gửi đến phân khúc mục tiêu.")) return;
    try {
      await executeCampaign(id);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "executed" as const } : c))
      );
    } catch {
      alert("Thực thi chiến dịch thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chiến dịch</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý chiến dịch marketing và phân khúc khách hàng
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo chiến dịch
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo chiến dịch mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="campaign-name">Tên chiến dịch</Label>
                <Input
                  id="campaign-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Holiday Sale 2026"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="segment">Phân khúc mục tiêu</Label>
                <Input
                  id="segment"
                  value={formData.segment_target}
                  onChange={(e) => setFormData({ ...formData, segment_target: e.target.value })}
                  placeholder="e.g. VIP, At Risk, Loyal, New"
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Giảm giá %</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={formData.discount_pct}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_pct: parseInt(e.target.value) })
                  }
                  className="bg-muted/50"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border bg-card/50 backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Megaphone className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No campaigns yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="divide-y border-t">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="px-5 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-medium">
                        {campaign.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase tracking-wider ${STATUS_STYLES[campaign.status] || ""}`}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        Segment: <span className="text-foreground">{campaign.segment_target}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Discount: <span className="text-primary font-medium">{campaign.discount_pct}%</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {campaign.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(campaign.id)}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                    )}
                    {campaign.status === "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecute(campaign.id)}
                      >
                        <Play className="mr-1 h-3.5 w-3.5" />
                        Execute
                      </Button>
                    )}
                    {campaign.status === "executed" && (
                      <span className="text-xs text-muted-foreground italic">Completed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
  segment: string;
  discount_percent: number;
  status: "draft" | "approved" | "executed";
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-800 text-zinc-300 border-zinc-700",
  approved: "bg-emerald-950/50 text-emerald-400 border-emerald-800",
  executed: "bg-teal-950/50 text-teal-300 border-teal-800",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    segment: "",
    discount_percent: 10,
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
      setFormData({ name: "", segment: "", discount_percent: 10 });
      loadCampaigns();
    } catch {
      alert("Failed to create campaign");
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
      alert("Failed to approve campaign");
    }
  };

  const handleExecute = async (id: number) => {
    if (!confirm("Execute this campaign? This will send discounts to the segment.")) return;
    try {
      await executeCampaign(id);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "executed" as const } : c))
      );
    } catch {
      alert("Failed to execute campaign");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Campaigns</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage marketing campaigns and customer segments
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-zinc-800 bg-zinc-950">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Create Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="campaign-name" className="text-zinc-300">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Holiday Sale 2026"
                  className="border-zinc-800 bg-zinc-900"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="segment" className="text-zinc-300">Target Segment</Label>
                <Input
                  id="segment"
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  placeholder="e.g. high_value, at_risk, new_customers"
                  className="border-zinc-800 bg-zinc-900"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount" className="text-zinc-300">Discount %</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={formData.discount_percent}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_percent: parseInt(e.target.value) })
                  }
                  className="border-zinc-800 bg-zinc-900"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-700 text-white"
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

      <div className="rounded-xl border border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Megaphone className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">No campaigns yet</p>
            <p className="text-xs text-zinc-600 mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/30">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="px-5 py-4 hover:bg-zinc-900/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-medium text-zinc-100">
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
                      <span className="text-xs text-zinc-400">
                        Segment: <span className="text-zinc-300">{campaign.segment}</span>
                      </span>
                      <span className="text-xs text-zinc-400">
                        Discount: <span className="text-emerald-400 font-medium">{campaign.discount_percent}%</span>
                      </span>
                      <span className="text-xs text-zinc-600">
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
                        className="border-emerald-800 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300"
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
                        className="border-teal-800 text-teal-400 hover:bg-teal-950/30 hover:text-teal-300"
                      >
                        <Play className="mr-1 h-3.5 w-3.5" />
                        Execute
                      </Button>
                    )}
                    {campaign.status === "executed" && (
                      <span className="text-xs text-zinc-600 italic">Completed</span>
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

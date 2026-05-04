"use client";

import { useState } from "react";
import { ReviewDoc } from "@/src/lib/repos/misc";
import { RatingStars } from "@/src/components/shared/RatingStars";
import { Button } from "@/src/components/ui/button";
import { Input, Label, Textarea } from "@/src/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReviewSection({
  productId,
  reviews,
  canReview,
  sellerId,
  sessionUserId,
}: {
  productId: string;
  reviews: ReviewDoc[];
  canReview: boolean;
  sellerId: string;
  sessionUserId?: string;
}) {
  const r = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ productId, rating, comment }),
      headers: { "Content-Type": "application/json" },
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Review submitted");
      setComment("");
      r.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Failed");
    }
  }
  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
      {canReview && (
        <div className="border border-border rounded-md p-4 mb-6 space-y-3">
          <Label>Your rating</Label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <RatingStars value={n <= rating ? n : 0} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience" />
          <Button onClick={submit} disabled={busy || !comment}>Submit review</Button>
        </div>
      )}
      <ul className="space-y-4">
        {reviews
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((rv) => (
            <li key={rv.id} className="border border-border rounded-md p-4">
              <div className="flex items-center gap-2 mb-1">
                <RatingStars value={rv.rating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {new Date(rv.createdAt).toLocaleDateString()}
                  {rv.isEdited && " · edited"}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line">{rv.comment}</p>
              {rv.sellerResponse && (
                <div className="mt-2 ml-4 border-l-2 border-primary/40 pl-3 text-sm">
                  <span className="text-xs text-muted-foreground">Seller response</span>
                  <p>{rv.sellerResponse.comment}</p>
                </div>
              )}
              {!rv.sellerResponse && sessionUserId === sellerId && (
                <SellerRespondForm reviewId={rv.id} />
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

function SellerRespondForm({ reviewId }: { reviewId: string }) {
  const r = useRouter();
  const [text, setText] = useState("");
  async function submit() {
    const res = await fetch(`/api/reviews/${reviewId}/respond`, {
      method: "POST",
      body: JSON.stringify({ comment: text }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      toast.success("Response posted");
      r.refresh();
    }
  }
  return (
    <div className="mt-3 flex gap-2">
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Respond as seller" />
      <Button onClick={submit} disabled={!text}>Post</Button>
    </div>
  );
}

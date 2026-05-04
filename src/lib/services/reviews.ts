import { reviewsRepo } from "../repos/misc";
import { ordersRepo } from "../repos/orders";
import { productsRepo } from "../repos/products";

export function canReview(customerId: string, productId: string) {
  return ordersRepo.customerHasPurchased(customerId, productId) != null;
}

export function submitReview(input: {
  customerId: string;
  productId: string;
  rating: number;
  comment: string;
}) {
  const order = ordersRepo.customerHasPurchased(input.customerId, input.productId);
  if (!order) throw new Error("Must have purchased to review");
  const existing = reviewsRepo.byOrderProduct(order.id, input.productId);
  if (existing) throw new Error("Already reviewed");
  const review = reviewsRepo.create({
    customerId: input.customerId,
    productId: input.productId,
    orderId: order.id,
    rating: input.rating,
    comment: input.comment,
  });
  recomputeAverage(input.productId);
  return review;
}

export function editReview(
  reviewId: string,
  customerId: string,
  patch: { rating?: number; comment?: string },
) {
  const r = reviewsRepo.byId(reviewId);
  if (!r || r.customerId !== customerId) throw new Error("Not found");
  const ageMs = Date.now() - new Date(r.createdAt).getTime();
  if (ageMs > 30 * 24 * 3600 * 1000) throw new Error("Edit window closed");
  const updated = reviewsRepo.update(reviewId, {
    ...patch,
    isEdited: true,
    editedAt: new Date().toISOString(),
  });
  if (updated) recomputeAverage(r.productId);
  return updated;
}

export function respondToReview(reviewId: string, sellerId: string, comment: string) {
  const r = reviewsRepo.byId(reviewId);
  if (!r) throw new Error("Not found");
  const product = productsRepo.byId(r.productId);
  if (!product || product.sellerId !== sellerId) throw new Error("Not your product");
  return reviewsRepo.update(reviewId, {
    sellerResponse: { comment, respondedAt: new Date().toISOString() },
  });
}

export function recomputeAverage(productId: string) {
  const reviews = reviewsRepo.byProduct(productId);
  if (reviews.length === 0) {
    productsRepo.update(productId, { averageRating: 0, reviewCount: 0 });
    return;
  }
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  const avg = sum / reviews.length;
  productsRepo.update(productId, {
    averageRating: Math.round(avg * 100) / 100,
    reviewCount: reviews.length,
  });
}

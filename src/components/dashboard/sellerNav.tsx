import { LayoutDashboard, Package, Tag, Layers, Wallet, Sparkles, Receipt } from "lucide-react";
import { NavItem } from "./DashboardShell";
import { productsRepo } from "@/src/lib/repos/products";

export function sellerNav(sellerId: string): NavItem[] {
  const total = productsRepo.bySeller(sellerId).length;
  const pending = productsRepo
    .bySeller(sellerId)
    .filter((p) => p.status === "pending_review").length;
  return [
    { href: "/seller/dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      href: "/seller/products",
      label: "Products",
      icon: <Package className="w-4 h-4" />,
      badge: total > 0 ? total : undefined,
    },
    {
      href: "/seller/discounts",
      label: "Discounts",
      icon: <Tag className="w-4 h-4" />,
    },
    {
      href: "/seller/bundles",
      label: "Bundles",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      href: "/seller/payouts",
      label: "Payouts",
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      href: "/seller/subscription",
      label: "Subscription",
      icon: <Sparkles className="w-4 h-4" />,
    },
    ...(pending > 0
      ? [
          {
            href: "/seller/products?status=pending",
            label: "Review queue",
            icon: <Receipt className="w-4 h-4" />,
            badge: pending,
          } as NavItem,
        ]
      : []),
  ];
}

import { LayoutDashboard, Users, Package, ShoppingCart, RefreshCcw, ShieldAlert, FolderTree, UserCheck } from "lucide-react";
import { NavItem } from "./DashboardShell";
import { usersRepo } from "@/src/lib/repos/users";
import { productsRepo } from "@/src/lib/repos/products";
import { ordersRepo } from "@/src/lib/repos/orders";

export function adminNav(): NavItem[] {
  const pendingSellers = usersRepo.bySellerStatus("pending_approval").length;
  const pendingProducts = productsRepo.byStatus("pending_review").length;
  const flaggedOrders = ordersRepo.flagged().length;
  const refundRequests = ordersRepo.all().filter((o) => o.requiresReview && o.refundReason).length;
  return [
    { href: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      href: "/admin/sellers/pending",
      label: "Approvals",
      icon: <UserCheck className="w-4 h-4" />,
      badge: pendingSellers > 0 ? pendingSellers : undefined,
    },
    {
      href: "/admin/products/pending",
      label: "Product queue",
      icon: <Package className="w-4 h-4" />,
      badge: pendingProducts > 0 ? pendingProducts : undefined,
    },
    { href: "/admin/sellers", label: "Sellers", icon: <Users className="w-4 h-4" /> },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingCart className="w-4 h-4" /> },
    {
      href: "/admin/refunds",
      label: "Refunds",
      icon: <RefreshCcw className="w-4 h-4" />,
      badge: refundRequests > 0 ? refundRequests : undefined,
    },
    {
      href: "/admin/fraud",
      label: "Fraud",
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: flaggedOrders > 0 ? flaggedOrders : undefined,
    },
    { href: "/admin/categories", label: "Categories", icon: <FolderTree className="w-4 h-4" /> },
  ];
}

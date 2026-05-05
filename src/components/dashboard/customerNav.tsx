import { LayoutDashboard, Package, Heart, User, Sparkles } from "lucide-react";
import { NavItem } from "./DashboardShell";
import { ordersRepo } from "@/src/lib/repos/orders";

export function customerNav(userId: string): NavItem[] {
  const orders = ordersRepo.byCustomer(userId).length;
  return [
    { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      href: "/orders",
      label: "Orders & downloads",
      icon: <Package className="w-4 h-4" />,
      badge: orders > 0 ? orders : undefined,
    },
    { href: "/affiliate/dashboard", label: "Affiliate", icon: <Sparkles className="w-4 h-4" /> },
    { href: "/seller/onboarding", label: "Become a seller", icon: <Heart className="w-4 h-4" /> },
    { href: "/api/account/export", label: "Export my data", icon: <User className="w-4 h-4" /> },
  ];
}

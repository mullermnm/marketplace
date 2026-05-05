import { LayoutDashboard, Link as LinkIcon, Wallet } from "lucide-react";
import { NavItem } from "./DashboardShell";

export const affiliateNav: NavItem[] = [
  { href: "/affiliate/dashboard", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/affiliate/dashboard#links", label: "Links", icon: <LinkIcon className="w-4 h-4" /> },
  { href: "/affiliate/payouts", label: "Payouts", icon: <Wallet className="w-4 h-4" /> },
];

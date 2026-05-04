import { usersRepo } from "../repos/users";
import { categoriesRepo } from "../repos/categories";
import { subsRepo } from "../repos/subscriptions";
import { hashPassword } from "../auth/password";

let seeded = false;

export async function ensureSeed() {
  if (seeded) return;
  seeded = true;

  const adminEmail = "admin@local.dev";
  if (!usersRepo.byEmail(adminEmail)) {
    const passwordHash = await hashPassword("Admin123!");
    usersRepo.create({
      email: adminEmail,
      emailVerified: true,
      passwordHash,
      name: "Admin",
      role: "admin",
    });
  }

  if (categoriesRepo.all().length === 0) {
    const software = categoriesRepo.create({
      name: "Software",
      description: "Apps, plugins, scripts",
    });
    categoriesRepo.create({
      name: "Productivity",
      description: "",
      parentId: software.id,
    });
    categoriesRepo.create({ name: "Templates", description: "Design and document templates" });
    categoriesRepo.create({ name: "Courses", description: "Educational content" });
    categoriesRepo.create({ name: "3D Models", description: "" });
    categoriesRepo.create({ name: "Audio", description: "" });
    categoriesRepo.create({ name: "Video", description: "" });
    categoriesRepo.create({ name: "eBooks", description: "" });
  }

  // Demo seller (approved, free trial)
  const sellerEmail = "seller@local.dev";
  if (!usersRepo.byEmail(sellerEmail)) {
    const passwordHash = await hashPassword("Seller123!");
    const seller = usersRepo.create({
      email: sellerEmail,
      emailVerified: true,
      passwordHash,
      name: "Demo Seller",
      role: "seller",
      sellerProfile: {
        businessName: "Demo Studio",
        description: "Selling demo digital goods",
        contactEmail: sellerEmail,
        status: "approved",
        approvedAt: new Date().toISOString(),
      },
    });
    subsRepo.create(seller.id, "free_trial");
  }

  // Demo customer
  const customerEmail = "customer@local.dev";
  if (!usersRepo.byEmail(customerEmail)) {
    const passwordHash = await hashPassword("Customer123!");
    usersRepo.create({
      email: customerEmail,
      emailVerified: true,
      passwordHash,
      name: "Demo Customer",
      role: "customer",
    });
  }
}

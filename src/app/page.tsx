import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import ApartmentsList from "@/components/ApartmentsList";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ApartmentsList user={payload} />
    </div>
  );
}

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { GUEST_COOKIE } from "@/lib/guest";

export async function continueAsGuest() {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE, "1", { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/[locale]", "layout");
}

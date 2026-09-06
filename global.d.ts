import type { routing } from "@/i18n/routing";
import type messages from "@/messages/ja.json";
import type { DefaultSession } from "next-auth";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}

// database session strategy spreads the adapter's user row (including `id`)
// into `session.user`, but next-auth's default type omits it
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

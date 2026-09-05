import { ArrowLeft, History } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function ResultsPage() {
  const t = await getTranslations("ResultsPage");
  const tNav = await getTranslations("Nav");
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          {tNav("backToList")}
        </Link>
        <section className="mt-10 rounded-[2rem] border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <History data-icon="inline-start" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
            {t("description")}
          </p>
          <Button className="mt-6">
            <Link href="/">{t("browseQuizzes")}</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}


"use client";

import { Button } from "./ui/button";
import { useLanguage } from "@/lib/language-context";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Button
      variant="ghost"
      className="fixed top-4 right-4 bg-white/80 hover:bg-white/90"
      onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
    >
      {t('languageName')}
    </Button>
  );
}
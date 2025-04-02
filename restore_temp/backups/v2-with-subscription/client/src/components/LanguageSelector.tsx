import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale, LocaleCode } from "@/context/LocaleContext";

const LanguageSelector: React.FC = () => {
  const { currentLocale, setLocale, t, getLocaleOptions } = useLocale();
  const localeOptions = getLocaleOptions();

  const handleLocaleChange = (value: string) => {
    setLocale(value as LocaleCode);
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <label className="text-sm font-medium">{t("language")}</label>
      <Select
        value={currentLocale}
        onValueChange={handleLocaleChange}
      >
        <SelectTrigger className="bg-white dark:bg-zinc-900">
          <SelectValue placeholder={t("language")} />
        </SelectTrigger>
        <SelectContent>
          {localeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
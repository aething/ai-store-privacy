import { useLocation } from "wouter";
import { useLocale } from "@/context/LocaleContext";

export default function Footer() {
  const [, setLocation] = useLocation();
  const { t, currentLocale } = useLocale();

  // Навигация к информационной странице
  const goToInfoPage = (pageId: string) => {
    // Исправлено: используем правильный маршрут /info/ вместо /policy/
    setLocation(`/info/${pageId}`);
  };

  return (
    <footer className="bg-gray-100 py-8 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Компания */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("company")}</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => goToInfoPage("about")} 
                  className="text-blue-600 hover:underline"
                >
                  {t("aboutUs")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => goToInfoPage("contact")} 
                  className="text-blue-600 hover:underline"
                >
                  {t("contactUs")}
                </button>
              </li>
            </ul>
          </div>

          {/* Политики */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("policies")}</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => goToInfoPage("privacyPolicy")} 
                  className="text-blue-600 hover:underline"
                >
                  {t("privacyPolicy")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => goToInfoPage("termsOfService")} 
                  className="text-blue-600 hover:underline"
                >
                  {t("termsOfService")}
                </button>
              </li>
            </ul>
          </div>

          {/* Доставка и возврат */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("shipping")}</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => goToInfoPage("deliveryPolicy")} 
                  className="text-blue-600 hover:underline"
                >
                  {t("deliveryInfo")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => goToInfoPage("returnPolicy")} 
                  className="text-blue-600 hover:underline"
                >
                  {t("returnsInfo")}
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} AI Technologies. {t("allRightsReserved")}
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            {t("currentLang")}: {currentLocale.toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  );
}
/**
 * Многоязычные версии политик
 * Каждая политика имеет перевод на все поддерживаемые языки
 */

import { LocaleCode } from "@/context/LocaleContext";

// Структура политики с многоязычной поддержкой
export interface MultilingualPolicy {
  id: string;
  translations: Record<LocaleCode, {
    title: string;
    content: string;
  }>;
}

// Политика доставки со всеми переводами
export const deliveryPolicy: MultilingualPolicy = {
  id: "delivery-policy",
  translations: {
    // Английская версия
    en: {
      title: "Delivery Policy",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
          
          <h4 class="font-medium mb-2">1. Delivery Policy</h4>
          <p class="mb-4 text-text-secondary">We comply with EU (Directive 2011/83/EU, GDPR) and US (FTC, UCC) laws.</p>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Delivery Regions:</h5>
            <p class="text-text-secondary">EU & USA only.<br>
            EU prices include VAT. Non-EU/US orders may incur customs fees (customer's responsibility).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Methods:</h5>
            <p class="text-text-secondary">Standard (3–7 business days). Cost included in item price.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Timeframes:</h5>
            <p class="text-text-secondary">Processing: 1–3 days. Max 30 days to EU (per Directive 2011/83/EU). Delays notified via email.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Tracking:</h5>
            <p class="text-text-secondary">GDPR-compliant tracking link provided post-dispatch.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Damages:</h5>
            <p class="text-text-secondary">Report within 14 days (EU) or 7 days (USA). Free returns with photo proof.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Right of Withdrawal:</h5>
            <p class="text-text-secondary">Cancel within 14 days (see <a href="/policy/return-policy" class="text-blue-600 hover:underline">Returns</a>).</p>
          </div>
          
          <p class="text-text-secondary"><strong>Contact:</strong> support@aething.com</p>
        </div>
      `
    },
    
    // Немецкая версия
    de: {
      title: "Lieferrichtlinie",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Lieferrichtlinie</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 1 Regionen:</h5>
            <p class="text-text-secondary">EU: Preis inkl. MwSt.</p>
            <p class="text-text-secondary">USA: Ohne Mehrwertsteuer.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 2 Lieferzeiten:</h5>
            <p class="text-text-secondary">Standard: 3-7 Werktage nach Zahlungseingang.</p>
            <p class="text-text-secondary">Express: Auf Anfrage (+ Gebühr).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 3 Fristen:</h5>
            <p class="text-text-secondary">Bearbeitung 1–3 Tage. Max. 30 Tage in EU (Richtlinie 2011/83/EU).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 4 Beschädigungen:</h5>
            <p class="text-text-secondary">Innerhalb 14 Tage (EU) melden. Kostenlose Rücksendung mit Foto.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 5 Risikoübergang:</h5>
            <p class="text-text-secondary">Mit Übergabe an den Spediteur (Incoterms 2023: FCA).</p>
          </div>
          
          <p class="text-text-secondary"><strong>Kontakt:</strong> support@aething.com</p>
        </div>
      `
    },
    
    // Французская версия
    fr: {
      title: "Politique de Livraison",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Politique de Livraison</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Zones:</h5>
            <p class="text-text-secondary">UE & USA. Prix UE TTC. Frais de douane hors UE/USA à votre charge.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Méthodes:</h5>
            <p class="text-text-secondary">Standard (3–7 jours ouvrés). Frais inclus.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Délais:</h5>
            <p class="text-text-secondary">Traitement 1–3 jours. Max 30 jours UE (Directive 2011/83/UE).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Dommages:</h5>
            <p class="text-text-secondary">Signaler sous 14 jours (UE). Retour gratuit avec preuve photo.</p>
          </div>
          
          <p class="text-text-secondary"><strong>Contact:</strong> support@aething.com</p>
        </div>
      `
    },
    
    // Испанская версия
    es: {
      title: "Política de Envío",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Política de Envío</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Regiones:</h5>
            <p class="text-text-secondary">UE y EE.UU. Precios UE con IVA. Aranceles fuera UE/EE.UU. son su responsabilidad.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Métodos:</h5>
            <p class="text-text-secondary">Estándar (3–7 días laborables). Coste incluido.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Plazos:</h5>
            <p class="text-text-secondary">Procesamiento 1–3 días. Máximo 30 días en UE (Directiva 2011/83/UE).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Daños:</h5>
            <p class="text-text-secondary">Reportar en 14 días (UE). Devolución gratuita con foto.</p>
          </div>
          
          <p class="text-text-secondary"><strong>Contacto:</strong> support@aething.com</p>
        </div>
      `
    },
    
    // Итальянская версия
    it: {
      title: "Politica di Consegna",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
          
          <h4 class="font-medium mb-2">Politica di Consegna</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Aree:</h5>
            <p class="text-text-secondary">UE & USA. Prezzi UE IVA inclusa. Dazi doganali extra-UE/USA a vostro carico.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Metodi:</h5>
            <p class="text-text-secondary">Standard (3–7 giorni lavorativi). Costo incluso.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Tempi:</h5>
            <p class="text-text-secondary">Elaborazione 1–3 giorni. Massimo 30 giorni UE (Direttiva 2011/83/UE).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Danni:</h5>
            <p class="text-text-secondary">Segnalare entro 14 giorni (UE). Reso gratuito con foto.</p>
          </div>
          
          <p class="text-text-secondary"><strong>Contatto:</strong> support@aething.com</p>
        </div>
      `
    },
    
    // Японская версия
    ja: {
      title: "配送ポリシー",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">配送ポリシー</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">地域:</h5>
            <p class="text-text-secondary">EU・米国。EU価格はVAT込み。EU/米国外は関税が発生する場合あり。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">方法:</h5>
            <p class="text-text-secondary">標準配送（3–7営業日）。送料込み。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">期間:</h5>
            <p class="text-text-secondary">処理1–3日。EUは最大30日（指令2011/83/EU）。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">損傷:</h5>
            <p class="text-text-secondary">EUは14日以内に報告。写真証明で無料返品。</p>
          </div>
          
          <p class="text-text-secondary"><strong>連絡先:</strong> support@aething.com</p>
        </div>
      `
    },
    
    // Китайская версия
    zh: {
      title: "配送政策",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">配送政策</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">地区:</h5>
            <p class="text-text-secondary">欧盟和美国。欧盟价格含税。非欧盟/美国订单可能产生关税。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">方式:</h5>
            <p class="text-text-secondary">标准配送（3–7个工作日）。运费已含。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">时效:</h5>
            <p class="text-text-secondary">处理时间1–3天。欧盟最长30天（指令2011/83/EU）。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">损坏:</h5>
            <p class="text-text-secondary">欧盟14天内报告。凭照片免费退换。</p>
          </div>
          
          <p class="text-text-secondary"><strong>联系:</strong> support@aething.com</p>
        </div>
      `
    }
  }
};

// Контактная информация
export const contactPolicy: MultilingualPolicy = {
  id: "contact-info",
  translations: {
    // Английская версия
    en: {
      title: "Contact Information",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
          
          <h4 class="font-medium mb-2">Contact Information</h4>
          
          <div class="mb-3">
            <p class="text-text-secondary"><strong>Company:</strong> Aething Inc.</p>
            <p class="text-text-secondary"><strong>Address:</strong> 1111B S Governors Ave #6113, Dover, DE 19904, USA</p>
            <p class="text-text-secondary"><strong>Email:</strong> support@aething.com</p>
          </div>
        </div>
      `
    },
    // Немецкая версия
    de: {
      title: "Kontaktinformationen",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Kontaktinformationen</h4>
          
          <div class="mb-3">
            <p class="text-text-secondary"><strong>Unternehmen:</strong> Aething Inc.</p>
            <p class="text-text-secondary"><strong>Adresse:</strong> 1111B S Governors Ave #6113, Dover, DE 19904, USA</p>
            <p class="text-text-secondary"><strong>E-Mail:</strong> support@aething.com</p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Coordonnées",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Coordonnées</h4>
          
          <div class="mb-3">
            <p class="text-text-secondary"><strong>Société:</strong> Aething Inc.</p>
            <p class="text-text-secondary"><strong>Adresse:</strong> 1111B S Governors Ave #6113, Dover, DE 19904, USA</p>
            <p class="text-text-secondary"><strong>Email:</strong> support@aething.com</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Información de Contacto",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Información de Contacto</h4>
          
          <div class="mb-3">
            <p class="text-text-secondary"><strong>Empresa:</strong> Aething Inc.</p>
            <p class="text-text-secondary"><strong>Dirección:</strong> 1111B S Governors Ave #6113, Dover, DE 19904, USA</p>
            <p class="text-text-secondary"><strong>Email:</strong> support@aething.com</p>
          </div>
        </div>
      `
    },
    // Итальянская версия
    it: {
      title: "Informazioni di Contatto",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
          
          <h4 class="font-medium mb-2">Informazioni di Contatto</h4>
          
          <div class="mb-3">
            <p class="text-text-secondary"><strong>Azienda:</strong> Aething Inc.</p>
            <p class="text-text-secondary"><strong>Indirizzo:</strong> 1111B S Governors Ave #6113, Dover, DE 19904, USA</p>
            <p class="text-text-secondary"><strong>Email:</strong> support@aething.com</p>
          </div>
        </div>
      `
    },
    // Японская версия
    ja: {
      title: "お問い合わせ情報",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">お問い合わせ情報</h4>
          
          <div class="mb-3">
            <p class="text-text-secondary"><strong>会社名:</strong> Aething Inc.</p>
            <p class="text-text-secondary"><strong>住所:</strong> 1111B S Governors Ave #6113, Dover, DE 19904, USA</p>
            <p class="text-text-secondary"><strong>メール:</strong> support@aething.com</p>
          </div>
        </div>
      `
    },
    // Китайская версия
    zh: {
      title: "联系信息",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">联系信息</h4>
          
          <div class="mb-3">
            <p class="text-text-secondary"><strong>公司:</strong> Aething Inc.</p>
            <p class="text-text-secondary"><strong>地址:</strong> 1111B S Governors Ave #6113, Dover, DE 19904, USA</p>
            <p class="text-text-secondary"><strong>邮箱:</strong> support@aething.com</p>
          </div>
        </div>
      `
    }
  }
};

// Политика возврата и обмена
export const returnPolicy: MultilingualPolicy = {
  id: "return-policy",
  translations: {
    // Английская версия
    en: {
      title: "Return & Exchange Policy",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
          
          <h4 class="font-medium mb-2">Return & Exchange Policy</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">General Conditions:</h5>
            <p class="text-text-secondary">Return Window: 14 days from delivery.</p>
            <p class="text-text-secondary">Non-Returnable Items: Opened software, custom PCs, customer-damaged goods.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Defective Items:</h5>
            <p class="text-text-secondary">Free return shipping if defect is confirmed. Provide proof via support@aething.com within 7 days.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Standard Returns:</h5>
            <p class="text-text-secondary">Customer covers return shipping. Refund in 5–7 business days.</p>
          </div>
        </div>
      `
    },
    // Немецкая версия
    de: {
      title: "Widerrufsbelehrung (Rückgabebedingungen)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Widerrufsbelehrung (Rückgabebedingungen)</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 1 Widerrufsrecht (Gemäß § 355 BGB)</h5>
            <p class="text-text-secondary">Sie haben 14 Tage ab Erhalt der Ware, um den Kauf ohne Angabe von Gründen zu widerrufen.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 2 Ausnahmen</h5>
            <p class="text-text-secondary">Kein Widerrufsrecht für:</p>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Aktivierte Software/Digitale Inhalte</li>
              <li>Maßgefertigte PC-Konfigurationen</li>
              <li>Beschädigte Ware durch unsachgemäße Handhabung</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 3 Verfahren</h5>
            <p class="text-text-secondary">Schritt: Senden Sie eine E-Mail an support@aething.com mit:</p>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Bestellnummer</li>
              <li>Foto des Originalzustands (bei Beschädigungen)</li>
            </ul>
            <p class="text-text-secondary">Schritt: Wir senden eine Rücksendeetikette (bei Defekten) oder Adresse für Eigenversand.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 4 Kostentragung</h5>
            <p class="text-text-secondary">Bei Defekten: Wir übernehmen die Rücksendekosten.</p>
            <p class="text-text-secondary">Bei Widerruf: Sie tragen die direkten Kosten der Rücksendung.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 5 Erstattung</h5>
            <p class="text-text-secondary">Innerhalb von 7 Werktagen nach Wareneingang.</p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Politique de Retour et Rétractation",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Politique de Retour et Rétractation</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Article L221-18 du Code de la Consommation:</h5>
            <p class="text-text-secondary">Droit de rétractation : 14 jours à compter de la réception du produit.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Exceptions:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Logiciels activés/licences numériques.</li>
              <li>Configurations PC sur mesure (sauf défaut).</li>
              <li>Produits endommagés par le client.</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Procédure:</h5>
            <p class="text-text-secondary">Envoyer un email à support@aething.com avec:</p>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Numéro de commande.</li>
              <li>Photos du produit (si endommagé).</li>
            </ul>
            <p class="text-text-secondary">Nous fournissons une étiquette de retour (pour les défauts) ou l'adresse d'expédition.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Frais de Retour:</h5>
            <p class="text-text-secondary">Défauts: Pris en charge par Aething Inc.</p>
            <p class="text-text-secondary">Rétractation: À la charge du client.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Remboursement:</h5>
            <p class="text-text-secondary">Sous 7 jours ouvrables après réception du retour.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Política de Devoluciones y Derecho de Desistimiento",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Política de Devoluciones y Derecho de Desistimiento</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Ley General 3/2014 (Art. 71-108):</h5>
            <p class="text-text-secondary"><strong>Plazo:</strong> 14 días naturales desde la recepción del producto.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Excepciones:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Software activado/licencias digitales.</li>
              <li>Equipos personalizados (salvo defectos).</li>
              <li>Daños causados por el cliente.</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Procedimiento:</h5>
            <p class="text-text-secondary">Enviar email a support@aething.com con:</p>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Número de pedido.</li>
              <li>Fotos del producto (si está dañado).</li>
            </ul>
            <p class="text-text-secondary">Proporcionaremos etiqueta de devolución (para defectos) o dirección de retorno.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Costes:</h5>
            <p class="text-text-secondary">Defectos: A cargo de Aething Inc.</p>
            <p class="text-text-secondary">Desistimiento: A cargo del cliente.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Reembolso:</h5>
            <p class="text-text-secondary">En un plazo de 7 días hábiles tras recibir el producto.</p>
          </div>
        </div>
      `
    },
    // Итальянская версия
    it: {
      title: "Diritto di Recesso e Reso",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
          
          <h4 class="font-medium mb-2">Diritto di Recesso e Reso</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Decreto Legislativo 21/2014 (Art. 52-67):</h5>
            <p class="text-text-secondary"><strong>Termine:</strong> 14 giorni dalla ricezione del prodotto.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Esclusioni:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Software attivato/licenze digitali.</li>
              <li>PC configurati su misura (salvo difetti).</li>
              <li>Danni causati dal cliente.</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Procedura:</h5>
            <p class="text-text-secondary">Inviare email a support@aething.com con:</p>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Numero d'ordine.</li>
              <li>Foto del prodotto (se danneggiato).</li>
            </ul>
            <p class="text-text-secondary">Forniremo etichetta di reso (per difetti) o indirizzo per la spedizione.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Costi:</h5>
            <p class="text-text-secondary">Difetti: A carico di Aething Inc.</p>
            <p class="text-text-secondary">Recesso: A carico del cliente.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Rimborso:</h5>
            <p class="text-text-secondary">Entro 7 giorni lavorativi dalla ricezione del reso.</p>
          </div>
        </div>
      `
    },
    // Японская версия
    ja: {
      title: "返品・返金ポリシー",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">返品・返金ポリシー</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">消費者契約法（第6条）及び特定商取引法（第15条）:</h5>
            <p class="text-text-secondary"><strong>返品期間：</strong>商品到着後14日間。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">返品条件:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>未使用品に限る</li>
              <li>オリジナルパッケージ必須</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">返品不可商品:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>開封済みソフトウェア/ライセンスキー</li>
              <li>カスタムPC（不良品を除く）</li>
              <li>お客様による損傷</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">返品手順:</h5>
            <p class="text-text-secondary">support@aething.com へ以下を送付：</p>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>注文番号</li>
              <li>商品状態の写真（破損の場合）</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">費用負担:</h5>
            <p class="text-text-secondary">不良品：当社負担</p>
            <p class="text-text-secondary">お客様都合：送料お客様負担</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">返金処理:</h5>
            <p class="text-text-secondary">返品受領後7営業日以内</p>
          </div>
        </div>
      `
    },
    // Китайская версия
    zh: {
      title: "退换货政策",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">退换货政策</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">依据《电子商务法》第20条、《消费者权益保护法》第25条:</h5>
            <p class="text-text-secondary"><strong>退货期限:</strong> 签收后14天内</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">退货条件:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>商品未使用</li>
              <li>保留原包装及配件</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">不适用退货商品:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>已激活的软件/数字产品</li>
              <li>定制类商品（除非存在质量问题）</li>
              <li>人为损坏商品</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">退货流程:</h5>
            <p class="text-text-secondary">发送邮件至 support@aething.com 并提供:</p>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>订单号</li>
              <li>商品问题照片（如破损）</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">费用承担:</h5>
            <p class="text-text-secondary">质量问题：我方承担运费</p>
            <p class="text-text-secondary">无理由退货：客户承担运费</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">退款时间:</h5>
            <p class="text-text-secondary">收到退货后7个工作日内</p>
          </div>
        </div>
      `
    }
  }
};

// Условия оплаты
export const paymentTermsPolicy: MultilingualPolicy = {
  id: "payment-terms",
  translations: {
    // Английская версия
    en: {
      title: "Payment Terms",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
          
          <h4 class="font-medium mb-2">Payment Terms</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Methods:</h5>
            <p class="text-text-secondary">Stripe (options depend on your country).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Prepayment:</h5>
            <p class="text-text-secondary">Required for all orders.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Refunds:</h5>
            <p class="text-text-secondary">Processed within 7 business days.</p>
          </div>
        </div>
      `
    },
    // Немецкая версия
    de: {
      title: "Zahlungsbedingungen",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Zahlungsbedingungen</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 1 Akzeptierte Methoden:</h5>
            <p class="text-text-secondary">Stripe (Kreditkarten, landesspezifische Optionen)</p>
            <p class="text-text-secondary">Vorauskasse (100% bei Bestellung)</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 2 Sicherheit:</h5>
            <p class="text-text-secondary">PCI-DSS konforme Verschlüsselung.</p>
            <p class="text-text-secondary">Keine Speicherung der Kartendaten auf unseren Servern.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 3 Rückerstattungen:</h5>
            <p class="text-text-secondary">Werden innerhalb von 7 Werktagen bearbeitet.</p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Conditions de Paiement",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Conditions de Paiement</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Méthodes Acceptées:</h5>
            <p class="text-text-secondary">Stripe (cartes bancaires, options par pays).</p>
            <p class="text-text-secondary">Paiement anticipé (100% à la commande).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Sécurité:</h5>
            <p class="text-text-secondary">Cryptage conforme PCI-DSS.</p>
            <p class="text-text-secondary">Aucun stockage des données bancaires sur nos serveurs.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Remboursements:</h5>
            <p class="text-text-secondary">Traités dans un délai de 7 jours ouvrables après réception du retour.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Términos de Pago",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Términos de Pago</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Métodos Aceptados:</h5>
            <p class="text-text-secondary">Stripe (tarjetas, opciones por país).</p>
            <p class="text-text-secondary">Pago anticipado (100% al realizar el pedido).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Seguridad:</h5>
            <p class="text-text-secondary">Cifrado PCI-DSS.</p>
            <p class="text-text-secondary">No almacenamos datos bancarios en nuestros servidores.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Reembolsos:</h5>
            <p class="text-text-secondary">Procesados dentro de 7 días hábiles tras recibir el producto devuelto.</p>
          </div>
        </div>
      `
    },
    // Итальянская версия
    it: {
      title: "Termini di Pagamento",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
          
          <h4 class="font-medium mb-2">Termini di Pagamento</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Metodi:</h5>
            <p class="text-text-secondary">Stripe (opzioni dipendono dal tuo paese).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Pagamento anticipato:</h5>
            <p class="text-text-secondary">Richiesto per tutti gli ordini.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Rimborsi:</h5>
            <p class="text-text-secondary">Elaborati entro 7 giorni lavorativi.</p>
          </div>
        </div>
      `
    },
    // Японская версия
    ja: {
      title: "支払い条件",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">支払い条件</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">対応決済方法:</h5>
            <p class="text-text-secondary">Stripe（クレジットカード、国別オプション）</p>
            <p class="text-text-secondary">前払い（注文時100%）</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">セキュリティ:</h5>
            <p class="text-text-secondary">PCI DSS準拠の暗号化</p>
            <p class="text-text-secondary">カードデータ非保存</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">返金:</h5>
            <p class="text-text-secondary">返品受領後7営業日以内に処理</p>
          </div>
        </div>
      `
    },
    // Китайская версия
    zh: {
      title: "支付条款",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">支付条款</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">支付方式:</h5>
            <p class="text-text-secondary">Stripe（支持信用卡/地区特定支付方式）</p>
            <p class="text-text-secondary">预付全款</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">安全措施:</h5>
            <p class="text-text-secondary">PCI DSS标准加密</p>
            <p class="text-text-secondary">不存储银行卡信息</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">退款处理:</h5>
            <p class="text-text-secondary">收到退货后7个工作日内完成退款</p>
          </div>
        </div>
      `
    }
  }
};

// Гарантия и ответственность
export const warrantyPolicy: MultilingualPolicy = {
  id: "warranty",
  translations: {
    // Английская версия
    en: {
      title: "Warranty & Liability",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
          
          <h4 class="font-medium mb-2">Warranty & Liability</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Coverage:</h5>
            <p class="text-text-secondary">USA: 12 months.</p>
            <p class="text-text-secondary">EU: 24 months.</p>
            <p class="text-text-secondary">Other: 12 months.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Void If:</h5>
            <p class="text-text-secondary">Mechanical/electrical damage, unauthorized repairs.</p>
          </div>
        </div>
      `
    },
    // Немецкая версия
    de: {
      title: "Garantie & Gewährleistung",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Garantie & Gewährleistung</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 1 Gesetzliche Gewährleistung (EU):</h5>
            <p class="text-text-secondary">24 Monate für Neuware (Richtlinie 1999/44/EG).</p>
            <p class="text-text-secondary">12 Monate für Gebrauchtware.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 2 Garantieausschlüsse:</h5>
            <p class="text-text-secondary">Mechanische Beschädigungen (Stürze, Wasserschäden).</p>
            <p class="text-text-secondary">Modifikationen durch Kunden.</p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Garantie Légale & Commerciale",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Garantie Légale & Commerciale</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Garantie Légale (Art. L217-4 à L217-14 du Code de la Consommation):</h5>
            <p class="text-text-secondary">24 mois pour les produits neufs.</p>
            <p class="text-text-secondary">12 mois pour les produits d'occasion.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Exclusions:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Dommages physiques (chutes, exposition à l'eau).</li>
              <li>Modifications par le client.</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Couverture Géographique:</h5>
            <p class="text-text-secondary">USA: 12 mois.</p>
            <p class="text-text-secondary">UE: 24 mois (conformément à la directive européenne).</p>
            <p class="text-text-secondary">Autres: 12 mois.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Garantía Legal y Comercial",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Garantía Legal y Comercial</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Ley 23/2003 de Garantías (Art. 114-126):</h5>
            <p class="text-text-secondary">24 meses para productos nuevos.</p>
            <p class="text-text-secondary">12 meses para productos de segunda mano.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Exclusiones:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Daños físicos (caídas, exposición al agua).</li>
              <li>Modificaciones realizadas por el cliente.</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Cobertura Geográfica:</h5>
            <p class="text-text-secondary">EE.UU.: 12 meses.</p>
            <p class="text-text-secondary">UE: 24 meses (conforme a directiva europea).</p>
            <p class="text-text-secondary">Otros: 12 meses.</p>
          </div>
        </div>
      `
    },
    // Итальянская версия
    it: {
      title: "Garanzia e Responsabilità",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
          
          <h4 class="font-medium mb-2">Garanzia e Responsabilità</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Copertura:</h5>
            <p class="text-text-secondary">USA: 12 mesi.</p>
            <p class="text-text-secondary">UE: 24 mesi.</p>
            <p class="text-text-secondary">Altri: 12 mesi.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Invalidata se:</h5>
            <p class="text-text-secondary">Danni meccanici/elettrici, riparazioni non autorizzate.</p>
          </div>
        </div>
      `
    },
    // Японская версия
    ja: {
      title: "保証と責任",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">保証と責任</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">保証期間:</h5>
            <p class="text-text-secondary">米国: 12ヶ月。</p>
            <p class="text-text-secondary">EU: 24ヶ月。</p>
            <p class="text-text-secondary">その他: 12ヶ月。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">無効となる場合:</h5>
            <p class="text-text-secondary">機械的/電気的損傷、許可されていない修理。</p>
          </div>
        </div>
      `
    },
    // Китайская версия
    zh: {
      title: "保修条款",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">保修条款</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">依据《产品质量法》第40条:</h5>
            <p class="text-text-secondary"><strong>保修期限</strong></p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">保修期限:</h5>
            <p class="text-text-secondary">全新商品：12个月</p>
            <p class="text-text-secondary">二手商品：6个月</p>
            <p class="text-text-secondary">欧盟地区：24个月（符合欧盟法规）</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">免责情况:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>人为损坏（摔坏、进水）</li>
              <li>私自拆修</li>
              <li>未按说明书操作导致的损坏</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">保修流程:</h5>
            <p class="text-text-secondary">联系客服 support@aething.com，提供订单号和问题描述</p>
            <p class="text-text-secondary">我们将在24小时内回复处理方案</p>
          </div>
        </div>
      `
    }
  }
};

// Политика конфиденциальности
export const privacyPolicy: MultilingualPolicy = {
  id: "privacy-policy",
  translations: {
    // Английская версия
    en: {
      title: "Privacy Policy (GDPR)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
          
          <h4 class="font-medium mb-2">Privacy Policy (GDPR)</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Data Collected:</h5>
            <p class="text-text-secondary">Name, email, shipping address, payment details.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">GDPR Rights:</h5>
            <p class="text-text-secondary">Request deletion via support@aething.com (subject: "GDPR").</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">DPO:</h5>
            <p class="text-text-secondary">Alex Bernshtein.</p>
          </div>
        </div>
      `
    },
    // Немецкая версия
    de: {
      title: "Datenschutzerklärung (DSGVO-konform)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Datenschutzerklärung (DSGVO-konform)</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Art. 13 DSGVO - Verantwortlicher:</h5>
            <p class="text-text-secondary">Aething Inc., vertreten durch DSB Alex Bernshtein (support@aething.com).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Erhobene Daten:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Name, Lieferadresse</li>
              <li>Zahlungsdaten (via Stripe)</li>
              <li>IP-Adresse (für Betrugsprävention)</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Rechte der Betroffenen:</h5>
            <p class="text-text-secondary">Löschung: E-Mail mit Betreff "DSGVO Löschung".</p>
            <p class="text-text-secondary">Datenportabilität: Anfrage per E-Mail.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Speicherdauer:</h5>
            <p class="text-text-secondary">Bestelldaten: 10 Jahre (§ 257 HGB).</p>
            <p class="text-text-secondary">Kontodaten: 30 Tage nach Transaktion.</p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Politique de Confidentialité (RGPD)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Politique de Confidentialité (RGPD)</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Conformité au Règlement UE 2016/679:</h5>
            <p class="text-text-secondary">Cette politique est conforme au Règlement Général sur la Protection des Données de l'Union Européenne.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Responsable du traitement:</h5>
            <p class="text-text-secondary">Aething Inc., représenté par le DPO Alex Bernshtein (support@aething.com).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Données Collectées:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Nom, adresse de livraison.</li>
              <li>Données de paiement (via Stripe).</li>
              <li>Adresse IP (pour prévention des fraudes).</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Droits des Utilisateurs:</h5>
            <p class="text-text-secondary">Droit à l'oubli: Email avec l'objet "RGPD Suppression".</p>
            <p class="text-text-secondary">Portabilité des données: Sur demande écrite.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Durée de Conservation:</h5>
            <p class="text-text-secondary">Données de commande: 10 ans (obligation légale).</p>
            <p class="text-text-secondary">Données de paiement: 30 jours après transaction.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Política de Privacidad (RGPD/LOPDGDD)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Política de Privacidad (RGPD/LOPDGDD)</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Reglamento UE 2016/679 y Ley Orgánica 3/2018:</h5>
            <p class="text-text-secondary">Esta política cumple con la normativa europea y española de protección de datos.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Responsable:</h5>
            <p class="text-text-secondary">Aething Inc., representado por el DPD Alex Bernshtein (support@aething.com).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Datos Recopilados:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>Nombre, dirección de envío.</li>
              <li>Datos de pago (procesados por Stripe).</li>
              <li>Dirección IP (prevención de fraudes).</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Derechos del Usuario:</h5>
            <p class="text-text-secondary">Derecho al Olvido: Email con asunto "RGPD Eliminación".</p>
            <p class="text-text-secondary">Portabilidad: Solicitud por escrito.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Conservación de Datos:</h5>
            <p class="text-text-secondary">Pedidos: 6 años (Art. 30 Código de Comercio).</p>
            <p class="text-text-secondary">Pagos: 30 días post-transacción.</p>
          </div>
        </div>
      `
    },
    // Итальянская версия
    it: {
      title: "Politica sulla Privacy (GDPR)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
          
          <h4 class="font-medium mb-2">Politica sulla Privacy (GDPR)</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Dati raccolti:</h5>
            <p class="text-text-secondary">Nome, email, indirizzo di spedizione, dettagli di pagamento.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Diritti GDPR:</h5>
            <p class="text-text-secondary">Richiesta di cancellazione via support@aething.com (oggetto: "GDPR").</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">DPO:</h5>
            <p class="text-text-secondary">Alex Bernshtein.</p>
          </div>
        </div>
      `
    },
    // Японская версия
    ja: {
      title: "プライバシーポリシー（GDPR）",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">プライバシーポリシー（GDPR）</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">収集するデータ:</h5>
            <p class="text-text-secondary">名前、メール、配送先住所、支払い詳細。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">GDPRの権利:</h5>
            <p class="text-text-secondary">削除のリクエストはsupport@aething.com（件名: "GDPR"）へ。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">データ保護責任者:</h5>
            <p class="text-text-secondary">アレックス・ベルンシュタイン。</p>
          </div>
        </div>
      `
    },
    // Китайская версия
    zh: {
      title: "隐私政策",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">隐私政策</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">《个人信息保护法》第13-28条:</h5>
            <p class="text-text-secondary">本隐私政策符合中国和国际数据保护标准</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">数据控制方:</h5>
            <p class="text-text-secondary">Aething Inc.（数据保护官：Alex Bernshtein）</p>
            <p class="text-text-secondary">联系方式：support@aething.com</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">收集信息类型:</h5>
            <ul class="list-disc pl-5 mb-4 text-text-secondary">
              <li>姓名、收货地址</li>
              <li>支付信息（通过Stripe处理）</li>
              <li>IP地址（用于反欺诈）</li>
            </ul>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">用户权利:</h5>
            <p class="text-text-secondary">删除数据：发送邮件至support@aething.com，标题注明"GDPR删除请求"</p>
            <p class="text-text-secondary">数据迁移：书面申请</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">数据保存期限:</h5>
            <p class="text-text-secondary">订单数据：5年（《电子商务法》要求）</p>
            <p class="text-text-secondary">支付数据：30天</p>
          </div>
        </div>
      `
    }
  }
};

// Условия использования
export const termsPolicy: MultilingualPolicy = {
  id: "terms",
  translations: {
    // Английская версия
    en: {
      title: "Terms of Service",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
          
          <h4 class="font-medium mb-2">Terms of Service</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Orders:</h5>
            <p class="text-text-secondary">Prepayment required. No cancellations post-shipping.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Delivery:</h5>
            <p class="text-text-secondary">Region-specific timelines. Tracking provided.</p>
          </div>
        </div>
      `
    },
    // Немецкая версия
    de: {
      title: "Allgemeine Geschäftsbedingungen (AGB)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Allgemeine Geschäftsbedingungen (AGB)</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 1 Geltungsbereich:</h5>
            <p class="text-text-secondary">Diese Bedingungen gelten für alle Käufe über die Aething-App.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 2 Streitbeilegung:</h5>
            <p class="text-text-secondary">Online-Streitbeilegung (OS-Plattform der EU): 
              <a href="https://ec.europa.eu/consumers/odr/" class="underline" target="_blank">ec.europa.eu/consumers/odr</a>
            </p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">§ 3 Bestellungen:</h5>
            <p class="text-text-secondary">Vorauszahlung erforderlich. Keine Stornierungen nach dem Versand.</p>
          </div>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Widerrufshinweis:</h5>
            <p class="text-text-secondary">Sie haben ein 14-tägiges Widerrufsrecht gemäß § 355 BGB. 
              Details finden Sie in unserer <a href="/policy/return-policy" class="underline">Widerrufsbelehrung</a>.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Wichtiger Hinweis:</h5>
            <p class="text-text-secondary">
              Für Österreich/Schweiz: Es gelten abweichende MwSt.-Sätze gemäß lokaler Gesetzgebung.
            </p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Conditions Générales de Vente (CGV)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Conditions Générales de Vente (CGV)</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Champ d'Application:</h5>
            <p class="text-text-secondary">Applicables à toutes les commandes passées via l'application Aething.</p>
          </div>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Droit de Rétractation (Article L221-18):</h5>
            <p class="text-text-secondary">Vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation.
              Consultez notre <a href="/policy/return-policy" class="underline">Politique de Retour</a> pour plus de détails.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Règlement des Litiges:</h5>
            <p class="text-text-secondary">Plateforme de Règlement en Ligne des Litiges (UE): 
              <a href="https://ec.europa.eu/consumers/odr/" class="underline" target="_blank">ec.europa.eu/consumers/odr</a>
            </p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Commandes:</h5>
            <p class="text-text-secondary">Prépaiement requis. Pas d'annulations après expédition.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Términos y Condiciones Generales",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Términos y Condiciones Generales</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Ámbito de Aplicación:</h5>
            <p class="text-text-secondary">Aplicable a todos los pedidos realizados mediante la app Aething.</p>
          </div>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">Derecho de Desistimiento:</h5>
            <p class="text-text-secondary"><strong>Tiene un plazo de 14 días</strong> para ejercer su derecho de desistimiento desde la recepción del producto.
              Consulte nuestra <a href="/policy/return-policy" class="underline">Política de Devoluciones</a> para más detalles.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Resolución de Conflictos:</h5>
            <p class="text-text-secondary">Plataforma de Resolución de Litigios en Línea (UE): 
              <a href="https://ec.europa.eu/consumers/odr/" class="underline" target="_blank">ec.europa.eu/consumers/odr</a>
            </p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Condiciones de Entrega:</h5>
            <p class="text-text-secondary">UE: Precio con IVA incluido.</p>
            <p class="text-text-secondary">EE.UU.: Precio sin impuestos.</p>
            <p class="text-text-secondary">Plazos estándar: 3-7 días laborables tras confirmación de pago.</p>
          </div>
        </div>
      `
    },
    // Итальянская версия
    it: {
      title: "Termini di Servizio",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
          
          <h4 class="font-medium mb-2">Termini di Servizio</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Ordini:</h5>
            <p class="text-text-secondary">Pagamento anticipato richiesto. Nessuna cancellazione dopo la spedizione.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Consegna:</h5>
            <p class="text-text-secondary">Tempistiche specifiche per regione. Tracciamento fornito.</p>
          </div>
        </div>
      `
    },
    // Японская версия
    ja: {
      title: "利用規約",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">利用規約</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">注文:</h5>
            <p class="text-text-secondary">前払いが必要です。発送後のキャンセルはできません。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">配送:</h5>
            <p class="text-text-secondary">地域ごとの配送期間。追跡情報が提供されます。</p>
          </div>
        </div>
      `
    },
    // Китайская версия
    zh: {
      title: "用户协议",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">用户协议</h4>
          
          <div class="mb-3 bg-primary-50 dark:bg-primary-950 p-3 rounded-md border border-primary-200 dark:border-primary-800">
            <h5 class="font-medium mb-1 text-primary-800 dark:text-primary-300">依据《网络安全法》第41条:</h5>
            <p class="text-text-secondary">用户注册即视为同意本协议</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">争议解决:</h5>
            <p class="text-text-secondary">美国特拉华州法院管辖</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">配送范围:</h5>
            <p class="text-text-secondary">中国大陆：含税价格</p>
            <p class="text-text-secondary">国际订单：可能产生关税（由客户承担）</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">配送时间:</h5>
            <p class="text-text-secondary">标准配送：3-7个工作日（支付确认后）</p>
            <p class="text-text-secondary">加急配送：需额外付费</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">特别说明:</h5>
            <p class="text-text-secondary">跨境购物可能需自行申报海关</p>
            <p class="text-text-secondary">虚拟商品不支持7天无理由退货</p>
          </div>
        </div>
      `
    }
  }
};

// Список всех многоязычных политик
export const multilingualPolicies: MultilingualPolicy[] = [
  deliveryPolicy,
  contactPolicy,
  returnPolicy,
  paymentTermsPolicy,
  warrantyPolicy,
  privacyPolicy,
  termsPolicy
];

// Функция для получения локализованной политики по ID и коду языка
export function getLocalizedPolicy(id: string, locale: LocaleCode) {
  const policy = multilingualPolicies.find(p => p.id === id);
  if (!policy) return null;
  
  // Возвращаем версию политики на запрошенном языке или на английском по умолчанию
  return policy.translations[locale] || policy.translations.en;
}

export default multilingualPolicies;
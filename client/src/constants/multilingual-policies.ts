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
            <h5 class="font-medium mb-1">Regionen:</h5>
            <p class="text-text-secondary">EU & USA. EU-Preise inkl. MwSt. Zollgebühren außerhalb EU/USA möglich.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Methoden:</h5>
            <p class="text-text-secondary">Standard (3–7 Werktage). Kosten inklusive.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Fristen:</h5>
            <p class="text-text-secondary">Bearbeitung 1–3 Tage. Max. 30 Tage in EU (Richtlinie 2011/83/EU).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Beschädigungen:</h5>
            <p class="text-text-secondary">Innerhalb 14 Tage (EU) melden. Kostenlose Rücksendung mit Foto.</p>
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
      title: "Rückgabe- und Umtauschrichtlinie",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Rückgabe- und Umtauschrichtlinie</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Allgemeine Bedingungen:</h5>
            <p class="text-text-secondary">Rückgabefrist: 14 Tage ab Lieferung.</p>
            <p class="text-text-secondary">Nicht zurückgebbare Artikel: Geöffnete Software, kundenspezifische PCs, vom Kunden beschädigte Waren.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Defekte Artikel:</h5>
            <p class="text-text-secondary">Kostenloser Rückversand bei bestätigtem Defekt. Nachweis über support@aething.com innerhalb von 7 Tagen übermitteln.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Standardrückgaben:</h5>
            <p class="text-text-secondary">Kunde trägt die Kosten für den Rückversand. Erstattung innerhalb von 5–7 Werktagen.</p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Politique de Retour et d'Échange",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Politique de Retour et d'Échange</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Conditions générales:</h5>
            <p class="text-text-secondary">Fenêtre de retour: 14 jours à compter de la livraison.</p>
            <p class="text-text-secondary">Articles non retournables: Logiciels ouverts, PC personnalisés, marchandises endommagées par le client.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Articles défectueux:</h5>
            <p class="text-text-secondary">Frais de retour gratuits si le défaut est confirmé. Fournir une preuve via support@aething.com dans les 7 jours.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Retours standard:</h5>
            <p class="text-text-secondary">Le client couvre les frais de retour. Remboursement sous 5 à 7 jours ouvrables.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Política de Devolución y Cambio",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Política de Devolución y Cambio</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Condiciones generales:</h5>
            <p class="text-text-secondary">Ventana de devolución: 14 días desde la entrega.</p>
            <p class="text-text-secondary">Artículos no retornables: Software abierto, PC personalizados, mercancías dañadas por el cliente.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Artículos defectuosos:</h5>
            <p class="text-text-secondary">Envío de devolución gratuito si se confirma el defecto. Proporcione prueba a través de support@aething.com dentro de los 7 días.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Devoluciones estándar:</h5>
            <p class="text-text-secondary">El cliente cubre el envío de devolución. Reembolso en 5-7 días hábiles.</p>
          </div>
        </div>
      `
    },
    // Итальянская версия
    it: {
      title: "Politica di Reso e Cambio",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
          
          <h4 class="font-medium mb-2">Politica di Reso e Cambio</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Condizioni generali:</h5>
            <p class="text-text-secondary">Finestra di reso: 14 giorni dalla consegna.</p>
            <p class="text-text-secondary">Articoli non restituibili: Software aperto, PC personalizzati, merce danneggiata dal cliente.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Articoli difettosi:</h5>
            <p class="text-text-secondary">Spedizione di reso gratuita se il difetto è confermato. Fornire prova tramite support@aething.com entro 7 giorni.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Resi standard:</h5>
            <p class="text-text-secondary">Il cliente copre la spedizione di reso. Rimborso in 5-7 giorni lavorativi.</p>
          </div>
        </div>
      `
    },
    // Японская версия
    ja: {
      title: "返品・交換ポリシー",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">返品・交換ポリシー</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">一般条件:</h5>
            <p class="text-text-secondary">返品期間: 配達から14日間。</p>
            <p class="text-text-secondary">返品不可品: 開封済みソフトウェア、カスタムPC、お客様による損傷品。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">不良品:</h5>
            <p class="text-text-secondary">不良が確認された場合、返送料は無料。7日以内にsupport@aething.comに証拠を提出してください。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">標準返品:</h5>
            <p class="text-text-secondary">返送料はお客様負担。返金は5〜7営業日以内。</p>
          </div>
        </div>
      `
    },
    // Китайская версия
    zh: {
      title: "退货和换货政策",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">退货和换货政策</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">一般条件:</h5>
            <p class="text-text-secondary">退货窗口: 自交付之日起14天。</p>
            <p class="text-text-secondary">不可退货物品: 已开封软件、定制PC、客户损坏的商品。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">有缺陷的物品:</h5>
            <p class="text-text-secondary">如果确认缺陷，免费退货运费。在7天内通过support@aething.com提供证明。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">标准退货:</h5>
            <p class="text-text-secondary">客户承担退货运费。5-7个工作日内退款。</p>
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
            <h5 class="font-medium mb-1">Methoden:</h5>
            <p class="text-text-secondary">Stripe (Optionen abhängig von Ihrem Land).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Vorauszahlung:</h5>
            <p class="text-text-secondary">Erforderlich für alle Bestellungen.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Rückerstattungen:</h5>
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
            <h5 class="font-medium mb-1">Méthodes:</h5>
            <p class="text-text-secondary">Stripe (options selon votre pays).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Prépaiement:</h5>
            <p class="text-text-secondary">Requis pour toutes les commandes.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Remboursements:</h5>
            <p class="text-text-secondary">Traités dans un délai de 7 jours ouvrables.</p>
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
            <h5 class="font-medium mb-1">Métodos:</h5>
            <p class="text-text-secondary">Stripe (opciones dependen de su país).</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Pago anticipado:</h5>
            <p class="text-text-secondary">Requerido para todos los pedidos.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Reembolsos:</h5>
            <p class="text-text-secondary">Procesados dentro de 7 días hábiles.</p>
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
            <h5 class="font-medium mb-1">方法:</h5>
            <p class="text-text-secondary">Stripe（オプションはお住まいの国によって異なります）。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">前払い:</h5>
            <p class="text-text-secondary">すべての注文に必要です。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">返金:</h5>
            <p class="text-text-secondary">7営業日以内に処理されます。</p>
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
            <h5 class="font-medium mb-1">方式:</h5>
            <p class="text-text-secondary">Stripe（选项取决于您所在的国家）。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">预付款:</h5>
            <p class="text-text-secondary">所有订单均需预付款。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">退款:</h5>
            <p class="text-text-secondary">在7个工作日内处理。</p>
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
      title: "Garantie & Haftung",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Garantie & Haftung</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Deckung:</h5>
            <p class="text-text-secondary">USA: 12 Monate.</p>
            <p class="text-text-secondary">EU: 24 Monate.</p>
            <p class="text-text-secondary">Andere: 12 Monate.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Ungültig bei:</h5>
            <p class="text-text-secondary">Mechanische/elektrische Beschädigung, unbefugte Reparaturen.</p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Garantie et Responsabilité",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Garantie et Responsabilité</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Couverture:</h5>
            <p class="text-text-secondary">USA: 12 mois.</p>
            <p class="text-text-secondary">UE: 24 mois.</p>
            <p class="text-text-secondary">Autres: 12 mois.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Invalide si:</h5>
            <p class="text-text-secondary">Dommages mécaniques/électriques, réparations non autorisées.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Garantía y Responsabilidad",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Garantía y Responsabilidad</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Cobertura:</h5>
            <p class="text-text-secondary">EE.UU.: 12 meses.</p>
            <p class="text-text-secondary">UE: 24 meses.</p>
            <p class="text-text-secondary">Otros: 12 meses.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Nula si:</h5>
            <p class="text-text-secondary">Daño mecánico/eléctrico, reparaciones no autorizadas.</p>
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
      title: "保修和责任",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">保修和责任</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">保修范围:</h5>
            <p class="text-text-secondary">美国：12个月。</p>
            <p class="text-text-secondary">欧盟：24个月。</p>
            <p class="text-text-secondary">其他：12个月。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">保修失效条件:</h5>
            <p class="text-text-secondary">机械/电气损坏，未经授权的维修。</p>
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
      title: "Datenschutzrichtlinie (DSGVO)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Datenschutzrichtlinie (DSGVO)</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Erfasste Daten:</h5>
            <p class="text-text-secondary">Name, E-Mail, Lieferadresse, Zahlungsdetails.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">DSGVO-Rechte:</h5>
            <p class="text-text-secondary">Löschung beantragen über support@aething.com (Betreff: "DSGVO").</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Datenschutzbeauftragter:</h5>
            <p class="text-text-secondary">Alex Bernshtein.</p>
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
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Données collectées:</h5>
            <p class="text-text-secondary">Nom, email, adresse de livraison, détails de paiement.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Droits RGPD:</h5>
            <p class="text-text-secondary">Demande de suppression via support@aething.com (objet: "RGPD").</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">DPO:</h5>
            <p class="text-text-secondary">Alex Bernshtein.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Política de Privacidad (RGPD)",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Política de Privacidad (RGPD)</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Datos recopilados:</h5>
            <p class="text-text-secondary">Nombre, correo electrónico, dirección de envío, detalles de pago.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Derechos RGPD:</h5>
            <p class="text-text-secondary">Solicite eliminación a través de support@aething.com (asunto: "RGPD").</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">DPO:</h5>
            <p class="text-text-secondary">Alex Bernshtein.</p>
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
      title: "隐私政策（GDPR）",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">隐私政策（GDPR）</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">收集的数据:</h5>
            <p class="text-text-secondary">姓名、电子邮件、送货地址、支付详情。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">GDPR权利:</h5>
            <p class="text-text-secondary">通过support@aething.com（主题："GDPR"）请求删除。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">数据保护官:</h5>
            <p class="text-text-secondary">亚历克斯·伯恩斯坦。</p>
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
      title: "Nutzungsbedingungen",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
          
          <h4 class="font-medium mb-2">Nutzungsbedingungen</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Bestellungen:</h5>
            <p class="text-text-secondary">Vorauszahlung erforderlich. Keine Stornierungen nach dem Versand.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Lieferung:</h5>
            <p class="text-text-secondary">Regionsspezifische Zeitrahmen. Sendungsverfolgung wird bereitgestellt.</p>
          </div>
        </div>
      `
    },
    // Французская версия
    fr: {
      title: "Conditions d'Utilisation",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
          
          <h4 class="font-medium mb-2">Conditions d'Utilisation</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Commandes:</h5>
            <p class="text-text-secondary">Prépaiement requis. Pas d'annulations après expédition.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Livraison:</h5>
            <p class="text-text-secondary">Délais spécifiques à la région. Suivi fourni.</p>
          </div>
        </div>
      `
    },
    // Испанская версия
    es: {
      title: "Términos de Servicio",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
          
          <h4 class="font-medium mb-2">Términos de Servicio</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Pedidos:</h5>
            <p class="text-text-secondary">Pago anticipado requerido. No hay cancelaciones después del envío.</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">Entrega:</h5>
            <p class="text-text-secondary">Plazos específicos según la región. Seguimiento proporcionado.</p>
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
      title: "服务条款",
      content: `
        <div class="mb-4">
          <p class="mb-2 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
          
          <h4 class="font-medium mb-2">服务条款</h4>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">订单:</h5>
            <p class="text-text-secondary">需要预付款。发货后不可取消。</p>
          </div>
          
          <div class="mb-3">
            <h5 class="font-medium mb-1">交付:</h5>
            <p class="text-text-secondary">地区特定的时间表。提供跟踪信息。</p>
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
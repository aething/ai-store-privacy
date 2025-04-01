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
        <h3 class="font-medium text-lg mb-2">Aething Inc. - Unified Policies</h3>
        <p class="mb-4 text-text-secondary"><strong>Last Updated:</strong> April 1, 2025</p>
        
        <h4 class="font-medium mb-2">1. Delivery Policy</h4>
        <p class="mb-4 text-text-secondary">We comply with EU (Directive 2011/83/EU, GDPR) and US (FTC, UCC) laws.</p>
        
        <h5 class="font-medium mb-2">Delivery Regions:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li><strong>EU & USA</strong> only.</li>
          <li>EU prices include VAT. Non-EU/US orders may incur customs fees (customer's responsibility).</li>
        </ul>
        
        <h5 class="font-medium mb-2">Methods:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Standard (3–7 business days). Cost included in item price.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Timeframes:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Processing: 1–3 days. Max 30 days to EU (per Directive 2011/83/EU). Delays notified via email.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Tracking:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>GDPR-compliant tracking link provided post-dispatch.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Damages:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Report within 14 days (EU) or 7 days (USA). Free returns with photo proof.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Right of Withdrawal:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Cancel within 14 days (see <a href="/policy/return-policy" class="text-blue-600 hover:underline">Returns</a>).</li>
        </ul>
        
        <p class="text-text-secondary"><strong>Contact:</strong> support@aething.com</p>
      `
    },
    
    // Немецкая версия
    de: {
      title: "Lieferrichtlinie",
      content: `
        <h3 class="font-medium text-lg mb-2">Aething Inc. - Einheitliche Richtlinien</h3>
        <p class="mb-4 text-text-secondary"><strong>Zuletzt aktualisiert:</strong> 1. April 2025</p>
        
        <h4 class="font-medium mb-2">1. Lieferrichtlinie</h4>
        <p class="mb-4 text-text-secondary">Wir entsprechen den EU-Gesetzen (Richtlinie 2011/83/EU, DSGVO) und US-Gesetzen (FTC, UCC).</p>
        
        <h5 class="font-medium mb-2">Lieferregionen:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li><strong>EU & USA</strong> nur.</li>
          <li>EU-Preise inkl. MwSt. Zollgebühren außerhalb EU/USA sind Verantwortung des Kunden.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Methoden:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Standard (3–7 Werktage). Kosten im Artikelpreis inbegriffen.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Zeitrahmen:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Bearbeitung: 1–3 Tage. Max. 30 Tage in die EU (gemäß Richtlinie 2011/83/EU). Verzögerungen werden per E-Mail mitgeteilt.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Verfolgung:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>DSGVO-konformer Tracking-Link nach Versand bereitgestellt.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Beschädigungen:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Meldung innerhalb von 14 Tagen (EU) oder 7 Tagen (USA). Kostenlose Rücksendung mit Fotobeweis.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Widerrufsrecht:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Stornierung innerhalb von 14 Tagen (siehe <a href="/policy/return-policy" class="text-blue-600 hover:underline">Rückgaben</a>).</li>
        </ul>
        
        <p class="text-text-secondary"><strong>Kontakt:</strong> support@aething.com</p>
      `
    },
    
    // Французская версия
    fr: {
      title: "Politique de Livraison",
      content: `
        <h3 class="font-medium text-lg mb-2">Aething Inc. - Politiques Unifiées</h3>
        <p class="mb-4 text-text-secondary"><strong>Dernière mise à jour:</strong> 1 avril 2025</p>
        
        <h4 class="font-medium mb-2">1. Politique de Livraison</h4>
        <p class="mb-4 text-text-secondary">Nous respectons les lois de l'UE (Directive 2011/83/UE, RGPD) et des États-Unis (FTC, UCC).</p>
        
        <h5 class="font-medium mb-2">Zones de livraison:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li><strong>UE et USA</strong> uniquement.</li>
          <li>Prix UE TTC. Frais de douane hors UE/USA à la charge du client.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Méthodes:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Standard (3–7 jours ouvrés). Coût inclus dans le prix de l'article.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Délais:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Traitement: 1–3 jours. Max 30 jours vers l'UE (selon Directive 2011/83/UE). Retards notifiés par email.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Suivi:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Lien de suivi conforme au RGPD fourni après expédition.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Dommages:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Signaler dans les 14 jours (UE) ou 7 jours (USA). Retours gratuits avec preuve photo.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Droit de rétractation:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Annulation dans les 14 jours (voir <a href="/policy/return-policy" class="text-blue-600 hover:underline">Retours</a>).</li>
        </ul>
        
        <p class="text-text-secondary"><strong>Contact:</strong> support@aething.com</p>
      `
    },
    
    // Испанская версия
    es: {
      title: "Política de Envío",
      content: `
        <h3 class="font-medium text-lg mb-2">Aething Inc. - Políticas Unificadas</h3>
        <p class="mb-4 text-text-secondary"><strong>Última actualización:</strong> 1 de abril de 2025</p>
        
        <h4 class="font-medium mb-2">1. Política de Envío</h4>
        <p class="mb-4 text-text-secondary">Cumplimos con las leyes de la UE (Directiva 2011/83/UE, RGPD) y EE.UU. (FTC, UCC).</p>
        
        <h5 class="font-medium mb-2">Regiones de entrega:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li><strong>UE y EE.UU.</strong> únicamente.</li>
          <li>Precios UE con IVA incluido. Los pedidos fuera de la UE/EE.UU. pueden incurrir en tasas aduaneras (responsabilidad del cliente).</li>
        </ul>
        
        <h5 class="font-medium mb-2">Métodos:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Estándar (3–7 días laborables). Costo incluido en el precio del artículo.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Plazos:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Procesamiento: 1–3 días. Máximo 30 días a la UE (según Directiva 2011/83/UE). Retrasos notificados por correo electrónico.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Seguimiento:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Enlace de seguimiento conforme al RGPD proporcionado después del envío.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Daños:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Informar dentro de 14 días (UE) o 7 días (EE.UU.). Devoluciones gratuitas con prueba fotográfica.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Derecho de desistimiento:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Cancelar dentro de 14 días (ver <a href="/policy/return-policy" class="text-blue-600 hover:underline">Devoluciones</a>).</li>
        </ul>
        
        <p class="text-text-secondary"><strong>Contacto:</strong> support@aething.com</p>
      `
    },
    
    // Итальянская версия
    it: {
      title: "Politica di Consegna",
      content: `
        <h3 class="font-medium text-lg mb-2">Aething Inc. - Politiche Unificate</h3>
        <p class="mb-4 text-text-secondary"><strong>Ultimo aggiornamento:</strong> 1 aprile 2025</p>
        
        <h4 class="font-medium mb-2">1. Politica di Consegna</h4>
        <p class="mb-4 text-text-secondary">Rispettiamo le leggi dell'UE (Direttiva 2011/83/UE, GDPR) e degli USA (FTC, UCC).</p>
        
        <h5 class="font-medium mb-2">Aree di consegna:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li><strong>UE e USA</strong> solamente.</li>
          <li>Prezzi UE IVA inclusa. Ordini extra UE/USA possono incorrere in dazi doganali (responsabilità del cliente).</li>
        </ul>
        
        <h5 class="font-medium mb-2">Metodi:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Standard (3–7 giorni lavorativi). Costo incluso nel prezzo dell'articolo.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Tempistiche:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Elaborazione: 1–3 giorni. Massimo 30 giorni per l'UE (secondo Direttiva 2011/83/UE). Ritardi notificati via email.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Tracciamento:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Link di tracciamento conforme al GDPR fornito dopo la spedizione.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Danni:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Segnalare entro 14 giorni (UE) o 7 giorni (USA). Resi gratuiti con prova fotografica.</li>
        </ul>
        
        <h5 class="font-medium mb-2">Diritto di recesso:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>Annullare entro 14 giorni (vedi <a href="/policy/return-policy" class="text-blue-600 hover:underline">Resi</a>).</li>
        </ul>
        
        <p class="text-text-secondary"><strong>Contatto:</strong> support@aething.com</p>
      `
    },
    
    // Японская версия
    ja: {
      title: "配送ポリシー",
      content: `
        <h3 class="font-medium text-lg mb-2">Aething Inc. - 統一ポリシー</h3>
        <p class="mb-4 text-text-secondary"><strong>最終更新日:</strong> 2025年4月1日</p>
        
        <h4 class="font-medium mb-2">1. 配送ポリシー</h4>
        <p class="mb-4 text-text-secondary">EU（指令2011/83/EU、GDPR）および米国（FTC、UCC）の法律に準拠しています。</p>
        
        <h5 class="font-medium mb-2">配送地域:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li><strong>EUと米国</strong>のみ。</li>
          <li>EU価格はVAT込み。EU/米国外の注文には関税が発生する場合があります（お客様負担）。</li>
        </ul>
        
        <h5 class="font-medium mb-2">配送方法:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>標準配送（3～7営業日）。費用は商品価格に含まれています。</li>
        </ul>
        
        <h5 class="font-medium mb-2">配送期間:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>処理期間：1～3日。EUへは最大30日（指令2011/83/EUに基づく）。遅延はメールで通知されます。</li>
        </ul>
        
        <h5 class="font-medium mb-2">追跡:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>発送後、GDPRに準拠した追跡リンクが提供されます。</li>
        </ul>
        
        <h5 class="font-medium mb-2">損傷:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>EU内は14日以内、米国内は7日以内に報告してください。写真証明で無料返品可能。</li>
        </ul>
        
        <h5 class="font-medium mb-2">撤回権:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>14日以内にキャンセル可能（<a href="/policy/return-policy" class="text-blue-600 hover:underline">返品</a>を参照）。</li>
        </ul>
        
        <p class="text-text-secondary"><strong>連絡先:</strong> support@aething.com</p>
      `
    },
    
    // Китайская версия
    zh: {
      title: "配送政策",
      content: `
        <h3 class="font-medium text-lg mb-2">Aething Inc. - 统一政策</h3>
        <p class="mb-4 text-text-secondary"><strong>最后更新:</strong> 2025年4月1日</p>
        
        <h4 class="font-medium mb-2">1. 配送政策</h4>
        <p class="mb-4 text-text-secondary">我们遵守欧盟（指令2011/83/EU、GDPR）和美国（FTC、UCC）法律。</p>
        
        <h5 class="font-medium mb-2">配送区域:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li><strong>仅限欧盟和美国</strong>。</li>
          <li>欧盟价格含增值税。非欧盟/美国订单可能产生关税（客户责任）。</li>
        </ul>
        
        <h5 class="font-medium mb-2">配送方式:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>标准配送（3-7个工作日）。费用已包含在商品价格中。</li>
        </ul>
        
        <h5 class="font-medium mb-2">时间框架:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>处理时间：1-3天。欧盟最长30天（根据指令2011/83/EU）。延迟将通过电子邮件通知。</li>
        </ul>
        
        <h5 class="font-medium mb-2">跟踪:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>发货后提供符合GDPR的跟踪链接。</li>
        </ul>
        
        <h5 class="font-medium mb-2">损坏:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>欧盟内14天内或美国内7天内报告。凭照片证明免费退货。</li>
        </ul>
        
        <h5 class="font-medium mb-2">撤销权:</h5>
        <ul class="list-disc pl-5 mb-4 text-text-secondary">
          <li>14天内可取消（参见<a href="/policy/return-policy" class="text-blue-600 hover:underline">退货</a>）。</li>
        </ul>
        
        <p class="text-text-secondary"><strong>联系方式:</strong> support@aething.com</p>
      `
    }
  }
};

// Список всех многоязычных политик
export const multilingualPolicies: MultilingualPolicy[] = [
  deliveryPolicy
];

// Функция для получения локализованной политики по ID и коду языка
export function getLocalizedPolicy(id: string, locale: LocaleCode) {
  const policy = multilingualPolicies.find(p => p.id === id);
  if (!policy) return null;
  
  // Возвращаем версию политики на запрошенном языке или на английском по умолчанию
  return policy.translations[locale] || policy.translations.en;
}

export default multilingualPolicies;
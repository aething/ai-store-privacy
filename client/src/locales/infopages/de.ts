/**
 * German (de) info page translations
 */

import { InfoPage } from "@/types";

export const de: InfoPage[] = [
  {
    id: 0,
    title: "KI-gestützte Lösungen für professionelle Umgebungen",
    description: "Entdecken Sie, wie unsere KI-gestützte Chatbot-Lösung auf der NVIDIA Jetson Orin Nano-Plattform domänenspezifische Lösungen für verschiedene professionelle Umgebungen liefert.",
    content: `
      <p>Die KI-gestützte Chatbot-Lösung, die auf dieser Plattform aufgebaut ist, eignet sich hervorragend für eine Vielzahl von professionellen Aufgaben in mehreren Branchen, indem sie ihre Fähigkeit nutzt, erhebliche Datenmengen zu verarbeiten und maßgeschneiderte, domänenspezifische Lösungen zu liefern. Nachfolgend finden Sie eine Analyse ihrer Fähigkeiten in Bezug auf Datenverarbeitungsvolumen und professionelle Anwendungen:</p>
      
      <h3>Datenverarbeitungsvolumen</h3>
      <ul>
        <li><strong>Inferenzkapazität:</strong> Mit einer Leistung von 5–10 Token pro Sekunde kann das System Antworten von 20 Token (etwa 10–15 Wörter) in 2–4 Sekunden generieren, was die sequentielle Bearbeitung von 15–30 Anfragen pro Minute für einen einzelnen Benutzer ermöglicht. Bei mehreren Benutzern (2–3 gleichzeitige Anfragen) können sich die Antwortzeiten aufgrund der Ressourcenfreigabe auf 5–10 Sekunden verlängern.</li>
        <li><strong>Wissensbasis-Umfang:</strong> Mithilfe von RAG kann das System bis zu 500 GB Textdaten indexieren und nutzen, was etwa 200 Millionen A4-Seiten entspricht (bei Annahme von 2–3 KB pro Seite). Dies ermöglicht es, als umfassendes Repository für Unternehmensdokumentation, Handbücher oder historische Aufzeichnungen zu dienen.</li>
        <li><strong>Kontextuelle Verarbeitung:</strong> Das Kontextfenster von 4096–8192 Token unterstützt die Analyse von Dokumenten, die sich über 10–20 A4-Seiten pro Anfrage erstrecken, was es für die Zusammenfassung von Berichten, das Extrahieren von Erkenntnissen oder die Beantwortung detaillierter Fragen auf der Grundlage mäßig großer Texte geeignet macht.</li>
      </ul>
      
      <h3>Professionelle Anwendungen</h3>
      <h4>1. IT-Abteilung:</h4>
      <ul>
        <li><strong>Aufgabe:</strong> Automatisierung des technischen Supports und der Dokumentensuche.</li>
        <li><strong>Beispiel:</strong> Abfrage von Systemprotokollen, Fehlerbehebungsleitfäden oder Software-Handbüchern in der Wissensdatenbank, um schrittweise Lösungen für IT-Mitarbeiter oder Endbenutzer bereitzustellen.</li>
        <li><strong>Volumen:</strong> Kann Hunderttausende von Seiten technischer Dokumentation (z.B. 100 GB) verarbeiten und Echtzeit-Unterstützung ohne externe Abhängigkeiten bieten.</li>
      </ul>
      
      <h3>Vorteile in professionellen Umgebungen</h3>
      <ul>
        <li><strong>Datenschutz:</strong> Der Betrieb innerhalb eines Unternehmensnetzwerks stellt sicher, dass sensible Informationen im Haus bleiben, was für regulierte Branchen entscheidend ist.</li>
        <li><strong>Skalierbarkeit:</strong> Obwohl auf 2–3 gleichzeitige Benutzer bei maximaler Leistung begrenzt, kann das System mit zusätzlichen Einheiten vernetzt werden, um es breiter einzusetzen.</li>
        <li><strong>Anpassung:</strong> Die Open-Source-Natur ermöglicht Fine-Tuning auf domänenspezifischen Datensätzen (z.B. 10 GB Branchenberichte), was die Relevanz und Genauigkeit verbessert.</li>
      </ul>
    `,
  },
  {
    id: 1,
    title: "ML-Systeme für professionelle Umgebungen",
    description: "Erkunden Sie, wie unsere Machine-Learning-Systeme auf der NVIDIA DGX Spark-Plattform anspruchsvolle Lösungen für verschiedene professionelle Domänen liefern.",
    content: `
      <p>Die ML-Systeme, die diese Plattform nutzen, sind für anspruchsvolle Aufgaben in verschiedenen professionellen Bereichen konzipiert und nutzen erhebliche Rechenleistung und Datenverarbeitungskapazität, um branchenspezifische Lösungen zu liefern. Nachfolgend finden Sie eine Analyse ihrer Fähigkeiten in Bezug auf Datenverarbeitungsvolumen und professionelle Anwendungen:</p>
      
      <h3>Datenverarbeitungsvolumen</h3>
      <ul>
        <li><strong>Inferenzkapazität:</strong> Mit einer Generierungsgeschwindigkeit von 20–50 Token pro Sekunde kann das System Antworten von 20 Token (etwa 15 Wörter) in 0,4–1 Sekunde erstellen, was bis zu 60–150 Anfragen pro Minute für einen einzelnen Benutzer ermöglicht. Bei mehreren Benutzern (5–8 gleichzeitige Anfragen) behält es nahezu Echtzeit-Leistung (1–2 Sekunden pro Antwort) bei, wobei die Kapazität auf 20–30 gleichzeitige Anfragen bei reduzierter Geschwindigkeit (5–10 Token/Sekunde) skaliert werden kann.</li>
        <li><strong>Wissensbasis-Umfang:</strong> Das RAG-System kann bis zu 1 TB Textdaten indexieren und nutzen, was etwa 400 Millionen A4-Seiten entspricht und ein umfangreiches, durchsuchbares Repository für unternehmensweites Wissensmanagement bietet.</li>
      </ul>
      
      <h3>Professionelle Anwendungen</h3>
      <ul>
        <li><strong>IT-Abteilung:</strong> Optimierung von IT-Betrieb und Support-Eskalation durch Verarbeitung von Anfragen gegen ein 500 GB großes Repository von Systemprotokollen, Konfigurationsleitfäden und Ticketing-Aufzeichnungen.</li>
        <li><strong>Finanzsektor:</strong> Verbesserung der Finanzanalyse und Regulierungskonformität durch Analyse von 600 GB Transaktionsaufzeichnungen, Marktberichten und Compliance-Richtlinien.</li>
        <li><strong>Bildung und Schulung:</strong> Förderung des interaktiven Lernens und der Dozentenunterstützung durch Abfrage einer 700 GB großen Sammlung akademischer Arbeiten, Vorlesungsnotizen und Multimedia-Transkripte.</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "Intelligente Automatisierungssysteme für professionelle Umgebungen",
    description: "Erfahren Sie, wie unsere Intelligenten Automatisierungssysteme basierend auf NVIDIA's Founders Edition RTX 6000-Plattform Arbeitsabläufe in verschiedenen Branchen optimieren.",
    content: `
      <p>Unsere Intelligenten Automatisierungssysteme, die von NVIDIA's Founders Edition RTX 6000 angetrieben werden, bieten umfassende Automatisierungslösungen für Unternehmensumgebungen in mehreren Sektoren.</p>
      
      <h3>Professionelle Anwendungen</h3>
      <h4>1. IT-Abteilung:</h4>
      <ul>
        <li><strong>Aufgabe:</strong> Automatisierung des IT-Service-Managements und der Support-Eskalation.</li>
        <li><strong>Beispiel:</strong> Orchestrierung von Ticket-Lösungsworkflows, Abfrage einer 1 TB-Datenbank mit Systemprotokollen und Handbüchern über Chatbot oder Sprachbefehle, um sofortige Lösungen bereitzustellen, und Eskalation komplexer Probleme mit detailliertem Kontext.</li>
        <li><strong>Volumen:</strong> Verwaltet Millionen technischer Datensätze (~400 Millionen A4-Seiten) und reduziert die Lösungszeiten durch automatisierte Antworten.</li>
      </ul>
      
      <h3>Vorteile in professionellen Umgebungen</h3>
      <ul>
        <li><strong>Echtzeit-Automatisierung:</strong> Nahezu sofortige Text-, Sprach- und Prozessausführung verbessert die Betriebsgeschwindigkeit, was für zeitkritische Branchen entscheidend ist.</li>
        <li><strong>Datenschutz:</strong> Lokale Verarbeitung gewährleistet die Einhaltung von Vorschriften, was für das Gesundheitswesen und den Rechtssektor von entscheidender Bedeutung ist.</li>
        <li><strong>Skalierbarkeit:</strong> Unterstützt 5–10 gleichzeitige Benutzer bei maximaler Leistung, mit der Möglichkeit von Multi-GPU-Setups zur Handhabung größerer Teams.</li>
      </ul>
    `,
  },
];
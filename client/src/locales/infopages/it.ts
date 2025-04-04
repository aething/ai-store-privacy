/**
 * Italian (it) info page translations
 */

import { InfoPage } from "@/types";

export const it: InfoPage[] = [
  {
    id: 0,
    title: "Soluzioni basate su IA per ambienti professionali",
    description: "Scopri come la nostra soluzione di chatbot basata su IA sulla piattaforma NVIDIA Jetson Orin Nano offre soluzioni specifiche per vari ambienti professionali.",
    content: `
      <p>La soluzione di chatbot basata su IA costruita su questa piattaforma è adatta a una varietà di compiti professionali in diversi settori, sfruttando la sua capacità di elaborare volumi significativi di dati e fornire soluzioni personalizzate e specifiche per ogni dominio. Di seguito un'analisi delle sue capacità in termini di volume di elaborazione dati e applicazioni professionali:</p>
      
      <h3>Volume di elaborazione dati</h3>
      <ul>
        <li><strong>Capacità di inferenza:</strong> Con una performance di 5-10 token al secondo, il sistema può generare risposte di 20 token (circa 10-15 parole) in 2-4 secondi, consentendo la gestione sequenziale di 15-30 query al minuto per un singolo utente. Per più utenti (2-3 query simultanee), i tempi di risposta possono estendersi a 5-10 secondi a causa della condivisione delle risorse.</li>
        <li><strong>Scala della base di conoscenza:</strong> Utilizzando RAG, il sistema può indicizzare e utilizzare fino a 500 GB di dati testuali, equivalenti a circa 200 milioni di pagine A4 (assumendo 2-3 KB per pagina). Questo gli permette di servire come repository completo per documentazione aziendale, manuali o registri storici.</li>
        <li><strong>Elaborazione contestuale:</strong> La finestra di contesto di 4096-8192 token supporta l'analisi di documenti che si estendono su 10-20 pagine A4 per query, rendendolo adatto per riassumere report, estrarre informazioni o rispondere a domande dettagliate basate su testi moderatamente grandi.</li>
      </ul>
      
      <h3>Applicazioni professionali</h3>
      <h4>1. Dipartimento IT:</h4>
      <ul>
        <li><strong>Compito:</strong> Automatizzazione del supporto tecnico e della ricerca di documentazione.</li>
        <li><strong>Esempio:</strong> Interrogazione di log di sistema, guide alla risoluzione dei problemi o manuali di software archiviati nella base di conoscenza per fornire risoluzioni passo-passo per il personale IT o gli utenti finali.</li>
        <li><strong>Volume:</strong> Può elaborare centinaia di migliaia di pagine di documentazione tecnica (ad esempio, 100 GB), offrendo assistenza in tempo reale senza dipendenze esterne.</li>
      </ul>
      
      <h3>Vantaggi negli ambienti professionali</h3>
      <ul>
        <li><strong>Privacy dei dati:</strong> Operare all'interno di una rete aziendale garantisce che le informazioni sensibili rimangano in sede, cruciale per settori regolamentati.</li>
        <li><strong>Scalabilità:</strong> Sebbene limitato a 2-3 utenti simultanei a prestazioni massime, il sistema può essere collegato in rete con unità aggiuntive per una distribuzione più ampia.</li>
        <li><strong>Personalizzazione:</strong> La natura open source consente la messa a punto su set di dati specifici del dominio (ad esempio, 10 GB di report di settore), migliorando la pertinenza e l'accuratezza.</li>
      </ul>
    `,
  },
  {
    id: 1,
    title: "Sistemi ML per ambienti professionali",
    description: "Esplora come i nostri Sistemi di Machine Learning che sfruttano la piattaforma NVIDIA DGX Spark offrono soluzioni sofisticate per diversi domini professionali.",
    content: `
      <p>I Sistemi di Machine Learning che sfruttano questa piattaforma sono progettati per affrontare compiti sofisticati in diversi domini professionali, sfruttando una significativa potenza di calcolo e capacità di elaborazione dati per fornire soluzioni specifiche per ogni settore. Di seguito un'analisi delle sue capacità in termini di volume di elaborazione dati e applicazioni professionali:</p>
      
      <h3>Volume di elaborazione dati</h3>
      <ul>
        <li><strong>Capacità di inferenza:</strong> Con una velocità di generazione di 20-50 token al secondo, il sistema può produrre risposte di 20 token (circa 15 parole) in 0,4-1 secondo, consentendo fino a 60-150 query al minuto per un singolo utente. Per più utenti (5-8 query simultanee), mantiene prestazioni quasi in tempo reale (1-2 secondi per risposta), con capacità di scalare a 20-30 richieste simultanee a velocità ridotta (5-10 token/secondo).</li>
        <li><strong>Scala della base di conoscenza:</strong> Il sistema RAG può indicizzare e utilizzare fino a 1 TB di dati testuali, equivalenti a circa 400 milioni di pagine A4, fornendo un vasto repository consultabile per la gestione della conoscenza a livello aziendale.</li>
      </ul>
      
      <h3>Applicazioni professionali</h3>
      <ul>
        <li><strong>Dipartimento IT:</strong> Ottimizzazione delle operazioni IT e dell'escalation del supporto attraverso l'elaborazione di query contro un repository di 500 GB di log di sistema, guide di configurazione e registri di ticketing.</li>
        <li><strong>Settore finanziario:</strong> Miglioramento dell'analisi finanziaria e della conformità normativa attraverso l'analisi di un archivio di 600 GB di registri di transazioni, report di mercato e politiche di conformità.</li>
        <li><strong>Istruzione e formazione:</strong> Facilitazione dell'apprendimento interattivo e del supporto agli istruttori attraverso l'interrogazione di una collezione di 700 GB di documenti accademici, appunti di lezione e trascrizioni multimediali.</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "Sistemi di automazione intelligente per ambienti professionali",
    description: "Scopri come i nostri Sistemi di Automazione Intelligente basati sulla piattaforma NVIDIA Founders Edition RTX 6000 ottimizzano i flussi di lavoro in vari settori.",
    content: `
      <p>I nostri Sistemi di Automazione Intelligente alimentati dalla NVIDIA Founders Edition RTX 6000 offrono soluzioni di automazione complete per ambienti aziendali in molteplici settori.</p>
      
      <h3>Applicazioni professionali</h3>
      <h4>1. Dipartimento IT:</h4>
      <ul>
        <li><strong>Compito:</strong> Automazione della gestione dei servizi IT e dell'escalation del supporto.</li>
        <li><strong>Esempio:</strong> Orchestrazione dei flussi di lavoro di risoluzione dei ticket, interrogazione di un database di 1 TB di log di sistema e manuali tramite chatbot o comandi vocali per fornire correzioni istantanee, ed escalation di problemi complessi con contesto dettagliato.</li>
        <li><strong>Volume:</strong> Gestisce milioni di record tecnici (~400 milioni di pagine A4), riducendo i tempi di risoluzione con risposte automatizzate.</li>
      </ul>
      
      <h3>Vantaggi negli ambienti professionali</h3>
      <ul>
        <li><strong>Automazione in tempo reale:</strong> Testi, voci ed esecuzioni di processi quasi istantanei migliorano la velocità operativa, cruciale per settori sensibili al tempo.</li>
        <li><strong>Privacy dei dati:</strong> L'elaborazione localizzata garantisce la conformità alle normative, vitale per i settori sanitario e legale.</li>
        <li><strong>Scalabilità:</strong> Supporta 5-10 utenti simultanei a prestazioni massime, con potenziale per configurazioni multi-GPU per gestire team più grandi.</li>
      </ul>
    `,
  },
];
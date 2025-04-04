/**
 * Italian (it) product translations
 */

import { ProductTranslations } from '@/types';

const translations: ProductTranslations = {
  1: {
    title: "Modulo di Calcolo IA Edge (Edizione Sviluppatori)",
    description: "Modulo di calcolo IA avanzato progettato per deployment edge con CPU ARM a 6 core, 8GB di RAM e unità di elaborazione neurale specializzata che offre fino a 67 TOPS di prestazioni. Perfetto per lo sviluppo di IA, robotica e applicazioni di visione artificiale.",
    hardwareInfo: "Il Modulo di Calcolo IA Edge presenta l'architettura Jetson Orin Nano più recente con un processore ARM Cortex-A78AE a 6 core che funziona fino a 1,5 GHz. È dotato di 8GB di memoria LPDDR5 e offre prestazioni eccezionali per applicazioni IA edge. La NPU supporta tutti i principali framework di deep learning e fornisce fino a 67 TOPS di prestazioni IA con efficienza energetica ottimizzata.",
    softwareInfo: "Questo modulo viene fornito con uno stack software completo che include un sistema operativo basato su Linux, librerie CUDA e supporto completo per TensorFlow, PyTorch e ONNX runtime. L'SDK integrato include strumenti per l'ottimizzazione, la visualizzazione e il deployment dei modelli. La gestione e il versionamento dei modelli IA sono integrati, consentendo aggiornamenti wireless senza problemi.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software",
    hardwareSpecsLabel: "Specifiche Hardware",
    aiCapabilitiesLabel: "Capacità di IA e Prestazioni",
    softwareArchitectureLabel: "Architettura Software",
    learnMoreTitle: "Dettagli Tecnici",
    learnMoreContent: "Il Modulo di Calcolo IA Edge rappresenta il massimo dell'hardware IA per il deployment edge. Con la sua potente NPU e lo stack software ottimizzato, consente di implementare reti neurali complesse, inclusi transformer e LLM, sull'edge con un consumo energetico minimo."
  },
  2: {
    title: "Server IA Enterprise (Montabile in Rack)",
    description: "Server IA ad alte prestazioni per implementazioni aziendali con GPU multiple, ottimizzato per carichi di lavoro di machine learning su larga scala, elaborazione dati e hosting di applicazioni IA. Dotato di alimentatori ridondanti e raffreddamento avanzato per operatività 24/7.",
    hardwareInfo: "Il Server IA Enterprise è fornito in uno chassis montabile in rack 2U con supporto per fino a 4 GPU ad alte prestazioni (NVIDIA A100 o equivalente). È dotato di doppi processori Intel Xeon con un totale di 64 core, 256GB di memoria DDR4 ECC (espandibile a 1TB), e 8TB di storage NVMe in configurazione RAID. Il sistema include alimentatori ridondanti da 1600W e un sistema di raffreddamento avanzato per prestazioni ottimali.",
    softwareInfo: "Il server viene preinstallato con Ubuntu Server LTS e include uno stack software IA completo con CUDA, cuDNN e TensorRT. Supporta Docker e Kubernetes per implementazioni containerizzate e include strumenti per training e inferenza distribuiti. Il software di gestione fornisce funzionalità complete di monitoraggio, pianificazione e allocazione delle risorse.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software",
    hardwareSpecsLabel: "Specifiche Hardware",
    aiCapabilitiesLabel: "Capacità di IA e Prestazioni",
    softwareArchitectureLabel: "Architettura Software",
    learnMoreTitle: "Soluzioni IA Enterprise",
    learnMoreContent: "Il Server IA Enterprise rappresenta una soluzione all'avanguardia per le organizzazioni che cercano di implementare l'IA su larga scala. Offre prestazioni eccezionali per l'addestramento di modelli complessi, l'esecuzione di carichi di lavoro di inferenza e la gestione di più progetti IA contemporaneamente con affidabilità e sicurezza di livello enterprise."
  },
  3: {
    title: "Kit di Visione IA (Pacchetto Completo)",
    description: "Kit completo di sviluppo per visione IA con moduli camera ad alta risoluzione, unità di elaborazione e modelli pre-addestrati per applicazioni di visione artificiale. Ideale per prototipare soluzioni IA basate sulla visione come rilevamento oggetti, riconoscimento facciale e analisi delle attività.",
    hardwareInfo: "Il Kit di Visione IA include un modulo di calcolo principale basato sulla piattaforma Jetson Xavier NX, dotato di CPU NVIDIA Carmel a 6 core e GPU Volta a 384 core con 48 Tensor Core. Viene fornito con 8GB di memoria LPDDR4x e 16GB di storage eMMC. Il kit include due moduli camera 4K con lenti grandangolari, capacità infrarossi per operazioni in condizioni di scarsa illuminazione ed elaborazione immagini accelerata via hardware.",
    softwareInfo: "Il Kit di Visione viene fornito con uno stack software completo che include modelli pre-addestrati per attività comuni di visione artificiale come rilevamento oggetti, classificazione, segmentazione e tracking. L'SDK fornisce API per il controllo della camera, l'elaborazione delle immagini e il deployment dei modelli. Il sistema supporta TensorFlow, PyTorch e OpenCV, con strumenti aggiuntivi per la gestione dei dataset e il training dei modelli.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software",
    hardwareSpecsLabel: "Specifiche Hardware",
    aiCapabilitiesLabel: "Capacità di IA e Prestazioni",
    softwareArchitectureLabel: "Architettura Software",
    learnMoreTitle: "Tecnologia di Visione IA",
    learnMoreContent: "Il nostro Kit di Visione IA integra tecnologie di visione artificiale all'avanguardia con hardware dedicato per applicazioni nel mondo reale. Consente lo sviluppo rapido di soluzioni per analisi retail, monitoraggio della sicurezza, ispezione industriale, navigazione autonoma e altro ancora con uno sforzo di programmazione minimo."
  }
};

export default translations;
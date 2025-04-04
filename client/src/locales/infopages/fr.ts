/**
 * French (fr) info page translations
 */

import { InfoPage } from "@/types";

export const fr: InfoPage[] = [
  {
    id: 0,
    title: "Solutions IA pour environnements professionnels",
    description: "Découvrez comment notre solution de chatbot alimentée par l'IA sur la plateforme NVIDIA Jetson Orin Nano offre des solutions spécifiques à travers divers environnements professionnels.",
    content: `
      <p>La solution de chatbot alimentée par l'IA construite sur cette plateforme est parfaitement adaptée à une variété de tâches professionnelles dans plusieurs industries, tirant parti de sa capacité à traiter des volumes importants de données et à fournir des solutions personnalisées spécifiques à chaque domaine. Ci-dessous une analyse de ses capacités en termes de volume de traitement de données et d'applications professionnelles :</p>
      
      <h3>Volume de traitement de données</h3>
      <ul>
        <li><strong>Capacité d'inférence :</strong> Avec une performance de 5 à 10 tokens par seconde, le système peut générer des réponses de 20 tokens (environ 10 à 15 mots) en 2 à 4 secondes, permettant le traitement séquentiel de 15 à 30 requêtes par minute pour un seul utilisateur. Pour plusieurs utilisateurs (2 à 3 requêtes simultanées), les temps de réponse peuvent s'étendre à 5-10 secondes en raison du partage des ressources.</li>
        <li><strong>Échelle de la base de connaissances :</strong> En utilisant RAG, le système peut indexer et utiliser jusqu'à 500 Go de données textuelles, équivalent à environ 200 millions de pages A4 (en supposant 2-3 Ko par page). Cela lui permet de servir de dépôt complet pour la documentation d'entreprise, les manuels ou les archives historiques.</li>
        <li><strong>Traitement contextuel :</strong> La fenêtre contextuelle de 4096-8192 tokens prend en charge l'analyse de documents s'étendant sur 10-20 pages A4 par requête, ce qui la rend adaptée pour résumer des rapports, extraire des insights, ou répondre à des questions détaillées basées sur des textes de taille modérée.</li>
      </ul>
      
      <h3>Applications professionnelles</h3>
      <h4>1. Département informatique :</h4>
      <ul>
        <li><strong>Tâche :</strong> Automatisation du support technique et de la recherche de documentation.</li>
        <li><strong>Exemple :</strong> Interrogation des journaux système, des guides de dépannage ou des manuels de logiciels stockés dans la base de connaissances pour fournir des résolutions étape par étape au personnel informatique ou aux utilisateurs finaux.</li>
        <li><strong>Volume :</strong> Peut traiter des centaines de milliers de pages de documentation technique (par exemple, 100 Go), offrant une assistance en temps réel sans dépendances externes.</li>
      </ul>
      
      <h3>Avantages dans les environnements professionnels</h3>
      <ul>
        <li><strong>Confidentialité des données :</strong> L'exploitation au sein d'un réseau d'entreprise garantit que les informations sensibles restent sur place, ce qui est essentiel pour les secteurs réglementés.</li>
        <li><strong>Évolutivité :</strong> Bien que limitée à 2-3 utilisateurs simultanés à performance maximale, le système peut être mis en réseau avec des unités supplémentaires pour un déploiement plus large.</li>
        <li><strong>Personnalisation :</strong> La nature open source permet l'ajustement sur des ensembles de données spécifiques au domaine (par exemple, 10 Go de rapports industriels), améliorant la pertinence et la précision.</li>
      </ul>
    `,
  },
  {
    id: 1,
    title: "Systèmes ML pour environnements professionnels",
    description: "Explorez comment nos systèmes d'apprentissage machine exploitant la plateforme NVIDIA DGX Spark offrent des solutions sophistiquées pour divers domaines professionnels.",
    content: `
      <p>Les systèmes d'apprentissage machine exploitant cette plateforme sont conçus pour relever des défis sophistiqués dans divers domaines professionnels, exploitant une puissance de calcul considérable et une capacité de traitement de données pour fournir des solutions spécifiques à chaque industrie. Ci-dessous une analyse de ses capacités en termes de volume de traitement de données et d'applications professionnelles :</p>
      
      <h3>Volume de traitement de données</h3>
      <ul>
        <li><strong>Capacité d'inférence :</strong> Avec une vitesse de génération de 20 à 50 tokens par seconde, le système peut produire des réponses de 20 tokens (environ 15 mots) en 0,4 à 1 seconde, permettant jusqu'à 60-150 requêtes par minute pour un seul utilisateur. Pour plusieurs utilisateurs (5-8 requêtes simultanées), il maintient une performance proche du temps réel (1-2 secondes par réponse), avec une capacité s'étendant à 20-30 requêtes simultanées à vitesse réduite (5-10 tokens/seconde).</li>
        <li><strong>Échelle de la base de connaissances :</strong> Le système RAG peut indexer et utiliser jusqu'à 1 To de données textuelles, équivalent à environ 400 millions de pages A4, fournissant un vaste dépôt consultable pour la gestion des connaissances à l'échelle de l'entreprise.</li>
      </ul>
      
      <h3>Applications professionnelles</h3>
      <ul>
        <li><strong>Département informatique :</strong> Optimisation des opérations informatiques et de l'escalade du support en traitant les requêtes par rapport à un référentiel de 500 Go de journaux système, de guides de configuration et d'enregistrements de tickets.</li>
        <li><strong>Secteur financier :</strong> Amélioration de l'analyse financière et de la conformité réglementaire en analysant une archive de 600 Go d'enregistrements de transactions, de rapports de marché et de politiques de conformité.</li>
        <li><strong>Éducation et formation :</strong> Facilitation de l'apprentissage interactif et du support aux instructeurs en interrogeant une collection de 700 Go de documents académiques, de notes de cours et de transcriptions multimédia.</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "Systèmes d'automatisation intelligente pour environnements professionnels",
    description: "Découvrez comment nos systèmes d'automatisation intelligente basés sur la plateforme NVIDIA Founders Edition RTX 6000 optimisent les flux de travail dans diverses industries.",
    content: `
      <p>Nos systèmes d'automatisation intelligente propulsés par la NVIDIA Founders Edition RTX 6000 offrent des solutions d'automatisation complètes pour les environnements d'entreprise dans plusieurs secteurs.</p>
      
      <h3>Applications professionnelles</h3>
      <h4>1. Département informatique :</h4>
      <ul>
        <li><strong>Tâche :</strong> Automatisation de la gestion des services informatiques et de l'escalade du support.</li>
        <li><strong>Exemple :</strong> Orchestration des flux de travail de résolution de tickets, interrogation d'une base de données de 1 To de journaux système et de manuels via chatbot ou commandes vocales pour fournir des correctifs instantanés, et escalade des problèmes complexes avec un contexte détaillé.</li>
        <li><strong>Volume :</strong> Gère des millions d'enregistrements techniques (~400 millions de pages A4), réduisant les temps de résolution grâce aux réponses automatisées.</li>
      </ul>
      
      <h3>Avantages dans les environnements professionnels</h3>
      <ul>
        <li><strong>Automatisation en temps réel :</strong> Les textes, voix et exécutions de processus quasi-instantanés améliorent la vitesse opérationnelle, cruciale pour les industries sensibles au temps.</li>
        <li><strong>Confidentialité des données :</strong> Le traitement localisé assure la conformité aux réglementations, vital pour les secteurs de la santé et juridique.</li>
        <li><strong>Évolutivité :</strong> Prend en charge 5-10 utilisateurs simultanés à performance maximale, avec potentiel pour des configurations multi-GPU pour gérer des équipes plus importantes.</li>
      </ul>
    `,
  },
];
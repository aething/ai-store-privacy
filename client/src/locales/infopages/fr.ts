/**
 * French (fr) info page translations
 */

import { InfoPage } from "@/types";

// French translations of info pages
export const fr: InfoPage[] = [
  {
    id: 0,
    title: "Solutions pilotées par l'IA pour environnements professionnels",
    description: "Découvrez comment notre solution de chatbot piloté par l'IA sur la plateforme NVIDIA Jetson Orin Nano offre des solutions spécifiques pour divers environnements professionnels.",
    content: `
      <p>La solution de chatbot pilotée par l'IA construite sur cette plateforme est bien adaptée à une variété de tâches professionnelles dans plusieurs industries, exploitant sa capacité à traiter des volumes importants de données et à fournir des solutions personnalisées et spécifiques à chaque domaine.</p>
      
      <h3>Volume de traitement des données</h3>
      <ul>
        <li><strong>Capacité d'inférence :</strong> Avec une performance de 5 à 10 tokens par seconde, le système peut générer des réponses de 20 tokens (environ 10-15 mots) en 2-4 secondes.</li>
        <li><strong>Échelle de base de connaissances :</strong> En utilisant RAG, le système peut indexer et utiliser jusqu'à 500 Go de données textuelles.</li>
      </ul>
      
      <h3>Applications professionnelles</h3>
      <h4>1. Département informatique :</h4>
      <ul>
        <li><strong>Tâche :</strong> Automatisation du support technique et de la recherche de documentation.</li>
        <li><strong>Exemple :</strong> Interrogation des journaux système, des guides de dépannage ou des manuels de logiciels.</li>
      </ul>
      
      <h3>Avantages dans les environnements professionnels</h3>
      <ul>
        <li><strong>Confidentialité des données :</strong> Opérant au sein d'un réseau d'entreprise, garantit que les informations sensibles restent sur site.</li>
        <li><strong>Évolutivité :</strong> Bien que limité à 2-3 utilisateurs simultanés à performance maximale, le système peut être mis en réseau avec des unités supplémentaires.</li>
      </ul>
    `,
  },
  {
    id: 1,
    title: "Systèmes de ML pour environnements professionnels",
    description: "Explorez comment nos systèmes d'apprentissage automatique sur la plateforme NVIDIA DGX Spark offrent des solutions sophistiquées pour divers domaines professionnels.",
    content: `
      <p>Les systèmes de ML exploitant cette plateforme sont conçus pour aborder des tâches sophistiquées dans divers domaines professionnels, exploitant une puissance de calcul et une capacité de traitement de données significatives pour fournir des solutions spécifiques à chaque industrie.</p>
      
      <h3>Volume de traitement des données</h3>
      <ul>
        <li><strong>Capacité d'inférence :</strong> Avec une vitesse de génération de 20 à 50 tokens par seconde, le système peut produire des réponses de 20 tokens en 0,4-1 seconde.</li>
        <li><strong>Échelle de base de connaissances :</strong> Le système RAG peut indexer et utiliser jusqu'à 1 To de données textuelles.</li>
      </ul>
      
      <h3>Applications professionnelles</h3>
      <ul>
        <li><strong>Département informatique :</strong> Optimisation des opérations informatiques et de l'escalade du support.</li>
        <li><strong>Secteur financier :</strong> Amélioration de l'analyse financière et de la conformité réglementaire.</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "Systèmes d'automatisation intelligente pour environnements professionnels",
    description: "Découvrez comment nos systèmes d'automatisation intelligente basés sur la plateforme NVIDIA Founders Edition RTX 6000 optimisent les flux de travail dans diverses industries.",
    content: `
      <p>Nos systèmes d'automatisation intelligente alimentés par NVIDIA Founders Edition RTX 6000 offrent des solutions d'automatisation complètes pour les environnements d'entreprise dans plusieurs secteurs.</p>
      
      <h3>Applications professionnelles</h3>
      <h4>1. Département informatique :</h4>
      <ul>
        <li><strong>Tâche :</strong> Automatisation de la gestion des services informatiques et de l'escalade du support.</li>
        <li><strong>Exemple :</strong> Orchestration des flux de travail de résolution de tickets, interrogation d'une base de données de 1 To.</li>
      </ul>
      
      <h3>Avantages dans les environnements professionnels</h3>
      <ul>
        <li><strong>Automatisation en temps réel :</strong> L'exécution quasi instantanée de texte, de voix et de processus améliore la vitesse opérationnelle.</li>
        <li><strong>Confidentialité des données :</strong> Le traitement local garantit la conformité aux réglementations.</li>
      </ul>
    `,
  },
];
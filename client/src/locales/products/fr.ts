/**
 * French (fr) product translations
 */

import { ProductTranslations } from '@/types';

const translations: ProductTranslations = {
  1: {
    title: "Module de Calcul IA en Périphérie (Édition Développeur)",
    description: "Module de calcul IA avancé conçu pour le déploiement en périphérie avec CPU ARM 6 cœurs, 8 Go de RAM et unité de traitement neuronal spécialisée offrant jusqu'à 67 TOPS de performance. Parfait pour le développement d'IA, la robotique et les applications de vision par ordinateur.",
    hardwareInfo: "Le Module de Calcul IA en Périphérie présente la dernière architecture Jetson Orin Nano avec un processeur ARM Cortex-A78AE 6 cœurs fonctionnant jusqu'à 1,5 GHz. Il est équipé de 8 Go de mémoire LPDDR5 et offre des performances exceptionnelles pour les applications d'IA en périphérie. Le NPU prend en charge tous les principaux frameworks d'apprentissage profond et fournit jusqu'à 67 TOPS de performance IA avec une efficacité énergétique optimisée.",
    softwareInfo: "Ce module est livré avec une pile logicielle complète comprenant un système d'exploitation basé sur Linux, des bibliothèques CUDA et une prise en charge complète de TensorFlow, PyTorch et ONNX runtime. Le SDK intégré comprend des outils pour l'optimisation, la visualisation et le déploiement de modèles. La gestion et le versionnement des modèles d'IA sont intégrés, permettant des mises à jour transparentes par voie hertzienne.",
    hardwareTabLabel: "Matériel",
    softwareTabLabel: "Logiciel",
    hardwareSpecsLabel: "Spécifications Matérielles",
    aiCapabilitiesLabel: "Capacités IA et Performance",
    softwareArchitectureLabel: "Architecture Logicielle",
    learnMoreTitle: "Détails Techniques",
    learnMoreContent: "Le Module de Calcul IA en Périphérie représente la pointe de la technologie matérielle d'IA pour le déploiement en périphérie. Avec son NPU puissant et sa pile logicielle optimisée, il permet de déployer des réseaux neuronaux complexes, y compris des transformers et des LLMs, en périphérie avec une consommation d'énergie minimale."
  },
  2: {
    title: "Serveur IA Entreprise (Montage en Rack)",
    description: "Serveur IA haute performance pour les déploiements en entreprise avec plusieurs GPU, optimisé pour les charges de travail d'apprentissage automatique à grande échelle, le traitement des données et l'hébergement d'applications d'IA. Dispose d'alimentations redondantes et d'un refroidissement avancé pour un fonctionnement 24/7.",
    hardwareInfo: "Le Serveur IA Entreprise est livré dans un châssis 2U montable en rack avec support pour jusqu'à 4 GPU haute performance (NVIDIA A100 ou équivalent). Il dispose de deux processeurs Intel Xeon avec jusqu'à 64 cœurs au total, 256 Go de mémoire DDR4 ECC (extensible à 1 To), et 8 To de stockage NVMe en configuration RAID. Le système comprend des alimentations redondantes de 1600W et un système de refroidissement avancé pour des performances optimales.",
    softwareInfo: "Le serveur est livré préinstallé avec Ubuntu Server LTS et comprend une pile logicielle IA complète avec CUDA, cuDNN et TensorRT. Il prend en charge Docker et Kubernetes pour les déploiements conteneurisés, et inclut des outils pour l'entraînement et l'inférence distribués. Le logiciel de gestion fournit des capacités complètes de surveillance, de planification et d'allocation des ressources.",
    hardwareTabLabel: "Matériel",
    softwareTabLabel: "Logiciel",
    hardwareSpecsLabel: "Spécifications Matérielles",
    aiCapabilitiesLabel: "Capacités IA et Performance",
    softwareArchitectureLabel: "Architecture Logicielle"
  },
  3: {
    title: "Kit de Vision IA (Package Complet)",
    description: "Kit complet de développement de vision IA avec modules de caméra haute résolution, unité de traitement et modèles pré-entraînés pour les applications de vision par ordinateur. Idéal pour prototyper des solutions IA basées sur la vision comme la détection d'objets, la reconnaissance faciale et l'analyse d'activité.",
    hardwareInfo: "Le Kit de Vision IA comprend un module de calcul principal basé sur la plateforme Jetson Xavier NX, avec un CPU NVIDIA Carmel 6 cœurs et un GPU Volta 384 cœurs avec 48 Tensor Cores. Il est équipé de 8 Go de mémoire LPDDR4x et 16 Go de stockage eMMC. Le kit comprend deux modules de caméra 4K avec des objectifs grand angle, des capacités infrarouges pour le fonctionnement en faible luminosité et un traitement d'image accéléré par matériel.",
    softwareInfo: "Le Kit de Vision est livré avec une pile logicielle complète comprenant des modèles pré-entraînés pour les tâches courantes de vision par ordinateur telles que la détection d'objets, la classification, la segmentation et le suivi. Le SDK fournit des API pour le contrôle de la caméra, le traitement d'image et le déploiement de modèles. Le système prend en charge TensorFlow, PyTorch et OpenCV, avec des outils supplémentaires pour la gestion des ensembles de données et l'entraînement de modèles.",
    hardwareTabLabel: "Matériel",
    softwareTabLabel: "Logiciel"
  }
};

export default translations;
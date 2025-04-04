/**
 * Spanish (es) product translations
 */

import { ProductTranslations } from '@/types';

const translations: ProductTranslations = {
  1: {
    title: "Módulo de Computación IA de Borde (Edición para Desarrolladores)",
    description: "Módulo de computación de IA avanzado diseñado para despliegue en el borde con CPU ARM de 6 núcleos, 8GB de RAM y unidad de procesamiento neuronal especializada que ofrece hasta 67 TOPS de rendimiento. Perfecto para desarrollo de IA, robótica y aplicaciones de visión por computadora.",
    hardwareInfo: "El Módulo de Computación IA de Borde presenta la arquitectura más reciente de Jetson Orin Nano con un procesador ARM Cortex-A78AE de 6 núcleos que funciona a hasta 1,5 GHz. Viene con 8GB de memoria LPDDR5 y ofrece un rendimiento excepcional para aplicaciones de IA de borde. La NPU soporta todos los principales frameworks de aprendizaje profundo y proporciona hasta 67 TOPS de rendimiento de IA con eficiencia energética optimizada.",
    softwareInfo: "Este módulo viene con una pila de software completa que incluye un sistema operativo basado en Linux, bibliotecas CUDA y soporte completo para TensorFlow, PyTorch y ONNX runtime. El SDK integrado incluye herramientas para optimización de modelos, visualización e implementación. La gestión y versionado de modelos de IA están integrados, permitiendo actualizaciones inalámbricas sin problemas.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software",
    hardwareSpecsLabel: "Especificaciones de Hardware",
    aiCapabilitiesLabel: "Capacidades de IA y Rendimiento",
    softwareArchitectureLabel: "Arquitectura de Software",
    learnMoreTitle: "Detalles Técnicos",
    learnMoreContent: "El Módulo de Computación IA de Borde representa lo último en hardware de IA para despliegue en el borde. Con su potente NPU y pila de software optimizada, permite la implementación de redes neuronales complejas, incluidos transformers y LLMs, en el borde con un consumo mínimo de energía."
  },
  2: {
    title: "Servidor IA Empresarial (Montaje en Rack)",
    description: "Servidor de IA de alto rendimiento para implementaciones empresariales con múltiples GPUs, optimizado para cargas de trabajo de aprendizaje automático a gran escala, procesamiento de datos y alojamiento de aplicaciones de IA. Cuenta con fuentes de alimentación redundantes y refrigeración avanzada para operación 24/7.",
    hardwareInfo: "El Servidor IA Empresarial viene en un chasis montable en rack 2U con soporte para hasta 4 GPUs de alto rendimiento (NVIDIA A100 o equivalente). Cuenta con procesadores Intel Xeon duales con hasta 64 núcleos en total, 256GB de memoria DDR4 ECC (ampliable a 1TB), y 8TB de almacenamiento NVMe en configuración RAID. El sistema incluye fuentes de alimentación redundantes de 1600W y un sistema de refrigeración avanzado para un rendimiento óptimo.",
    softwareInfo: "El servidor viene preinstalado con Ubuntu Server LTS e incluye una pila de software de IA completa con CUDA, cuDNN y TensorRT. Soporta Docker y Kubernetes para implementaciones en contenedores, e incluye herramientas para entrenamiento e inferencia distribuidos. El software de gestión proporciona capacidades integrales de monitoreo, programación y asignación de recursos.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software",
    hardwareSpecsLabel: "Especificaciones de Hardware",
    aiCapabilitiesLabel: "Capacidades de IA y Rendimiento",
    softwareArchitectureLabel: "Arquitectura de Software"
  },
  3: {
    title: "Kit de Visión IA (Paquete Completo)",
    description: "Kit completo de desarrollo de visión por IA con módulos de cámara de alta resolución, unidad de procesamiento y modelos pre-entrenados para aplicaciones de visión por computadora. Ideal para prototipar soluciones de IA basadas en visión como detección de objetos, reconocimiento facial y análisis de actividad.",
    hardwareInfo: "El Kit de Visión IA incluye un módulo de computación principal basado en la plataforma Jetson Xavier NX, con una CPU NVIDIA Carmel de 6 núcleos y una GPU Volta de 384 núcleos con 48 Tensor Cores. Viene con 8GB de memoria LPDDR4x y 16GB de almacenamiento eMMC. El kit incluye dos módulos de cámara 4K con lentes gran angular, capacidades infrarrojas para operación con poca luz y procesamiento de imágenes acelerado por hardware.",
    softwareInfo: "El Kit de Visión viene con una pila de software completa que incluye modelos pre-entrenados para tareas comunes de visión por computadora como detección de objetos, clasificación, segmentación y seguimiento. El SDK proporciona APIs para control de cámara, procesamiento de imágenes e implementación de modelos. El sistema soporta TensorFlow, PyTorch y OpenCV, con herramientas adicionales para gestión de conjuntos de datos y entrenamiento de modelos.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software"
  }
};

export default translations;
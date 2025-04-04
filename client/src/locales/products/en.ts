/**
 * English (en) product translations
 */

import { ProductTranslations } from '@/types';

const translations: ProductTranslations = {
  1: {
    title: "AI Edge Computing Module (Developer Edition)",
    description: "Advanced AI computing module designed for edge deployment with 6-core ARM CPU, 8GB RAM and specialized neural processing unit offering up to 67 TOPS performance. Perfect for AI development, robotics, and computer vision applications.",
    hardwareInfo: "The AI Edge Computing Module features the latest Jetson Orin Nano architecture with a 6-core ARM Cortex-A78AE processor running at up to 1.5 GHz. It comes with 8GB of LPDDR5 memory and delivers exceptional performance for edge AI applications. The NPU supports all major deep learning frameworks and provides up to 67 TOPS of AI performance with optimized energy efficiency.",
    softwareInfo: "This module comes with a complete software stack including a Linux-based OS, CUDA libraries, and full support for TensorFlow, PyTorch, and ONNX runtime. The integrated SDK includes tools for model optimization, visualization, and deployment. AI model management and versioning are built-in, allowing for seamless updates over the air.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software",
    hardwareSpecsLabel: "Hardware Specifications",
    aiCapabilitiesLabel: "AI Capabilities & Performance",
    softwareArchitectureLabel: "Software Architecture",
    learnMoreTitle: "Technical Details",
    learnMoreContent: "The AI Edge Computing Module represents the cutting edge of AI hardware for edge deployment. With its powerful NPU and optimized software stack, it enables deploying complex neural networks including transformers and LLMs at the edge with minimal power consumption."
  },
  2: {
    title: "Enterprise AI Server (Rack-Mountable)",
    description: "High-performance AI server for enterprise deployments with multiple GPUs, optimized for large-scale machine learning workloads, data processing, and AI application hosting. Features redundant power supplies and advanced cooling for 24/7 operation.",
    hardwareInfo: "The Enterprise AI Server comes in a 2U rack-mountable chassis with support for up to 4 high-performance GPUs (NVIDIA A100 or equivalent). It features dual Intel Xeon processors with up to 64 cores total, 256GB of DDR4 ECC memory (expandable to 1TB), and 8TB of NVMe storage in RAID configuration. The system includes redundant 1600W power supplies and an advanced cooling system for optimal performance.",
    softwareInfo: "The server comes pre-installed with Ubuntu Server LTS and includes a complete AI software stack with CUDA, cuDNN, and TensorRT. It supports Docker and Kubernetes for containerized deployments, and includes tools for distributed training and inference. The management software provides comprehensive monitoring, scheduling, and resource allocation capabilities.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software",
    hardwareSpecsLabel: "Hardware Specifications",
    aiCapabilitiesLabel: "AI Capabilities & Performance",
    softwareArchitectureLabel: "Software Architecture"
  },
  3: {
    title: "AI Vision Kit (Complete Package)",
    description: "Complete AI vision development kit with high-resolution camera modules, processing unit, and pre-trained models for computer vision applications. Ideal for prototyping vision-based AI solutions like object detection, facial recognition, and activity analysis.",
    hardwareInfo: "The AI Vision Kit includes a main computing module based on the Jetson Xavier NX platform, featuring a 6-core NVIDIA Carmel CPU and 384-core Volta GPU with 48 Tensor Cores. It comes with 8GB of LPDDR4x memory and 16GB of eMMC storage. The kit includes two 4K camera modules with wide-angle lenses, infrared capabilities for low-light operation, and hardware accelerated image processing.",
    softwareInfo: "The Vision Kit comes with a complete software stack including pre-trained models for common computer vision tasks such as object detection, classification, segmentation, and tracking. The SDK provides APIs for camera control, image processing, and model deployment. The system supports TensorFlow, PyTorch, and OpenCV, with additional tools for dataset management and model training.",
    hardwareTabLabel: "Hardware",
    softwareTabLabel: "Software"
  }
};

export default translations;
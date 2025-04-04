/**
 * Chinese (zh) product translations
 */

import { ProductTranslations } from '@/types';

const translations: ProductTranslations = {
  1: {
    title: "AI边缘计算模块（开发者版）",
    description: "先进的AI计算模块，专为边缘部署设计，配备6核ARM CPU、8GB RAM和专用神经处理单元，提供高达67 TOPS的性能。完美适用于AI开发、机器人技术和计算机视觉应用。",
    hardwareInfo: "AI边缘计算模块采用最新的Jetson Orin Nano架构，配备运行速度高达1.5 GHz的6核ARM Cortex-A78AE处理器。它配备8GB LPDDR5内存，为边缘AI应用提供卓越性能。NPU支持所有主要深度学习框架，并提供高达67 TOPS的AI性能，同时优化能源效率。",
    softwareInfo: "该模块配备完整软件堆栈，包括基于Linux的操作系统、CUDA库以及对TensorFlow、PyTorch和ONNX运行时的全面支持。集成SDK包含模型优化、可视化和部署工具。内置AI模型管理和版本控制功能，支持无缝空中更新。",
    hardwareTabLabel: "硬件",
    softwareTabLabel: "软件",
    hardwareSpecsLabel: "硬件规格",
    aiCapabilitiesLabel: "AI功能和性能",
    softwareArchitectureLabel: "软件架构",
    learnMoreTitle: "技术详情",
    learnMoreContent: "AI边缘计算模块代表了边缘部署AI硬件的尖端水平。凭借其强大的NPU和优化的软件堆栈，它能够以最小的功耗在边缘部署复杂的神经网络，包括Transformer和LLM模型。"
  },
  2: {
    title: "企业级AI服务器（机架式）",
    description: "高性能AI服务器，适用于企业部署，配备多个GPU，针对大规模机器学习工作负载、数据处理和AI应用托管进行优化。具有冗余电源和先进冷却系统，支持24/7全天候运行。",
    hardwareInfo: "企业级AI服务器采用2U机架式机箱，支持最多4个高性能GPU（NVIDIA A100或同等产品）。它配备双Intel Xeon处理器，总计高达64个内核，256GB DDR4 ECC内存（可扩展至1TB），以及RAID配置的8TB NVMe存储。系统包括冗余1600W电源和先进冷却系统，确保最佳性能。",
    softwareInfo: "服务器预装Ubuntu Server LTS，并包含完整AI软件堆栈，包括CUDA、cuDNN和TensorRT。它支持Docker和Kubernetes进行容器化部署，并包含分布式训练和推理工具。管理软件提供全面的监控、调度和资源分配功能。",
    hardwareTabLabel: "硬件",
    softwareTabLabel: "软件",
    hardwareSpecsLabel: "硬件规格",
    aiCapabilitiesLabel: "AI功能和性能",
    softwareArchitectureLabel: "软件架构",
    learnMoreTitle: "企业AI解决方案",
    learnMoreContent: "企业级AI服务器为寻求大规模部署AI的组织提供前沿解决方案。它为训练复杂模型、执行推理工作负载以及同时管理多个AI项目提供卓越性能，同时保证企业级可靠性和安全性。"
  },
  3: {
    title: "AI视觉套件（完整套装）",
    description: "完整的AI视觉开发套件，配备高分辨率摄像头模块、处理单元和预训练模型，用于计算机视觉应用。非常适合开发基于视觉的AI解决方案原型，如物体检测、人脸识别和活动分析。",
    hardwareInfo: "AI视觉套件包含基于Jetson Xavier NX平台的主计算模块，配备6核NVIDIA Carmel CPU和384核Volta GPU，含48个张量核心。它配备8GB LPDDR4x内存和16GB eMMC存储。该套件包括两个配备广角镜头的4K摄像头模块，支持低光环境下的红外功能，以及硬件加速图像处理。",
    softwareInfo: "视觉套件配备完整软件堆栈，包括常见计算机视觉任务的预训练模型，如物体检测、分类、分割和跟踪。SDK提供摄像头控制、图像处理和模型部署API。系统支持TensorFlow、PyTorch和OpenCV，并提供额外的数据集管理和模型训练工具。",
    hardwareTabLabel: "硬件",
    softwareTabLabel: "软件",
    hardwareSpecsLabel: "硬件规格",
    aiCapabilitiesLabel: "AI功能和性能",
    softwareArchitectureLabel: "软件架构",
    learnMoreTitle: "视觉AI技术",
    learnMoreContent: "我们的AI视觉套件将前沿计算机视觉技术与专用硬件集成，用于实际应用场景。它支持快速开发零售分析、安全监控、工业检测、自主导航等解决方案，同时将编程工作量降至最低。"
  }
};

export default translations;
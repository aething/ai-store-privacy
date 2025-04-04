/**
 * Japanese (ja) product translations
 */

import { ProductTranslations } from '@/types';

const translations: ProductTranslations = {
  1: {
    title: "AIエッジコンピューティングモジュール（開発者版）",
    description: "6コアARMプロセッサ、8GBのRAM、専用ニューラルプロセッシングユニットを搭載し、最大67 TOPSのパフォーマンスを提供する先進的なAIコンピューティングモジュール。AI開発、ロボティクス、コンピュータビジョンアプリケーションに最適です。",
    hardwareInfo: "AIエッジコンピューティングモジュールは、最新のJetson Orin Nanoアーキテクチャを採用し、最大1.5GHzで動作する6コアのARM Cortex-A78AEプロセッサを搭載しています。8GBのLPDDR5メモリを備え、エッジAIアプリケーションに優れたパフォーマンスを提供します。NPUは主要なディープラーニングフレームワークをすべてサポートし、エネルギー効率を最適化しながら最大67 TOPSのAIパフォーマンスを実現します。",
    softwareInfo: "このモジュールには、Linux系OS、CUDAライブラリ、TensorFlow、PyTorch、ONNXランタイムの完全サポートを含む完全なソフトウェアスタックが付属しています。統合されたSDKには、モデルの最適化、視覚化、デプロイメントのためのツールが含まれています。AIモデル管理とバージョン管理が組み込まれており、OTAによるシームレスなアップデートが可能です。",
    hardwareTabLabel: "ハードウェア",
    softwareTabLabel: "ソフトウェア",
    hardwareSpecsLabel: "ハードウェア仕様",
    aiCapabilitiesLabel: "AI機能とパフォーマンス",
    softwareArchitectureLabel: "ソフトウェアアーキテクチャ",
    learnMoreTitle: "技術的詳細",
    learnMoreContent: "AIエッジコンピューティングモジュールは、エッジデプロイメント向けAIハードウェアの最先端を代表しています。強力なNPUと最適化されたソフトウェアスタックにより、トランスフォーマーやLLMを含む複雑なニューラルネットワークを、最小限の電力消費でエッジにデプロイすることができます。"
  },
  2: {
    title: "エンタープライズAIサーバー（ラックマウント型）",
    description: "複数のGPUを搭載した大規模機械学習ワークロード、データ処理、AIアプリケーションホスティングに最適化された高性能AIサーバー。冗長電源と高度な冷却システムを備え、24時間365日の運用が可能です。",
    hardwareInfo: "エンタープライズAIサーバーは、最大4台の高性能GPU（NVIDIA A100または同等品）をサポートする2Uラックマウント筐体で提供されます。合計64コアのデュアルIntel Xeonプロセッサ、256GBのDDR4 ECCメモリ（1TBまで拡張可能）、RAID構成で8TBのNVMeストレージを搭載しています。システムには冗長1600W電源と最適なパフォーマンスを実現する高度な冷却システムが含まれています。",
    softwareInfo: "サーバーにはUbuntu Server LTSがプリインストールされており、CUDA、cuDNN、TensorRTを含む完全なAIソフトウェアスタックが付属しています。コンテナ化されたデプロイメント用にDockerとKubernetesをサポートし、分散トレーニングと推論のためのツールも含まれています。管理ソフトウェアは包括的な監視、スケジューリング、リソース割り当て機能を提供します。",
    hardwareTabLabel: "ハードウェア",
    softwareTabLabel: "ソフトウェア",
    hardwareSpecsLabel: "ハードウェア仕様",
    aiCapabilitiesLabel: "AI機能とパフォーマンス",
    softwareArchitectureLabel: "ソフトウェアアーキテクチャ",
    learnMoreTitle: "エンタープライズAIソリューション",
    learnMoreContent: "エンタープライズAIサーバーは、大規模にAIを展開しようとする組織にとって最先端のソリューションです。複雑なモデルのトレーニング、推論ワークロードの実行、複数のAIプロジェクトをエンタープライズレベルの信頼性とセキュリティで同時に管理するための卓越したパフォーマンスを提供します。"
  },
  3: {
    title: "AIビジョンキット（完全パッケージ）",
    description: "高解像度カメラモジュール、処理ユニット、コンピュータビジョンアプリケーション用の事前学習済みモデルを備えた完全なAIビジョン開発キット。物体検出、顔認識、活動分析などのビジョンベースのAIソリューションのプロトタイピングに最適です。",
    hardwareInfo: "AIビジョンキットには、Jetson Xavier NXプラットフォームをベースにした6コアのNVIDIA Carmel CPUと48テンソルコアを搭載した384コアのVolta GPUを特徴とするメインコンピューティングモジュールが含まれています。8GBのLPDDR4xメモリと16GBのeMMCストレージを搭載しています。キットには広角レンズを備えた2台の4Kカメラモジュール、低照度での動作のための赤外線機能、ハードウェアによる画像処理の高速化が含まれています。",
    softwareInfo: "ビジョンキットには、物体検出、分類、セグメンテーション、トラッキングなどの一般的なコンピュータビジョンタスク用の事前学習済みモデルを含む完全なソフトウェアスタックが付属しています。SDKはカメラ制御、画像処理、モデルデプロイメント用のAPIを提供します。システムはTensorFlow、PyTorch、OpenCVをサポートし、データセット管理とモデルトレーニング用の追加ツールも備えています。",
    hardwareTabLabel: "ハードウェア",
    softwareTabLabel: "ソフトウェア",
    hardwareSpecsLabel: "ハードウェア仕様",
    aiCapabilitiesLabel: "AI機能とパフォーマンス",
    softwareArchitectureLabel: "ソフトウェアアーキテクチャ",
    learnMoreTitle: "ビジョンAIテクノロジー",
    learnMoreContent: "当社のAIビジョンキットは、実世界のアプリケーション向けに最先端のコンピュータビジョン技術と専用ハードウェアを統合しています。小売分析、セキュリティ監視、産業検査、自律走行などのソリューションを、最小限のプログラミング労力で迅速に開発することが可能です。"
  }
};

export default translations;
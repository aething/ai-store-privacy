/**
 * Chinese (zh) info page translations
 */

import { InfoPage } from "@/types";

// Chinese translations of info pages
export const zh: InfoPage[] = [
  {
    id: 0,
    title: "适用于专业环境的AI驱动解决方案",
    description: "了解我们基于NVIDIA Jetson Orin Nano平台的AI驱动聊天机器人解决方案如何为各种专业环境提供领域特定的解决方案。",
    content: `
      <p>基于该平台构建的AI驱动聊天机器人解决方案非常适合跨多个行业的各种专业任务，利用其处理大量数据并提供定制化、特定领域解决方案的能力。</p>
      
      <h3>数据处理量</h3>
      <ul>
        <li><strong>推理能力:</strong> 以每秒5-10个词元的性能，系统可以在2-4秒内生成20个词元的响应（约10-15个单词）。</li>
        <li><strong>知识库规模:</strong> 使用RAG，系统可以索引并利用高达500GB的文本数据。</li>
      </ul>
      
      <h3>专业应用</h3>
      <h4>1. IT部门:</h4>
      <ul>
        <li><strong>任务:</strong> 自动化技术支持和文档搜索。</li>
        <li><strong>示例:</strong> 查询系统日志、故障排除指南或软件手册。</li>
      </ul>
      
      <h3>在专业环境中的优势</h3>
      <ul>
        <li><strong>数据隐私:</strong> 在公司网络内运行，确保敏感信息保留在内部。</li>
        <li><strong>可扩展性:</strong> 虽然在最大性能下限制为2-3个同时用户，但系统可以与其他单元进行网络连接。</li>
      </ul>
    `,
  },
  {
    id: 1,
    title: "适用于专业环境的机器学习系统",
    description: "探索我们基于NVIDIA DGX Spark平台的机器学习系统如何为各种专业领域提供复杂的解决方案。",
    content: `
      <p>利用该平台的机器学习系统旨在处理各种专业领域中的复杂任务，利用显著的计算能力和数据处理能力来提供特定行业的解决方案。</p>
      
      <h3>数据处理量</h3>
      <ul>
        <li><strong>推理能力:</strong> 以每秒20-50个词元的生成速度，系统能够在0.4-1秒内生成20个词元的响应。</li>
        <li><strong>知识库规模:</strong> RAG系统可以索引并利用高达1TB的文本数据。</li>
      </ul>
      
      <h3>专业应用</h3>
      <ul>
        <li><strong>IT部门:</strong> 优化IT运营和支持升级。</li>
        <li><strong>金融部门:</strong> 增强金融分析和监管合规。</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "适用于专业环境的智能自动化系统",
    description: "了解我们基于NVIDIA Founders Edition RTX 6000平台的智能自动化系统如何优化各行业的工作流程。",
    content: `
      <p>我们由NVIDIA Founders Edition RTX 6000驱动的智能自动化系统为跨多个领域的企业环境提供全面的自动化解决方案。</p>
      
      <h3>专业应用</h3>
      <h4>1. IT部门:</h4>
      <ul>
        <li><strong>任务:</strong> 自动化IT服务管理和支持升级。</li>
        <li><strong>示例:</strong> 编排工单解决工作流程，查询1TB数据库。</li>
      </ul>
      
      <h3>在专业环境中的优势</h3>
      <ul>
        <li><strong>实时自动化:</strong> 文本、语音和流程的近即时执行提高了运行速度。</li>
        <li><strong>数据隐私:</strong> 本地处理确保监管合规。</li>
      </ul>
    `,
  },
];
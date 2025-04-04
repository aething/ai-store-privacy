/**
 * English (en) info page translations
 */

import { InfoPage } from "@/types";

// English translations of info pages
export const en: InfoPage[] = [
  {
    id: 0,
    title: "AI-Driven Solutions for Professional Environments",
    description: "Discover how our AI-driven chatbot solution on the NVIDIA Jetson Orin Nano platform offers domain-specific solutions for various professional environments.",
    content: `
      <p>The AI-driven chatbot solution built on this platform is well-suited to a variety of professional tasks across multiple industries, leveraging its ability to process significant volumes of data and provide customized, domain-specific solutions.</p>
      
      <h3>Data Processing Volume</h3>
      <ul>
        <li><strong>Inference Capability:</strong> With a performance of 5-10 tokens per second, the system can generate 20-token responses (approximately 10-15 words) in 2-4 seconds.</li>
        <li><strong>Knowledge Base Scale:</strong> Using RAG, the system can index and leverage up to 500GB of textual data.</li>
      </ul>
      
      <h3>Professional Applications</h3>
      <h4>1. IT Department:</h4>
      <ul>
        <li><strong>Task:</strong> Automating technical support and documentation search.</li>
        <li><strong>Example:</strong> Querying system logs, troubleshooting guides, or software manuals.</li>
      </ul>
      
      <h3>Benefits in Professional Environments</h3>
      <ul>
        <li><strong>Data Privacy:</strong> Operating within a company network, ensures sensitive information remains on-premises.</li>
        <li><strong>Scalability:</strong> While limited to 2-3 simultaneous users at maximum performance, the system can be networked with additional units.</li>
      </ul>
    `,
  },
  {
    id: 1,
    title: "ML Systems for Professional Environments",
    description: "Explore how our machine learning systems on the NVIDIA DGX Spark platform offer sophisticated solutions for various professional domains.",
    content: `
      <p>The ML systems leveraging this platform are designed to tackle sophisticated tasks across various professional domains, leveraging significant computing power and data processing capability to deliver industry-specific solutions.</p>
      
      <h3>Data Processing Volume</h3>
      <ul>
        <li><strong>Inference Capability:</strong> With a generation speed of 20-50 tokens per second, the system can produce 20-token responses in 0.4-1 second.</li>
        <li><strong>Knowledge Base Scale:</strong> The RAG system can index and leverage up to 1TB of textual data.</li>
      </ul>
      
      <h3>Professional Applications</h3>
      <ul>
        <li><strong>IT Department:</strong> Optimizing IT operations and support escalation.</li>
        <li><strong>Financial Sector:</strong> Enhancing financial analysis and regulatory compliance.</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "Intelligent Automation Systems for Professional Environments",
    description: "Learn how our intelligent automation systems based on the NVIDIA Founders Edition RTX 6000 platform optimize workflows across various industries.",
    content: `
      <p>Our intelligent automation systems powered by NVIDIA Founders Edition RTX 6000 provide comprehensive automation solutions for enterprise environments across multiple sectors.</p>
      
      <h3>Professional Applications</h3>
      <h4>1. IT Department:</h4>
      <ul>
        <li><strong>Task:</strong> Automating IT service management and support escalation.</li>
        <li><strong>Example:</strong> Orchestrating ticket resolution workflows, querying a 1TB database.</li>
      </ul>
      
      <h3>Benefits in Professional Environments</h3>
      <ul>
        <li><strong>Real-time Automation:</strong> The near-instant execution of text, voice, and processes enhances operational speed.</li>
        <li><strong>Data Privacy:</strong> Local processing ensures regulatory compliance.</li>
      </ul>
    `,
  },
];
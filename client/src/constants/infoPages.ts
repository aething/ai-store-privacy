import { InfoPage } from "@/types";

export const infoPages: InfoPage[] = [
  {
    id: 0,
    title: "AI-Driven Solutions Professional Environments",
    description: "Discover how our AI-driven chatbot solution on the NVIDIA Jetson Orin Nano platform delivers domain-specific solutions across various professional environments.",
    content: `
      <p>The AI-driven chatbot solution built on this platform is well-suited for a variety of professional tasks across multiple industries, leveraging its capacity to process significant volumes of data and deliver tailored, domain-specific solutions. Below is an analysis of its capabilities in terms of data processing volume and professional applications:</p>
      
      <h3>Data Processing Volume</h3>
      <ul>
        <li><strong>Inference Capacity:</strong> With a performance of 5–10 tokens per second, the system can generate responses of 20 tokens (approximately 10–15 words) in 2–4 seconds, enabling sequential handling of 15–30 queries per minute for a single user. For multiple users (2–3 simultaneous queries), response times may extend to 5–10 seconds due to resource sharing.</li>
        <li><strong>Knowledge Base Scale:</strong> Using RAG, the system can index and utilize up to 500 GB of text data, equivalent to approximately 200 million A4 pages (assuming 2–3 KB per page). This allows it to serve as a comprehensive repository for enterprise documentation, manuals, or historical records.</li>
        <li><strong>Contextual Processing:</strong> The 4096–8192 token context window supports analysis of documents spanning 10–20 A4 pages per query, making it suitable for summarizing reports, extracting insights, or answering detailed questions based on moderately large texts.</li>
      </ul>
      
      <h3>Professional Applications</h3>
      <h4>1. IT Department:</h4>
      <ul>
        <li><strong>Task:</strong> Automating technical support and documentation search.</li>
        <li><strong>Example:</strong> Querying system logs, troubleshooting guides, or software manuals stored in the knowledge base to provide step-by-step resolutions for IT staff or end-users.</li>
        <li><strong>Volume:</strong> Can process hundreds of thousands of pages of technical documentation (e.g., 100 GB), offering real-time assistance without external dependencies.</li>
      </ul>
      
      <h4>2. Financial Sector:</h4>
      <ul>
        <li><strong>Task:</strong> Analyzing financial reports, compliance documents, or transactional records.</li>
        <li><strong>Example:</strong> Extracting key metrics from quarterly reports or answering regulatory queries based on a 200 GB archive of financial policies and historical data.</li>
        <li><strong>Volume:</strong> Capable of handling millions of records (e.g., 50 million A4 pages), supporting audit preparation or risk assessment with localized, secure processing.</li>
      </ul>
      
      <h4>3. Education and Training:</h4>
      <ul>
        <li><strong>Task:</strong> Delivering personalized learning support or course material synthesis.</li>
        <li><strong>Example:</strong> Summarizing textbooks, answering student queries from a 300 GB repository of educational content, or generating practice questions based on curricula.</li>
        <li><strong>Volume:</strong> Processes extensive educational archives (e.g., 120 million A4 pages), enabling scalable deployment across departments or institutions.</li>
      </ul>
      
      <h4>4. General Enterprise Use:</h4>
      <ul>
        <li><strong>Task:</strong> Enhancing internal knowledge management and employee onboarding.</li>
        <li><strong>Example:</strong> Responding to HR policy inquiries, retrieving project documentation, or providing procedural guidance from a 500 GB knowledge base encompassing company records.</li>
        <li><strong>Volume:</strong> Supports comprehensive organizational memory, equivalent to decades of accumulated documentation, accessible within an intranet environment.</li>
      </ul>
      
      <h3>Industry-Specific Solutions</h3>
      <ul>
        <li><strong>Healthcare:</strong> Querying medical guidelines or patient care protocols from a localized knowledge base, ensuring compliance with privacy regulations by avoiding cloud dependencies.</li>
        <li><strong>Manufacturing:</strong> Assisting with equipment manuals or production logs, processing technical drawings (converted to text via OCR) to aid maintenance teams.</li>
        <li><strong>Legal:</strong> Summarizing case law or contracts, leveraging the RAG system to index millions of legal documents for rapid retrieval and analysis.</li>
      </ul>
      
      <h3>Advantages in Professional Settings</h3>
      <ul>
        <li><strong>Data Privacy:</strong> Operating within an enterprise network ensures sensitive information remains on-premises, critical for regulated industries.</li>
        <li><strong>Scalability:</strong> While limited to 2–3 simultaneous users at peak performance, the system can be networked with additional units for broader deployment.</li>
        <li><strong>Customization:</strong> Open-source nature allows fine-tuning on domain-specific datasets (e.g., 10 GB of industry reports), enhancing relevance and accuracy.</li>
      </ul>
    `,
  },
  {
    id: 1,
    title: "ML Systems Professional Environments",
    description: "Explore how our Machine Learning Systems leveraging the NVIDIA DGX Spark platform deliver sophisticated solutions for diverse professional domains.",
    content: `
      <p>The ML Systems leveraging this platform are designed to tackle sophisticated tasks across diverse professional domains, harnessing significant computational power and data processing capacity to deliver industry-specific solutions. Below is an analysis of its capabilities in terms of data processing volume and professional applications:</p>
      
      <h3>Data Processing Volume</h3>
      <ul>
        <li><strong>Inference Capacity:</strong> With a generation speed of 20–50 tokens per second, the system can produce responses of 20 tokens (approximately 15 words) in 0.4–1 second, enabling up to 60–150 queries per minute for a single user. For multiple users (5–8 simultaneous queries), it maintains near-real-time performance (1–2 seconds per response), with capacity scaling to 20–30 concurrent requests at reduced speeds (5–10 tokens/second).</li>
        <li><strong>Knowledge Base Scale:</strong> The RAG system can index and utilize up to 1 TB of text data, equivalent to approximately 400 million A4 pages, providing a vast, searchable repository for enterprise-wide knowledge management.</li>
        <li><strong>Contextual Processing:</strong> With a context window of 8192–32,768 tokens, it can analyze documents spanning 20–80 A4 pages per query, ideal for in-depth document summarization, multi-turn conversations, or complex query resolution.</li>
        <li><strong>Voice Processing:</strong> Handles real-time audio inputs (e.g., 10-second utterances, ~100–150 words) with STT latency of 0.5–1 second and TTS synthesis in under 200 ms, supporting seamless voice interactions.</li>
      </ul>
      
      <h3>Professional Applications</h3>
      <h4>1. IT Department:</h4>
      <ul>
        <li><strong>Task:</strong> Streamlining IT operations and support escalation.</li>
        <li><strong>Example:</strong> Processing queries against a 500 GB repository of system logs, configuration guides, and ticketing records to provide instant troubleshooting advice or escalate issues with detailed context.</li>
        <li><strong>Volume:</strong> Capable of managing millions of technical documents (e.g., 200 million A4 pages), reducing downtime through rapid, voice- or text-driven assistance.</li>
      </ul>
      
      <h4>2. Financial Sector:</h4>
      <ul>
        <li><strong>Task:</strong> Enhancing financial analysis and regulatory compliance.</li>
        <li><strong>Example:</strong> Analyzing a 600 GB archive of transaction records, market reports, and compliance policies to generate summaries, flag anomalies, or respond to audit inquiries via voice or text.</li>
        <li><strong>Volume:</strong> Processes extensive financial datasets (e.g., 240 million A4 pages), supporting real-time decision-making and reporting.</li>
      </ul>
      
      <h4>3. Education and Training:</h4>
      <ul>
        <li><strong>Task:</strong> Facilitating interactive learning and instructor support.</li>
        <li><strong>Example:</strong> Querying a 700 GB collection of academic papers, lecture notes, and multimedia transcripts to answer student questions, generate quizzes, or deliver voice-guided tutorials.</li>
        <li><strong>Volume:</strong> Handles vast educational content (e.g., 280 million A4 pages), enabling scalable, personalized training programs.</li>
      </ul>
      
      <h4>4. General Enterprise Use:</h4>
      <ul>
        <li><strong>Task:</strong> Optimizing knowledge sharing and operational efficiency.</li>
        <li><strong>Example:</strong> Responding to employee queries on a 1 TB knowledge base of HR policies, project plans, and corporate archives, accessible via text chat or voice commands.</li>
        <li><strong>Volume:</strong> Supports an organizational memory of up to 400 million A4 pages, streamlining onboarding, cross-departmental collaboration, and process automation.</li>
      </ul>
      
      <h3>Industry-Specific Solutions</h3>
      <h4>Healthcare:</h4>
      <ul>
        <li><strong>Task:</strong> Supporting clinical decision-making and patient interaction.</li>
        <li><strong>Example:</strong> Accessing a 800 GB database of medical protocols, research papers, and patient histories to provide voice-assisted diagnostic support or text-based treatment summaries for practitioners.</li>
      </ul>
      
      <h4>Manufacturing:</h4>
      <ul>
        <li><strong>Task:</strong> Improving production and maintenance workflows.</li>
        <li><strong>Example:</strong> Querying a 600 GB library of equipment manuals, sensor logs, and schematics (text-extracted via OCR) to guide technicians through repairs or monitor production metrics in real time.</li>
      </ul>
      
      <h4>Legal:</h4>
      <ul>
        <li><strong>Task:</strong> Accelerating case research and contract review.</li>
        <li><strong>Example:</strong> Analyzing a 900 GB corpus of legal precedents, contracts, and statutes to draft summaries, answer queries, or narrate findings via voice output for attorneys.</li>
      </ul>
      
      <h3>Advantages in Professional Settings</h3>
      <ul>
        <li><strong>Real-Time Responsiveness:</strong> Near-instant text and voice interactions enhance user experience and operational speed, critical for time-sensitive industries like finance or healthcare.</li>
        <li><strong>Data Security:</strong> Localized processing within an intranet ensures compliance with data privacy regulations, vital for legal and medical applications.</li>
        <li><strong>Scalability:</strong> Supports 5–8 concurrent users at peak performance, with potential for clustering (via ConnectX-7) to handle larger teams or departments.</li>
        <li><strong>Customization:</strong> Open-source framework enables fine-tuning on domain-specific datasets (e.g., 100 GB of industry records), tailoring responses to professional jargon and workflows.</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "Intelligent Automation Systems Professional Environments",
    description: "Learn how our Intelligent Automation Systems based on NVIDIA's Founders Edition RTX 6000 platform optimize workflows across various industries.",
    content: `
      <p>Our Intelligent Automation Systems powered by NVIDIA's Founders Edition RTX 6000 deliver comprehensive automation solutions for enterprise environments across multiple sectors.</p>
      
      <h3>Professional Applications</h3>
      <h4>1. IT Department:</h4>
      <ul>
        <li><strong>Task:</strong> Automating IT service management and support escalation.</li>
        <li><strong>Example:</strong> Orchestrating ticket resolution workflows, querying a 1 TB database of system logs and manuals via chatbot or voice commands to provide instant fixes, and escalating complex issues with detailed context.</li>
        <li><strong>Volume:</strong> Manages millions of technical records (~400 million A4 pages), reducing resolution times with automated responses.</li>
      </ul>
      
      <h4>2. Financial Sector:</h4>
      <ul>
        <li><strong>Task:</strong> Streamlining transaction processing and compliance monitoring.</li>
        <li><strong>Example:</strong> Automating payment reconciliations, analyzing a 1.5 TB archive of financial policies and transaction logs to flag anomalies, and responding to compliance queries via voice or text.</li>
        <li><strong>Volume:</strong> Processes extensive datasets (~600 million A4 pages), supporting real-time auditing and reporting.</li>
      </ul>
      
      <h4>3. Education and Training:</h4>
      <ul>
        <li><strong>Task:</strong> Enhancing interactive learning and administrative automation.</li>
        <li><strong>Example:</strong> Automating course scheduling, querying a 1 TB repository of educational content to answer student questions via chatbot or voice, and generating personalized study plans.</li>
        <li><strong>Volume:</strong> Handles vast educational archives (~400 million A4 pages), scaling across institutions.</li>
      </ul>
      
      <h4>4. General Enterprise Use:</h4>
      <ul>
        <li><strong>Task:</strong> Optimizing operational workflows and employee support.</li>
        <li><strong>Example:</strong> Automating HR onboarding processes, retrieving policies from a 2 TB knowledge base via voice or text, and coordinating inter-departmental tasks with real-time updates.</li>
        <li><strong>Volume:</strong> Supports an organizational memory of ~800 million A4 pages, improving efficiency and collaboration.</li>
      </ul>
      
      <h3>Industry-Specific Solutions</h3>
      <h4>Healthcare:</h4>
      <ul>
        <li><strong>Task:</strong> Automating patient record management and clinical support.</li>
        <li><strong>Example:</strong> Processing a 1.8 TB database of medical records and guidelines to update patient files, answer practitioner queries via voice, and automate appointment scheduling.</li>
      </ul>
      
      <h4>Manufacturing:</h4>
      <ul>
        <li><strong>Task:</strong> Enhancing production automation and maintenance.</li>
        <li><strong>Example:</strong> Coordinating robotic assembly lines, querying a 1.5 TB library of equipment logs and manuals to guide repairs via chatbot or voice, and predicting maintenance needs.</li>
      </ul>
      
      <h4>Legal:</h4>
      <ul>
        <li><strong>Task:</strong> Automating case research and document drafting.</li>
        <li><strong>Example:</strong> Analyzing a 2 TB corpus of legal documents to summarize cases, draft contracts via voice commands, and respond to client inquiries in real-time.</li>
      </ul>
      
      <h3>Advantages in Professional Settings</h3>
      <ul>
        <li><strong>Real-Time Automation:</strong> Near-instant text, voice, and process execution enhances operational speed, critical for time-sensitive industries.</li>
        <li><strong>Data Privacy:</strong> Localized processing ensures compliance with regulations, vital for healthcare and legal sectors.</li>
        <li><strong>Scalability:</strong> Supports 5–10 concurrent users at peak performance, with potential for multi-GPU setups to handle larger teams.</li>
        <li><strong>Customization:</strong> Open-source framework allows tailoring to industry-specific workflows and datasets (e.g., 100 GB of proprietary data).</li>
      </ul>
      
      <p>This platform excels in delivering secure, high-capacity intelligent automation, processing vast data volumes to drive efficiency, decision-making, and innovation across IT, finance, education, healthcare, and beyond.</p>
    `,
  },
];

// Сохраняем оригинальную функцию для обратной совместимости
export const getInfoPageById = (id: number): InfoPage | undefined => {
  return infoPages.find(page => page.id === id);
};

export const getAllInfoPages = (): InfoPage[] => {
  return infoPages;
};
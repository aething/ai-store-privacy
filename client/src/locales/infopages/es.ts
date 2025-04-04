/**
 * Spanish (es) info page translations
 */

import { InfoPage } from "@/types";

export const es: InfoPage[] = [
  {
    id: 0,
    title: "Soluciones impulsadas por IA para entornos profesionales",
    description: "Descubra cómo nuestra solución de chatbot impulsada por IA en la plataforma NVIDIA Jetson Orin Nano ofrece soluciones específicas para diversos entornos profesionales.",
    content: `
      <p>La solución de chatbot impulsada por IA construida sobre esta plataforma es adecuada para una variedad de tareas profesionales en múltiples industrias, aprovechando su capacidad para procesar volúmenes significativos de datos y entregar soluciones personalizadas y específicas para cada dominio. A continuación se presenta un análisis de sus capacidades en términos de volumen de procesamiento de datos y aplicaciones profesionales:</p>
      
      <h3>Volumen de procesamiento de datos</h3>
      <ul>
        <li><strong>Capacidad de inferencia:</strong> Con un rendimiento de 5-10 tokens por segundo, el sistema puede generar respuestas de 20 tokens (aproximadamente 10-15 palabras) en 2-4 segundos, permitiendo el manejo secuencial de 15-30 consultas por minuto para un solo usuario. Para múltiples usuarios (2-3 consultas simultáneas), los tiempos de respuesta pueden extenderse a 5-10 segundos debido al uso compartido de recursos.</li>
        <li><strong>Escala de la base de conocimientos:</strong> Utilizando RAG, el sistema puede indexar y utilizar hasta 500 GB de datos de texto, equivalente a aproximadamente 200 millones de páginas A4 (asumiendo 2-3 KB por página). Esto le permite servir como un repositorio completo para documentación empresarial, manuales o registros históricos.</li>
        <li><strong>Procesamiento contextual:</strong> La ventana de contexto de 4096-8192 tokens admite el análisis de documentos que abarcan 10-20 páginas A4 por consulta, haciéndolo adecuado para resumir informes, extraer perspectivas o responder preguntas detalladas basadas en textos moderadamente grandes.</li>
      </ul>
      
      <h3>Aplicaciones profesionales</h3>
      <h4>1. Departamento de TI:</h4>
      <ul>
        <li><strong>Tarea:</strong> Automatización del soporte técnico y búsqueda de documentación.</li>
        <li><strong>Ejemplo:</strong> Consulta de registros del sistema, guías de solución de problemas o manuales de software almacenados en la base de conocimientos para proporcionar resoluciones paso a paso para el personal de TI o los usuarios finales.</li>
        <li><strong>Volumen:</strong> Puede procesar cientos de miles de páginas de documentación técnica (por ejemplo, 100 GB), ofreciendo asistencia en tiempo real sin dependencias externas.</li>
      </ul>
      
      <h3>Ventajas en entornos profesionales</h3>
      <ul>
        <li><strong>Privacidad de datos:</strong> Operar dentro de una red empresarial garantiza que la información sensible permanezca en las instalaciones, crucial para industrias reguladas.</li>
        <li><strong>Escalabilidad:</strong> Aunque limitado a 2-3 usuarios simultáneos a máximo rendimiento, el sistema puede conectarse en red con unidades adicionales para un despliegue más amplio.</li>
        <li><strong>Personalización:</strong> La naturaleza de código abierto permite el ajuste fino en conjuntos de datos específicos del dominio (por ejemplo, 10 GB de informes de la industria), mejorando la relevancia y precisión.</li>
      </ul>
    `,
  },
  {
    id: 1,
    title: "Sistemas ML para entornos profesionales",
    description: "Explore cómo nuestros Sistemas de Aprendizaje Automático que aprovechan la plataforma NVIDIA DGX Spark ofrecen soluciones sofisticadas para diversos dominios profesionales.",
    content: `
      <p>Los Sistemas de Aprendizaje Automático que aprovechan esta plataforma están diseñados para abordar tareas sofisticadas en diversos dominios profesionales, aprovechando un poder computacional significativo y capacidad de procesamiento de datos para entregar soluciones específicas para cada industria. A continuación se presenta un análisis de sus capacidades en términos de volumen de procesamiento de datos y aplicaciones profesionales:</p>
      
      <h3>Volumen de procesamiento de datos</h3>
      <ul>
        <li><strong>Capacidad de inferencia:</strong> Con una velocidad de generación de 20-50 tokens por segundo, el sistema puede producir respuestas de 20 tokens (aproximadamente 15 palabras) en 0.4-1 segundo, permitiendo hasta 60-150 consultas por minuto para un solo usuario. Para múltiples usuarios (5-8 consultas simultáneas), mantiene un rendimiento casi en tiempo real (1-2 segundos por respuesta), con capacidad para escalar a 20-30 solicitudes concurrentes a velocidades reducidas (5-10 tokens/segundo).</li>
        <li><strong>Escala de la base de conocimientos:</strong> El sistema RAG puede indexar y utilizar hasta 1 TB de datos de texto, equivalente a aproximadamente 400 millones de páginas A4, proporcionando un vasto repositorio consultable para la gestión del conocimiento en toda la empresa.</li>
      </ul>
      
      <h3>Aplicaciones profesionales</h3>
      <ul>
        <li><strong>Departamento de TI:</strong> Optimización de operaciones de TI y escalación de soporte mediante el procesamiento de consultas contra un repositorio de 500 GB de registros del sistema, guías de configuración y registros de tickets.</li>
        <li><strong>Sector financiero:</strong> Mejora del análisis financiero y cumplimiento normativo mediante el análisis de un archivo de 600 GB de registros de transacciones, informes de mercado y políticas de cumplimiento.</li>
        <li><strong>Educación y formación:</strong> Facilitación del aprendizaje interactivo y apoyo al instructor mediante la consulta de una colección de 700 GB de documentos académicos, notas de conferencias y transcripciones multimedia.</li>
      </ul>
    `,
  },
  {
    id: 2,
    title: "Sistemas de automatización inteligente para entornos profesionales",
    description: "Conozca cómo nuestros Sistemas de Automatización Inteligente basados en la plataforma NVIDIA Founders Edition RTX 6000 optimizan los flujos de trabajo en varias industrias.",
    content: `
      <p>Nuestros Sistemas de Automatización Inteligente impulsados por la NVIDIA Founders Edition RTX 6000 ofrecen soluciones de automatización integrales para entornos empresariales en múltiples sectores.</p>
      
      <h3>Aplicaciones profesionales</h3>
      <h4>1. Departamento de TI:</h4>
      <ul>
        <li><strong>Tarea:</strong> Automatización de la gestión de servicios de TI y escalación de soporte.</li>
        <li><strong>Ejemplo:</strong> Orquestación de flujos de trabajo para resolución de tickets, consulta de una base de datos de 1 TB de registros del sistema y manuales a través de chatbot o comandos de voz para proporcionar soluciones instantáneas, y escalación de problemas complejos con contexto detallado.</li>
        <li><strong>Volumen:</strong> Gestiona millones de registros técnicos (~400 millones de páginas A4), reduciendo los tiempos de resolución con respuestas automatizadas.</li>
      </ul>
      
      <h3>Ventajas en entornos profesionales</h3>
      <ul>
        <li><strong>Automatización en tiempo real:</strong> Los textos, voces y ejecuciones de procesos casi instantáneos mejoran la velocidad operativa, crucial para industrias sensibles al tiempo.</li>
        <li><strong>Privacidad de datos:</strong> El procesamiento localizado asegura el cumplimiento de las normativas, vital para los sectores de salud y legal.</li>
        <li><strong>Escalabilidad:</strong> Admite 5-10 usuarios concurrentes a máximo rendimiento, con potencial para configuraciones multi-GPU para manejar equipos más grandes.</li>
      </ul>
    `,
  },
];
import { InfoPage } from "@/types";

export const infoPages: InfoPage[] = [
  {
    id: 0,
    title: "AI Store - Play Market Description",
    description: "Learn about our mobile application available on Play Market with advanced AI shopping features. Discover how our app combines intuitive design with powerful AI technology to create a seamless shopping experience on your mobile device.",
    content: `
      <h2>AI Store by Aething - Мобильное приложение для Play Market</h2>
      <p>AI Store by Aething - это современное мобильное приложение для электронной коммерции, разработанное в соответствии с принципами Material Design. Приложение представляет собой интернет-магазин с двумя основными страницами: Магазин и Аккаунт.</p>
      
      <h3>Особенности приложения</h3>
      <ul>
        <li><strong>Material Design</strong>: Чистый, отзывчивый дизайн, соответствующий руководящим принципам Google Material Design.</li>
        <li><strong>Горизонтальная прокрутка карточек товаров</strong>: Просмотр товаров в стиле Apple с горизонтальным интерфейсом прокрутки.</li>
        <li><strong>Верификация по электронной почте</strong>: Простая регистрация только по email с отображением статуса верификации.</li>
        <li><strong>Безопасные платежи</strong>: Интеграция со Stripe для безопасных и удобных платежей.</li>
        <li><strong>Поддержка нескольких валют</strong>: Автоматическое определение валюты (USD/EUR) на основе страны пользователя.</li>
        <li><strong>Информационные страницы</strong>: Легкодоступные страницы с политиками, включая доставку, возврат, конфиденциальность, условия оплаты и многое другое.</li>
      </ul>
      
      <h3>Структура приложения</h3>
      <p><strong>Страница Магазин:</strong> Отображает карточки товаров с изображениями, описаниями и кнопками "Купить". Товары размещены в горизонтальном прокручиваемом макете. На странице размещаются три товара с возможностью прокрутки влево и вправо. Верхнюю треть карточки занимает изображение товара, нижнюю треть - описание и кнопка "Купить". При нажатии на карточку открывается страница с подробным описанием товара.</p>
      
      <p><strong>Страница Аккаунт:</strong> Показывает информацию о пользователе (имя, телефон, адрес) и статус верификации (красная надпись "Не верифицирован" или зеленая надпись "Подтвержден"). Включает ссылки на страницы с политиками:</p>
      <ul>
        <li>Политика доставки</li>
        <li>Политика возврата и обмена</li>
        <li>Контактная информация</li>
        <li>Политика конфиденциальности</li>
        <li>Условия оплаты</li>
        <li>Гарантии и ответственность</li>
        <li>Terms of Service</li>
        <li>GDPR</li>
        <li>FTC Rules</li>
      </ul>
      
      <p>При нажатии на любой из этих пунктов открывается новая страница на весь экран с кнопкой закрытия вверху и кнопкой возврата к началу страницы внизу.</p>
      
      <h3>Технологии</h3>
      <p>Приложение построено с использованием современных веб-технологий и может быть упаковано для Android. Обработка платежей осуществляется через Stripe, а данные о клиентах безопасно хранятся с использованием интеграции Google Sheets.</p>
      
      <p>При регистрации пользователя запрашивается только адрес электронной почты, на который отправляется письмо с подтверждением. После ввода email пользователь перенаправляется на страницу Магазин.</p>
      
      <p>Опыт будущего шоппинга с AI Store by Aething - где передовые технологии сочетаются с интуитивно понятным дизайном.</p>
    `,
  },
  {
    id: 1,
    title: "AI-Powered Shopping Assistant",
    description: "Enhance your shopping experience with our AI assistant that helps you find exactly what you need. Our sophisticated algorithms learn your preferences over time to create a personalized shopping experience that feels like having your own personal stylist.",
    content: `
      <h2>Shopping Reimagined with AI</h2>
      <p>Our AI shopping assistant uses advanced machine learning algorithms to understand your preferences and provide personalized shopping recommendations. Whether you're looking for a specific item or need inspiration, our assistant is here to help.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li><strong>Personalized Recommendations</strong>: Get product suggestions based on your browsing history and preferences.</li>
        <li><strong>Natural Language Search</strong>: Simply describe what you're looking for in your own words.</li>
        <li><strong>Visual Search</strong>: Upload an image to find similar products in our catalog.</li>
        <li><strong>Size and Fit Prediction</strong>: Get accurate size recommendations based on your profile.</li>
      </ul>
      
      <h3>How It Works</h3>
      <p>Our AI assistant uses a combination of natural language processing, computer vision, and collaborative filtering to understand your needs and preferences. The more you use it, the better it gets at predicting what you'll love.</p>
      
      <p>Try asking the assistant for recommendations or help finding specific products. You can also ask for styling advice or product comparisons. The possibilities are endless!</p>
    `,
  },
  {
    id: 2,
    title: "Our Vision for Sustainable Technology",
    description: "Learn about our commitment to creating technology that's good for people and the planet. We believe that innovation and sustainability can go hand in hand, and we're dedicated to reducing our environmental footprint while creating amazing products.",
    content: `
      <h2>Technology with Purpose</h2>
      <p>At Aething, we believe that technology should enhance human lives while respecting our planet. Our vision is to create innovative products that solve real problems without creating new ones for future generations.</p>
      
      <h3>Our Sustainability Commitments</h3>
      <ul>
        <li><strong>Carbon-Neutral Operations</strong>: We offset 100% of the carbon emissions from our operations and shipping.</li>
        <li><strong>Responsible Materials</strong>: We carefully select materials that minimize environmental impact and prioritize recyclability.</li>
        <li><strong>Ethical Supply Chain</strong>: We work only with partners who meet our high standards for worker rights and environmental practices.</li>
        <li><strong>Product Longevity</strong>: We design our products to last, with easy repairs and upgrades to extend their useful life.</li>
      </ul>
      
      <h3>Innovation for Impact</h3>
      <p>We're continuously exploring new ways to reduce our environmental footprint while enhancing the user experience. From energy-efficient algorithms to biodegradable packaging, every detail matters.</p>
      
      <p>Join us in creating a future where technology serves humanity without compromising our planet's health. Together, we can prove that innovation and responsibility can go hand in hand.</p>
    `,
  },
  {
    id: 3,
    title: "The Next Wave of AI Innovation",
    description: "Explore how we're pushing the boundaries of what's possible with artificial intelligence. Our research teams are developing breakthrough technologies in multimodal learning, on-device intelligence, and human-AI collaboration that will transform your daily interactions with technology.",
    content: `
      <h2>Pioneering the Future of AI</h2>
      <p>Artificial intelligence is evolving at an unprecedented pace, and we're at the forefront of this revolution. Our research team is exploring new paradigms in machine learning that will make AI more capable, efficient, and accessible than ever before.</p>
      
      <h3>Research Priorities</h3>
      <ul>
        <li><strong>Multimodal Learning</strong>: Teaching AI to understand and reason across text, images, audio, and more.</li>
        <li><strong>On-Device Intelligence</strong>: Bringing powerful AI capabilities directly to your devices without compromising privacy.</li>
        <li><strong>Human-AI Collaboration</strong>: Creating systems that enhance human capabilities instead of replacing them.</li>
        <li><strong>Trustworthy AI</strong>: Developing methods to ensure AI systems are transparent, fair, and aligned with human values.</li>
      </ul>
      
      <h3>From Lab to Life</h3>
      <p>Our innovation process bridges the gap between cutting-edge research and practical applications. We work closely with users to ensure our AI solutions solve real problems in intuitive ways.</p>
      
      <p>The products you enjoy today represent just the beginning of what's possible. As our AI capabilities continue to evolve, we're excited to introduce features and experiences that will transform how you interact with technology in your daily life.</p>
    `,
  },
  {
    id: 4,
    title: "Privacy-First Design Philosophy",
    description: "Discover how we build privacy into everything we do, from product design to data practices. We believe privacy is a fundamental right, not just a feature, and we've pioneered innovative techniques like on-device processing and data minimization to protect your information.",
    content: `
      <h2>Privacy as a Fundamental Right</h2>
      <p>In today's connected world, privacy isn't just a feature—it's a fundamental right. At Aething, we believe you should never have to choose between amazing technology and privacy. That's why we build privacy protections into every product and service we offer.</p>
      
      <h3>Our Privacy Principles</h3>
      <ul>
        <li><strong>Data Minimization</strong>: We collect only the data we need to provide and improve our services.</li>
        <li><strong>On-Device Processing</strong>: Whenever possible, we process your data directly on your device instead of sending it to the cloud.</li>
        <li><strong>Transparent Controls</strong>: We give you clear visibility into what data is collected and simple tools to control how it's used.</li>
        <li><strong>Secure by Design</strong>: We implement state-of-the-art security measures to protect your information from unauthorized access.</li>
      </ul>
      
      <h3>Privacy and AI</h3>
      <p>Our approach to artificial intelligence emphasizes privacy preservation. We're pioneering techniques like federated learning and differential privacy that allow AI to learn from aggregate patterns without accessing individual data.</p>
      
      <p>We're committed to proving that powerful, personalized experiences don't require compromising your privacy. With Aething products, you're not just the user—you're in control.</p>
    `,
  },
];

export const getInfoPageById = (id: number): InfoPage | undefined => {
  return infoPages.find(page => page.id === id);
};

export const getAllInfoPages = (): InfoPage[] => {
  return infoPages;
};
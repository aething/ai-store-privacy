import React from 'react';

// Компонент для безопасного добавления инлайновых CSS-стилей
interface InlineCSSProps {
  css: string;
}

export const InlineCSS: React.FC<InlineCSSProps> = ({ css }) => {
  return <style>{css}</style>;
};

export default InlineCSS;
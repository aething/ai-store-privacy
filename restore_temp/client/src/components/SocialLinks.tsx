import React from 'react';
import { FaLinkedin, FaXTwitter, FaTelegram } from 'react-icons/fa6';

interface SocialLinksProps {
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ className = '' }) => {
  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/iharkul',
      icon: <FaLinkedin size={24} />
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/digitalpatent',
      icon: <FaXTwitter size={24} />
    },
    {
      name: 'Telegram',
      url: 'https://t.me/aethinginc',
      icon: <FaTelegram size={24} />
    }
  ];

  return (
    <div className={`flex justify-center items-center py-4 ${className}`}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 text-gray-700 hover:text-blue-600 transition-colors"
          aria-label={link.name}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
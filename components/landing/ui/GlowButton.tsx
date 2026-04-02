import React from 'react';

interface GlowButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'gaming';
  disabled?: boolean;
}

export default function GlowButton({ children, href, onClick, className = '', type = 'button', variant = 'primary', disabled = false }: GlowButtonProps) {
  const buttonContent = (
    <>
      <div className="points_wrapper">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className="point" />
        ))}
      </div>
      <span className="inner">
        {children}
      </span>
    </>
  );

  const buttonClasses = `
    ${variant === 'secondary' ? 'button-secondary' : variant === 'gaming' ? 'button-gaming' : 'button'} relative inline-flex items-center justify-center 
    cursor-pointer overflow-hidden transition-all duration-300 ease-out
    active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}
  `.trim();

  if (href) {
    return (
      <a href={href} className={buttonClasses}>
        {buttonContent}
      </a>
    );
  }

  return (
    <button onClick={onClick} type={type} className={buttonClasses} disabled={disabled}>
      {buttonContent}
    </button>
  );
}
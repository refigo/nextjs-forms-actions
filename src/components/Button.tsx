import { ReactNode } from 'react';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Button({
  type = 'button',
  children,
  disabled = false,
  className = '',
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full py-3 px-4 bg-pink-500 text-white font-medium rounded-full 
      hover:bg-pink-600 active:bg-pink-700 transition-colors
      disabled:bg-pink-300 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

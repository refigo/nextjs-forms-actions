import { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react';

type ButtonProps<T extends ElementType = 'button'> = {
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  as?: T;
} & ComponentPropsWithoutRef<T>;

export default function Button<T extends ElementType = 'button'>({
  type = 'button',
  children,
  disabled = false,
  className = '',
  onClick,
  as,
  ...rest
}: ButtonProps<T>) {
  const Component = as || 'button';
  
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`w-full py-3 px-4 bg-pink-500 text-white font-medium rounded-full 
      hover:bg-pink-600 active:bg-pink-700 transition-colors
      disabled:bg-pink-300 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

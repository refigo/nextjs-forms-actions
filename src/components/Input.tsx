import { ReactNode } from 'react';

interface InputProps {
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export default function Input({
  name,
  type = 'text',
  placeholder,
  error,
  icon,
  disabled = false,
}: InputProps) {
  return (
    <div className="w-full mb-4">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full py-3 px-4 rounded-full border ${
            error ? 'border-red-500' : 'border-gray-200'
          } ${
            icon ? 'pl-10' : 'pl-4'
          } outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

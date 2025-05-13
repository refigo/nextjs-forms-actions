import { ReactNode, ChangeEvent } from 'react';

interface InputProps {
  name: string;
  id?: string; // id 속성 추가
  type?: string;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function Input({
  name,
  id,
  type = 'text',
  placeholder,
  error,
  icon,
  disabled = false,
  value,
  defaultValue,
  required = false,
  onChange,
  className = '',
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
          id={id || name}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          required={required}
          onChange={onChange}
          className={`w-full py-3 px-4 rounded-full border ${
            error ? 'border-red-500' : 'border-gray-200'
          } ${
            icon ? 'pl-10' : 'pl-4'
          } outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-black placeholder:text-gray-500 ${className}`}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

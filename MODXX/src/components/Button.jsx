import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl focus:ring-orange-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 focus:ring-gray-500',
    outline: 'border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white focus:ring-orange-500',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    default: 'px-4 py-2 text-sm rounded-lg gap-2',
    large: 'px-6 py-3 text-base rounded-lg gap-2'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-5 h-5'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          {children}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={iconSizes[size]} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={iconSizes[size]} />
          )}
        </>
      )}
    </motion.button>
  );
};

export default Button;
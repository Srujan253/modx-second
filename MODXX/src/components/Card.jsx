import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  hover = true,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-xl overflow-hidden transition-all duration-300';
  
  const variants = {
    default: 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50',
    solid: 'bg-gray-800 border border-gray-700',
    glass: 'bg-gray-800/40 backdrop-blur-xl border border-gray-700/30',
    gradient: 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50'
  };

  const hoverClasses = hover ? 'hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { y: -2, scale: 1.01 },
    whileTap: { scale: 0.99 }
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${clickableClasses} ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 pt-4 border-t border-gray-700/50 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
import React from 'react';

const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  fullWidth = false,
  children, 
  ...props 
}, ref) => {
  // Base button classes
  let buttonClasses = [
    'inline-flex items-center justify-center',
    'rounded-md text-sm font-medium',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    fullWidth ? 'w-full' : '',
  ];

  // Variant classes
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  // Size classes
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  // Add variant and size classes
  buttonClasses.push(variants[variant] || variants.default);
  buttonClasses.push(sizes[size] || sizes.default);

  // Add any custom classes
  if (className) {
    buttonClasses.push(className);
  }
  
  return (
    <button
      className={buttonClasses.join(' ').trim()}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };

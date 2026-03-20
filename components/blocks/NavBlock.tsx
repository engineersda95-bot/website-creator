'use client';

import React, { useState } from 'react';
import { NavView } from './NavView';

export const NavBlock: React.FC<any> = (props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <NavView 
      {...props} 
      isMenuOpen={isMenuOpen} 
      toggleMenu={() => setIsMenuOpen(!isMenuOpen)} 
    />
  );
};

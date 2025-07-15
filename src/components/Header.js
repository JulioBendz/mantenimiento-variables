import React from 'react';
import logo from '../assets/sika-logo.png';

function Header() {
  return (
    <header className="flex items-center justify-center mb-8 gap-8">
      <img
        src={logo}
        alt="Logo"
        className="h-24 w-24 object-contain"
      />
      <div className="flex flex-col items-start">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Mantenimiento de Variables
        </h1>
        <p className="text-gray-600">
          Gestiona variables numéricas y evalúa fórmulas matemáticas
        </p>
      </div>
    </header>
  );
}

export default Header;
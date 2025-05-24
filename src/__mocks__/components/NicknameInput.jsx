import React, { useState } from 'react';

const NicknameInput = () => {
  const [nickname, setNickname] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Sanitizar el input antes de usarlo
    const sanitizedNickname = nickname
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Guardar en cookie o donde sea necesario
    document.cookie = `nickname=${sanitizedNickname}`;
  };
  
  return (
    <form onSubmit={handleSubmit} role="form">
      <input 
        type="text" 
        placeholder="Ingresa tu nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <button type="submit">Guardar</button>
    </form>
  );
};

export default NicknameInput;
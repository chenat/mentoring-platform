import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './components/Lobby';
import CodeBlock from './components/CodeBlock';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/codeBlock/:blockId" element={<CodeBlock />} />
        <Route path="/" element={<Lobby />} />
      </Routes>
    </Router>
  );
};

export default App;

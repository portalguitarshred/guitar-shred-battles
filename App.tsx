import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './views/Home';
import BattleDetail from './views/BattleDetail';
import Upload from './views/Upload';
import Profile from './views/Profile';
import Rankings from './views/Rankings';
import Auth from './views/Auth';
import Regulation from './views/Regulation';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/battle/:id" element={<BattleDetail />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/regulation/:id" element={<Regulation />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;

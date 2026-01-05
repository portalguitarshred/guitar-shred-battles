
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './views/Home';
import BattleDetail from './views/BattleDetail';
import Upload from './views/Upload';
import Profile from './views/Profile';
import Rankings from './views/Rankings';
import Auth from './views/Auth';
import Regulation from './views/Regulation';
import { auth } from './lib/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any = null;

    const initSession = async () => {
      try {
        console.log("🎸 Arena v1.1.7 - Hybrid Session Sync Active");
        
        // Sempre tenta pegar a sessão atual (real ou mock)
        const { data } = await auth.getSession();
        if (data?.session) {
          setSession(data.session);
        }

        // Se inscreve para mudanças de estado (login/logout)
        const { data: subData } = auth.onAuthStateChange((_event, newSession) => {
          console.log("Arena Auth Change:", _event);
          setSession(newSession);
        });
        
        subscription = subData.subscription;
      } catch (e) {
        console.error("Erro na Arena:", e);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    return () => {
      if (subscription && subscription.unsubscribe) subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
         <div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
         <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 animate-pulse">Sincronizando Arena...</p>
         </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout user={session?.user}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/battle/:id" element={<BattleDetail />} />
          <Route 
            path="/upload" 
            element={session ? <Upload /> : <Navigate to="/auth?redirect=/upload" />} 
          />
          <Route 
            path="/profile" 
            element={session ? <Profile /> : <Navigate to="/auth?redirect=/profile" />} 
          />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/regulation/:id" element={<Regulation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;

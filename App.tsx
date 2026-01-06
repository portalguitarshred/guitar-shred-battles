import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Home from './views/Home.tsx';
import BattleDetail from './views/BattleDetail.tsx';
import Upload from './views/Upload.tsx';
import Profile from './views/Profile.tsx';
import Rankings from './views/Rankings.tsx';
import Auth from './views/Auth.tsx';
import Regulation from './views/Regulation.tsx';
import { auth } from './lib/supabase.ts';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any = null;

    const initSession = async () => {
      try {
        console.log("🎸 Arena v1.2.0 - Core Restored");
        
        const { data } = await auth.getSession();
        if (data?.session) {
          setSession(data.session);
        }

        const { data: subData } = auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession);
        });
        
        subscription = subData.subscription;
      } catch (e) {
        console.error("Arena Initialization Error:", e);
      } finally {
        setTimeout(() => setLoading(false), 300);
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

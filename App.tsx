import React from 'react';
import { GlobalProvider, useGlobalContext } from './context/GlobalContext';
import { RootNavigator } from './navigation/RootNavigator';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isLoading } = useGlobalContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-[#00FF9C]">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return <RootNavigator />;
};

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <AppContent />
    </GlobalProvider>
  );
};

export default App;
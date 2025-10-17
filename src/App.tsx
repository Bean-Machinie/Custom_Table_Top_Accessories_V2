import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EditorProvider } from './stores/EditorContext';
import { HomePage } from './pages/HomePage';
import { EditorPage } from './pages/EditorPage';
import { useEffect } from 'react';
import { assetStore } from './adapters/AssetStoreAdapter';

function App() {
  useEffect(() => {
    assetStore.ensureBucket().catch((error) => {
      console.error('Failed to ensure asset bucket:', error);
    });
  }, []);

  return (
    <BrowserRouter>
      <EditorProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor/:frameId" element={<EditorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </EditorProvider>
    </BrowserRouter>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { db } from '../adapters/DatabaseAdapter';
import { Document, Frame } from '@shared/types';

export function HomePage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [frames, setFrames] = useState<Record<string, Frame[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await db.listDocuments();
      setDocuments(docs);

      const framesMap: Record<string, Frame[]> = {};
      for (const doc of docs) {
        const docFrames = await db.listFrames(doc.id);
        framesMap[doc.id] = docFrames;
      }
      setFrames(framesMap);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const doc = await db.createDocument(
        import.meta.env.VITE_DEFAULT_PROJECT_NAME || 'New Document'
      );

      const frame = await db.createFrame(doc.id, {
        name: 'Frame 1',
        width: 1920,
        height: 1080,
        dpi: 300,
        baseColor: '#FFFFFF',
      });

      navigate(`/editor/${frame.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
      alert('Failed to create document');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border bg-surface px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text">
            {import.meta.env.VITE_DEFAULT_PROJECT_NAME || 'Bean Machine'}
          </h1>
          <Button variant="primary" onClick={handleCreateDocument}>
            New Document
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {documents.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold text-text mb-2">
                No documents yet
              </h2>
              <p className="text-text-secondary mb-6">
                Create your first document to get started
              </p>
              <Button variant="primary" onClick={handleCreateDocument}>
                Create Document
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-surface border border-border rounded-token-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-text mb-1">
                        {doc.name}
                      </h2>
                      <p className="text-sm text-text-muted">
                        Updated {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {frames[doc.id] && frames[doc.id].length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {frames[doc.id].map((frame) => (
                        <button
                          key={frame.id}
                          onClick={() => navigate(`/editor/${frame.id}`)}
                          className="group aspect-video bg-background border border-border rounded-token-md overflow-hidden hover:border-primary transition-colors"
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <div className="text-sm font-medium text-text mb-1 truncate w-full text-center">
                              {frame.name}
                            </div>
                            <div className="text-xs text-text-muted">
                              {frame.width} × {frame.height}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">No frames</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

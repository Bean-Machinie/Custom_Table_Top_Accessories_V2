import { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { Frame, Layer, Viewport } from '@shared/types';
import { db } from '../adapters/DatabaseAdapter';

interface EditorState {
  currentFrame: Frame | null;
  layers: Layer[];
  selectedLayerId: string | null;
  viewport: Viewport;
  isDirty: boolean;
  isLoading: boolean;
}

type EditorAction =
  | { type: 'SET_FRAME'; payload: Frame }
  | { type: 'SET_LAYERS'; payload: Layer[] }
  | { type: 'ADD_LAYER'; payload: Layer }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<Layer> } }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'REORDER_LAYERS'; payload: Layer[] }
  | { type: 'SELECT_LAYER'; payload: string | null }
  | { type: 'SET_VIEWPORT'; payload: Viewport }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

const initialState: EditorState = {
  currentFrame: null,
  layers: [],
  selectedLayerId: null,
  viewport: { zoom: 1, panX: 0, panY: 0 },
  isDirty: false,
  isLoading: false,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_FRAME':
      return { ...state, currentFrame: action.payload };

    case 'SET_LAYERS':
      return { ...state, layers: action.payload };

    case 'ADD_LAYER':
      return {
        ...state,
        layers: [...state.layers, action.payload],
        isDirty: true,
      };

    case 'UPDATE_LAYER':
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === action.payload.id
            ? { ...layer, ...action.payload.updates }
            : layer
        ),
        isDirty: true,
      };

    case 'DELETE_LAYER':
      return {
        ...state,
        layers: state.layers.filter((layer) => layer.id !== action.payload),
        selectedLayerId:
          state.selectedLayerId === action.payload ? null : state.selectedLayerId,
        isDirty: true,
      };

    case 'REORDER_LAYERS':
      return {
        ...state,
        layers: action.payload,
        isDirty: true,
      };

    case 'SELECT_LAYER':
      return { ...state, selectedLayerId: action.payload };

    case 'SET_VIEWPORT':
      return { ...state, viewport: action.payload };

    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface EditorContextValue extends EditorState {
  dispatch: React.Dispatch<EditorAction>;
  loadFrame: (frameId: string) => Promise<void>;
  saveFrame: () => Promise<void>;
  addLayer: (layer: Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => Promise<void>;
  reorderLayers: (layers: Layer[]) => void;
  selectLayer: (id: string | null) => void;
  setViewport: (viewport: Viewport) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const loadFrame = useCallback(async (frameId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const frame = await db.getFrame(frameId);
      if (!frame) throw new Error('Frame not found');

      const layers = await db.listLayers(frameId);

      dispatch({ type: 'SET_FRAME', payload: frame });
      dispatch({ type: 'SET_LAYERS', payload: layers });
      dispatch({
        type: 'SET_VIEWPORT',
        payload: {
          zoom: frame.viewportZoom,
          panX: frame.viewportPanX,
          panY: frame.viewportPanY,
        },
      });
      dispatch({ type: 'SET_DIRTY', payload: false });
    } catch (error) {
      console.error('Failed to load frame:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const saveFrame = useCallback(async () => {
    if (!state.currentFrame || !state.isDirty) return;

    try {
      await db.updateFrame(state.currentFrame.id, {
        viewportZoom: state.viewport.zoom,
        viewportPanX: state.viewport.panX,
        viewportPanY: state.viewport.panY,
      });

      dispatch({ type: 'SET_DIRTY', payload: false });
    } catch (error) {
      console.error('Failed to save frame:', error);
      throw error;
    }
  }, [state.currentFrame, state.viewport, state.isDirty]);

  const addLayer = useCallback((layer: Layer) => {
    dispatch({ type: 'ADD_LAYER', payload: layer });
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    dispatch({ type: 'UPDATE_LAYER', payload: { id, updates } });
  }, []);

  const deleteLayer = useCallback(async (id: string) => {
    try {
      await db.deleteLayer(id);
      dispatch({ type: 'DELETE_LAYER', payload: id });
    } catch (error) {
      console.error('Failed to delete layer:', error);
      throw error;
    }
  }, []);

  const reorderLayers = useCallback((layers: Layer[]) => {
    dispatch({ type: 'REORDER_LAYERS', payload: layers });
  }, []);

  const selectLayer = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_LAYER', payload: id });
  }, []);

  const setViewport = useCallback((viewport: Viewport) => {
    dispatch({ type: 'SET_VIEWPORT', payload: viewport });
    dispatch({ type: 'SET_DIRTY', payload: true });
  }, []);

  useEffect(() => {
    if (!state.isDirty) return;

    const timeoutId = setTimeout(() => {
      saveFrame().catch((error) => {
        console.error('Autosave failed:', error);
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [state.isDirty, saveFrame]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.isDirty) {
        saveFrame().catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty, saveFrame]);

  const value: EditorContextValue = {
    ...state,
    dispatch,
    loadFrame,
    saveFrame,
    addLayer,
    updateLayer,
    deleteLayer,
    reorderLayers,
    selectLayer,
    setViewport,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}

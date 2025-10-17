export type LayerType = 'base' | 'image' | 'text' | 'shape';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay';

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface Layer {
  id: string;
  frameId: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  orderIndex: number;
  assetUrl?: string;
  transform: Transform;
  opacity: number;
  blendMode: BlendMode;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Frame {
  id: string;
  documentId: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  baseColor: string;
  paperColor?: string;
  viewportZoom: number;
  viewportPanX: number;
  viewportPanY: number;
  createdAt: string;
  updatedAt: string;
  orderIndex: number;
  layers?: Layer[];
}

export interface Document {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  frames?: Frame[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface CreateFrameOptions {
  width: number;
  height: number;
  dpi: number;
  baseColor: string;
  paperColor?: string;
  name?: string;
}

export interface CreateLayerOptions {
  type: LayerType;
  name?: string;
  assetUrl?: string;
  transform?: Partial<Transform>;
}

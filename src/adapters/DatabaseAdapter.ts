import { Document, Frame, Layer, CreateFrameOptions, CreateLayerOptions } from '@shared/types';
import { supabase } from '../lib/supabase';

export class DatabaseAdapter {
  async createDocument(name: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert({ name })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create document');

    return this.mapDocument(data);
  }

  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return this.mapDocument(data);
  }

  async listDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapDocument);
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        name: updates.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update document');

    return this.mapDocument(data);
  }

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
  }

  async createFrame(documentId: string, options: CreateFrameOptions): Promise<Frame> {
    const maxOrderResult = await supabase
      .from('frames')
      .select('order_index')
      .eq('document_id', documentId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrderResult.data?.order_index ?? -1) + 1;

    const { data, error } = await supabase
      .from('frames')
      .insert({
        document_id: documentId,
        name: options.name || 'Untitled Frame',
        width: options.width,
        height: options.height,
        dpi: options.dpi,
        base_color: options.baseColor,
        paper_color: options.paperColor,
        order_index: nextOrder,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create frame');

    const frame = this.mapFrame(data);

    const baseLayer = await this.createLayer(frame.id, {
      type: 'base',
      name: 'Base Canvas',
      transform: { x: 0, y: 0, width: options.width, height: options.height },
    });

    await supabase
      .from('layers')
      .update({ locked: true, order_index: 0 })
      .eq('id', baseLayer.id);

    return frame;
  }

  async getFrame(id: string): Promise<Frame | null> {
    const { data, error } = await supabase
      .from('frames')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return this.mapFrame(data);
  }

  async listFrames(documentId: string): Promise<Frame[]> {
    const { data, error } = await supabase
      .from('frames')
      .select('*')
      .eq('document_id', documentId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapFrame);
  }

  async updateFrame(id: string, updates: Partial<Frame>): Promise<Frame> {
    const { data, error } = await supabase
      .from('frames')
      .update({
        name: updates.name,
        viewport_zoom: updates.viewportZoom,
        viewport_pan_x: updates.viewportPanX,
        viewport_pan_y: updates.viewportPanY,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update frame');

    return this.mapFrame(data);
  }

  async deleteFrame(id: string): Promise<void> {
    const { error } = await supabase.from('frames').delete().eq('id', id);
    if (error) throw error;
  }

  async createLayer(frameId: string, options: CreateLayerOptions): Promise<Layer> {
    const maxOrderResult = await supabase
      .from('layers')
      .select('order_index')
      .eq('frame_id', frameId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrderResult.data?.order_index ?? -1) + 1;

    const { data, error } = await supabase
      .from('layers')
      .insert({
        frame_id: frameId,
        type: options.type,
        name: options.name || 'Layer',
        asset_url: options.assetUrl,
        transform_x: options.transform?.x ?? 0,
        transform_y: options.transform?.y ?? 0,
        transform_width: options.transform?.width ?? 100,
        transform_height: options.transform?.height ?? 100,
        transform_rotation: options.transform?.rotation ?? 0,
        transform_scale_x: options.transform?.scaleX ?? 1,
        transform_scale_y: options.transform?.scaleY ?? 1,
        order_index: nextOrder,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create layer');

    return this.mapLayer(data);
  }

  async listLayers(frameId: string): Promise<Layer[]> {
    const { data, error } = await supabase
      .from('layers')
      .select('*')
      .eq('frame_id', frameId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapLayer);
  }

  async updateLayer(id: string, updates: Partial<Layer>): Promise<Layer> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.visible !== undefined) updateData.visible = updates.visible;
    if (updates.locked !== undefined) updateData.locked = updates.locked;
    if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;
    if (updates.opacity !== undefined) updateData.opacity = updates.opacity;

    if (updates.transform) {
      if (updates.transform.x !== undefined) updateData.transform_x = updates.transform.x;
      if (updates.transform.y !== undefined) updateData.transform_y = updates.transform.y;
      if (updates.transform.width !== undefined) updateData.transform_width = updates.transform.width;
      if (updates.transform.height !== undefined) updateData.transform_height = updates.transform.height;
      if (updates.transform.rotation !== undefined) updateData.transform_rotation = updates.transform.rotation;
      if (updates.transform.scaleX !== undefined) updateData.transform_scale_x = updates.transform.scaleX;
      if (updates.transform.scaleY !== undefined) updateData.transform_scale_y = updates.transform.scaleY;
    }

    const { data, error } = await supabase
      .from('layers')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to update layer');

    return this.mapLayer(data);
  }

  async deleteLayer(id: string): Promise<void> {
    const { error } = await supabase.from('layers').delete().eq('id', id);
    if (error) throw error;
  }

  async reorderLayers(frameId: string, layerIds: string[]): Promise<void> {
    for (let i = 0; i < layerIds.length; i++) {
      await supabase
        .from('layers')
        .update({ order_index: i })
        .eq('id', layerIds[i])
        .eq('frame_id', frameId);
    }
  }

  private mapDocument(data: any): Document {
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      revision: data.revision,
    };
  }

  private mapFrame(data: any): Frame {
    return {
      id: data.id,
      documentId: data.document_id,
      name: data.name,
      width: data.width,
      height: data.height,
      dpi: data.dpi,
      baseColor: data.base_color,
      paperColor: data.paper_color,
      viewportZoom: data.viewport_zoom,
      viewportPanX: data.viewport_pan_x,
      viewportPanY: data.viewport_pan_y,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      orderIndex: data.order_index,
    };
  }

  private mapLayer(data: any): Layer {
    return {
      id: data.id,
      frameId: data.frame_id,
      type: data.type,
      name: data.name,
      visible: data.visible,
      locked: data.locked,
      orderIndex: data.order_index,
      assetUrl: data.asset_url,
      transform: {
        x: data.transform_x,
        y: data.transform_y,
        width: data.transform_width,
        height: data.transform_height,
        rotation: data.transform_rotation,
        scaleX: data.transform_scale_x,
        scaleY: data.transform_scale_y,
      },
      opacity: data.opacity,
      blendMode: data.blend_mode,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const db = new DatabaseAdapter();

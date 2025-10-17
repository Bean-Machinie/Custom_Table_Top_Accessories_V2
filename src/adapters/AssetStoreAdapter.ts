import { supabase } from '../lib/supabase';

export class AssetStoreAdapter {
  private bucketName: string;

  constructor() {
    this.bucketName = import.meta.env.VITE_SUPABASE_BUCKET || 'assets';
  }

  async uploadAsset(file: File, path?: string): Promise<string> {
    const fileName = path || `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async deleteAsset(url: string): Promise<void> {
    const path = this.extractPathFromUrl(url);
    if (!path) return;

    const { error } = await supabase.storage.from(this.bucketName).remove([path]);

    if (error) throw error;
  }

  async getAssetUrl(path: string): Promise<string> {
    const { data } = supabase.storage.from(this.bucketName).getPublicUrl(path);
    return data.publicUrl;
  }

  private extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
      return pathMatch ? pathMatch[1] : null;
    } catch {
      return null;
    }
  }

  async ensureBucket(): Promise<void> {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === this.bucketName);

    if (!exists) {
      const { error } = await supabase.storage.createBucket(this.bucketName, {
        public: true,
        fileSizeLimit: 52428800,
      });

      if (error && !error.message.includes('already exists')) {
        throw error;
      }
    }
  }
}

export const assetStore = new AssetStoreAdapter();

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Upload, Image as ImageIcon, Video, Sparkles, Eye } from "lucide-react";

export const BackgroundManager = () => {
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    const { data, error } = await supabase
      .from('backgrounds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error fetching backgrounds",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setBackgrounds(data || []);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('backgrounds')
        .insert([
          {
            url: publicUrl,
            is_video: file.type.startsWith('video/')
          }
        ]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Background uploaded successfully",
      });

      fetchBackgrounds();
    } catch (error: any) {
      toast({
        title: "Error uploading background",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('backgrounds')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Delete from storage
      const filePath = url.split('/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('backgrounds')
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      toast({
        title: "Success",
        description: "Background deleted successfully",
      });

      fetchBackgrounds();
    } catch (error: any) {
      toast({
        title: "Error deleting background",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 font-noto">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/90 via-cyan-600/90 to-teal-600/90 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <Sparkles className="h-5 w-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{backgrounds.length}</div>
            <div className="text-sm text-white/80 font-medium">전체 미디어</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/90 via-blue-600/90 to-blue-700/90 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <Eye className="h-5 w-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {backgrounds.filter(bg => !bg.is_video).length}
            </div>
            <div className="text-sm text-white/80 font-medium">이미지</div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/90 via-emerald-600/90 to-emerald-700/90 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Video className="h-6 w-6 text-white" />
              </div>
              <Eye className="h-5 w-5 text-white/60" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {backgrounds.filter(bg => bg.is_video).length}
            </div>
            <div className="text-sm text-white/80 font-medium">동영상</div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/95 via-card/90 to-card/85 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">새 배경 업로드</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1 bg-background/80 border-border/50 focus:border-primary/50 transition-all cursor-pointer"
            />
            <Button 
              disabled={uploading}
              className="bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all min-w-[140px]"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? '업로드 중...' : '업로드'}
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backgrounds.map((bg, index) => (
          <div 
            key={bg.id} 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/95 via-card/90 to-card/85 border border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative aspect-video">
              {bg.is_video ? (
                <>
                  <video
                    src={bg.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-lg shadow-lg">
                    <Video className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">동영상</span>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={bg.url}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-blue-500/90 backdrop-blur-sm rounded-lg shadow-lg">
                    <ImageIcon className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-semibold text-white">이미지</span>
                  </div>
                </>
              )}
              
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm shadow-xl"
                onClick={() => handleDelete(bg.id, bg.url)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {backgrounds.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">업로드된 배경이 없습니다</p>
        </div>
      )}
    </div>
  );
};

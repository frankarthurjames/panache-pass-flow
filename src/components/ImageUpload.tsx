import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export const ImageUpload = ({ value = [], onChange, maxImages = 5, label = "Images" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxImages - value.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast.error(`Vous pouvez télécharger maximum ${maxImages} images`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image valide`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} est trop volumineux (max 10MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast.error(`Erreur lors de l'upload de ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
        
        // Update progress
        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) téléchargée(s) avec succès`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">
          Téléchargez jusqu'à {maxImages} images (JPG, PNG, WebP - max 10MB chacune)
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  <img
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-32 border-2 border-dashed"
          >
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span>Téléchargement...</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <div className="font-medium">Cliquez pour télécharger des images</div>
                    <div className="text-sm text-muted-foreground">
                      ou glissez-déposez vos fichiers ici
                    </div>
                  </div>
                </>
              )}
            </div>
          </Button>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {Math.round(uploadProgress)}% terminé
              </p>
            </div>
          )}
        </div>
      )}

      {value.length === 0 && !uploading && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune image téléchargée</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
    if (!files) {
      console.log('ImageUpload: No files selected');
      return;
    }

    console.log(`ImageUpload: ${files.length} file(s) selected, current images: ${value.length}/${maxImages}`);

    const remainingSlots = maxImages - value.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast.error(`Vous pouvez télécharger maximum ${maxImages} images`);
      return;
    }

    if (filesToUpload.length < files.length) {
      toast.warning(`Seuls ${filesToUpload.length} fichier(s) sur ${files.length} seront uploadés (limite: ${maxImages})`);
    }

    console.log(`ImageUpload: Uploading ${filesToUpload.length} file(s)`);
    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        console.log(`ImageUpload: Processing file ${i + 1}/${filesToUpload.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error(`ImageUpload: Invalid file type: ${file.type}`);
          toast.error(`${file.name} n'est pas une image valide`);
          errorCount++;
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.error(`ImageUpload: File too large: ${file.size} bytes`);
          toast.error(`${file.name} est trop volumineux (max 10MB)`);
          errorCount++;
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        console.log(`ImageUpload: Uploading to Supabase storage: ${fileName}`);
        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(fileName, file);

        if (error) {
          console.error('ImageUpload: Supabase upload error:', error);
          toast.error(`Erreur lors de l'upload de ${file.name}: ${error.message}`);
          errorCount++;
          continue;
        }

        console.log('ImageUpload: Upload successful:', data);
        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(data.path);

        console.log('ImageUpload: Public URL generated:', urlData.publicUrl);
        uploadedUrls.push(urlData.publicUrl);
        successCount++;

        // Update progress
        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
      }

      if (uploadedUrls.length > 0) {
        console.log(`ImageUpload: Adding ${uploadedUrls.length} new images to existing ${value.length} images`);
        const newImages = [...value, ...uploadedUrls];
        onChange(newImages);
        toast.success(`${uploadedUrls.length} image(s) téléchargée(s) avec succès`);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} fichier(s) n'ont pas pu être uploadés`);
      }

      console.log(`ImageUpload: Upload completed - Success: ${successCount}, Errors: ${errorCount}`);
    } catch (error) {
      console.error('ImageUpload: Unexpected error:', error);
      toast.error("Erreur inattendue lors du téléchargement");
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

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const newImages = [...value];
    const [primaryImage] = newImages.splice(index, 1);
    newImages.unshift(primaryImage);
    onChange(newImages);
    toast.success("Image définie comme principale (bannière)");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">
          Téléchargez jusqu'à {maxImages} images. La première sera utilisée comme bannière.
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageUrl, index) => (
            <Card key={index} className={cn(
              "relative group overflow-hidden border-2 transition-all",
              index === 0 ? "border-orange-500 ring-2 ring-orange-500/20" : "border-transparent"
            )}>
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  <img
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      PRINCIPALE
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index !== 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-6 px-2 text-[10px] font-medium"
                        onClick={() => setAsPrimary(index)}
                      >
                        Mettre en 1er
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
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
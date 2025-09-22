import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EventLikeButtonProps {
  eventId: string;
  className?: string;
}

export const EventLikeButton = ({ eventId, className = "" }: EventLikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Charger le statut du like et le nombre total de likes
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        // Charger le nombre total de likes
        const { count } = await supabase
          .from('event_likes')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId);

        setLikesCount(count || 0);

        // Si l'utilisateur est connecté, vérifier s'il a liké
        if (user) {
          const { data } = await supabase
            .from('event_likes')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', user.id)
            .single();

          setIsLiked(!!data);
        }
      } catch (error) {
        console.error('Error loading like status:', error);
      }
    };

    if (eventId) {
      loadLikeStatus();
    }
  }, [eventId, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      // Rediriger vers la page de connexion
      window.location.href = '/auth';
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // Retirer le like
        const { error } = await supabase
          .from('event_likes')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Ajouter le like
        const { error } = await supabase
          .from('event_likes')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 h-8 px-3 hover:bg-red-50 hover:text-red-600 transition-colors ${className}`}
    >
      <Heart 
        className={`w-4 h-4 transition-colors ${
          isLiked 
            ? "fill-red-500 text-red-500" 
            : "text-muted-foreground"
        }`} 
      />
      <span className="text-sm font-medium">
        {likesCount}
      </span>
    </Button>
  );
};
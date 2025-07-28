import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClearCacheButton() {
  const { toast } = useToast();

  const handleClearCache = async () => {
    try {
      // Clear all browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Cache Cleared",
        description: "Browser cache cleared. The page will reload now.",
      });
      
      // Force hard reload after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache. Try refreshing manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleClearCache}
      className="text-orange-600 border-orange-200 hover:bg-orange-50"
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      Clear Cache & Reload
    </Button>
  );
}

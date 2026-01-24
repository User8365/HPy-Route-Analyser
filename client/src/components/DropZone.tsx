import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function DropZone({ onFileSelect, isLoading }: DropZoneProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Detect iOS on mount
  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Clear previous error
    setError(null);
    
    // Handle rejected files (wrong type)
    if (rejectedFiles && rejectedFiles.length > 0) {
      setError("Erreur : veuillez selectionner un fichier GPX issu de VRzen !");
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Additional validation for iOS - check file extension
      if (file.name.toLowerCase().endsWith('.gpx')) {
        onFileSelect(file);
      } else {
        setError("Erreur : veuillez selectionner un fichier GPX issu de VRzen !");
      }
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setError(null);
      if (file.name.toLowerCase().endsWith('.gpx')) {
        onFileSelect(file);
      } else {
        setError("Erreur : veuillez selectionner un fichier GPX issu de VRzen !");
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/gpx+xml': ['.gpx'],
    },
    multiple: false,
    disabled: isLoading,
    // iOS specific fixes
    noClick: false,
    noKeyboard: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        "rounded-3xl border-2 border-dashed p-6 sm:p-8 md:p-12 lg:p-16 text-center",
        isDragActive 
          ? "border-[#00f2ff] bg-[#00f2ff]/5 scale-[0.99]" 
          : "border-white/10 hover:border-[#00f2ff]/50 bg-white/[0.02] hover:bg-white/[0.04]",
        isLoading && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
    >
      {/* iOS fallback input */}
      {isIOS && (
        <input
          type="file"
          accept=".gpx"
          onChange={handleFileChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      )}
      
      {/* Standard react-dropzone input for non-iOS */}
      {!isIOS && <input {...getInputProps()} />}
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#00f2ff] animate-spin" />
            <p className="text-base sm:text-lg font-medium text-white">Analyse en cours...</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Extraction des données de performance</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#00f2ff]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {isDragActive ? (
                <FileUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#00f2ff] animate-bounce" />
              ) : (
                <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#00f2ff]" />
              )}
            </div>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-base sm:text-lg md:text-xl font-semibold text-white">
                {isDragActive ? "Déposez le fichier" : "Déposez votre fichier GPX ici ou Cliquez sur Parcourir"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-sm mx-auto">
                Supporte les exports VRzen.
              </p>
            </div>
            
            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground/60">
              <span className="px-2 py-1 rounded border border-white/5 bg-white/[0.02]">GPX ONLY</span>
              <span className="px-2 py-1 rounded border border-white/5 bg-white/[0.02]">MAX 10MB</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

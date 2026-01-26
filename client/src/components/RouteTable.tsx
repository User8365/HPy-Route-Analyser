
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { type RoutePoint } from "@shared/schema";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RouteTableProps {
  points: RoutePoint[];
}

export function RouteTable({ points }: RouteTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displayPoints = isExpanded ? points : points.slice(0, 5);
  const hasMorePoints = points.length > 5;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 text-[#00f2ff]" />
        <h2 className="text-xl font-bold text-white">Analyse de la route</h2>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#0d1526]/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">HDG</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">TWA</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">Voile</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">SOG</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">Statut Foils</TableHead>
                <TableHead className="text-right text-muted-foreground font-semibold text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">TWS</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {displayPoints.map((point, index) => (
              <TableRow 
                key={index} 
                className={cn(
                  "border-white/5 hover:bg-white/[0.03] transition-colors font-mono text-sm",
                  point.isFoils100 && "bg-[#00f2ff]/5 border-l-2 border-l-[#00f2ff]"
                )}
              >
                <TableCell className="font-medium text-foreground text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">{point.hdg}°</TableCell>
                <TableCell className={cn("text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2", parseInt(point.twa) < 0 ? "text-[#ff00ff]" : "text-[#00f2ff]")}>
                  {point.twa}°
                </TableCell>
                <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">
                  <span className="px-1 sm:px-2 py-0.5 sm:py-1 rounded-md bg-white/5 text-[8px] sm:text-[10px] text-muted-foreground border border-white/10 uppercase tracking-wider">
                    {point.sail}
                  </span>
                </TableCell>
                <TableCell className="text-[#3b82f6] font-bold text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">{point.sog} kt</TableCell>
                <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">
                  {point.isFoils100 ? (
                    <span className="text-[#00f2ff] flex items-center gap-1 font-bold text-[10px] sm:text-sm">🚀 100%</span>
                  ) : point.isFoilsActive ? (
                    <span className="text-[#3b82f6] flex items-center gap-1 text-[10px] sm:text-sm">✅ Actif</span>
                  ) : (
                    <span className="text-muted-foreground/50 flex items-center gap-1 italic text-[9px] sm:text-xs">❌ Inactif</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-[10px] sm:text-sm whitespace-nowrap px-1 sm:px-3 py-2">{point.tws} kt</TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
        
        {hasMorePoints && (
          <div className="border-t border-white/5 p-3 sm:p-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs sm:text-sm text-muted-foreground hover:text-foreground border border-white/10"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Afficher moins
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Afficher plus ({points.length - 5} lignes)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

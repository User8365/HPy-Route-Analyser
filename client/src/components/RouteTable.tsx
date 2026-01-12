
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
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface RouteTableProps {
  points: RoutePoint[];
}

export function RouteTable({ points }: RouteTableProps) {
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
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">HDG</TableHead>
              <TableHead className="text-muted-foreground font-semibold">TWA</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Voile</TableHead>
              <TableHead className="text-muted-foreground font-semibold">SOG</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Statut Foils</TableHead>
              <TableHead className="text-right text-muted-foreground font-semibold">TWS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {points.map((point, index) => (
              <TableRow 
                key={index} 
                className={cn(
                  "border-white/5 hover:bg-white/[0.03] transition-colors font-mono text-sm",
                  point.isFoils100 && "bg-[#00f2ff]/5 border-l-2 border-l-[#00f2ff]"
                )}
              >
                <TableCell className="font-medium text-foreground">{point.hdg}°</TableCell>
                <TableCell className={parseInt(point.twa) < 0 ? "text-[#ff00ff]" : "text-[#00f2ff]"}>
                  {point.twa}°
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-muted-foreground border border-white/10 uppercase tracking-wider">
                    {point.sail}
                  </span>
                </TableCell>
                <TableCell className="text-[#3b82f6] font-bold">{point.sog} kt</TableCell>
                <TableCell>
                  {point.isFoils100 ? (
                    <span className="text-[#00f2ff] flex items-center gap-1 font-bold">🚀 100%</span>
                  ) : point.isFoilsActive ? (
                    <span className="text-[#3b82f6] flex items-center gap-1">✅ Actif</span>
                  ) : (
                    <span className="text-muted-foreground/50 flex items-center gap-1 italic text-xs">❌ Inactif</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{point.tws} kt</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

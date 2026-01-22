
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DropZone } from "@/components/DropZone";
import { RouteTable } from "@/components/RouteTable";
import { type RoutePoint, type AnalysisStats } from "@shared/schema";
import { motion } from "framer-motion";
import { Clock, Settings, Zap, BarChart2, ShieldCheck, PieChart, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { analyzeGPX } from "@/lib/analyzer";
import hpyLogo from "@assets/hpyanalyserlogo_1768213210318.jpeg";

export default function Home() {
  const [data, setData] = useState<{ points: RoutePoint[], stats: AnalysisStats | null }>({ points: [], stats: null });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") return;

      setIsLoading(true);
      try {
        const result = await analyzeGPX({
          fileName: file.name,
          fileContent: text,
        });
        
        setData({ points: result.points, stats: result.stats });
        toast({ title: "Analyse terminée", description: "Le fichier GPX a été traité avec succès." });
      } catch (error) {
        console.error("Erreur d'analyse:", error);
        toast({ variant: "destructive", title: "Échec", description: "Impossible d'analyser le fichier. Assurez-vous que le fichier est bien de type GPX et qu'il est bien issu de VRzen" });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const chartData = data.points.map(p => ({
    time: new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    SOG: p.sog,
    TWS: p.tws
  })).filter((_, i) => i % 5 === 0);

  const barColors = ['#00f2ff', '#00f2ff', '#ff00ff', '#ff00ff', '#3b82f6'];

  const getPrioritySail = (stats: AnalysisStats) => {
    if (!stats.paidSailStats || stats.paidSailStats.length === 0) return null;
    const sorted = [...stats.paidSailStats].sort((a, b) => b.usagePercent - a.usagePercent);
    if (sorted[0].usagePercent === 0) return null;
    return sorted[0];
  };

  const prioritySail = data.stats ? getPrioritySail(data.stats) : null;

  return (
    <div className="min-h-screen bg-[#050b18] text-[#e2e8f0] font-sans overflow-x-hidden">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <header className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-8 md:mb-12 text-center sm:text-left">
          <div className="w-20 h-20 sm:w-24 sm:h-24 max-w-[150px] rounded-2xl overflow-hidden border-2 border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,242,255,0.2)]">
            <img src={hpyLogo} alt="HPy Team Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">HPy - Analyseur de course</h1>
            <p className="text-sm md:text-base text-muted-foreground">Outil d'analyse pour Virtual Regatta</p>
          </div>
        </header>

        <DropZone onFileSelect={handleFileSelect} isLoading={isLoading} />

        {data.stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 md:mt-12 space-y-8 md:space-y-12">
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Card className="flex-1 min-w-[200px] bg-[#0d1526]/80 border-[#00f2ff]/10 shadow-[0_0_15px_rgba(0,242,255,0.05)]">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Durée Totale</CardTitle>
                  <Clock className="w-4 h-4 text-[#00f2ff]" />
                </CardHeader>
                <CardContent><div className="text-xl md:text-2xl font-bold">{data.stats.totalDuration}</div></CardContent>
              </Card>
              <Card className="flex-1 min-w-[200px] bg-[#0d1526]/80 border-[#ff00ff]/10">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Manœuvres</CardTitle>
                  <Settings className="w-4 h-4 text-[#ff00ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{data.stats.sailChanges + data.stats.gybeTackCount}</div>
                  <p className="text-[10px] text-muted-foreground">{data.stats.sailChanges} V / {data.stats.gybeTackCount} A</p>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[200px] bg-[#0d1526]/80 border-[#00f2ff]/10">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">% Foils</CardTitle>
                  <Zap className="w-4 h-4 text-[#00f2ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-[#00f2ff]">{data.stats.percentFoils100}%</div>
                  <p className="text-[10px] text-muted-foreground">du temps à 100%</p>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[200px] bg-[#0d1526]/80 border-[#3b82f6]/10">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Gain Temps avec Foils</CardTitle>
                  <Zap className="w-4 h-4 text-[#3b82f6]" />
                </CardHeader>
                <CardContent><div className="text-xl md:text-2xl font-bold">{data.stats.totalFoilTimeSaved}</div></CardContent>
              </Card>
              <Card className="flex-1 min-w-[200px] bg-[#0d1526]/80 border-[#ff00ff]/10 shadow-[0_0_15px_rgba(255,0,255,0.05)]">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Voile Prioritaire</CardTitle>
                  <Star className="w-4 h-4 text-[#ff00ff]" />
                </CardHeader>
                <CardContent>
                  <div className={cn("text-xl md:text-2xl font-bold truncate", prioritySail ? "text-[#ff00ff]" : "text-muted-foreground")}>
                    {prioritySail ? prioritySail.name : "Voiles Standard"}
                  </div>
                  {prioritySail && <p className="text-[10px] text-muted-foreground">{prioritySail.usagePercent}% d'utilisation</p>}
                </CardContent>
              </Card>
            </div>

            <section className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white px-2">
                <ShieldCheck className="w-6 h-6 text-[#00f2ff]" /> Aide au choix de l'équipement
              </h2>
              <div className="flex flex-wrap lg:flex-nowrap gap-6 md:gap-8">
                <Card className="w-full lg:w-1/2 bg-[#0d1526]/80 border-white/5 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-md flex items-center gap-2"><PieChart className="w-5 h-5 text-[#ff00ff]" /> Rentabilité des options</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-muted-foreground">Nom de Voile</TableHead>
                          <TableHead className="text-muted-foreground text-center">% Utilisation</TableHead>
                          <TableHead className="text-muted-foreground text-right">% Temps sous Foils</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.stats.paidSailStats.map((sail: any, i) => {
                          const isCode0 = sail.name && sail.name.trim().toLowerCase() === "code 0";
                          let categoryColor;
                          if (isCode0) {
                            categoryColor = "border-l-[#fbbf24]";
                          } else if (i < 2) {
                            categoryColor = "border-l-[#00f2ff]";
                          } else if (i < 4) {
                            categoryColor = "border-l-[#ff00ff]";
                          } else {
                            categoryColor = "border-l-[#3b82f6]";
                          }
                          console.log(`Sail: "${sail.name}", isCode0: ${isCode0}, color: ${categoryColor}`);
                          return (
                            <TableRow 
                              key={i} 
                              className={cn(
                                "border-white/5 transition-colors border-l-2",
                                categoryColor,
                                sail.usagePercent === 0 ? "opacity-30 grayscale" : "bg-white/[0.02]"
                              )}
                            >
                              <TableCell className={cn("font-medium", sail.usagePercent > 0 ? "text-white" : "text-foreground")}>
                                <div className="text-sm">{sail.name}</div>
                                <div className="text-[9px] text-muted-foreground uppercase tracking-tighter opacity-70">
                                  {sail.category}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-bold", 
                                  sail.usagePercent > 0 ? "bg-[#00f2ff]/20 text-[#00f2ff]" : "bg-white/5 text-muted-foreground"
                                )}>
                                  {sail.usagePercent}%
                                </span>
                              </TableCell>
                              <TableCell className={cn("text-right font-mono text-xs", sail.foilTimePercent > 0 ? "text-[#ff00ff]" : "text-muted-foreground")}>
                                {sail.foilTimePercent}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="w-full lg:w-1/2 bg-[#0d1526]/80 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-md flex items-center gap-2"><BarChart2 className="w-5 h-5 text-[#3b82f6]" /> Répartition du Temps (min)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] md:h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={data.stats.paidSailStats} margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                          <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis dataKey="name" type="category" stroke="#e2e8f0" fontSize={10} tickLine={false} axisLine={false} width={80} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0d1526', borderColor: '#ffffff10' }} 
                            cursor={{ fill: '#ffffff05' }}
                          />
                          <Bar dataKey="totalTimeMinutes" name="Temps (min)" radius={[0, 4, 4, 0]}>
                            {data.stats.paidSailStats.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} fillOpacity={0.8} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Card className="bg-[#0d1526]/80 border-white/5 p-4 md:p-6 overflow-hidden">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex items-center gap-2"><BarChart2 className="w-5 h-5 text-[#00f2ff]" /> Vitesse & Vent</CardTitle>
              </CardHeader>
              <div className="h-[250px] md:h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1526', borderColor: '#ffffff10' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="SOG" stroke="#00f2ff" strokeWidth={3} dot={false} name="Vitesse (SOG)" />
                    <Line type="monotone" dataKey="TWS" stroke="#ff00ff" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Vent (TWS)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <RouteTable points={data.points} />

            <footer className="pt-8 pb-4 border-t border-white/5">
              <p className="text-center text-[15px] md:text-xs text-muted-foreground/60 italic">
                Outil optimisé pour les fichiers GPX issus de VRzen ! Outil développé par l'équipe HPy Team.
              </p>
            </footer>
          </motion.div>
        )}
      </main>
    </div>
  );
}

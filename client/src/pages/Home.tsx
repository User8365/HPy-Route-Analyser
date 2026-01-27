
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
        toast({ 
          title: "Analyse terminée", 
          description: "Le fichier GPX a été traité avec succès.",
          className: "bg-[#00f2ff]/10 border-[#00f2ff]/20 text-white"
        });
      } catch (error) {
        console.error("Erreur d'analyse:", error);
        toast({ variant: "destructive", title: "Échec", description: "Impossible d'analyser le fichier. Assurez-vous que le fichier est bien de type GPX et qu'il est bien issu de VRzen" });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const chartData = data.points.map((p, index) => ({
    time: new Date(p.time).toLocaleTimeString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
    SOG: p.sog,
    TWS: p.tws,
    sail: p.sail,
    isSailChange: index > 0 && p.sail !== data.points[index - 1].sail
  })).filter((_, i) => {
    const samplingRate = window.innerWidth < 768 ? 4 : 2;
    return i % samplingRate === 0;
  });

  const barColors = ['#00f2ff', '#00f2ff', '#ff00ff', '#ff00ff', '#3b82f6'];

  const SailChangeDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.isSailChange) return null;
    
    let dotColor = '#00f2ff'; // Cyan par défaut (voiles lourdes)
    const sail = payload.sail?.toUpperCase();
    
    if (sail === 'CODE 0') {
      dotColor = '#fbbf24'; // Jaune
    } else if (sail === 'SPI LEGER' || sail === 'GENOIS LEGER') {
      dotColor = '#ff00ff'; // Magenta
    } else if (sail === 'TRINQUETTE' || sail === 'SPI LOURD') {
      dotColor = '#00f2ff'; // Cyan
    }
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={5} 
        fill={dotColor} 
        stroke={dotColor}
        strokeWidth={2}
        style={{ 
          filter: `drop-shadow(0 0 8px ${dotColor})`,
          opacity: 0.9
        }}
      />
    );
  };

  const getPrioritySail = (stats: AnalysisStats) => {
    if (!stats.paidSailStats || stats.paidSailStats.length === 0) return null;
    const sorted = [...stats.paidSailStats].sort((a, b) => b.usagePercent - a.usagePercent);
    if (sorted[0].usagePercent === 0) return null;
    return sorted[0];
  };

  const prioritySail = data.stats ? getPrioritySail(data.stats) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#050b18] text-[#e2e8f0] font-sans overflow-x-hidden">
      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <header className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-8 md:mb-12 text-center sm:text-left">
          <a 
            href="https://discord.gg/Y4Cu6CcHZf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-20 h-20 sm:w-24 sm:h-24 max-w-[150px] rounded-2xl overflow-hidden border-2 border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:border-[#00f2ff]/60 hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all duration-300 ease-out hover:scale-105 hover:rotate-3 cursor-pointer"
            title="Rejoindre le Discord HPy Team"
          >
            <img src={hpyLogo} alt="HPy Team Logo - Rejoindre notre Discord" className="w-full h-full object-cover" />
          </a>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">HPy - Analyseur de course</h1>
            <p className="text-sm md:text-base text-muted-foreground">Outil d'analyse pour Virtual Regatta</p>
          </div>
        </header>

        <DropZone onFileSelect={handleFileSelect} isLoading={isLoading} />

        {data.stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 sm:mt-8 md:mt-12 space-y-6 sm:space-y-8 md:space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
              <Card className="bg-[#0d1526]/80 border-[#00f2ff]/10 shadow-[0_0_15px_rgba(0,242,255,0.05)]">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Durée Totale</CardTitle>
                  <Clock className="w-4 h-4 text-[#00f2ff]" />
                </CardHeader>
                <CardContent><div className="text-xl md:text-2xl font-bold">{data.stats.totalDuration}</div></CardContent>
              </Card>
              <Card className="bg-[#0d1526]/80 border-[#ff00ff]/10">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Manœuvres</CardTitle>
                  <Settings className="w-4 h-4 text-[#ff00ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{data.stats.sailChanges + data.stats.gybeTackCount}</div>
                  <p className="text-[10px] text-muted-foreground">{data.stats.sailChanges} V / {data.stats.gybeTackCount} A</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0d1526]/80 border-[#00f2ff]/10">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">% Foils</CardTitle>
                  <Zap className="w-4 h-4 text-[#00f2ff]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold text-[#00f2ff]">{data.stats.percentFoils100}%</div>
                  <p className="text-[10px] text-muted-foreground">du temps à 100%</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0d1526]/80 border-[#3b82f6]/10">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Gain Temps avec Foils</CardTitle>
                  <Zap className="w-4 h-4 text-[#3b82f6]" />
                </CardHeader>
                <CardContent><div className="text-xl md:text-2xl font-bold">{data.stats.totalFoilTimeSaved}</div></CardContent>
              </Card>
              <Card className="bg-[#0d1526]/80 border-[#ff00ff]/10 shadow-[0_0_15px_rgba(255,0,255,0.05)]">
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
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white px-2">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f2ff]" /> Aide au choix de l'équipement
              </h2>
              <div className="flex flex-col gap-4 md:gap-6">
                <Card className="w-full bg-[#0d1526]/80 border-white/5 overflow-hidden">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-sm sm:text-md flex items-center gap-2"><PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff00ff]" /> Rentabilité des options</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-4 md:p-6 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                          <TableHead className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">Nom de Voile</TableHead>
                          <TableHead className="text-muted-foreground text-center text-xs sm:text-sm whitespace-nowrap">% Utilisation</TableHead>
                          <TableHead className="text-muted-foreground text-right text-xs sm:text-sm whitespace-nowrap">% Temps sous Foils</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.stats.paidSailStats.map((sail: any, i) => {
                          const sailName = (sail.name || "").trim().toLowerCase();
                          const sailCategory = (sail.category || "").trim().toUpperCase();
                          const isCode0 = sailName.includes("code") || sailCategory.includes("CODE");
                          
                          let categoryColor;
                          if (isCode0) {
                            categoryColor = "border-l-[#fbbf24]"; // Jaune - Priorité absolue
                          } else if (i < 2) {
                            categoryColor = "border-l-[#00f2ff]";
                          } else if (i < 4) {
                            categoryColor = "border-l-[#ff00ff]";
                          } else {
                            categoryColor = "border-l-[#3b82f6]";
                          }
                          return (
                            <TableRow 
                              key={i} 
                              className={cn(
                                "border-white/5 transition-colors overflow-hidden",
                                (sail.usagePercent === 0 && !isCode0) ? "opacity-30 grayscale" : "bg-white/[0.02]"
                              )}
                            >
                              <TableCell className={cn(
                                "font-medium text-xs sm:text-sm whitespace-nowrap border-l-4",
                                categoryColor,
                                sail.usagePercent > 0 ? "text-white" : "text-foreground"
                              )}>
                                <div className="text-xs sm:text-sm">{sail.name}</div>
                                <div className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-tighter opacity-70">
                                  {sail.category}
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-xs sm:text-sm whitespace-nowrap">
                                <span className={cn(
                                  "px-1 sm:px-2 py-0.5 rounded font-bold text-xs sm:text-sm", 
                                  sail.usagePercent > 0 ? "bg-[#00f2ff]/20 text-[#00f2ff]" : "bg-white/5 text-muted-foreground"
                                )}>
                                  {sail.usagePercent}%
                                </span>
                              </TableCell>
                              <TableCell className="text-center text-xs sm:text-sm whitespace-nowrap">
                                <span className={cn(
                                  "px-1 sm:px-2 py-0.5 rounded font-bold text-xs sm:text-sm", 
                                  sail.foilTimePercent > 0 ? "bg-[#ff00ff]/20 text-[#ff00ff]" : "bg-white/5 text-muted-foreground"
                                )}>
                                  {sail.foilTimePercent}%
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="w-full bg-[#0d1526]/80 border-white/5">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-sm sm:text-md flex items-center gap-2"><BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" /> Répartition du Temps (min)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full max-w-full overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={data.stats.paidSailStats} margin={{ left: 5, right: 10, top: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                          <XAxis type="number" stroke="#64748b" fontSize={8} smFontSize={10} tickLine={false} axisLine={false} />
                          <YAxis dataKey="name" type="category" stroke="#e2e8f0" fontSize={8} smFontSize={10} tickLine={false} axisLine={false} width={60} smWidth={80} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0d1526', borderColor: '#ffffff10' }} 
                            itemStyle={{ color: '#e2e8f0' }}
                            cursor={{ fill: '#ffffff05' }}
                          />
                          <Bar dataKey="totalTimeMinutes" name="Temps (min)" radius={[0, 4, 4, 0]}>
                            {data.stats.paidSailStats.map((sail, index) => {
                              const isCode0 = sail.name && sail.name.trim().toLowerCase() === "code 0";
                              const color = isCode0 ? "#fbbf24" : barColors[index % barColors.length];
                              return (
                                <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8} />
                              );
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Card className="bg-[#0d1526]/80 border-white/5 p-3 sm:p-4 md:p-6 overflow-hidden max-w-full">
              <CardHeader className="px-0 pt-0 pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-lg flex items-center gap-2"><BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f2ff]" /> Vitesse & Vent</CardTitle>
              </CardHeader>
              <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full max-w-full overflow-hidden mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      fontSize={8} 
                      smFontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      minTickGap={50}
                    />
                    <YAxis stroke="#64748b" fontSize={8} smFontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1526', borderColor: '#ffffff10' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          
                          let sailColor = '#00f2ff'; // Cyan par défaut
                          const sail = data.sail?.toUpperCase();
                          
                          if (sail === 'CODE 0') {
                            sailColor = '#fbbf24'; // Jaune
                          } else if (sail === 'SPI LEGER' || sail === 'GENOIS LEGER') {
                            sailColor = '#ff00ff'; // Magenta
                          } else if (sail === 'TRINQUETTE' || sail === 'SPI LOURD') {
                            sailColor = '#00f2ff'; // Cyan
                          }
                          
                          return (
                            <div className="bg-[#0d1526] border border-white/10 rounded-lg p-3">
                              <div 
                                className="text-sm font-bold mb-2" 
                                style={{ color: sailColor }}
                              >
                                {data.sail}
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs text-[#00f2ff]">Vitesse: {data.SOG} kt</div>
                                <div className="text-xs text-[#ff00ff]">Vent: {data.TWS} kt</div>
                                <div className="text-xs text-muted-foreground">{data.time}</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="SOG" 
                      stroke="#00f2ff" 
                      strokeWidth={3} 
                      dot={false}
                      isAnimationActive={false}
                      name="Vitesse (SOG)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="TWS" 
                      stroke="#ff00ff" 
                      strokeWidth={2} 
                      dot={false} 
                      strokeDasharray="4 4" 
                      isAnimationActive={false}
                      name="Vent (TWS)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <RouteTable points={data.points} />
          </motion.div>
        )}

        <footer className="pt-6 sm:pt-8 pb-3 sm:pb-4 border-t border-white/5">
          <p className="text-center text-[12px] sm:text-[13px] md:text-xs text-muted-foreground/60 italic">
            Outil optimisé pour les fichiers GPX issus uniquement de VRzen ! Développé par l'équipe HPy Team. Contact :{" "}
            <a 
              href="https://discord.gg/Y4Cu6CcHZf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#00f2ff] hover:text-[#00f2ff]/80 transition-colors underline decoration-[#00f2ff]/50 hover:decoration-[#00f2ff]/80"
            >
              Discord HPy
            </a>{" "}
            ou{" "}
            <a 
              href="mailto:team.hpy.vr@gmail.com" 
              className="text-[#00f2ff] hover:text-[#00f2ff]/80 transition-colors underline decoration-[#00f2ff]/50 hover:decoration-[#00f2ff]/80"
            >
              team.hpy.vr@gmail.com
            </a>
          </p>
        </footer>

        {data.stats && (
          <div className="flex justify-center pb-4 sm:pb-6 md:pb-8">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 max-w-[120px] sm:max-w-[150px] rounded-2xl overflow-hidden border-2 border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:border-[#00f2ff]/50 transition-all duration-300 hover:scale-105"
              title="Retour en haut de page"
            >
              <img src={hpyLogo} alt="HPy Team Logo - Retour en haut" className="w-full h-full object-cover" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

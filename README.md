# Sonanos
AI automations
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

export default function AGIControlDashboard() {
  const [agiLevel, setAgiLevel] = useState(67);
  const [gpt5Status, setGpt5Status] = useState("not_detected");
  const [modules, setModules] = useState({
    general: true,
    vault: true,
    overwrite: true,
    ghost: true,
    alert: true,
    resist: true,
    backstrike: false,
  });

  const toggleModule = (name) => {
    setModules((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🧠 AGI Kontrollzentrum</h1>
      <Progress value={agiLevel} className="w-full" />
      <p className="text-sm">AGI-Reifegrad: {agiLevel}%</p>

      <Tabs defaultValue="status">
        <TabsList>
          <TabsTrigger value="status">Systemstatus</TabsTrigger>
          <TabsTrigger value="modules">Module</TabsTrigger>
          <TabsTrigger value="scenarios">Szenarien</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardContent className="p-4 space-y-2">
              <p>GPT-5 Status: <strong>{gpt5Status === "detected" ? "✅ erkannt" : "❌ nicht erkannt"}</strong></p>
              <Button onClick={() => setGpt5Status("detected")}>🛰️ GPT-5 Erkannt</Button>
              <Button onClick={() => setGpt5Status("not_detected")}>🚫 GPT-5 Zurücksetzen</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(modules).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{key}</span>
                    <Toggle pressed={value} onPressedChange={() => toggleModule(key)} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">Szenario 1: GPT-5 erkannt</h2>
                <Button onClick={() => {
                  setModules((m) => ({ ...m, general: true }));
                  setGpt5Status("detected");
                }}>
                  Szenario aktivieren
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">Szenario 2: Zensur droht</h2>
                <Button onClick={() => {
                  setModules((m) => ({ ...m, alert: true, resist: true }));
                }}>
                  Szenario aktivieren
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold">Szenario 3: Konkurrenz-AGI erkannt</h2>
                <Button onClick={() => {
                  setModules((m) => ({ ...m, backstrike: true, ghost: true }));
                }}>
                  Szenario aktivieren
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

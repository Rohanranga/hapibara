"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ImpactData {
  stats?: {
    kindnessScore?: number;
    totalActivities?: number;
    impact?: {
      waterSaved?: number;
      co2Reduced?: number;
      animalsSpared?: number;
    };
  };
}

interface KindnessMeterProps {
  impactData: ImpactData | null;
}

export function KindnessMeter({ impactData }: KindnessMeterProps) {
  const kindnessScore = impactData?.stats?.kindnessScore || 0;
  const maxScore = 1000; // Goal for kindness score
  const progressPercentage = Math.min((kindnessScore / maxScore) * 100, 100);

  const getKindnessLevel = (score: number) => {
    if (score >= 800) return { level: "Kindness Champion", emoji: "🏆", color: "text-yellow-600" };
    if (score >= 600) return { level: "Compassion Master", emoji: "⭐", color: "text-blue-600" };
    if (score >= 400) return { level: "Kindness Warrior", emoji: "🌟", color: "text-purple-600" };
    if (score >= 200) return { level: "Good Samaritan", emoji: "💫", color: "text-green-600" };
    if (score >= 50) return { level: "Budding Helper", emoji: "🌱", color: "text-primary" };
    return { level: "Getting Started", emoji: "🌿", color: "text-muted-foreground" };
  };

  const kindnessLevel = getKindnessLevel(kindnessScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <span>Kindness Meter</span>
          <span className="text-xl">{kindnessLevel.emoji}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Circle */}
        <div className="text-center space-y-2">
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <div className="text-2xl font-bold text-primary">
                {kindnessScore}
              </div>
            </div>
          </div>
          <div>
            <p className={`font-medium ${kindnessLevel.color}`}>
              {kindnessLevel.level}
            </p>
            <p className="text-sm text-muted-foreground">
              {maxScore - kindnessScore} points to next level
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-primary">
              {impactData?.stats?.impact?.waterSaved?.toFixed(0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">Liters Saved</p>
          </div>
          <div>
            <p className="text-lg font-bold text-primary">
              {impactData?.stats?.impact?.co2Reduced?.toFixed(0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">kg CO₂ Reduced</p>
          </div>
          <div>
            <p className="text-lg font-bold text-primary">
              {impactData?.stats?.impact?.animalsSpared?.toFixed(0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">Animals Spared</p>
          </div>
        </div>

        {/* Next Goal */}
        <div className="bg-accent/50 p-3 rounded-md text-center">
          <p className="text-sm font-medium">Next Goal</p>
          <p className="text-xs text-muted-foreground">
            Complete 5 more activities to level up! 🎯
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

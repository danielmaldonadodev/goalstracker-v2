"use client";

import BottomNav from "@/components/BottomNav";
import DateNavigator from "@/components/DateNavigator";
import DayScoreCircle from "@/components/DayScoreCircle";
import { useState } from "react";

export default function TestPage() {
  const [score, setScore] = useState(75);
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div className="min-h-screen gradient-mesh pb-24">
      <div className="max-w-md mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-4xl font-bold mb-2">MyYear Components</h1>
          <p className="text-muted-foreground">Testing core components</p>
        </div>

        {/* Date Navigator */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Date Navigator</h2>
          <DateNavigator
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </div>

        {/* Day Score Circle */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Day Score Circle
          </h2>
          <DayScoreCircle score={score} />

          {/* Score Slider */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Cambiar score: {score}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Test different scores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <DayScoreCircle score={30} className="scale-50" />
            <p className="text-center text-sm mt-2">Bajo (30%)</p>
          </div>
          <div className="glass-card p-4">
            <DayScoreCircle score={65} className="scale-50" />
            <p className="text-center text-sm mt-2">Medio (65%)</p>
          </div>
          <div className="glass-card p-4">
            <DayScoreCircle score={95} className="scale-50" />
            <p className="text-center text-sm mt-2">Alto (95%)</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}


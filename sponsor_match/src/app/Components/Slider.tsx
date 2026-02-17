"use client";
import { useState } from "react";

export default function BudgetSlider() {
  const [budget, setBudget] = useState(500); // default value

  return (
    <div className="flex flex-col space-y-2">
    <input
        type="range"
        min="0"
        max="10000"
        value={budget}
        onChange={(e) => setBudget(+e.target.value)}
        className="w-full accent-Black"
      />
      <label className="font-Body text-lg"> £{budget}</label>
    </div>
  );
}

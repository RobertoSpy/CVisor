"use client";

export default function SkillsRadarPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Skill Radar</h1>
      <div className="flex flex-wrap gap-2">
        {["Leadership", "React", "Comunicare", "Organizare", "Canva"].map(skill => (
          <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded">{skill}</span>
        ))}
      </div>
      <button className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition shadow">Modifică skill radar</button>
    </div>
  );
}
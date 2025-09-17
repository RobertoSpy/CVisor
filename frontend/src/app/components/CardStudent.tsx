"use client";
type CardStudentProps = {
  title: string;
  desc: string;
  icon: string;
};

export default function CardStudent({ title, desc, icon }: CardStudentProps) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-primary flex flex-col items-center w-72">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-2 text-primary">{title}</h3>
      <p className="text-md text-gray-600">{desc}</p>
    </div>
  );
}
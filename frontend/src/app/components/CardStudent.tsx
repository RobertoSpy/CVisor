type CardStudentProps = {
  title: string;
  desc: string;
  icon: string;
};


export default function CardStudent({ title, desc, icon }: CardStudentProps) {
  return (
    <div className="bg-card rounded-xl p-8 shadow-lg hover:scale-105 transition transform hover:bg-gradient-primary border-2 border-primary cursor-pointer flex flex-col items-center w-72">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}
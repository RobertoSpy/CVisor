import React from "react";

// Mock data pentru exemplificare
const organizationProfile = {
  name: "Compania Exemplu SRL",
  history: "Compania Exemplu SRL a fost fondată în 2010, având ca scop dezvoltarea de soluții software inovatoare pentru educație și business.",
  events: [
    { year: 2022, title: "Hackathon Educațional" },
    { year: 2023, title: "Conferința Tech4All" },
    { year: 2024, title: "Workshop Leadership" },
  ],
  keyPeople: [
    { name: "Andrei Popescu", role: "CEO", responsibilities: "Strategie, management general" },
    { name: "Maria Ionescu", role: "CTO", responsibilities: "Coordonare tehnică, inovare" },
    { name: "Ioana Georgescu", role: "HR Manager", responsibilities: "Resurse umane, recrutare" },
  ],
  location: "Str. Exemplului 12, București, România",
  contactPerson: {
    name: "Vlad Stanescu",
    email: "vlad.stanescu@exemplu.ro",
    phone: "+40 721 123 456",
  },
  social: {
    website: "https://exemplu.ro",
    facebook: "facebook.com/exemplu",
    linkedin: "linkedin.com/company/exemplu",
  },
};

export default function OrganizationProfile() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-3xl font-bold mb-4">{organizationProfile.name}</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Istoric organizație</h2>
        <p>{organizationProfile.history}</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Arhivă evenimente</h2>
        <ul className="list-disc pl-6">
          {organizationProfile.events.map((event, idx) => (
            <li key={idx}>{event.year}: {event.title}</li>
          ))}
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Persoane cheie</h2>
        <ul className="list-disc pl-6">
          {organizationProfile.keyPeople.map((person, idx) => (
            <li key={idx}>
              <span className="font-bold">{person.name}</span> - {person.role} <br />
              <span className="text-gray-600">{person.responsibilities}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Locație firmă</h2>
        <p>{organizationProfile.location}</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Persoană de contact</h2>
        <p><span className="font-bold">{organizationProfile.contactPerson.name}</span></p>
        <p>Email: <a href={`mailto:${organizationProfile.contactPerson.email}`} className="text-blue-600 underline">{organizationProfile.contactPerson.email}</a></p>
        <p>Telefon: {organizationProfile.contactPerson.phone}</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Rețele de socializare / Date de contact</h2>
        <ul className="list-disc pl-6">
          <li>Website: <a href={organizationProfile.social.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{organizationProfile.social.website}</a></li>
          <li>Facebook: <a href={`https://${organizationProfile.social.facebook}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{organizationProfile.social.facebook}</a></li>
          <li>LinkedIn: <a href={`https://${organizationProfile.social.linkedin}`} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{organizationProfile.social.linkedin}</a></li>
        </ul>
      </section>
    </div>
  );
}

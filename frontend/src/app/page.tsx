"use client";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import VideoGallery from "./components/VideoGallery";
import Testimonials from "./components/Testimonials";
import StatsSection from "./components/StatsSection";
import Footer from "./components/Footer";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "student") router.push("/student");
    else if (role === "organization") router.push("/organization");
    else if (role === "admin") router.push("/admin");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full">
        <HeroSection />
        <StatsSection />
        <Testimonials />
        <VideoGallery />
      </main>
      <Footer />
    </div>
  );
}
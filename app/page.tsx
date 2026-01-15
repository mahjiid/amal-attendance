"use client";
import Link from "next/link";
import { ChevronRight, ArrowRight, ShieldCheck, Zap, Globe, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AmalTechLogo } from "@/components/ui/logo";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <header className="container mx-auto flex items-center justify-between p-6 z-50 relative">
        <div className="flex items-center gap-2">
           <AmalTechLogo className="h-8 w-auto" />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#products" className="hover:text-primary transition-colors">Products</Link>
          <Link href="#services" className="hover:text-primary transition-colors">Services</Link>
          <Link href="#about" className="hover:text-primary transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-2">
           <Link href="/kiosk" target="_blank">
             <Button variant="ghost" className="text-muted-foreground hover:text-primary" size="sm">Launch Kiosk</Button>
           </Link>
           <Link href="/dashboard">
             <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" size="sm">Employee Login</Button>
           </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-auto min-h-[800px] flex items-center justify-center overflow-hidden py-20 lg:py-0">
        <AnimatedBackground />
        
        {/* Dynamic Overlay Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white/90 z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary/5 to-transparent opacity-60 blur-3xl" />

        <div className="container mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 md:px-6">
           {/* Text Content */}
           <div className="space-y-6 text-center lg:text-left">
             <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 backdrop-blur-md animate-fade-in-up">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
               <span className="text-xs font-medium text-foreground/80">Leading Nigeria's Tech Revolution</span>
             </div>
             
             <h1 className="text-4xl md:text-6xl/tight font-extrabold tracking-tighter">
               <span className="text-foreground">We Build The </span>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-secondary animate-gradient-x">Future</span>
             </h1>
             
             <p className="max-w-[600px] text-lg text-muted-foreground mx-auto lg:mx-0">
               From <span className="text-secondary font-bold">Amal Semiconductor</span>'s cutting-edge hardware to <span className="text-primary font-bold">Amal Tech</span>'s innovative software solutions. We are pioneering the digital infrastructure of tomorrow.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
               <Link href="http://amaltech.com.ng/" target="_blank">
                 <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.4)] border-0 text-white">
                   Explore Solutions
                   <div className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-white/20">
                     <ChevronRight className="w-3 h-3" />
                   </div>
                 </Button>
               </Link>
               <Link href="/auth/login">
                 <Button variant="outline" size="lg" className="h-12 px-8 text-base border-primary/20 bg-primary/5 hover:bg-primary/10 backdrop-blur-sm text-foreground">
                   Staff Portal
                 </Button>
               </Link>
             </div>
           </div>

           {/* Hero Visuals */}
           <div className="relative h-[400px] lg:h-[600px] w-full perspective-1000 group mt-10 lg:mt-0">
              {/* Floating Cards / Images Composition */}
              
              {/* Main Image: Semiconductor (Back) */}
              <div className="absolute top-0 lg:top-10 right-0 w-full lg:w-3/4 h-full lg:h-3/4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transform text-xs lg:rotate-y-12 lg:rotate-z-2 group-hover:rotate-y-0 group-hover:rotate-z-0 transition-transform duration-700 ease-out brightness-75 group-hover:brightness-100">
                  <div className="absolute inset-0 bg-secondary/20 mix-blend-overlay z-10" />
                  <img src="/images/semiconductor-hero.png" alt="Amal Semiconductor Wafer" className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-xs font-mono text-secondary-foreground">
                    AMAL_SEMI::WAFER_FAB_01
                  </div>
              </div>
              
              {/* Secondary Image: Tech Lab (Front Left) */}
              <div className="absolute bottom-[-20px] lg:bottom-20 left-0 lg:left-0 w-2/3 h-1/2 lg:h-2/3 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform lg:-rotate-y-12 lg:-rotate-z-2 translate-z-10 group-hover:rotate-y-0 group-hover:rotate-z-0 transition-transform duration-700 ease-out delay-100 hidden sm:block">
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                  <img src="/images/tech-lab.jpg" alt="Amal Tech Lab" className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-xs font-mono text-primary-foreground">
                    AMAL_TECH::R&D_LAB
                  </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute top-20 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative z-10 bg-white/50 backdrop-blur-sm -mt-20 border-t border-white/5 shadow-xl">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-sm text-secondary font-medium">
                        About Us
                    </div>
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-foreground">
                        Pioneering Hardware in Africa
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Amal Technologies Limited is a leading Nigerian technology company specializing in <span className="text-foreground font-medium">Electronic Design and Manufacturing (EMS)</span>, Hardware Development, and Internet of Things (IoT) solutions. 
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                         We are bridging the hardware development gap in Africa through localized manufacturing and innovative research, with a vision to become the premier hub for semiconductor and electronic innovation on the continent.
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-primary">5+</span>
                            <span className="text-sm text-muted-foreground">Years Innovation</span>
                        </div>
                        <div className="w-px h-12 bg-border"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-secondary">50k+</span>
                            <span className="text-sm text-muted-foreground">Devices Deployed</span>
                        </div>
                        <div className="w-px h-12 bg-border"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-primary">100%</span>
                            <span className="text-sm text-muted-foreground">Indigenous</span>
                        </div>
                    </div>
                </div>
                <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                    <img src="/images/tech-lab.jpg" alt="Amal Tech Facility" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
                        <p className="text-white font-mono text-sm">FACILITY::ABUJA_HQ</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative z-10 bg-brand-gradient/5">
         <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tighter md:text-5xl mb-4">Our Services</h2>
                <p className="text-muted-foreground text-lg">End-to-end electronic and software solutions tailored for industrial and consumer needs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Cpu} 
                title="Electronic Manufacturing (EMS)" 
                description="Full-scale manufacturing of electronic components, PCBs, and assembled devices with localized precision."
              />
              <FeatureCard 
                icon={Zap} 
                title="PCB Design & Prototyping" 
                description="Professional design, layout, and rapid prototyping of circuit boards for diverse industrial applications."
              />
              <FeatureCard 
                icon={Globe} 
                title="IoT & R&D Solutions" 
                description="Research and Development for connected smart devices, bridging software intelligence with physical hardware."
              />
           </div>
         </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 relative z-10">
         <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tighter md:text-5xl mb-4">Signature Products</h2>
                <p className="text-muted-foreground text-lg">Hardware innovations designed for safety, efficiency, and the future.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product 1 */}
                <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-white border border-border shadow-lg hover:shadow-xl transition-shadow group">
                    <div className="w-full md:w-1/3 h-48 bg-gray-100 rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-primary/20">
                            <ShieldCheck className="w-16 h-16" />
                        </div>
                        {/* Placeholder for Product Image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold">Amal Smart Gas Detector</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Flagship</span>
                        </div>
                        <p className="text-muted-foreground">
                            An intelligent IoT safety device that detects gas leaks in real-time, sends instant alerts to your phone, and can automatically shut off gas supply to prevent accidents.
                        </p>
                         <Link href="https://amaltech.com.ng" target="_blank" className="inline-flex items-center text-primary font-medium hover:underline mt-2">
                            View Product <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>

                 {/* Product 2 */}
                 <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-white border border-border shadow-lg hover:shadow-xl transition-shadow group">
                    <div className="w-full md:w-1/3 h-48 bg-gray-100 rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center bg-secondary/5 text-secondary/20">
                            <Cpu className="w-16 h-16" />
                        </div>
                        {/* Placeholder for Product Image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                             <h3 className="text-2xl font-bold">Smart Metering Solutions</h3>
                             <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">Enterprise</span>
                        </div>
                        <p className="text-muted-foreground">
                            Advanced energy metering infrastructure for accurate consumption tracking, remote monitoring, and efficient grid management.
                        </p>
                        <Link href="https://amaltech.com.ng" target="_blank" className="inline-flex items-center text-primary font-medium hover:underline mt-2">
                            View Product <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
         </div>
      </section>

      
      {/* Gallery Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
             <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
               Company Culture
             </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-5xl text-brand-gradient">
               Life at Amal Tech
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
               Innovating together. Building the future of Nigeria's digital industry.
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="group relative overflow-hidden rounded-xl border border-white/10 aspect-video md:aspect-[4/5] shadow-2xl">
                <div className="absolute inset-0 bg-secondary/20 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-overlay"></div>
                <img 
                   src="/images/tech-lab.jpg" 
                   alt="Amal Tech Lab" 
                   className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20 translate-y-4 group-hover:translate-y-0 transition-transform">
                   <h3 className="text-white font-bold text-lg">Advanced R&D</h3>
                   <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity">State-of-the-art facilities</p>
                </div>
             </div>
             
             <div className="group relative overflow-hidden rounded-xl border border-white/10 aspect-video md:aspect-[4/5] shadow-2xl mt-0 md:-mt-8">
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-overlay"></div>
                 <img 
                   src="/images/team-outdoor.png" 
                   alt="Amal Tech Team" 
                   className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                />
                 <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20 translate-y-4 group-hover:translate-y-0 transition-transform">
                   <h3 className="text-white font-bold text-lg">Our People</h3>
                   <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Driven by passion & innovation</p>
                </div>
             </div>
             
             <div className="group relative overflow-hidden rounded-xl border border-white/10 aspect-video md:aspect-[4/5] shadow-2xl">
                <div className="absolute inset-0 bg-secondary/20 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-overlay"></div>
                 <img 
                   src="/images/team-meeting.jpg" 
                   alt="Collaboration" 
                   className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                />
                 <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20 translate-y-4 group-hover:translate-y-0 transition-transform">
                   <h3 className="text-white font-bold text-lg">Collaboration</h3>
                   <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Solving complex problems</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <footer className="py-6 border-t border-white/5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Amal Technologies. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/50 transition-colors group"
    >
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

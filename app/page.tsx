"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./style.css";

import type { User } from "@supabase/supabase-js";
import Image from "next/image";

export default function NovareTalent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Fetch user role from profiles table
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('roles')
            .eq('id', user.id)
            .single();

          if (!error && profile) {
            setUserRole(profile.roles);
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Fetch user role when auth state changes
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!error && profile) {
          setUserRole(profile.role);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const getDashboardPath = () => {
    if (!user) return "/sign-in";
    
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'client':
        return '/client';
      case 'user':
        return '/Dashboard';
      default:
        return '/Dashboard';
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const dashboardPath = getDashboardPath();

  return (
    <>
      <header className="bg-black/30 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#home" className="flex items-center space-x-3">
              <Image 
                src="/Image/novera_talent_logo2.jpg" 
                alt="Novare Talent Logo" 
                className="h-10 w-10 object-contain"
                width={200}
                height={50}
              />
              <span className="text-2xl font-bold text-white">Novare Talent</span>
            </a>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#process" className="text-gray-300 hover:text-primary transition-colors">Process</a>
              <a href="#team" className="text-gray-300 hover:text-primary transition-colors">Team</a>
              <a href="#testimonials" className="text-gray-300 hover:text-primary transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-300 hover:text-primary transition-colors">Contact</a>

              <div className="flex items-center space-x-4 ml-4">
                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/company/novare-talent/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    className="w-5 h-5"
                  >
                    <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.3c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.3h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.96v5.71h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.85-1.54 3.05 0 3.61 2.01 3.61 4.63v5.55z"/>
                  </svg>
                </a>
                
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/novare_talent?igsh=MWZnc3dnMG5xbXR2OQ==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    className="w-5 h-5"
                  >
                    <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.4.4.6.2 1 .5 1.5.9.5.5.8.9 1 .5.2.5.3 1.2.4 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.4-.2.6-.5 1-1 1.5-.5.5-.9.8-1.5 1-.5.2-1.2.3-2.4.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.4-.4-.6-.2-1-.5-1.5-1-.5-.5-.8-.9-1-1.5-.2-.5-.3-1.2-.4-2.4-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.4.2-.6.5-1 1-1.5.5-.5.9-.8 1.5-1 .5-.2 1.2-.3 2.4-.4 1.3-.1 1.7-.1 4.9-.1zm0-2.2c-3.3 0-3.7 0-5 .1-1.3.1-2.3.3-3.1.6-.9.3-1.6.7-2.3 1.4-.7.7-1.1 1.4-1.4 2.3-.3.8-.5 1.8-.6 3.1-.1 1.3-.1 1.7-.1 5s0 3.7.1 5c.1 1.3.3 2.3.6 3.1.3.9.7 1.6 1.4 2.3.7.7 1.4 1.1 2.3 1.4.8.3 1.8.5 3.1.6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.3-.3 3.1-.6.9-.3 1.6-.7 2.3-1.4.7-.7 1.1-1.4 1.4-2.3.3-.8.5-1.8.6-3.1.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.3-.6-3.1-.3-.9-.7-1.6-1.4-2.3-.7-.7-1.4-1.1-2.3-1.4-.8-.3-1.8-.5-3.1-.6-1.3-.1-1.7-.1-5-.1zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zm0 10.2a4 4 0 110-8 4 4 0 010 8zm6.4-11.7a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8z"/>
                  </svg>
                </a>
              </div>
            </nav>
            
            <div className="flex items-center flex-row space-x-4">
              <a 
                href="#contact" 
                className="hidden md:block bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Register Startup
              </a>
              <a 
                href={dashboardPath} 
                className="hidden md:block bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                {user ? "Dashboard" : "Sign In"}
              </a>
            </div>
            
            <button 
              id="mobile-menu-button"
              className="md:hidden text-white" 
              aria-label="Open mobile menu"
              onClick={toggleMobileMenu}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu */}
          <div 
            id="mobile-menu"
            className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4 p-4 rounded-lg glass-card`}
          >
            <nav className="flex flex-col space-y-4">
              <a href="#process" className="text-gray-300 hover:text-primary transition-colors block text-center py-2">Process</a>
              <a href="#team" className="text-gray-300 hover:text-primary transition-colors block text-center py-2">Team</a>
              <a href="#testimonials" className="text-gray-300 hover:text-primary transition-colors block text-center py-2">Testimonials</a>
              <a href="#contact" className="bg-primary text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors block text-center mt-2">
                Register Startup
              </a>
              <a 
                href={dashboardPath} 
                className="bg-primary text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors block text-center mt-2"
              >
                {user ? "Dashboard" : "Sign In"}
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Rest of your content would need to be converted to JSX as well */}
      <main>
  <section id="home" className="min-h-screen flex items-center pt-24 pb-12">
    <div className="container mx-auto px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
          By the time your next meeting starts, we&lsquo;ve already found your next <span className="text-primary">top hire.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          We provide invite-only access to pre-vetted talent from premier institutes like IITs, BITS, and IIMs. Get candidates with the skills and mindset to drive your startup&lsquo;s growth from day one.
        </p>
        <a href="#contact" className="mt-10 inline-block bg-primary text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-primary-dark transition-transform hover:scale-105">
          Register Your Startup
        </a>
        <div className="mt-4 text-sm text-gray-400">Hire fast. Hire smart.</div>
      </div>
    </div>
  </section>

  <section id="process" className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Our Process</h2>
        <p className="mt-2 text-lg text-gray-400">A Clear Path to Your Next Hire</p>
        <div className="mt-4 w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>
      <div className="flex flex-col items-center gap-y-8">
        <div className="max-w-2xl w-full p-8 rounded-xl text-center glass-card">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
            <span className="text-2xl font-bold text-primary">1</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Register & Get Verified</h3>
          <p className="text-gray-400">
            Start by registering your company on our platform. We&lsquo;ll quickly onboard you after verifying your company details to ensure a trusted network.
          </p>
        </div>
        <div className="text-primary text-2xl my-2 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="w-full max-w-5xl text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
            <span className="text-2xl font-bold text-primary">2</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">We Source Your Candidates</h3>
          <p className="text-gray-400 mb-8">Once you share your job description, we use two primary methods to find the perfect fit.</p>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="p-8 rounded-xl text-left glass-card">
              <h4 className="text-lg font-bold text-primary mb-2">Method A: Assessment-Based</h4>
              <p className="text-gray-400">
                We circulate the job description across our exclusive candidate network, conduct initial assessments, and screen for the top talent.
              </p>
            </div>
            <div className="p-8 rounded-xl text-left glass-card">
              <h4 className="text-lg font-bold text-primary mb-2">Method B: Referral-Based</h4>
              <p className="text-gray-400">
                We leverage trusted references from within our network, providing you with candidates who come with an additional layer of trust and relevance.
              </p>
            </div>
          </div>
        </div>
        <div className="text-primary text-2xl my-2 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="max-w-2xl w-full p-8 rounded-xl text-center glass-card">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
            <span className="text-2xl font-bold text-primary">3</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Interview & Onboard</h3>
          <p className="text-gray-400">
            You receive a shortlist of 3-4 pre-screened candidates. From there, you can conduct further interviews (managerial, technical) or proceed directly to onboarding your next team member.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="team" className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white">The People Behind the Connections</h2>
        <p className="mt-2 text-lg text-gray-400">Meet the core team.</p>
        <div className="mt-4 w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>
      <div className="flex flex-wrap justify-center items-stretch gap-10">
        <div className="w-full md:w-5/12 lg:w-1/3 glass-card rounded-xl p-8 flex flex-col">
          <div className="text-center">
            <Image src="/Image/Sahil.png" alt="Sahil Sheoran, Founder & CEO" className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-primary" width={400} height={400}/>
            <h3 className="text-xl font-bold text-white">Sahil Sheoran</h3>
            <p className="text-primary font-semibold">Founder & CEO</p>
            <p className="mt-2 text-gray-400 text-sm text-left">
              Sahil is a first-time founder with a simple belief: India&lsquo;s top talent deserves better pathways, and startups deserve better talent. An IIT Bombay graduate, he combines a builder&lsquo;s mindset with a passion for solving real hiring pain. At Novare Talent, he leads the vision, product, and partnerships — with one goal in mind: help founders hire fast without compromising on trust or quality.
            </p>
          </div>
        </div>
        <div className="w-full md:w-5/12 lg:w-1/3 glass-card rounded-xl p-8 flex flex-col">
          <div className="text-center">
            <Image src="/Image/Sankalp.png" alt="Sankalp, Creative Head" className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-primary"  width={400} height={400}/>
            <h3 className="text-xl font-bold text-white">Sankalp</h3>
            <p className="text-primary font-semibold">Head of Creatives</p>
            <p className="mt-2 text-gray-400 text-sm text-left">
              He&lsquo;s here for thinking outside the box, but he usually forgets where the box is. He&lsquo;s the reason why you will find Novare Talent an interesting brand; Not just a pretty one, but also like a story you actually want to be part of.
            </p>
          </div>
        </div>
        <div className="w-full md:w-5/12 lg:w-1/3 glass-card rounded-xl p-8 flex flex-col">
          <div className="text-center">
            <Image src="/Image/Sanat.png" alt="Sanat, Tech & Product" className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-primary"  width={400} height={400}/>
            <h3 className="text-xl font-bold text-white">Sanat</h3>
            <p className="text-primary font-semibold">Tech & Product</p>
            <p className="mt-2 text-gray-400 text-sm text-left">
              Sanat is an Electrical Engineering student at IIT Bombay who loves building things and solving problems with tech. He&lsquo;s always curious and enjoys figuring out how things work. When he&lsquo;s not busy with projects, you&lsquo;ll probably find him watching anime or playing games.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="testimonials" className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white">What Our Partners Say</h2>
        <div className="mt-4 w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="swiper testimonials-swiper overflow-hidden">
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              <div className="p-8 rounded-xl glass-card flex flex-col justify-between h-full">
                <p className="text-gray-300 italic text-left">
                  &ldquo;I was looking for a UX intern and came across Sahil from Novare Talent via linkedin, we had a quick chat and I shared my requirements + budget, and within a few days he connected me with an intern which was very helpful, fast and curated! I had to put in almost no time or effort.&ldquo;
                </p>
                <div className="mt-6 flex items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white">Hitesh Sharma</p>
                    <p className="text-sm text-primary">Founder, Motor 360</p>
                  </div>
                  <Image src="/Image/Hitesh Sharma pfp.jpeg.jpg" alt="Photo of Hitesh Sharma" className="w-14 h-14 rounded-full object-cover border-2 border-primary/50"  width={400} height={400}/>
                </div>
              </div>
            </div>
            <div className="swiper-slide">
              <div className="p-8 rounded-xl glass-card flex flex-col justify-between h-full">
                <p className="text-gray-300 italic text-left">
                  &ldquo;Novare Talent led by Sahil Sheoran focuses on the right pain point in the complex domain of recruitment specifically for internships. Sahil has built a remarkable network within the major IITs... I wish Sahil and the team at Novare all the very best for the stellar future ahead 🙌🏻&ldquo;
                </p>
                <div className="mt-6 flex items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white">Aniket Deb</p>
                    <p className="text-sm text-primary">ex-CEO/COO of Bizongo</p>
                  </div>
                  <Image src="/Image/aniket deb.jpg" alt="Photo of Aniket Deb" className="w-14 h-14 rounded-full object-cover border-2 border-primary/50"  width={400} height={400}/>
                </div>
              </div>
            </div>
            <div className="swiper-slide">
              <div className="p-8 rounded-xl glass-card flex flex-col justify-between h-full">
                <p className="text-gray-300 italic text-left">
                  &ldquo;Working with Sahil, and Novare Talent, just made hiring so much easier... If you want fast, thoughtful hiring without the usual headache, definitely recommend Novare Talent.&ldquo;
                </p>
                <div className="mt-6 flex items-center justify-end gap-4">
                  <div className="text-right">
                    <p className="font-bold text-white">Onkar Borade</p>
                    <p className="text-sm text-primary">Founder InvoicEase</p>
                  </div>
                  <Image src="/Image/Onkar Borade pfp.jpeg.jpg" alt="Photo of Onkar Borade" className="w-14 h-14 rounded-full object-cover border-2 border-primary/50"  width={400} height={400}/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="swiper-button-prev text-primary"></div>
        <div className="swiper-button-next text-primary"></div>
      </div>
    </div>
  </section>

  <section id="contact" className="py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Build Your A-Team?</h2>
        <p className="mt-2 text-lg text-gray-400">Let&apos;s find the talent that will help you scale. Register your startup below.</p>
        <div className="mt-4 w-24 h-1 bg-primary mx-auto rounded-full"></div>
      </div>
      <div className="max-w-xl mx-auto p-8 rounded-xl shadow-2xl glass-card">
        <form action="https://formspree.io/f/xpwrndlo" method="POST">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                required 
                className="mt-1 block w-full bg-gray-800/50 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-300">Company Name</label>
              <input 
                type="text" 
                name="company" 
                id="company" 
                required 
                className="mt-1 block w-full bg-gray-800/50 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Work Email</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                required 
                className="mt-1 block w-full bg-gray-800/50 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="needs" className="block text-sm font-medium text-gray-300">Which type of role are you hiring for?</label>
              <input 
                type="text" 
                name="needs" 
                id="needs" 
                placeholder="e.g., Tech, Product, Marketing" 
                className="mt-1 block w-full bg-gray-800/50 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Job Description / Additional Information</label>
              <textarea 
                name="description" 
                id="description" 
                rows={4} 
                placeholder="Share the job description or any other details here." 
                className="mt-1 block w-full bg-gray-800/50 border-white/20 rounded-md shadow-sm py-3 px-4 text-white focus:border-primary focus:ring-primary"
              ></textarea>
            </div>
            <div>
              <button 
                type="submit" 
                className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="text-center mt-8">
        <p className="text-gray-400">
          Any questions? Email us at{" "}
          <a href="mailto:sahil@novaretalent.com" className="font-semibold text-primary hover:underline">
            sahil@novaretalent.com
          </a>
        </p>
      </div>
    </div>
  </section>
</main>

      <footer className="bg-black/30 border-t border-white/10">
        <div className="container mx-auto px-6 py-6 text-center text-gray-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>&copy; 2025 Novare Talent. All Rights Reserved.</div>
            <div className="flex items-center space-x-6">
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/company/novare-talent/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.3c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.3h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.96v5.71h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.85-1.54 3.05 0 3.61 2.01 3.61 4.63v5.55z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/novare_talent?igsh=MWZnc3dnMG5xbXR2OQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.4.4.6.2 1 .5 1.5.9.5.5.8.9 1 .5.2.5.3 1.2.4 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.4-.2.6-.5 1-1 1.5-.5.5-.9.8-1.5 1-.5.2-1.2.3-2.4.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.4-.4-.6-.2-1-.5-1.5-1-.5-.5-.8-.9-1-1.5-.2-.5-.3-1.2-.4-2.4-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.4.2-.6.5-1 1-1.5.5-.5.9-.8 1.5-1 .5-.2 1.2-.3 2.4-.4 1.3-.1 1.7-.1 4.9-.1m0-2.2c-3.3 0-3.7 0-5 .1-1.3.1-2.3.3-3.1.6-.9.3-1.6.7-2.3 1.4-.7.7-1.1 1.4-1.4 2.3-.3.8-.5 1.8-.6 3.1-.1 1.3-.1 1.7-.1 5s0 3.7.1 5c.1 1.3.3 2.3.6 3.1.3.9.7 1.6 1.4 2.3.7.7 1.4 1.1 2.3 1.4.8.3 1.8.5 3.1.6 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.3-.1 2.3-.3 3.1-.6.9-.3 1.6-.7 2.3-1.4.7-.7 1.1-1.4 1.4-2.3.3-.8.5-1.8.6-3.1.1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.3-.3-2.3-.6-3.1-.3-.9-.7-1.6-1.4-2.3-.7-.7-1.4-1.1-2.3-1.4-.8-.3-1.8-.5-3.1-.6-1.3-.1-1.7-.1-5-.1zm0 5.8a6.2 6.2 0 100 12.4 6.2 6.2 0 000-12.4zm0 10.2a4 4 0 110-8 4 4 0 010 8zm6.4-11.7a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
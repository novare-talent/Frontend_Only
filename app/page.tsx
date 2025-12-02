"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export default function NovareTalentLanding() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
            .from("profiles")
            .select("role") // Changed from "roles" to "role" for consistency
            .eq("id", user.id)
            .single();

          if (!error && profile) {
            setUserRole(profile.role);
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
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
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
      case "admin":
        return "/admin";
      case "client":
        return "/client";
      case "user":
        return "/Dashboard";
      default:
        return "/Dashboard";
    }
  };

  useEffect(() => {
    const DESIGN_WIDTH = 1920;

    const applyScale = () => {
      const page = pageRef.current;
      const stage = stageRef.current;
      if (!page || !stage) return;

      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      );
      const scale = Math.max(0.2, Number((vw / DESIGN_WIDTH).toFixed(6)));

      page.style.transformOrigin = "top left";
      page.style.transform = `translateZ(0) scale(${scale})`;

      const baseHeight = page.scrollHeight;
      stage.style.width = `${Math.ceil(DESIGN_WIDTH * scale)}px`;
      stage.style.height = `${Math.ceil(baseHeight * scale)}px`;
    };

    applyScale();
    window.addEventListener("resize", applyScale);
    window.addEventListener("orientationchange", applyScale);

    return () => {
      window.removeEventListener("resize", applyScale);
      window.removeEventListener("orientationchange", applyScale);
    };
  }, []);

  const toggleFaq = (index: any) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question:
        "What makes Novare Talent different from other hiring platforms?",
      answer:
        "We give companies direct access to a highly curated talent pool from India's top 1% institutes like IITs, helping them hire faster, smarter, and without noise.",
    },
    {
      question:
        "How can recruiters hire verified IITians through Novare Talent?",
      answer:
        "Recruiters can reach us at info@novaretalent.com to begin hiring. They can also sign up on our upcoming platform, Zenhyre, where verified IIT talent will be available for direct hiring.",
    },
    {
      question:
        "How do we ensure transparency for students in the hiring process?",
      answer:
        "Students applying through Zenhyre will receive constructive feedback if not selected, along with personalized resource recommendations to help them improve and grow.",
    },
    {
      question: "Do we only offer career opportunities to students?",
      answer:
        "No. Along with internships and full-time roles, we also provide curated learning resources and tools to support students throughout their career journey.",
    },
    {
      question: "Do we charge students?",
      answer:
        "Applying for opportunities is completely free. Some advanced learning resources may be paid, but access to career opportunities will always remain free for students.",
    },
    {
      question: "Who should not apply?",
      answer:
        "At this stage, Novare Talent is exclusively for IIT students. We plan to expand to other top-tier institutes soon based on response and demand.",
    },
  ];

  const clientTestimonials = [
    {
      avatar: "/assets/trustwall-avatar-1.png",
      name: "Aniket Deb",
      company: "Founder and Ex-CEO, Bizongo",
      quote:
        "Novare Talent focuses on the right pain point in the complex domain of recruitment, specifically for internships. Sahil has built a remarkable network within the major IITs... I wish Novare Talent team all the very best for the stellar future ahead.",
    },
    {
      avatar: "/assets/hitesh.jpg",
      name: "Hitesh Sharma",
      company: "Founder of Motor 360",
      quote:
        "I was looking for a UX intern and came across Novare Talent via LinkedIn. We had a quick chat and I shared my requirements + budget, and within a few days, they connected me with an intern, which was very helpful, fast and curated! I had to put in almost no time or effort",
    },
    {
      avatar: "/assets/onkar.jpg",
      name: "Onkar Borade",
      company: "Founder of InvoicEase",
      quote:
        "Working with Novare Talent just made hiring so much easier... If you want fast, thoughtful hiring without the usual headache, definitely recommend Novare Talent.",
    },
    {
      avatar: "/assets/Shruti.jpg",
      name: "Shruti, IIT Bombay Alumnus",
      company: "Stealth Startup",
      quote:
        "Grateful to Sahil and Novare Talent for the thoughtful engagement. They understood our needs perfectly and connected us with capable students. Also appreciate the initiative and intent to link us with relevant work in allied spaces. Excited to stay connected.",
    },
  ];

  const studentTestimonials = [
    {
      avatar: "/assets/chirag.jpg",
      name: "Chirag Jindal",
      college: "IIT Bombay",
      quote:
        "Grateful for this opportunity and looking forward to learning, contributing, and growing through this experience. Thanks Novare Talent",
    },
    {
      avatar: "/assets/student-avatar-1.png",
      name: "Preksha Jain",
      college: "IIT Bombay",
      quote:
        "As an intense Apping Person, Novare Talent made it easy to connect with high-growth startups, cutting out the noise and helping me find meaningful opportunities fast.",
    },
    {
      avatar: "/assets/deep.jpg",
      name: "Deep Agrawal",
      college: "IIT Bombay",
      quote:
        "I'm really grateful to Novare Talent for helping me secure an internship and saving me the time I would've spent on apping process endlessly.",
    },
    {
      avatar: "/assets/yashika.jpg",
      name: "Yashika Singh",
      college: "IIT Bombay",
      quote:
        "Novare Talent helped me discover opportunities that matched my creative journey and kept things simple. Thanks Novare talent",
    },
    {
      avatar: "/assets/nikhil.jpg",
      name: "Nikhil Khandelwal",
      college: "IIT Bombay",
      quote:
        "Working in a startup opened many doors for growth, from exercising my skill of expertise to making useful connections. Grateful to the Novare Talent team for helping me find an opportunity that truly pushed me to grow.",
    },
  ];

  return (
    <>
      <style jsx global>{`
        :root {
          --white: #ffffff;
          --black: #000000;
          --near-black: #0c0c0c;
          --ink: #030303;
          --accent: #7f00e2;
          --chip-bg: #141414;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: var(--black);
          color: var(--white);
          font-family:
            "DM Sans",
            system-ui,
            -apple-system,
            Segoe UI,
            Roboto,
            Arial,
            sans-serif;
          width: 100%;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        html {
          overflow-y: auto;
        }

        body {
          overflow-y: auto;
        }

        .stage {
          width: 100vw;
          position: relative;
          overflow-y: visible;
        }

        .page {
          width: 1920px;
          min-height: 7358px;
          margin: 0;
          position: relative;
          left: 0;
          transform-origin: top left;
          overflow-y: visible;
        }

        .section {
          position: relative;
        }

        section[id] {
          scroll-margin-top: 10px;
        }

        .section img {
          display: block;
        }

        img {
          max-width: 100%;
          height: auto;
        }

        .nav__link,
        .btn,
        .chip {
          font-size: 33.3333px;
          line-height: 1.302em;
          font-weight: 400;
        }
        .hero__subtitle {
          font-size: 33.3333px;
          line-height: 1.302em;
          font-weight: 400;
        }
        .hero__title {
          font-family: "Poppins", sans-serif;
          font-size: 66.991px;
          line-height: 1.5em;
          font-weight: 400;
        }
        .intro__title {
          font-family: "Poppins", sans-serif;
          font-size: 105.7353px;
          line-height: 1.5em;
          font-weight: 400;
        }
        .intro__description {
          font-size: 33.5636px;
          line-height: 1.302em;
          text-align: center;
        }
        .card__title {
          font-size: 40.7013px;
          line-height: 1.302em;
          text-align: center;
        }
        .card__bullets {
          font-size: 28.8295px;
          line-height: 1.37em;
        }
        .chip {
          font-size: 28.9163px;
        }
        .trust__subhead {
          font-size: 33.1953px;
          line-height: 1.39em;
          text-align: center;
        }
        .faq__title {
          font-family: "Inter", sans-serif;
          font-size: 32.6765px;
          line-height: 1.21em;
        }
        .footer__meta,
        .footer__link,
        .footer__contact {
          font-size: 27px;
          line-height: 1.302em;
        }
        .footer__link {
          font-size: 24px;
        }

        .hero {
          height: 1080px;
          overflow: hidden;
        }

        .hero__top {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 240px;
          background-color: #000;
          border-bottom-left-radius: 140px;
          border-bottom-right-radius: 140px;
          filter: saturate(120%) brightness(1.05);
        }

        .hero__bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 1080px;
          object-fit: cover;
        }

        .nav {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 120px;
          display: flex;
          align-items: center;
          background-color: #000;
          justify-content: center;
        }

        .nav__logo {
          position: absolute;
          left: 40px;
          top: -20px;
          width: 295px;
          height: 166px;
          object-fit: contain;
        }

        .nav__links {
          position: absolute;
          left: 463px;
          top: 42px;
          display: flex;
          gap: 44px;
          align-items: center;
        }

        .nav__link {
          color: var(--white);
          text-decoration: none;
        }

        .nav__link:hover {
          background: rgba(127, 0, 226, 0.3);
          border-color: #7f00e2;
          border-radius: 40%;
          box-shadow:
            0 0 30px rgba(127, 0, 226, 0.7),
            0 0 60px rgba(127, 0, 226, 0.4),
            0 0 90px rgba(127, 0, 226, 0.2);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          text-decoration: none;
        }

        .btn--outline {
          position: absolute;
          left: 1618px;
          top: 30px;
          width: 238px;
          height: 68px;
          border-radius: 40px;
          border: 2px solid transparent;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(6px);
          box-shadow:
            0 0 0 1px rgba(127, 0, 226, 0.15) inset,
            0 12px 28px rgba(0, 0, 0, 0.5);
        }

        .btn--outline::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 40px;
          padding: 2px;
          background: linear-gradient(
            135deg,
            rgba(148, 39, 255, 1) 0%,
            rgba(67, 0, 144, 1) 50%,
            rgba(10, 10, 10, 1) 100%
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .btn--outline:hover {
          box-shadow:
            0 0 0 1px rgba(127, 0, 226, 0.25) inset,
            0 18px 36px rgba(0, 0, 0, 0.6);
        }

        .nav .btn--outline:hover {
          background: rgba(127, 0, 226, 0.4);
          border-color: #7f00e2;
          box-shadow:
            0 0 30px rgba(127, 0, 226, 0.7),
            0 0 60px rgba(127, 0, 226, 0.4),
            0 0 90px rgba(127, 0, 226, 0.2);
        }

        .nav__socials {
          position: absolute;
          left: 1365px;
          top: 30px;
          display: flex;
          margin-top: 10px;
          gap: 20px;
        }

        .social--header {
          width: 48px;
          height: 48px;
        }

        .social--header:hover {
          background: rgba(127, 0, 226, 0.5);
          border-color: #7f00e2;
          border-radius: 30%;
          box-shadow:
            0 0 30px rgba(127, 0, 226, 0.7),
            0 0 60px rgba(127, 0, 226, 0.4),
            0 0 90px rgba(127, 0, 226, 0.2);
        }

        .nav__separator {
          position: absolute;
          left: 0;
          top: 120px;
          width: 100%;
          height: 1px;
          background: #000;
          opacity: 1;
        }

        .hero__content {
          position: absolute;
          left: 360px;
          top: 330px;
          width: 1200px;
          text-align: left;
        }

        .hero__title {
          margin: 0 0 48px 0;
        }

        .hero__subtitle {
          position: relative;
          left: 0;
          top: 0;
          width: 100%;
          margin: 6px 0 0 0;
          opacity: 0.9;
        }

        .hero__cta {
          position: absolute;
          left: 812px;
          top: 768px;
          width: 296px;
          height: 84px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero__cta--top {
          top: 400px;
          left: 450px;
        }

        .btn--primary {
          width: 290px;
          height: 100px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 60px;
          color: var(--white);
          text-decoration: none;
          background-color: #000;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(127, 0, 226, 0.3);
        }

        .btn--primary:hover {
          transform: translateY(-8px);
          background: rgba(127, 0, 226, 0.55);
          border-color: #7f00e2;
          box-shadow:
            0 0 30px rgba(127, 0, 226, 0.7),
            0 0 60px rgba(127, 0, 226, 0.4),
            0 0 90px rgba(127, 0, 226, 0.2);
        }

        .btn-glow {
          position: absolute;
          left: -4px;
          top: 42px;
          width: 304px;
          height: 66px;
          filter: blur(50.5px);
          background: #000;
          border-radius: 999px;
          z-index: -1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero__cta .btn--primary {
          z-index: 1;
          border: 4px solid #6c00e2;
          box-shadow: 3px 12px 24.2px rgba(0, 0, 0, 1);
        }

        .hero__cta:hover .btn-glow {
          opacity: 1;
          transform: scale(1.2);
          filter: blur(40px);
        }

        .hero__bottom-glow {
          position: absolute;
          left: -27.49px;
          top: 983.36px;
          width: 1960.61px;
          height: 141.66px;
          filter: blur(72px);
          background: #000;
        }

        .intro {
          height: 1080px;
        }

        .intro__badge {
          position: absolute;
          left: 660px;
          width: 650px;
          height: 106px;
          display: grid;
          place-items: center;
          border-radius: 52.6415px;
          background: var(--ink);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
        }

        .intro__badge::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 52.6415px;
          padding: 5px;
          background: linear-gradient(
            135deg,
            rgba(148, 39, 255, 1) 0%,
            rgba(67, 0, 144, 1) 50%,
            rgba(10, 10, 10, 1) 100%
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .intro__badge-text {
          font-size: 41.0855px;
          line-height: 1.302em;
          font-weight: 400;
        }

        .intro__title {
          position: absolute;
          left: 434px;
          top: 140px;
          width: 1098px;
          z-index: 1;
          text-align: center;
        }

        .intro__title-base {
          color: #fff;
          font-style: italic;
        }

        .intro__title-accent {
          font-style: italic;
          display: inline-block;
          width: auto;
          padding-right: 0.2em;
          margin-right: -0.2em;
          background: linear-gradient(135deg, #a83cff 0%, #7f00e2 70%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .intro__description {
          position: absolute;
          left: 330px;
          top: 430px;
          width: 1278px;
          z-index: 1;
        }

        .intro__grid {
          position: absolute;
          left: 214px;
          top: 640px;
          display: grid;
          grid-template-columns: 660px 660px;
          gap: 103px;
        }

        .card {
          position: relative;
          width: 700px;
          height: 395px;
          border-radius: 60px;
          background: var(--near-black);
          padding: 32px 40px;
          box-shadow: inset 0 0 0 1px rgba(127, 0, 226, 0.08);
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 60px;
          padding: 2px;
          background: linear-gradient(153deg, #7f00e2 0%, #050505 80%);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 60px;
          background: radial-gradient(
            120% 120% at 100% 100%,
            rgba(127, 0, 226, 0.38) 0%,
            rgba(127, 0, 226, 0.12) 38%,
            rgba(0, 0, 0, 0) 62%
          );
          mix-blend-mode: normal;
          pointer-events: none;
        }

        .card__title {
          margin: 0;
          text-align: left;
          bottom: 100px;
          font-weight: 500;
          font-family: "Poppins", sans-serif;
        }

        .card__bullets {
          margin: 24px 0;
          padding-left: 20px;
          font-style: italic;
        }

        .card__bullets li {
          margin: 6px 0;
          top: 100px;
        }

        .chip {
          position: relative;
          top: 20px;
          bottom: auto;
          left: auto;
          width: auto;
          height: 40px;
          padding: 0 16px;
          border-radius: 8px;
          background: var(--accent);
          color: var(--white);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.6);
          margin: 16px 0 18px;
        }

        .trust {
          height: 1080px;
        }

        .trust__subhead {
          position: absolute;
          left: 311px;
          top: 214.38px;
          width: 1286px;
        }

        .students,
        .clients {
          height: 987px;
          position: relative;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        .students {
          /* ORIGINAL: margin-top: -200px; */
          margin-top: -100px; /* Adjusted to reduce gap */
        }

        .students__marquee,
        .clients__marquee {
          position: absolute;
          left: 111px;
          top: 400px;
          width: 1694px;
          height: 594px;
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .students__label-card,
        .clients__label-card {
          width: 370px;
          min-width: 360px;
          height: 594px;
          border-radius: 28px;
          background: var(--near-black);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-shadow: inset 0 0 0 1px rgba(127, 0, 226, 0.4);
          flex-shrink: 0;
        }

        .students__label-card::before,
        .clients__label-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 2px;
          background: linear-gradient(153deg, #7f00e2 0%, #050505 80%);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .students__label,
        .clients__label {
          text-align: center;
          font-size: 42px;
          font-weight: 400;
          line-height: 1.35em;
          position: relative;
          z-index: 1;
          color: #fff;
        }

        .students__viewport,
        .clients__viewport {
          flex: 1;
          overflow: hidden;
          height: 594px;
          position: relative;
        }

        .students__track {
          display: flex;
          align-items: center;
          gap: 48px;
          height: 594px;
          will-change: transform;
          animation: marquee-scroll-continuous-stu 45s linear infinite;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .clients__track {
          display: flex;
          align-items: center;
          gap: 48px;
          height: 594px;
          will-change: transform;
          animation: marquee-scroll-continuous-cli 20s linear infinite;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .students__viewport:hover .students__track,
        .clients__viewport:hover .clients__track {
          animation-play-state: paused;
        }

        .students__card,
        .clients__card {
          position: relative;
          width: 843px;
          height: 594px;
          border-radius: 28px;
          background: var(--near-black);
          border: none;
          box-shadow: inset 0 0 0 1px rgba(127, 0, 226, 0.4);
          padding: 48px;
          padding-left: 240px;
          flex: 0 0 843px;
          overflow: hidden;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .students__card::before,
        .clients__card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 2px;
          background: linear-gradient(153deg, #7f00e2 0%, #050505 80%);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .students__avatar,
        .clients__avatar {
          position: absolute;
          left: 57px;
          top: 55px;
          width: 155px;
          height: 155px;
          border-radius: 50%;
          background: #d9d9d9;
          overflow: hidden;
        }

        .students__avatar img,
        .clients__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .students__name,
        .clients__name {
          position: relative;
          margin: 0 0 12px 0;
          font-size: 48px;
          font-weight: 700;
          line-height: 1.2;
          color: #fff;
        }

        .students__college,
        .clients__company {
          position: relative;
          margin: 0 0 24px 0;
          font-size: 28px;
          font-weight: 400;
          line-height: 1.3;
          color: rgba(255, 255, 255, 0.8);
        }

        .students__quote,
        .clients__quote {
          position: relative;
          margin: 0;
          font-size: 26px;
          font-weight: 400;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        @keyframes marquee-scroll-continuous-stu {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-580%, 0, 0);
          }
        }

        @keyframes marquee-scroll-continuous-cli {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-205%, 0, 0);
          }
        }

        .team {
          height: 1080px;
          position: relative;
        }

        .team__img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          margin-top: 20px;
          object-fit: contain;
        }
        
        /* Adjusted height to minimize gap above it */
        .trust {
          height: 100px; /* ORIGINAL: 1080px */
        }

        .flare {
          height: 150px;
          position: relative;
          overflow: visible;
        }

        .flare::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 24px;
          height: 8px;
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0%,
            #7f00e2 30%,
            #b46aff 50%,
            #7f00e2 70%,
            rgba(0, 0, 0, 0) 100%
          );
          filter: blur(2px);
          opacity: 0.9;
        }

        .flare::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          width: 520px;
          height: 160px;
          background:
            radial-gradient(
              closest-side,
              #c08aff 0%,
              rgba(191, 128, 255, 0.75) 20%,
              rgba(127, 0, 226, 0.45) 40%,
              rgba(0, 0, 0, 0) 70%
            ),
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0) 0%,
              #7f00e2 45%,
              #ffffff 50%,
              #7f00e2 55%,
              rgba(0, 0, 0, 0) 100%
            );
          filter: blur(18px) saturate(120%);
          mix-blend-mode: screen;
        }

        .faq {
          min-height: 1260px;
          height: auto;
          overflow: visible;
          margin-top: -160px;
          margin-bottom: 60px;
        }

        .faq__bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 1080px;
          object-fit: cover;
        }

        .faq__header {
          position: absolute;
          left: 821px;
          top: 88px;
          width: 277px;
          height: 86px;
          display: grid;
          justify-items: center;
        }

        .faq__badge {
          width: 277px;
          height: 86px;
          display: grid;
          place-items: center;
          border-radius: 52.6415px;
          background: var(--ink);
          position: relative;
          font-size: 2.5rem;
          padding: 1rem 2.5rem;
        }

        .faq__badge::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 52.6415px;
          padding: 3.5px;
          background: linear-gradient(90deg, #000 0%, #7f00e2 100%);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .faq__title {
          position: absolute;
          left: -378px;
          top: 126px;
          width: 1132px;
          margin: 0;
        }

        .faq__list {
          position: absolute;
          left: 283px;
          top: 433px;
          width: 1355px;
          display: grid;
          row-gap: 18px;
          grid-auto-rows: auto;
        }

        .faq__item {
          position: relative;
          border-radius: 24px;
          background: var(--chip-bg);
        }

        .faq__item::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(
            135deg,
            #7f00e2 0%,
            #3b0072 50%,
            #050505 100%
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .faq__question {
          width: 100%;
          height: 137px;
          padding: 0 72px 0 32px;
          color: var(--white);
          background: transparent;
          border: 0;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 33px;
          line-height: 1.3em;
          border-radius: 24px;
          position: relative;
          cursor: pointer;
        }

        .faq__toggle {
          position: absolute;
          right: 28px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          color: var(--accent);
        }

        .faq__toggle::before {
          content: "+";
          font-size: 46px;
          line-height: 1;
          color: #7f00e2;
        }

        .faq__item.is-open .faq__toggle::before {
          content: "-";
          font-size: 46px;
        }

        .faq__answer {
          color: #cfcfcf;
          font-size: 28px;
          line-height: 1.4em;
          padding: 0 32px 24px;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition:
            max-height 320ms ease,
            opacity 260ms ease;
        }

        .faq__item.is-open .faq__answer {
          opacity: 1;
          max-height: 500px;
        }

        .faq__item.is-open::before {
          background: linear-gradient(
            135deg,
            #9b3bff 0%,
            #5a00b5 50%,
            #101010 100%
          );
        }

        .footer {
          height: 855px;
          margin-top: 60px;
          z-index: 1;
        }

        .footer__bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 1000px;
          object-fit: cover;
          z-index: -1;
        }

        .footer__strip {
          position: absolute;
          left: 0;
          top: 662px;
          width: 1920px;
          height: 418px;
          background: #000;
        }

        .footer__cta {
          position: absolute;
          left: 1521px;
          top: 733px;
          width: 257px;
          height: 68px;
          display: grid;
          place-items: center;
        }

        .footer__logo {
          position: absolute;
          left: 57px;
          top: 667px;
          width: 392px;
          height: 221px;
          object-fit: contain;
        }

        .footer .btn--outline {
          position: static;
          width: 238px;
          height: 68px;
        }

        .footer__socials {
          position: absolute;
          left: 1553px;
          top: 861px;
          display: flex;
          gap: 62px;
        }

        .footer__meta {
          position: absolute;
          left: 80px;
          top: 878px;
          width: 1698px;
          height: 145.5px;
        }

        .footer__legal {
          position: absolute;
          left: 0;
          top: 110.5px;
          width: 702px;
        }

        .footer__contact {
          position: absolute;
          left: 1044px;
          top: 103px;
          width: 654px;
          text-align: left;
        }

        .footer__links {
          position: absolute;
          left: 0;
          top: 0;
          width: 1280px;
          display: flex;
          align-items: start;
          gap: 272px;
        }

        .footer__links-group {
          display: flex;
          gap: 74px;
        }

        .footer__link {
          color: var(--white);
          text-decoration: none;
        }
      `}</style>

      <div className="stage" ref={stageRef}>
        <div className="page" ref={pageRef}>
          {/* Hero Section */}
          <section className="section hero" id="hero">
            <div className="hero__top" aria-hidden="true"></div>
            <Image
              className="hero__bg"
              src="/assets/hero-background.png"
              alt="Hero background"
              width={1920}
              height={1080}
              priority
            />

            <header className="nav" aria-label="Primary">
              <Image
                className="nav__logo"
                src="/assets/logo-novare-talent.png"
                alt="Novare Talent"
                width={295}
                height={166}
              />
              <nav className="nav__links">
                <a href="#about" className="nav__link">
                  About
                </a>
                <a href="#product" className="nav__link">
                  Product
                </a>
                <a href="#testimonials" className="nav__link">
                  Testimonials
                </a>
                <a href="#team" className="nav__link">
                  Team
                </a>
                <a href="#faqs" className="nav__link">
                  FAQs
                </a>
              </nav>
              <a
                href={getDashboardPath()}
                className="btn btn--outline"
              >
                {user ? "Dashboard" : "Try Zenhyre"}
              </a>
              <div className="nav__socials">
                <a
                  href="https://www.instagram.com/novare_talent?igsh=MWkyaGw0dmdiaWM5NA=="
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/assets/icon-instagram-header.svg"
                    alt="Instagram"
                    className="social social--header"
                    width={64}
                    height={64}
                  />
                </a>
                <a
                  href="https://www.linkedin.com/company/novare-talent/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/assets/icon-linkedin-header.svg"
                    alt="LinkedIn"
                    className="social social--header"
                    width={64}
                    height={64}
                  />
                </a>
              </div>
            </header>
            <div className="nav__separator" aria-hidden="true"></div>

            <div className="hero__content">
              <h1 className="hero__title">
                <span
                  style={{
                    display: "inline-block",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  We help companies hire from
                </span>
                <br />
                <span
                  style={{
                    display: "inline-block",
                    textAlign: "center",
                    color: "#7f00e2",
                    width: "100%",
                    fontStyle: "italic",
                  }}
                >
                  India&apos;s Top 1% Institutes
                </span>
              </h1>
              <p className="hero__subtitle">
                <span
                  style={{
                    display: "inline-block",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Hire curated talent for your company from IITs, IIMs and more
                </span>
              </p>

              <div className="hero__cta hero__cta--top">
                <div className="btn-glow" aria-hidden="true"></div>
                <a href={getDashboardPath()} className="btn btn--primary">
                  {user ? "Try Zenhyre" : "Try Zenhyre"}
                </a>
              </div>
              <div className="hero__cta" id="cta-hero">
                <div className="btn-glow" aria-hidden="true"></div>
                <a href={getDashboardPath()} className="btn btn--primary">
                  {user ? "Try Zenhyre" : "Try Zenhyre"}
                </a>
              </div>
            </div>

            <div className="hero__bottom-glow" aria-hidden="true"></div>
          </section>

          {/* Intro Section */}
          <section className="section intro" id="product">
            <div className="intro__badge">
              <span className="intro__badge-text">
                A product from Novare Talent
              </span>
            </div>
            <h3 className="intro__title">
              Introducing <span className="intro__title-base">Zen</span>
              <span className="intro__title-accent">hyre</span>
            </h3>
            <p className="intro__description">
              A curated portal exclusively for recruiters and students from
              India&apos;s top colleges, designed to connect each other simpler
              and faster.
            </p>

            <div className="intro__grid">
              <article className="card card--left">
                <h4 className="card__title">Looking to expand your team?</h4>
                <a href="/sign-up" className="chip">
                  Sign up as recruiter
                </a>
                <ul className="card__bullets">
                  <li>Access to exclusive Talent pool</li>
                  <li>Hire curated candidates</li>
                  <li>Faster and simpler</li>
                </ul>
              </article>
              <article className="card card--right">
                <h4 className="card__title">Searching for opportunities?</h4>
                <a href="/sign-up" className="chip">
                  Sign up as student
                </a>
                <ul className="card__bullets">
                  <li>Internships and job opportunities</li>
                  <li>Resources for career guidance</li>
                  <li>Tools &amp; much more</li>
                </ul>
              </article>
            </div>
          </section>

          {/* Trust Wall */}
          <section
            className="section trust"
            id="testimonials"
            style={{ height: "250px" }}
          >
            <div className="intro__badge">
              <span className="intro__badge-text">
                Trust Wall of Novare Talent
              </span>
            </div>
            <p className="trust__subhead">
              We began with a mission to fix what frustrated us all. And today,
              they&apos;re the ones who believed in that vision and placed their
              trust in us.
            </p>
          </section>

          {/* Client Testimonials */}
          <section className="section clients" id="clients">
            <div className="clients__marquee">
              <div className="clients__label-card">
                <span className="clients__label">
                  What our clients have to say about us :
                </span>
              </div>
              <div
                className="clients__viewport"
                aria-label="Client testimonials"
              >
                <div className="clients__track">
                  {[...Array(4)].map((_, roundIdx) =>
                    clientTestimonials.map((testimonial, idx) => (
                      <article
                        className="clients__card"
                        key={`${roundIdx}-${idx}`}
                        aria-hidden={roundIdx > 0}
                      >
                        <div className="clients__avatar">
                          <Image
                            src={testimonial.avatar}
                            alt="Client avatar"
                            width={155}
                            height={155}
                          />
                        </div>
                        <h3 className="clients__name">{testimonial.name}</h3>
                        <p className="clients__company">
                          {testimonial.company}
                        </p>
                        <p className="clients__quote">{testimonial.quote}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Student Testimonials */}
          <section className="section students" id="students">
            <div className="students__marquee">
              <div className="students__label-card">
                <span className="students__label">
                  What our students have to say about us :
                </span>
              </div>
              <div
                className="students__viewport"
                aria-label="Student testimonials"
              >
                <div className="students__track">
                  {[...Array(4)].map((_, roundIdx) =>
                    studentTestimonials.map((testimonial, idx) => (
                      <article
                        className="students__card"
                        key={`${roundIdx}-${idx}`}
                        aria-hidden={roundIdx > 0}
                      >
                        <div className="students__avatar">
                          <Image
                            src={testimonial.avatar}
                            alt="Student avatar"
                            width={155}
                            height={155}
                          />
                        </div>
                        <h3 className="students__name">{testimonial.name}</h3>
                        <p className="students__college">
                          {testimonial.college}
                        </p>
                        <p className="students__quote">{testimonial.quote}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="section team" id="team" aria-label="Team">
            <Image
              className="team__img"
              src="/assets/team.svg"
              alt="The team"
              width={1920}
              height={1080}
            />
          </section>

          {/* Flare Divider */}
          <section className="section flare" aria-hidden="true"></section>

          {/* FAQs */}
          <section className="section faq" id="faqs">
            <Image
              className="faq__bg"
              src="/assets/faq-bg.png"
              alt="FAQ background"
              width={1920}
              height={1080}
            />
            <div className="faq__header">
              <div className="faq__badge">FAQs</div>
              <h2 className="faq__title">
                Get answers to your questions and learn about us and our
                platform
              </h2>
            </div>
            <div className="faq__list" role="list">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`faq__item ${openFaqIndex === index ? "is-open" : ""}`}
                  role="listitem"
                >
                  <button
                    className="faq__question"
                    aria-expanded={openFaqIndex === index}
                    onClick={() => toggleFaq(index)}
                  >
                    {faq.question}
                    <span className="faq__toggle" aria-hidden="true"></span>
                  </button>
                  <div className="faq__answer">{faq.answer}</div>
                </div>
              ))}
            </div>
          </section>
          <div className="mt-64 pb-4"></div>
          {/* Footer */}
          <footer className="section footer" role="contentinfo">
            <Image
              className="footer__bg"
              src="/assets/footer-bg.png"
              alt="Footer background"
              width={1920}
              height={1000}
            />
            <div className="footer__strip"></div>

            <div className="footer__cta">
              <a
                href={getDashboardPath()}
                className="btn btn--outline"
              >
                {user ? "Try Zenhyre" : "Try Zenhyre"}
              </a>
            </div>

            <Image
              className="footer__logo"
              src="/assets/logo-novare-talent.png"
              alt="Novare Talent"
              width={392}
              height={221}
            />

            <div className="footer__socials">
              <a
                href="https://www.instagram.com/novare_talent?igsh=MWkyaGw0dmdiaWM5NA=="
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/assets/icon-instagram.svg"
                  alt="Instagram"
                  className="social"
                  width={48}
                  height={48}
                />
              </a>
              <a
                href="https://www.linkedin.com/company/novare-talent/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/assets/icon-linkedin.svg"
                  alt="LinkedIn"
                  className="social"
                  width={48}
                  height={48}
                />
              </a>
            </div>

            <div className="footer__meta">
              <div className="footer__legal">
                © 2025 Novare Talent Private Limited. All rights reserved
              </div>
              <div className="footer__contact">
                info@novaretalent.com <span style={{ margin: "0 1em" }}></span>{" "}
                Contact: 8708260409
              </div>
              <nav className="footer__links" aria-label="Footer">
                <div className="footer__links-group footer__links-group--left">
                  <a href="/Terms&Conditions.pdf" className="footer__link">
                    Terms of service
                  </a>
                  <a href="/Refund&CreditPolicy.pdf" className="footer__link">
                    Refund Policy
                  </a>
                </div>
                <div className="footer__links-group footer__links-group--right">
                  <a href="#about" className="footer__link">
                    About
                  </a>
                  <a href="#product" className="footer__link">
                    Product
                  </a>
                  <a href="#testimonials" className="footer__link">
                    Testimonials
                  </a>
                  <a href="#team" className="footer__link">
                    Team
                  </a>
                </div>
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
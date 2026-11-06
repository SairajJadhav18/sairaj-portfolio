"use client";
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowDownRight, ArrowUpRight, Mail } from 'lucide-react';
import { projects, experience, education } from '@/data/content';
import SiteNav from './SiteNav';
import TelemetryCursor from './TelemetryCursor';
import ProjectGallery from './ProjectGallery';
import ContactSection from './ContactSection';
const RaceStartScene=dynamic(()=>import('./RaceStartScene'),{ssr:false});
const SkillNetworkMap=dynamic(()=>import('./SkillNetworkMap'),{ssr:false,loading:()=><section id="expertise" className="expertise-placeholder" aria-busy="true"/>});

const smooth=(a:number,b:number,t:number)=>{const x=Math.min(1,Math.max(0,(t-a)/(b-a)));return x*x*(3-2*x);};

export default function Portfolio(){
 const journey=useRef<HTMLElement>(null);
 const heroCopy=useRef<HTMLDivElement>(null);
 const hudFill=useRef<HTMLDivElement>(null);
 const progress=useRef(0);
 const [reduced,setReduced]=useState(false);
 const [loaded,setLoaded]=useState(false);

 useEffect(()=>{
  const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>setReduced(mq.matches);sync();
  mq.addEventListener('change',sync);
  setLoaded(true);
  return()=>mq.removeEventListener('change',sync);
 },[]);

 // Hero scroll timeline + section reveals.
 useEffect(()=>{
  if(!loaded)return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});
  if(reduced){gsap.set('.rise',{clearProps:'all'});return;}
  const ctx=gsap.context(()=>{
   ScrollTrigger.create({trigger:journey.current,start:'top top',end:'bottom bottom',onUpdate:self=>{
    const t=self.progress;progress.current=t;
    const copy=heroCopy.current;
    if(copy){
     // The hero copy gracefully steps aside when the lights go out, so the launch is visible.
     const fade=1-smooth(.3,.5,t);
     copy.style.opacity=String(fade);
     copy.style.translate=`0 ${(-36*(1-fade)).toFixed(1)}px`;
     copy.style.pointerEvents=fade<.2?'none':'';
    }
    if(hudFill.current){
     hudFill.current.parentElement?.classList.toggle('is-live',t>.005);
     hudFill.current.style.transform=`scaleX(${Math.max(.02,Math.min(1,t/.37)).toFixed(3)})`;
    }
   }});
   gsap.set('.rise',{autoAlpha:0,y:28});
   ScrollTrigger.batch('.rise',{start:'top 90%',once:true,onEnter:els=>gsap.to(els,{autoAlpha:1,y:0,duration:.75,ease:'power2.out',stagger:.07,overwrite:true})});
  });
  // Lazy sections change the page height; keep trigger positions accurate.
  let timer=0;
  const ro=new ResizeObserver(()=>{window.clearTimeout(timer);timer=window.setTimeout(()=>ScrollTrigger.refresh(),180);});
  ro.observe(document.body);
  return()=>{ro.disconnect();window.clearTimeout(timer);ctx.revert();};
 },[loaded,reduced]);

 // Pause CSS animations in sections that are off-screen (saves battery and keeps scrolling smooth).
 useEffect(()=>{
  const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('is-offscreen',!e.isIntersecting)),{rootMargin:'200px 0px'});
  const observed=new Set<Element>();
  const scan=()=>document.querySelectorAll('main > section').forEach(s=>{if(!observed.has(s)){observed.add(s);io.observe(s);}});
  scan();
  const mo=new MutationObserver(scan);
  const main=document.querySelector('main');if(main)mo.observe(main,{childList:true});
  return()=>{io.disconnect();mo.disconnect();};
 },[]);

 return <main>
  <TelemetryCursor/>
  <a href="#about" className="skip-link">Skip to content</a>
  <SiteNav/>
  <section id="top" ref={journey} className="journey race-journey" aria-label="Introduction">
   <div className="journey-sticky race-sticky">
    <div className="scene-shell">{loaded&&<RaceStartScene progress={progress} reduced={reduced}/>}</div>
    <div className="race-shade"/>
    <div className="race-topline"><span>SAIRAJ JADHAV / TECHNOLOGY PORTFOLIO</span><span>STARTING GRID · 2026</span></div>
    <div className="race-hero-content" ref={heroCopy}>
     <div className="race-kicker"><span className="race-kicker-dot"/> CYBERSECURITY / DATA SCIENCE / SOFTWARE</div>
     <h1>SAIRAJ<br/><em>JADHAV.</em></h1>
     <p>Applied Computer Science student at Dalhousie University, exploring cybersecurity, data science, analytics, and software development.</p>
     <div className="hero-status"><span className="hero-status-dot"/>Graduating Dec 2026 · Open to opportunities</div>
     <div className="hero-actions">
      <a href="#projects" className="hero-btn hero-btn-primary">View projects <ArrowDownRight size={17}/></a>
      <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hero-btn">Résumé <ArrowUpRight size={17}/></a>
      <a href="#contact" className="hero-btn hero-btn-ghost"><Mail size={16}/> Contact</a>
     </div>
     <ul className="hero-facts" aria-label="At a glance"><li><b>{projects.length}</b> technical projects</li><li><b>{experience.length}</b> roles</li><li><b>BACS</b> Dalhousie University</li></ul>
    </div>
    <div className="race-hud"><span>SCROLL TO START THE RACE</span><div className="race-hud-track"><div className="race-hud-fill" ref={hudFill}/></div><a href="#about" className="race-skip">SKIP INTRO <ArrowDown size={14}/></a></div>
   </div>
  </section>
  <section id="about" className="about-section" aria-labelledby="about-heading">
    <div className="about-heading-row"><span className="section-index">ABOUT ME / 001</span><span className="about-section-label">COMPUTER SCIENCE STUDENT · HALIFAX, NS</span></div>
    <div className="about-layout">
      <div className="about-photo-frame rise"><Image src="/about-portrait.jpg" alt="Portrait of Sairaj Jadhav wearing a black suit in front of a wooden backdrop" fill sizes="(max-width: 850px) 90vw, 42vw" className="about-photo"/><span className="about-photo-caption">SAIRAJ JADHAV <span>© 2026</span></span></div>
      <div className="about-copy"><span className="about-overline">CYBERSECURITY · DATA SCIENCE · SOFTWARE</span><h2 id="about-heading" className="rise">Hi, I&apos;m <em>Sairaj.</em></h2><p className="about-lead rise">I’m beginning my career in technology, exploring cybersecurity, data science, and analytics through hands-on projects.</p><p className="about-description rise">I&apos;m completing my Bachelor of Applied Computer Science at Dalhousie University. I&apos;m curious about how systems work, how to keep them secure, and how data can help solve practical problems. So far, I&apos;ve explored healthcare applications, SQL databases, Python data pipelines, Power BI dashboards, and machine-learning projects. I&apos;m still learning, experimenting, and finding where I want to grow.</p>
        <div className="about-focus rise"><span>TOOLS I’VE USED</span><div>React & Node.js <b>·</b> Python & SQL <b>·</b> Power BI & DAX <b>·</b> AWS</div></div>
        <div className="about-education rise"><div className="about-education-heading"><span>EDUCATION</span><span>EXPECTED DEC 2026</span></div><strong>{education.degree}</strong><p>{education.school} <span>·</span> {education.location}</p><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">VIEW MY RÉSUMÉ <ArrowUpRight size={16}/></a></div>
      </div>
    </div>
  </section>
  <section id="projects" className="projects-section" aria-labelledby="projects-heading"><div className="projects-header"><div><span className="section-index">PROJECT PORTFOLIO / 002</span><h2 id="projects-heading" className="rise">TECHNICAL <em>PROJECTS.</em></h2></div><p>SOFTWARE PROJECTS · DATA ANALYTICS · MACHINE LEARNING<br/>DRAG OR SWIPE TO BROWSE · CLICK FOR DETAILS →</p></div>
   <ProjectGallery reduced={reduced}/>
  </section>
  <SkillNetworkMap/>
  <section id="experience" className="experience-section" aria-labelledby="experience-heading"><div className="experience-intro"><div className="section-index">PROFESSIONAL EXPERIENCE / 004</div><h2 id="experience-heading" className="rise">RELEVANT<br/><em>EXPERIENCE.</em></h2><p className="experience-deck">Junior Developer · Best Buy Sales & Omni Channel Specialist · Neo Financial Sales Representative. Technical delivery, stakeholder communication, and customer-facing problem solving.</p></div><div className="experience-feature-list">{experience.map((e,i)=><article className="experience-feature rise" key={e.title}><div className="experience-feature-meta"><span>0{i+1} / 0{experience.length}</span><span>{e.type}</span></div><div className="experience-feature-body"><div><h3>{e.title}</h3><p className="experience-company">{e.company}</p><p className="experience-description">{e.description}</p><div className="experience-pills">{e.highlights.map(h=><span key={h}>{h}</span>)}</div></div><span className="experience-date">{e.date}</span></div></article>)}</div>
   <div className="cta-strip rise"><div><span>NEXT STEP</span><p>Want to talk about a role or a project?</p></div><div className="cta-strip-actions"><a href="#contact" className="hero-btn hero-btn-primary">Get in touch <ArrowDownRight size={17}/></a><a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hero-btn">Download résumé <ArrowUpRight size={17}/></a></div></div>
  </section>
  <ContactSection/>
 </main>;
}

"use client";
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowUpRight, Github, Mail, MoveRight } from 'lucide-react';
import { projects, skills, experience, education } from '@/data/content';
const RaceStartScene=dynamic(()=>import('./RaceStartScene'),{ssr:false});
const ExpertiseWorkstation=dynamic(()=>import('./ExpertiseWorkstation'),{ssr:false});
export default function Portfolio(){
 const journey=useRef<HTMLElement>(null), track=useRef<HTMLDivElement>(null), gallery=useRef<HTMLElement>(null);
 const progress=useRef(0); const [reduced,setReduced]=useState(false); const [loaded,setLoaded]=useState(false); const cursorRef=useRef<HTMLDivElement>(null); const cursorTarget=useRef({x:-100,y:-100}); const [cursorActive,setCursorActive]=useState(false);
 useEffect(()=>{
  setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  setLoaded(true);
  let frame=0, x=-100, y=-100;
  const move=(e:PointerEvent)=>{cursorTarget.current={x:e.clientX,y:e.clientY};setCursorActive(!!(e.target as HTMLElement)?.closest('a,button,.project-slide'));};
  const animate=()=>{x+=(cursorTarget.current.x-x)*.24;y+=(cursorTarget.current.y-y)*.24;if(cursorRef.current)cursorRef.current.style.transform=`translate3d(${x}px,${y}px,0)`;frame=requestAnimationFrame(animate);};
  window.addEventListener('pointermove',move,{passive:true});frame=requestAnimationFrame(animate);
  return()=>{window.removeEventListener('pointermove',move);cancelAnimationFrame(frame);};
 },[]);
 useEffect(()=>{
  if(!loaded||reduced)return;
  gsap.registerPlugin(ScrollTrigger);
  const ctx=gsap.context(()=>{
   ScrollTrigger.create({trigger:journey.current,start:'top top',end:'bottom bottom',onUpdate:self=>{progress.current=self.progress;}});
   if(track.current&&gallery.current&&window.matchMedia('(min-width: 851px)').matches){
    const distance=()=>Math.max(0,track.current!.scrollWidth-gallery.current!.clientWidth);
    const galleryTween=gsap.to(track.current,{x:()=>-distance(),ease:'none',overwrite:'auto',scrollTrigger:{trigger:gallery.current,start:'top top',end:()=>`+=${Math.max(650,distance()*0.85)}`,pin:true,scrub:0.08,anticipatePin:1,invalidateOnRefresh:true,refreshPriority:1}});
    // Pin only on wide screens. Mobile keeps native touch scrolling.
    const resizeObserver=new ResizeObserver(()=>ScrollTrigger.refresh());
    resizeObserver.observe(gallery.current);
    resizeObserver.observe(track.current);
    // ResizeObserver is cleaned up when the GSAP context is reverted.
    (gallery.current as HTMLElement & {__galleryResizeObserver?:ResizeObserver}).__galleryResizeObserver=resizeObserver;
   }
   const chapters=gsap.utils.toArray<HTMLElement>('.race-unused-copy');
   chapters.forEach((el,i)=>{
     gsap.set(el,{autoAlpha:i===0?1:0,y:i===0?0:24});
     const starts=[0,.19,.43,.68]; const ends=[.24,.49,.73,1];
     ScrollTrigger.create({trigger:journey.current,start:'top top',end:'bottom bottom',onUpdate:self=>{
       const t=self.progress; const a=starts[i],b=ends[i];
       const fadeIn=i===0?1:Math.min(1,Math.max(0,(t-a)/.045));
       const fadeOut=i===3?1:Math.min(1,Math.max(0,(b-t)/.055));
       gsap.set(el,{autoAlpha:fadeIn*fadeOut,y:(1-fadeIn)*24-(1-fadeOut)*20});
     }});
   });
   gsap.utils.toArray<HTMLElement>('.rise').forEach(el=>gsap.fromTo(el,{y:65,opacity:0},{y:0,opacity:1,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
  });
  return()=>{(gallery.current as (HTMLElement & {__galleryResizeObserver?:ResizeObserver})|null)?.__galleryResizeObserver?.disconnect();ctx.revert();};
 },[loaded,reduced]);
 return <main>{loaded&&!reduced&&<div ref={cursorRef} className={`custom-cursor race-cursor ${cursorActive?"cursor-active":""}`} aria-hidden="true"><span className="cursor-crosshair">+</span><span className="cursor-ring"/><span className="cursor-dot"/></div>}
  <nav className="topbar" aria-label="Main navigation"><a href="#top" className="wordmark">SJ<span className="star">✳</span></a><span className="nav-middle">CYBERSECURITY · DATA SCIENCE · SOFTWARE</span><a href="#contact" className="nav-contact">CONTACT <ArrowUpRight size={16}/></a></nav>
  <section id="top" ref={journey} className="journey race-journey" aria-label="Race start portfolio introduction">
   <div className="journey-sticky race-sticky">
    <div className="scene-shell">{loaded&&<RaceStartScene progress={progress} reduced={reduced}/>}</div>
    <div className="race-shade"/>
    <div className="race-topline"><span>SAIRAJ JADHAV / TECHNOLOGY PORTFOLIO</span><span>STARTING GRID · 2026</span></div>
    <div className="race-hero-content"><div className="race-kicker"><span className="race-kicker-dot"/> CYBERSECURITY / DATA SCIENCE / SOFTWARE</div><h1>SAIRAJ<br/><em>JADHAV.</em></h1><p>Exploring cybersecurity, data science, analytics, and software development.</p><a href="#projects" className="race-cta">EXPLORE MY PROJECTS <ArrowDownRight size={18}/></a></div>
    <div className="race-hud"><span>SCROLL TO START THE RACE</span><div className="race-hud-track"><div className="race-hud-fill"/></div><span>FIVE RED → GREEN → GO</span></div>
   </div>
  </section>
  <section id="about" className="about-section" aria-labelledby="about-heading">
    <div className="about-heading-row"><span className="section-index">ABOUT ME / 001</span><span className="about-section-label">COMPUTER SCIENCE STUDENT · HALIFAX, NS</span></div>
    <div className="about-layout">
      <div className="about-photo-frame rise"><Image src="/about-portrait.jpg" alt="Portrait of Sairaj Jadhav wearing a black suit in front of a wooden backdrop" fill sizes="(max-width: 850px) 90vw, 42vw" className="about-photo" priority={false}/><span className="about-photo-caption">SAIRAJ JADHAV <span>© 2026</span></span></div>
      <div className="about-copy"><span className="about-overline">CYBERSECURITY · DATA SCIENCE · SOFTWARE</span><h2 id="about-heading" className="rise">Hi, I'm <em>Sairaj.</em></h2><p className="about-lead rise">I’m beginning my career in technology, exploring cybersecurity, data science, and analytics through hands-on projects.</p><p className="about-description rise">I'm completing my Bachelor of Applied Computer Science at Dalhousie University. I'm curious about how systems work, how to keep them secure, and how data can help solve practical problems. So far, I've explored healthcare applications, SQL databases, Python data pipelines, Power BI dashboards, and machine-learning projects. I'm still learning, experimenting, and finding where I want to grow.</p>
        <div className="about-focus rise"><span>TOOLS I’VE USED</span><div>React & Node.js <b>·</b> Python & SQL <b>·</b> Power BI & DAX <b>·</b> AWS</div></div>
        <div className="about-education rise"><div className="about-education-heading"><span>EDUCATION</span><span>EXPECTED DEC 2026</span></div><strong>{education.degree}</strong><p>{education.school} <span>·</span> {education.location}</p><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">VIEW MY RÉSUMÉ <ArrowUpRight size={16}/></a></div>
      </div>
    </div>
  </section>
  <section id="projects" className="projects-section" ref={gallery}><div className="projects-header"><div><span className="section-index">PROJECT PORTFOLIO / 002</span><h2>TECHNICAL <em>PROJECTS.</em></h2></div><p>SOFTWARE PROJECTS · DATA ANALYTICS · MACHINE LEARNING<br/>SCROLL TO VIEW PROJECTS →</p></div><div className="project-track" ref={track}>{projects.map((p,i)=><article className={`project-slide project-tone-${i%4}`} key={p.title}><div className="project-top"><span>0{i+1} / 0{projects.length}</span><span>{p.category} · {p.year}</span></div><div className="project-art"><Image src={p.image} alt={`${p.title} illustrative visual`} fill sizes="(max-width: 850px) 90vw, 780px" className="project-image"/><span className="art-stamp">{p.metric}</span></div><div className="project-info"><h3>{p.title}</h3><p>{p.description}</p><div className="project-tags">{p.tech.map(t=><span key={t}>{t}</span>)}</div></div></article>)}</div><div className="gallery-hint">SCROLL THROUGH PROJECTS · SWIPE ON MOBILE <ArrowDownRight size={18}/></div></section>
  <ExpertiseWorkstation/>
  <section id="experience" className="experience-section"><div className="experience-intro"><div className="section-index">PROFESSIONAL EXPERIENCE / 004</div><h2 className="rise">RELEVANT<br/><em>EXPERIENCE.</em></h2><p className="experience-deck">Junior Developer · Best Buy Sales & Omni Channel Specialist · Neo Financial Sales Representative. Technical delivery, stakeholder communication, and customer-facing problem solving.</p></div><div className="experience-feature-list">{experience.map((e,i)=><article className="experience-feature rise" key={e.title}><div className="experience-feature-meta"><span>0{i+1} / 03</span><span>{e.type}</span></div><div className="experience-feature-body"><div><h3>{e.title}</h3><p className="experience-company">{e.company}</p><p className="experience-description">{e.description}</p><div className="experience-pills">{e.highlights.map(h=><span key={h}>{h}</span>)}</div></div><span className="experience-date">{e.date}</span></div></article>)}</div></section>
  <section id="contact" className="contact-section final-lap" aria-labelledby="final-lap-heading">
    <div className="final-lap-ambient" aria-hidden="true"/>
    <div className="final-lap-inner">
      <div className="final-lap-top"><span>05 / CONTACT</span><span><span className="final-lap-led"/> OPEN TO EARLY-CAREER OPPORTUNITIES</span></div>
      <div className="final-lap-grid">
        <div className="final-lap-copy">
          <div className="final-lap-eyebrow"><span className="final-lap-dash"/> THE FINAL LAP</div>
          <h2 id="final-lap-heading">LET'S MAKE<br/><em>CONTACT.</em></h2>
          <p>I'm exploring opportunities in cybersecurity, data science, analytics, and software development. If you have a role or project worth discussing, I'd love to connect.</p>
          <div className="final-lap-actions"><a className="final-lap-primary" href="mailto:Sairaj.Jadhav@dal.ca?subject=Let's%20connect">GET IN TOUCH <ArrowUpRight size={19}/></a><a className="final-lap-secondary" href="/resume.pdf" target="_blank" rel="noopener noreferrer">VIEW RÉSUMÉ <ArrowUpRight size={17}/></a></div>
          <a className="final-lap-email" href="mailto:Sairaj.Jadhav@dal.ca">Sairaj.Jadhav@dal.ca</a>
        </div>
        <div className="final-lap-visual" aria-hidden="true">
          <div className="final-lap-track">
            <div className="final-lap-track-glow"/>
            <div className="final-lap-track-grain"/>
            <div className="final-lap-track-lights left-lights"/><div className="final-lap-track-lights right-lights"/>
            <div className="final-lap-gantry"><span>FINISH</span><div className="final-lap-gantry-leds"><i/><i/><i/><i/><i/></div><span>005</span></div>
            <div className="final-lap-telemetry"><span>FINAL SECTOR</span><strong>SECTOR 03</strong><small>TRACK STATUS <b>● CLEAR</b></small></div>
            <div className="final-lap-track-number">05</div>
            <div className="final-lap-track-edge edge-left"/><div className="final-lap-track-edge edge-right"/>
            <div className="final-lap-road-line road-one"/><div className="final-lap-road-line road-two"/>
            <div className="final-lap-finish"/>
            <div className="final-lap-car"><div className="final-lap-car-wing rear-wing"/><div className="final-lap-car-body"><div className="final-lap-cockpit"/><div className="final-lap-driver"/><div className="final-lap-halo"/><div className="final-lap-car-nose"/><div className="final-lap-car-stripe"/></div><div className="final-lap-wheel wheel-a"/><div className="final-lap-wheel wheel-b"/><div className="final-lap-wheel wheel-c"/><div className="final-lap-wheel wheel-d"/><div className="final-lap-car-wing front-wing"/><div className="final-lap-front-flap"/><div className="final-lap-car-mark">SJ</div></div>
            <div className="final-lap-speed speed-one"/><div className="final-lap-speed speed-two"/><div className="final-lap-speed speed-three"/>
            <div className="final-lap-finish-tag">FINISH LINE <span>↗</span></div>
          </div>
          <span className="final-lap-circuit-caption">CIRCUIT 005 — NEXT CHAPTER</span><div className="final-lap-visual-meta"><span>◉ LIVE CIRCUIT</span><span>SCROLL TO RESTART ↗</span></div>
        </div>
      </div>
      <footer className="final-lap-footer"><span>© {new Date().getFullYear()} SAIRAJ JADHAV</span><span>HALIFAX, NOVA SCOTIA</span><a href="#top">BACK TO THE GRID ↑</a></footer>
    </div>
  </section>
 </main>;
}

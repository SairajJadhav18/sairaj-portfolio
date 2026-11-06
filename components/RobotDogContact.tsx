'use client';
import {useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import type {PixelMood} from './Pixel3D';
const Pixel3D=dynamic(()=>import('./Pixel3D'),{ssr:false});
import {Github,Linkedin,Send,ArrowUpRight,Copy,Check} from 'lucide-react';
const emailAddress='Sairaj.Jadhav@dal.ca';
export default function RobotDogContact(){
 const face=useRef<HTMLDivElement>(null);
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[message,setMessage]=useState('');
 const [copied,setCopied]=useState(false);
 const [mood,setMood]=useState<PixelMood>('idle');
 const [trigger,setTrigger]=useState(0);
 const pointer=useRef({x:0,y:0});
 const [reduced,setReduced]=useState(false);
 const [active,setActive]=useState(false);
 const reactTo=(next:PixelMood)=>{setMood(next);setTrigger(n=>n+1)};

 useEffect(()=>{
  setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // Only render Pixel (and track the pointer) while the contact section is near the viewport.
  let visible=false;
  const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;setActive(entry.isIntersecting);},{rootMargin:'150px 0px'});
  if(face.current)io.observe(face.current);
  const onMove=(e:PointerEvent)=>{
   if(!visible)return;
   const box=face.current?.getBoundingClientRect();
   if(!box)return;
   pointer.current.x=Math.max(-1,Math.min(1,(e.clientX-(box.left+box.width/2))/(box.width*.7)));
   pointer.current.y=Math.max(-1,Math.min(1,((box.top+box.height/2)-e.clientY)/(box.height*.7)));
  };
  window.addEventListener('pointermove',onMove,{passive:true});
  return()=>{window.removeEventListener('pointermove',onMove);io.disconnect();};
 },[]);
 const submit=(e:React.FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  const subject=encodeURIComponent('Portfolio inquiry from '+name.trim());
  const body=encodeURIComponent('Name: '+name.trim()+'\nEmail: '+email.trim()+'\n\n'+message.trim());
  reactTo('send');
  window.location.href='mailto:'+emailAddress+'?subject='+subject+'&body='+body;
 };
 const copy=async()=>{try{await navigator.clipboard.writeText(emailAddress);setCopied(true);reactTo('copy');setTimeout(()=>setCopied(false),1800)}catch{}};
 return <section id="contact" className="contact-section dog-contact" aria-labelledby="dog-contact-heading">
  <div className="dog-top"><span>CONTACT / 005</span><span><i/> EAGER TO CONTRIBUTE TO MEANINGFUL PROJECTS AND GROW THROUGH HANDS-ON EXPERIENCE</span></div>
  <div className="dog-heading"><span>THE FINAL LAP · SAY HELLO</span><h2 id="dog-contact-heading">Let's make <em>contact.</em></h2><p>Have a role, project, or idea in mind? Send me a short message. My robot assistant is all ears.</p></div>
  <div className="dog-layout">
   <div className="dog-art-panel">
    <div className="meteor-sky realistic-meteor-sky" aria-hidden="true"><div className="night-sky-photo"/><div className="night-sky-vignette"/>{Array.from({length:9},(_,i)=><span key={i} className={`shooting-star shooting-star-${i+1}`}/>)}</div>
    <div className="dog-status"><span>●</span> PIXEL IS ONLINE <span className="dog-dots">•••</span></div>
    <div className="dog-art pixel-3d-container" ref={face} onClick={()=>reactTo("pet")} onPointerEnter={e=>{if(e.pointerType==='mouse')reactTo("wave")}} onPointerLeave={()=>setMood("idle")} aria-label="Interactive three-dimensional robot Pixel, who watches the cursor and reacts to interactions">
     <div className="pixel-speech" aria-live="polite">{mood==='name'?'Nice to meet you!':mood==='email'?'I’ll keep an eye out!':mood==='message'?'Tell me more!':mood==='typing'?'Ooh, a message!':mood==='social'?'Let’s connect!':mood==='send'?'Ready to send!':mood==='pet'?'That tickles! ♡':mood==='wave'?'Hello there! 👋':mood==='copy'?'Email copied!':'Hi! Want to build something together?'}</div>
     <Pixel3D mood={mood} trigger={trigger} pointer={pointer} reduced={reduced} active={active}/>
    </div>
    <button type="button" className="pixel-pet-button" onClick={()=>reactTo("pet")}>✦ SAY HELLO TO PIXEL</button>
    <div className="dog-caption"><strong>MEET PIXEL ✳</strong><span>REAL 3D · CURSOR TRACKING · INTERACTIVE</span></div>
    <div className="dog-socials" onPointerEnter={()=>reactTo("social")} onPointerLeave={()=>setMood("idle")}>
     <a href="https://github.com/SairajJadhav18" target="_blank" rel="noopener noreferrer"><Github size={18}/> GitHub <ArrowUpRight size={14}/></a>
     <a href="https://www.linkedin.com/in/sairaj-jadhav-bb5776243/" target="_blank" rel="noopener noreferrer"><Linkedin size={18}/> LinkedIn <ArrowUpRight size={14}/></a>
    </div>
   </div>
   <div className="dog-form-panel">
    <div className="dog-form-meta"><span>NEW MESSAGE</span><span>✳ DIRECT CONTACT</span></div>
    <h3>Drop me a message.</h3><p>I'd be happy to hear about an opportunity, collaboration, or anything interesting you're working on.</p>
    <form onSubmit={submit} onFocus={()=>reactTo("typing")} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setMood("idle")}} className="dog-form">
     <div className="dog-form-row"><label>YOUR NAME<input onFocus={()=>reactTo("name")} required maxLength={90} autoComplete="name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></label><label>EMAIL ADDRESS<input onFocus={()=>reactTo("email")} required type="email" maxLength={160} autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label></div>
     <label>YOUR MESSAGE<textarea onFocus={()=>reactTo("message")} required rows={5} maxLength={2500} placeholder="Hi Sairaj, I wanted to reach out about..." value={message} onChange={e=>setMessage(e.target.value)}/></label>
     <button type="submit" onPointerEnter={()=>reactTo("send")} className="dog-send">OPEN EMAIL TO SEND <Send size={17}/></button>
     <small className="dog-disclaimer">This opens your email app with the message pre-filled. The website doesn't send or store messages.</small>
    </form>
    <div className="dog-email"><span>OR EMAIL ME DIRECTLY</span><button type="button" onClick={copy}>{emailAddress} {copied?<Check size={15}/>:<Copy size={15}/>}</button></div>
   </div>
  </div>
  <footer className="dog-footer"><span>© {new Date().getFullYear()} SAIRAJ JADHAV</span><span>HALIFAX, NOVA SCOTIA</span><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">VIEW RÉSUMÉ ↗</a><a href="#top">BACK TO START ↑</a></footer>
 </section>;
}

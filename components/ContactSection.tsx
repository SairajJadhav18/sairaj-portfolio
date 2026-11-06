'use client';
import {useState} from 'react';
import Image from 'next/image';
import {ArrowUpRight,Check,Copy,FileText,Github,Linkedin,MapPin,Send} from 'lucide-react';
import {education} from '@/data/content';

const emailAddress='Sairaj.Jadhav@dal.ca';

export default function ContactSection(){
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[message,setMessage]=useState('');
 const [copied,setCopied]=useState(false);
 const submit=(e:React.FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  const subject=encodeURIComponent('Portfolio inquiry from '+name.trim());
  const body=encodeURIComponent('Name: '+name.trim()+'\nEmail: '+email.trim()+'\n\n'+message.trim());
  window.location.href='mailto:'+emailAddress+'?subject='+subject+'&body='+body;
 };
 const copy=async()=>{try{await navigator.clipboard.writeText(emailAddress);setCopied(true);setTimeout(()=>setCopied(false),1800);}catch{}};
 return <section id="contact" className="contact-clean" aria-labelledby="contact-heading">
  <div className="contact-clean-top"><span>CONTACT / 005</span><span>USUALLY REPLIES WITHIN 1–2 BUSINESS DAYS</span></div>
  <div className="contact-clean-heading"><h2 id="contact-heading" className="rise">Let&apos;s <em>talk.</em></h2><p className="rise">Have a role, project, or idea in mind? Send a short note or reach me directly.</p></div>
  <div className="contact-clean-grid">
   <aside className="contact-card rise">
    <div className="contact-card-head">
     <div className="contact-card-photo"><Image src="/about-portrait.jpg" alt="Sairaj Jadhav" fill sizes="88px"/></div>
     <div><strong>Sairaj Jadhav</strong><span>Applied Computer Science · {education.school}</span></div>
    </div>
    <div className="contact-card-status"><span className="hero-status-dot"/>Graduating Dec 2026 · Open to opportunities</div>
    <ul className="contact-card-facts">
     <li><MapPin size={16}/> Halifax, Nova Scotia</li>
     <li><FileText size={16}/> Cybersecurity · Data science · Software</li>
    </ul>
    <button type="button" className="contact-card-email" onClick={copy} aria-label={`Copy email address ${emailAddress}`}>
     <span><small>EMAIL</small>{emailAddress}</span>{copied?<Check size={17}/>:<Copy size={17}/>}
    </button>
    <span className="contact-card-copied" aria-live="polite">{copied?'Email copied to clipboard':''}</span>
    <div className="contact-card-links">
     <a href="https://www.linkedin.com/in/sairaj-jadhav-bb5776243/" target="_blank" rel="noopener noreferrer"><Linkedin size={17}/> LinkedIn <ArrowUpRight size={14}/></a>
     <a href="https://github.com/SairajJadhav18" target="_blank" rel="noopener noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={14}/></a>
     <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="is-primary"><FileText size={17}/> Résumé <ArrowUpRight size={14}/></a>
    </div>
   </aside>
   <form className="contact-form rise" onSubmit={submit}>
    <div className="contact-form-head"><h3>Send a message</h3><span>Opens in your email app</span></div>
    <div className="contact-form-row">
     <label>Name<input required maxLength={90} autoComplete="name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/></label>
     <label>Email<input required type="email" maxLength={160} autoComplete="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
    </div>
    <label>Message<textarea required rows={6} maxLength={2500} placeholder="Hi Sairaj, I'm reaching out about…" value={message} onChange={e=>setMessage(e.target.value)}/></label>
    <button type="submit" className="contact-send">Send message <Send size={16}/></button>
    <small>This opens your email app with the message pre-filled. The website doesn&apos;t send or store messages.</small>
   </form>
  </div>
  <footer className="contact-clean-footer"><span>© {new Date().getFullYear()} SAIRAJ JADHAV</span><span>HALIFAX, NOVA SCOTIA</span><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">VIEW RÉSUMÉ ↗</a><a href="#top">BACK TO START ↑</a></footer>
 </section>;
}

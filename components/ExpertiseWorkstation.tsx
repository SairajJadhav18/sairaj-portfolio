'use client';
import {useState} from 'react';
import Image from 'next/image';
import {skills} from '@/data/content';
import {ArrowUpRight,Code2,Database,Cloud,Users, RotateCcw, Sparkles} from 'lucide-react';

const hotspots=[
 {id:'code',label:'Code monitor',x:41,y:40,category:0,detail:'Languages, application development, APIs and debugging'},
 {id:'data',label:'Analytics monitor',x:57,y:40,category:1,detail:'SQL, Python, data visualisation and machine learning'},
 {id:'pc',label:'RGB gaming PC',x:72,y:48,category:2,detail:'Cloud services, version control and engineering tools'},
 {id:'keyboard',label:'Mechanical keyboard',x:47,y:52,category:0,detail:'Programming and software implementation'},
 {id:'coffee',label:'Steaming coffee',x:38,y:48,category:3,detail:'Teamwork, communication and practical problem-solving'},
 {id:'lego',label:'LEGO space shuttle',x:69,y:26,category:2,detail:'Curiosity, experimentation and building systems'},
 {id:'f1',label:'Racing model shelf',x:25,y:16,category:1,detail:'F1 racing analytics and data-driven projects'},
 {id:'posters',label:'Wall posters',x:81,y:25,category:3,detail:'Creative collaboration and project communication'},
 {id:'books',label:'Bookshelf',x:14,y:51,category:2,detail:'Ongoing learning, cloud and cybersecurity interests'},
 {id:'plant',label:'Hanging plants',x:50,y:14,category:3,detail:'Collaboration and growing through new challenges'},
 {id:'notes',label:'Pinned notes',x:54,y:33,category:3,detail:'Requirements, planning and stakeholder communication'},
 {id:'window',label:'City window',x:87,y:47,category:2,detail:'Technology exploration and cloud infrastructure'},
 {id:'desk',label:'Workspace desk',x:59,y:60,category:0,detail:'Building and testing real applications'},
 {id:'rug',label:'Room rug',x:48,y:77,category:1,detail:'Data science and analytics interests'},
 {id:'cat',label:'Cozy reading corner',x:24,y:69,category:3,detail:'Communication, teamwork and creativity'}
] as const;

const plannedProjects: Record<string,{title:string;summary:string;stack:string[];deliverable:string}> = {
 code:{title:'Secure API & Authentication Service',summary:'Build a production-style REST API with role-based access, rate limits, audit logs, and automated tests.',stack:['TypeScript','Node.js','PostgreSQL','JWT','Docker'],deliverable:'API documentation, tests, threat model'},
 data:{title:'End-to-End Analytics Pipeline',summary:'Ingest a public dataset, validate and transform it, and publish a decision-ready dashboard.',stack:['Python','SQL','dbt','Power BI','GitHub Actions'],deliverable:'Reproducible pipeline and dashboard'},
 pc:{title:'Cloud Security Posture Scanner',summary:'Audit a sandbox AWS environment for overly broad permissions, exposed storage, and insecure configurations.',stack:['Python','AWS IAM','S3','CloudTrail','Terraform'],deliverable:'Read-only findings report and remediation guide'},
 keyboard:{title:'Developer CI/CD Quality Gate',summary:'Create a sample app with unit tests, static analysis, dependency checks, and automated deployment.',stack:['GitHub Actions','TypeScript','Docker','Vitest'],deliverable:'Green build pipeline and test coverage'},
 coffee:{title:'Customer Support Insights Dashboard',summary:'Analyze synthetic service tickets to uncover recurring issues, response trends, and customer experience metrics.',stack:['Python','SQL','Power BI','NLP'],deliverable:'Dashboard with prioritized insights'},
 lego:{title:'Containerized Microservices Lab',summary:'Assemble several small services with messaging, observability, and repeatable local deployment.',stack:['Docker','FastAPI','Redis','OpenTelemetry'],deliverable:'Architecture diagram and working demo'},
 f1:{title:'Live Motorsport Strategy Simulator',summary:'Model tire degradation, pit-stop timing, and race outcomes using historical racing data.',stack:['Python','Pandas','Streamlit','Monte Carlo'],deliverable:'Interactive race strategy simulator'},
 posters:{title:'Accessible UX Audit Toolkit',summary:'Build an interface review workflow covering keyboard access, color contrast, and usability issues.',stack:['React','Playwright','axe-core','WCAG'],deliverable:'Before-and-after accessibility report'},
 books:{title:'Security Operations Detection Lab',summary:'Create a safe home-lab pipeline to ingest sample logs and detect suspicious authentication or network events.',stack:['Python','Sigma rules','Elastic','MITRE ATT&CK'],deliverable:'Detection rules and documented sample alerts'},
 plant:{title:'Environmental Sensor Analytics',summary:'Explore open environmental data, detect anomalies, and forecast trends with transparent model evaluation.',stack:['Python','Pandas','Scikit-learn','Streamlit'],deliverable:'Forecast dashboard and model card'},
 notes:{title:'Requirements-to-Release Tracker',summary:'Design a lightweight tool connecting user stories, acceptance criteria, tests, and release notes.',stack:['React','TypeScript','PostgreSQL','Playwright'],deliverable:'End-to-end traceability demo'},
 window:{title:'Cloud Cost & Usage Observatory',summary:'Analyze anonymized cloud billing data to identify waste, forecast spend, and flag anomalies.',stack:['AWS','Python','SQL','Grafana'],deliverable:'Cost dashboard and alerting rules'},
 desk:{title:'Full-Stack Job Application Tracker',summary:'Create a secure personal workflow for tracking applications, interviews, follow-ups, and outcomes.',stack:['Next.js','TypeScript','PostgreSQL','Auth'],deliverable:'Deployed app with privacy controls'},
 rug:{title:'Explainable Fraud Detection Model',summary:'Train on public or synthetic transaction data and compare precision, recall, false positives, and feature importance.',stack:['Python','Scikit-learn','SHAP','Streamlit'],deliverable:'Model evaluation and explainability report'},
 cat:{title:'Team Knowledge Search Assistant',summary:'Prototype retrieval-based search over sample documentation with citations, evaluation, and access safeguards.',stack:['Python','Embeddings','Vector search','FastAPI'],deliverable:'Search demo and evaluation results'}
};
const projectPreviews:Record<string,string> = {
 code:'/project-previews/code.svg',
 data:'/project-previews/data.svg',
 pc:'/project-previews/pc.svg',
 keyboard:'/project-previews/keyboard.svg',
 coffee:'/project-previews/coffee.svg',
 lego:'/project-previews/lego.svg',
 f1:'/project-previews/f1.svg',
 posters:'/project-previews/posters.svg',
 books:'/project-previews/books.svg',
 plant:'/project-previews/plant.svg',
 notes:'/project-previews/notes.svg',
 window:'/project-previews/window.svg',
 desk:'/project-previews/desk.svg',
 rug:'/project-previews/rug.svg',
 cat:'/project-previews/cat.svg',
};
const projectSkills:Record<string,string[]> = {
 code:["REST API design", "Authentication and authorization", "Threat modeling", "Automated testing"],
 data:["ETL architecture", "Data quality validation", "Dimensional modeling", "Dashboard storytelling"],
 pc:["Cloud security", "Identity and access management", "Infrastructure auditing", "Risk prioritization"],
 keyboard:["CI/CD workflows", "Automated tests", "Static analysis", "Deployment reliability"],
 coffee:["Customer analytics", "Natural language processing", "KPI reporting", "Service optimization"],
 lego:["Microservice architecture", "Container orchestration", "Distributed tracing", "Observability"],
 f1:["Statistical modeling", "Monte Carlo simulation", "Race strategy", "Interactive visualization"],
 posters:["Accessibility evaluation", "WCAG compliance", "UI testing", "Usability reporting"],
 books:["Log analysis", "Threat detection", "Detection engineering", "Incident triage"],
 plant:["Time-series forecasting", "Anomaly detection", "Environmental analytics", "Model evaluation"],
 notes:["Requirements traceability", "Test planning", "Release management", "Stakeholder communication"],
 window:["Cloud billing analytics", "Cost optimization", "Anomaly alerting", "Forecasting"],
 desk:["Full-stack development", "Data modeling", "Secure authentication", "Responsive design"],
 rug:["Classification modeling", "Fraud analytics", "Explainability", "Precision-recall evaluation"],
 cat:["Retrieval-augmented search", "Vector indexing", "Information retrieval", "Access control"]
};
const categoryNames=['PROGRAMMING & APPLICATIONS','DATA SCIENCE & ANALYTICS','TOOLS, CLOUD & SECURITY','COLLABORATION & LEARNING'];
const categoryIcons=[Code2,Database,Cloud,Users];
const descriptions=[
 'Programming languages, web technologies, and APIs used in my software projects.',
 'Exploring data pipelines, reporting, predictive models, and practical analytics.',
 'Development workflows, cloud infrastructure, and tools I am learning to use.',
 'Collaboration, requirements gathering, and communicating technical ideas.'
];
export default function ExpertiseWorkstation(){
 const [active,setActive]=useState(0);
 const [focus,setFocus]=useState('code');
 const [hover,setHover]=useState<string|null>(null);
 const Icon=categoryIcons[active];
 const planned=plannedProjects[focus];
 const preview=projectPreviews[focus];
 const select=(h:typeof hotspots[number])=>{setActive(h.category);setFocus(h.id)};
 return <section id="expertise" className="expertise-workstation diorama-expertise" aria-labelledby="expertise-heading">
  <div className="workstation-header"><div><span className="workstation-kicker">TECHNICAL EXPERTISE / 003</span><h2 id="expertise-heading">Explore my <em>room.</em></h2></div><p>Explore 15 hands-on project concepts through custom-coded interface previews, detailed technical plans, and the skills behind each build.</p></div>
  <div className="workstation-layout diorama-layout">
   <div className="workstation-stage diorama-stage">
    <div className="workstation-stage-top"><span><span className="workstation-live"/> INTERACTIVE ISOMETRIC ROOM</span><span>HOVER · CLICK · EXPLORE</span></div>
    <div className="diorama-frame">
     <Image src="/isometric-room.png" alt="Detailed illustrated isometric developer room with dual monitors, RGB gaming PC, plants, racing memorabilia, LEGO shuttle, coffee, posters and shelves" fill sizes="(max-width: 960px) 100vw, 58vw" className="diorama-image" priority={false}/>
     {hotspots.map(h=><button key={h.id} type="button" style={{left:`${h.x}%`,top:`${h.y}%`}} className={`diorama-hotspot ${focus===h.id?'is-selected':''}`} onPointerEnter={()=>setHover(h.id)} onPointerLeave={()=>setHover(null)} onFocus={()=>setHover(h.id)} onBlur={()=>setHover(null)} onClick={()=>select(h)} aria-label={`Explore ${h.label}: ${h.detail}`} aria-pressed={focus===h.id}>
      <span className="diorama-pulse"/><span className="diorama-hotspot-core">+</span>
      <span className={`diorama-tooltip ${hover===h.id?'is-visible':''}`}>{h.label}<small>{h.detail}</small></span>
     </button>)}
    </div>
    <div className="diorama-stage-footer"><span><Sparkles size={15}/> {hotspots.length} INTERACTIVE DETAILS</span><span>SELECT AN OBJECT TO EXPLORE</span></div>
    <div className="workstation-controls diorama-controls" aria-label="Choose a skill area">
     {['Programming','Data & Analytics','Cloud & Tools','Collaboration'].map((name,i)=><button key={name} className={active===i?'selected':''} onClick={()=>{const h=hotspots.find(h=>h.category===i)!;select(h)}} aria-pressed={active===i}><span>{String(i+1).padStart(2,'0')}</span>{name}</button>)}
    </div>
   </div>
   <div className="workstation-detail diorama-detail" key={focus}>
    <div className="workstation-detail-top"><span>EXPLORE / {String(hotspots.findIndex(h=>h.id===focus)+1).padStart(2,'0')}</span><Icon size={23} strokeWidth={1.5}/></div>
    <span className="workstation-detail-eyebrow">{categoryNames[active]}</span>
    <h3>{categoryNames[active].split(" & ").map(part=>part.toLowerCase()).join(" & ")}</h3>
    <p>{descriptions[active]}</p>
    <div className="workstation-skills">{skills[active].items.map(item=><div key={item}><span className="workstation-skill-dot"/>{item}</div>)}</div>
    <div className="expertise-case-study" aria-live="polite">
      <div className="expertise-case-top"><span>PROJECT SPOTLIGHT</span><span>{String(hotspots.findIndex(h=>h.id===focus)+1).padStart(2,'0')} / 15</span></div>
      <div className="expertise-case-image expertise-photo">
        <img key={focus} src={preview} alt={`Custom-coded interface prototype for ${planned.title}`} loading="lazy" />
        <span>CODED UI PROTOTYPE · SAMPLE DATA · CONCEPT PREVIEW</span>
      </div>
      <h4>{planned.title}</h4>
      <p className="expertise-case-summary">{planned.summary} This concept focuses on a practical, reproducible implementation with clear documentation, realistic test cases, and measurable outcomes. The goal is to demonstrate the engineering decisions behind the solution, not just its final interface.</p>
      <div className="expertise-case-result"><strong>Project deliverable</strong><div>{planned.deliverable}</div></div>
      <h5>Languages & technologies</h5>
      <div className="expertise-case-tags">{planned.stack.map(tech=><span key={tech}>{tech}</span>)}</div>
      <h5>Skills demonstrated by this concept</h5>
      <ul className="expertise-case-skills">{projectSkills[focus].map(skill=><li key={skill}>{skill}</li>)}</ul>
    </div>
    <div className="expertise-case-switcher">
      <div className="expertise-case-switcher-heading">EXPLORE ALL 15 PROJECT CONCEPTS</div>
      <div className="expertise-case-switcher-grid">{hotspots.map((item,index)=><button type="button" key={item.id} className={focus===item.id?'is-active':''} aria-pressed={focus===item.id} onClick={()=>select(item)}><span>{String(index+1).padStart(2,'0')}</span>{plannedProjects[item.id].title}</button>)}</div>
    </div>
    <div className="workstation-detail-footer"><span>KEEP EXPLORING THE ROOM</span><ArrowUpRight size={17}/></div>
   </div>
  </div>
  <p className="workstation-note"><RotateCcw size={14}/> Hover over the glowing markers and click to explore. Markers also work with keyboard and touch.</p>
 </section>;
}

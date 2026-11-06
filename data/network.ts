// Data model for the Technical Expertise network map.
// Nodes: 6 real projects (from content.ts), 15 project concepts, and skill hubs.
// Edges connect each project/concept to the skill hubs its stack uses.
import {projects,skills} from './content';

export type Territory={id:number;name:string;short:string;color:string;anchor:[number,number]};
export const territories:Territory[]=[
 {id:0,name:'Programming & applications',short:'PROGRAMMING',color:'#7cc8ff',anchor:[390,270]},
 {id:1,name:'Data science & analytics',short:'DATA & ANALYTICS',color:'#8af3bd',anchor:[1210,270]},
 {id:2,name:'Cloud, security & tools',short:'CLOUD · SECURITY · TOOLS',color:'#ffb86b',anchor:[1210,740]},
 {id:3,name:'Collaboration & delivery',short:'COLLABORATION',color:'#ff8fa3',anchor:[390,740]},
];

export type Hub={id:string;label:string;territory:number};
export const hubs:Hub[]=[
 {id:'python',label:'Python',territory:0},
 {id:'typescript',label:'TypeScript',territory:0},
 {id:'react',label:'React / Next.js',territory:0},
 {id:'node',label:'Node.js / Express',territory:0},
 {id:'apis',label:'REST APIs',territory:0},
 {id:'sql',label:'SQL & databases',territory:1},
 {id:'pandas',label:'Pandas',territory:1},
 {id:'ml',label:'Machine learning',territory:1},
 {id:'bi',label:'BI dashboards',territory:1},
 {id:'streamlit',label:'Streamlit',territory:1},
 {id:'etl',label:'ETL pipelines',territory:1},
 {id:'aws',label:'AWS',territory:2},
 {id:'docker',label:'Docker',territory:2},
 {id:'cicd',label:'Git & CI/CD',territory:2},
 {id:'security',label:'Security',territory:2},
 {id:'testing',label:'Testing & QA',territory:2},
 {id:'team',label:'Team & stakeholders',territory:3},
 {id:'requirements',label:'Requirements & UX',territory:3},
];

// Maps a technology name (as written in a stack) to one or more hubs.
const techMap:Record<string,string[]>={
 'Python':['python'],'TypeScript':['typescript'],'React':['react'],'Next.js':['react'],'Node.js':['node'],'Express':['node'],
 'REST APIs':['apis'],'FastAPI':['apis','python'],'JWT':['security'],'Auth':['security'],
 'SQL':['sql'],'SQL Server':['sql'],'MySQL':['sql'],'PostgreSQL':['sql'],'dbt':['etl','sql'],'ETL':['etl'],
 'Pandas':['pandas'],'Scikit-learn':['ml'],'SHAP':['ml'],'NLP':['ml'],'Embeddings':['ml'],'Monte Carlo':['ml'],
 'Power BI':['bi'],'DAX':['bi'],'Grafana':['bi'],'Excel VBA':['bi'],'Streamlit':['streamlit'],
 'AWS':['aws'],'AWS EC2':['aws'],'AWS IAM':['aws','security'],'S3':['aws'],'CloudTrail':['aws','security'],'Terraform':['aws'],
 'Docker':['docker'],'GitHub Actions':['cicd'],'GitLab':['cicd'],'Sigma rules':['security'],'MITRE ATT&CK':['security'],'Elastic':['security'],
 'Playwright':['testing'],'Vitest':['testing'],'axe-core':['testing'],'WCAG':['requirements'],
};

export type Concept={id:string;title:string;summary:string;stack:string[];deliverable:string;skills:string[];preview:string;extra?:string[]};
export const concepts:Concept[]=[
 {id:'code',title:'Secure API & Authentication Service',summary:'Build a production-style REST API with role-based access, rate limits, audit logs, and automated tests.',stack:['TypeScript','Node.js','PostgreSQL','JWT','Docker'],deliverable:'API documentation, tests, threat model',skills:['REST API design','Authentication and authorization','Threat modeling','Automated testing'],extra:['apis','testing']},
 {id:'data',title:'End-to-End Analytics Pipeline',summary:'Ingest a public dataset, validate and transform it, and publish a decision-ready dashboard.',stack:['Python','SQL','dbt','Power BI','GitHub Actions'],deliverable:'Reproducible pipeline and dashboard',skills:['ETL architecture','Data quality validation','Dimensional modeling','Dashboard storytelling']},
 {id:'pc',title:'Cloud Security Posture Scanner',summary:'Audit a sandbox AWS environment for overly broad permissions, exposed storage, and insecure configurations.',stack:['Python','AWS IAM','S3','CloudTrail','Terraform'],deliverable:'Read-only findings report and remediation guide',skills:['Cloud security','Identity and access management','Infrastructure auditing','Risk prioritization']},
 {id:'keyboard',title:'Developer CI/CD Quality Gate',summary:'Create a sample app with unit tests, static analysis, dependency checks, and automated deployment.',stack:['GitHub Actions','TypeScript','Docker','Vitest'],deliverable:'Green build pipeline and test coverage',skills:['CI/CD workflows','Automated tests','Static analysis','Deployment reliability']},
 {id:'coffee',title:'Customer Support Insights Dashboard',summary:'Analyze synthetic service tickets to uncover recurring issues, response trends, and customer experience metrics.',stack:['Python','SQL','Power BI','NLP'],deliverable:'Dashboard with prioritized insights',skills:['Customer analytics','Natural language processing','KPI reporting','Service optimization'],extra:['team']},
 {id:'lego',title:'Containerized Microservices Lab',summary:'Assemble several small services with messaging, observability, and repeatable local deployment.',stack:['Docker','FastAPI','Redis','OpenTelemetry'],deliverable:'Architecture diagram and working demo',skills:['Microservice architecture','Container orchestration','Distributed tracing','Observability']},
 {id:'f1',title:'Live Motorsport Strategy Simulator',summary:'Model tire degradation, pit-stop timing, and race outcomes using historical racing data.',stack:['Python','Pandas','Streamlit','Monte Carlo'],deliverable:'Interactive race strategy simulator',skills:['Statistical modeling','Monte Carlo simulation','Race strategy','Interactive visualization']},
 {id:'posters',title:'Accessible UX Audit Toolkit',summary:'Build an interface review workflow covering keyboard access, color contrast, and usability issues.',stack:['React','Playwright','axe-core','WCAG'],deliverable:'Before-and-after accessibility report',skills:['Accessibility evaluation','WCAG compliance','UI testing','Usability reporting']},
 {id:'books',title:'Security Operations Detection Lab',summary:'Create a safe home-lab pipeline to ingest sample logs and detect suspicious authentication or network events.',stack:['Python','Sigma rules','Elastic','MITRE ATT&CK'],deliverable:'Detection rules and documented sample alerts',skills:['Log analysis','Threat detection','Detection engineering','Incident triage']},
 {id:'plant',title:'Environmental Sensor Analytics',summary:'Explore open environmental data, detect anomalies, and forecast trends with transparent model evaluation.',stack:['Python','Pandas','Scikit-learn','Streamlit'],deliverable:'Forecast dashboard and model card',skills:['Time-series forecasting','Anomaly detection','Environmental analytics','Model evaluation']},
 {id:'notes',title:'Requirements-to-Release Tracker',summary:'Design a lightweight tool connecting user stories, acceptance criteria, tests, and release notes.',stack:['React','TypeScript','PostgreSQL','Playwright'],deliverable:'End-to-end traceability demo',skills:['Requirements traceability','Test planning','Release management','Stakeholder communication'],extra:['requirements','team']},
 {id:'window',title:'Cloud Cost & Usage Observatory',summary:'Analyze anonymized cloud billing data to identify waste, forecast spend, and flag anomalies.',stack:['AWS','Python','SQL','Grafana'],deliverable:'Cost dashboard and alerting rules',skills:['Cloud billing analytics','Cost optimization','Anomaly alerting','Forecasting']},
 {id:'desk',title:'Full-Stack Job Application Tracker',summary:'Create a secure personal workflow for tracking applications, interviews, follow-ups, and outcomes.',stack:['Next.js','TypeScript','PostgreSQL','Auth'],deliverable:'Deployed app with privacy controls',skills:['Full-stack development','Data modeling','Secure authentication','Responsive design'],extra:['requirements']},
 {id:'rug',title:'Explainable Fraud Detection Model',summary:'Train on public or synthetic transaction data and compare precision, recall, false positives, and feature importance.',stack:['Python','Scikit-learn','SHAP','Streamlit'],deliverable:'Model evaluation and explainability report',skills:['Classification modeling','Fraud analytics','Explainability','Precision-recall evaluation']},
 {id:'cat',title:'Team Knowledge Search Assistant',summary:'Prototype retrieval-based search over sample documentation with citations, evaluation, and access safeguards.',stack:['Python','Embeddings','Vector search','FastAPI'],deliverable:'Search demo and evaluation results',skills:['Retrieval-augmented search','Vector indexing','Information retrieval','Access control'],extra:['team','security']},
].map(c=>({...c,preview:`/project-previews/${c.id}.svg`}));

// Hubs implied by a real project's description beyond its tech tags.
const projectExtras:Record<number,string[]>={
 0:['etl','python'],        // Python ETL with automated validation
 1:['team','requirements'], // collaborated with healthcare stakeholders, usability
 2:['pandas','ml'],
 3:['etl'],
 4:['team'],                // six-person development team
 5:['requirements'],
};

export type NetNode={
 key:string;kind:'project'|'concept'|'hub';label:string;territory:number;
 projectIndex?:number;concept?:Concept;hub?:Hub;
};
export type NetEdge={a:string;b:string;territory:number};

const hubsFor=(stack:string[],extra:string[]=[])=>{
 const set=new Set<string>(extra);
 stack.forEach(t=>(techMap[t]??[]).forEach(h=>set.add(h)));
 return [...set];
};
const dominant=(hubIds:string[])=>{
 const count=[0,0,0,0];hubIds.forEach(h=>count[hubs.find(x=>x.id===h)!.territory]++);
 return count.indexOf(Math.max(...count));
};

export function buildNetwork(){
 const nodes:NetNode[]=[];const edges:NetEdge[]=[];
 const add=(key:string,kind:NetNode['kind'],label:string,links:string[],extra:Partial<NetNode>)=>{
  nodes.push({key,kind,label,territory:dominant(links),...extra});
  links.forEach(h=>edges.push({a:key,b:`hub:${h}`,territory:hubs.find(x=>x.id===h)!.territory}));
 };
 projects.forEach((p,i)=>add(`project:${i}`,'project',p.title,hubsFor(p.tech,projectExtras[i]),{projectIndex:i}));
 concepts.forEach(c=>add(`concept:${c.id}`,'concept',c.title,hubsFor(c.stack,c.extra),{concept:c}));
 // Only keep hubs that actually connect something.
 hubs.forEach(h=>{if(edges.some(e=>e.b===`hub:${h.id}`))nodes.push({key:`hub:${h.id}`,kind:'hub',label:h.label,territory:h.territory,hub:h});});
 return {nodes,edges};
}

export const skillGroups=skills;

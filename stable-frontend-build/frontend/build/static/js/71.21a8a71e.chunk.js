"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[71],{412:(e,t,s)=>{s.d(t,{A:()=>n});var a=s(43),r=s(996),i=s(579);const n=e=>{let{src:t,alt:s,className:n,sizes:c="100vw",priority:l=!1}=e;const[o,d]=(0,a.useState)(!0),[h,g]=(0,a.useState)(!1),[m,x]=(0,a.useState)(""),u=[320,640,768,1024,1280];(0,a.useEffect)((()=>{const e=(0,r.Qc)(t,800,"webp");x(e);const s=new Image;s.src=e,s.onload=()=>d(!1),s.onerror=()=>{console.warn("WebP image failed to load:",e),g(!0);const s=new Image;s.src=t,s.onload=()=>d(!1),s.onerror=()=>g(!0)}}),[t]);if(h)return(0,i.jsx)("div",{className:"bg-gray-200 flex items-center justify-center ".concat(n),children:(0,i.jsx)("span",{children:"Failed to load image"})});const{width:f,height:p}=t.includes("/images/")?{width:800,height:400}:{width:1200,height:800};return(0,i.jsxs)(i.Fragment,{children:[o&&(0,i.jsx)("div",{className:"bg-gray-200 animate-pulse ".concat(n)}),(0,i.jsx)("img",{src:m||t,srcSet:u.map((e=>"".concat((0,r.Qc)(t,e,"webp")," ").concat(e,"w"))).join(", "),width:f,height:p,alt:s,className:"".concat(n," ").concat(o?"hidden":""),loading:l?"eager":"lazy",sizes:c,style:{opacity:o?0:1},fetchPriority:l?"high":"auto",onError:e=>{console.warn("Image failed to load:",e.target.src),e.target.src!==t&&(e.target.src=t)}}),l&&(0,i.jsx)("link",{rel:"preload",href:m||t,as:"image",fetchPriority:"high"})]})}},71:(e,t,s)=>{s.r(t),s.d(t,{default:()=>h});var a=s(43),r=s(216),i=s(475),n=s(490),c=s(320),l=s(996),o=s(412),d=s(579);const h=()=>{const[e,t]=(0,a.useState)([]),[s,h]=(0,a.useState)(!0),g=(0,r.zy)();return(0,a.useEffect)((()=>{(async()=>{try{const e=(await l.nC.get("/images")).data,s=new Set,a=e.reduce(((e,t)=>{const a=t.category||"unknown";return s.has(a)||(s.add(a),e[a]=[]),e[a].push(t),e}),{}),r=Object.keys(a).map((e=>({id:e,title:e.charAt(0).toUpperCase()+e.slice(1),images:a[e].sort(((e,t)=>{var s,a;return(null!==(s=e.order)&&void 0!==s?s:0)-(null!==(a=t.order)&&void 0!==a?a:0)}))})));t(r)}catch(e){console.error("Error fetching gallery data:",e)}finally{h(!1)}})()}),[g.pathname]),s?(0,d.jsx)(c.A,{}):(0,d.jsx)("div",{id:"gallery",className:"py-12 bg-gray-100 mt-20",children:(0,d.jsxs)("div",{className:"max-w-7xl mx-auto px-4",children:[(0,d.jsxs)("h1",{className:"text-4xl font-bold text-center mb-12",children:["Utforsk Arbeidet Mitt",(0,d.jsxs)(n.mg,{children:[(0,d.jsx)("title",{children:"Utforsk Arbeidet Mitt"}),(0,d.jsx)("meta",{name:"description",content:"Se mine nyeste fotografier i bryllup, natur, portrett, og mer."}),(0,d.jsx)("link",{rel:"preconnect",href:"https://ds-photo.s3.eu-north-1.amazonaws.com",crossOrigin:"anonymous"}),(0,d.jsx)("link",{rel:"dns-prefetch",href:"https://ds-photo.s3.eu-north-1.amazonaws.com"})]})]}),(0,d.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8",children:e.map(((e,t)=>(0,d.jsxs)(i.N_,{to:"/gallery/".concat(e.id),className:"relative block group rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105",children:[e.images&&e.images.length>0?(0,d.jsx)(o.A,{src:e.images[0].url,alt:e.title,className:"w-full h-64 object-cover",sizes:"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",priority:t<3}):(0,d.jsx)("div",{className:"w-full h-64 bg-gray-300 flex items-center justify-center",children:(0,d.jsx)("p",{children:"No image available"})}),(0,d.jsx)("div",{className:"absolute inset-0 flex items-center justify-center",children:(0,d.jsx)("h3",{className:"dancing-script-gallery-title text-4xl md:text-6xl text-white text-center drop-shadow-lg",children:e.title})})]},e.id)))})]})})}}}]);
//# sourceMappingURL=71.21a8a71e.chunk.js.map
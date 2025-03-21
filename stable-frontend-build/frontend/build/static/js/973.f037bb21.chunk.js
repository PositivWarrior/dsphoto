"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[973],{412:(e,t,a)=>{a.d(t,{A:()=>n});var s=a(43),l=a(996),r=a(579);const n=e=>{let{src:t,alt:a,className:n,sizes:o="100vw",priority:c=!1}=e;const[i,d]=(0,s.useState)(!0),[h,g]=(0,s.useState)(!1),[u,m]=(0,s.useState)(""),p=[320,640,768,1024,1280];(0,s.useEffect)((()=>{const e=(0,l.Qc)(t,800,"webp");m(e);const a=new Image;a.src=e,a.onload=()=>d(!1),a.onerror=()=>{console.warn("WebP image failed to load:",e),g(!0);const a=new Image;a.src=t,a.onload=()=>d(!1),a.onerror=()=>g(!0)}}),[t]);if(h)return(0,r.jsx)("div",{className:"bg-gray-200 flex items-center justify-center ".concat(n),children:(0,r.jsx)("span",{children:"Failed to load image"})});const{width:x,height:f}=t.includes("/images/")?{width:800,height:400}:{width:1200,height:800};return(0,r.jsxs)(r.Fragment,{children:[i&&(0,r.jsx)("div",{className:"bg-gray-200 animate-pulse ".concat(n)}),(0,r.jsx)("img",{src:u||t,srcSet:p.map((e=>"".concat((0,l.Qc)(t,e,"webp")," ").concat(e,"w"))).join(", "),width:x,height:f,alt:a,className:"".concat(n," ").concat(i?"hidden":""),loading:c?"eager":"lazy",sizes:o,style:{opacity:i?0:1},fetchPriority:c?"high":"auto",onError:e=>{console.warn("Image failed to load:",e.target.src),e.target.src!==t&&(e.target.src=t)}}),c&&(0,r.jsx)("link",{rel:"preload",href:u||t,as:"image",fetchPriority:"high"})]})}},973:(e,t,a)=>{a.r(t),a.d(t,{default:()=>h});var s=a(43),l=a(216),r=a(412),n=a(579);const o=e=>{let{images:t}=e;const[a,l]=(0,s.useState)(0),[o,c]=(0,s.useState)(!1),[i,d]=(0,s.useState)(null);(0,s.useEffect)((()=>{const e=setInterval((()=>{l((e=>(e+1)%t.length))}),3e3);return()=>clearInterval(e)}),[t.length]);return(0,s.useEffect)((()=>{t.length>1&&(()=>{for(let e=1;e<=2;e++){const s=(a+e)%t.length;(new Image).src=t[s].url}})()}),[a,t]),(0,n.jsxs)("div",{children:[o&&(0,n.jsxs)("div",{className:"fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50",onClick:()=>{c(!1),d(null)},children:[(0,n.jsx)("img",{src:t[i].url,alt:"Enlarged",className:"w-auto max-w-full h-auto max-h-full object-contain rounded-lg",style:{margin:"40px auto",maxHeight:"80vh"}}),(0,n.jsx)("button",{onClick:e=>{e.stopPropagation(),d((e=>(e-1+t.length)%t.length))},className:"absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 text-black p-2 rounded-full",children:"\u2190"}),(0,n.jsx)("button",{onClick:e=>{e.stopPropagation(),d((e=>(e+1)%t.length))},className:"absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 text-black p-2 rounded-full",children:"\u2192"})]}),(0,n.jsxs)("div",{className:"relative w-full h-[500px] overflow-hidden rounded-lg shadow-lg",children:[t.map(((e,t)=>(0,n.jsx)("div",{className:"absolute inset-0 transition-opacity duration-1000 ".concat(t===a?"opacity-100":"opacity-0"),children:(0,n.jsx)(r.A,{src:e.url,alt:"slide ".concat(t),className:"w-full h-full object-contain rounded-lg",priority:0===t})},t))),(0,n.jsx)("button",{onClick:()=>{l((e=>(e-1+t.length)%t.length))},className:"\r absolute \r top-1/2 \r left-4 \r transform -translate-y-1/2 \r bg-white \r bg-opacity-50 \r hover:bg-opacity-100 \r rounded-full p-2",children:"\u2190"}),(0,n.jsx)("button",{onClick:()=>{l((e=>(e+1)%t.length))},className:"\r absolute \r top-1/2 \r right-4 \r transform -translate-y-1/2 \r bg-white \r bg-opacity-50 \r hover:bg-opacity-100 \r rounded-full \r p-2",children:"\u2192"})]}),(0,n.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10",children:t.map(((e,t)=>(0,n.jsx)("div",{className:"w-full h-auto cursor-pointer",onClick:()=>(e=>{d(e),c(!0)})(t),children:(0,n.jsx)(r.A,{src:e.url,alt:e.title||"Gallery image ".concat(t+1),className:"w-full h-64 object-cover rounded-lg shadow-lg",priority:t<3&&0===a})},t)))})]})};var c=a(490),i=a(320),d=a(996);const h=()=>{const{category:e}=(0,l.g)(),[t,a]=(0,s.useState)(null),[r,h]=(0,s.useState)(!0),[g,u]=(0,s.useState)([]),[m,p]=(0,s.useState)(1),x=(0,l.zy)(),f=x.pathname.includes("/admin");(0,s.useEffect)((()=>{(async()=>{try{const t=(await d.nC.get("/images?category=".concat(e))).data,s={title:e.charAt(0).toUpperCase()+e.slice(1),images:t.sort(((e,t)=>{var a,s;return(null!==(a=e.order)&&void 0!==a?a:0)-(null!==(s=t.order)&&void 0!==s?s:0)}))};a(s),u(s.images.slice(0,6)),h(!1)}catch(t){console.error("Error fetching gallery data:",t)}})(),p(1)}),[e,x.pathname]);const y=(null===t||void 0===t?void 0:t.images.length)>g.length;return r?(0,n.jsx)(i.A,{}):t?(0,n.jsxs)("div",{className:"max-w-7xl mx-auto px-4 py-10 mt-10",children:[(0,n.jsxs)("h2",{className:"text-4xl font-bold text-center mb-6 capitalize",children:[t.title," Gallery",(0,n.jsxs)(c.mg,{children:[(0,n.jsx)("title",{children:f?"Admin Panel | Dawid Siedlec":"".concat(null===t||void 0===t?void 0:t.title," Galleri | Dawid Siedlec")}),(0,n.jsx)("meta",{name:"description",content:"Utforsk ".concat(null===t||void 0===t?void 0:t.title,"-bilder av h\xf8y kvalitet.")}),(0,n.jsx)("link",{rel:"preconnect",href:"https://ds-photo.s3.eu-north-1.amazonaws.com",crossOrigin:"anonymous"}),(0,n.jsx)("link",{rel:"dns-prefetch",href:"https://ds-photo.s3.eu-north-1.amazonaws.com"})]})]}),g.length>0&&(0,n.jsx)(o,{images:g}),y&&(0,n.jsx)("div",{className:"text-center mt-8",children:(0,n.jsxs)("button",{onClick:()=>{const e=m+1,a=6*e;u(t.images.slice(0,a)),p(e)},className:"bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors",children:["Vis ",6," mer (",g.length," av"," ",t.images.length,")"]})})]}):(0,n.jsx)("h2",{className:"text-center text-red-600 mt-10",children:"Category not found"})}}}]);
//# sourceMappingURL=973.f037bb21.chunk.js.map
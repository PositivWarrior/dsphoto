"use strict";(self.webpackChunkfrontend=self.webpackChunkfrontend||[]).push([[237],{237:(e,t,s)=>{s.r(t),s.d(t,{default:()=>l});var n=s(555),a=s(43),r=s(344),i=s(579);const l=()=>{const[e,t]=(0,a.useState)({name:"",email:"",message:""}),[s,l]=(0,a.useState)(""),o=s=>{const{name:a,value:r}=s.target;t((0,n.A)((0,n.A)({},e),{},{[a]:r}))};return(0,i.jsx)("section",{id:"contact",className:"py-20 bg-white text-center",children:(0,i.jsxs)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[(0,i.jsx)("h2",{className:"text-4xl font-bold text-gray-800 mb-8",children:"Kontakt"}),(0,i.jsx)("p",{className:"text-lg text-gray-600 mb-4",children:"Har du noen sp\xf8rsm\xe5l? Ta gjerne kontakt med meg."}),(0,i.jsxs)("form",{onSubmit:s=>{s.preventDefault();const n={from_name:e.name,from_email:e.email,message:e.message};r.Ay.send("service_rn45rec","template_dewkewe",n,"ouIL0a7IpDVcizQLE").then((e=>{console.log("SUCCESS!",e.status,e.text),l("Meldingen ble sendt!")}),(e=>{console.log("FAILED...",e),l("Kunne ikke sende meldingen. Vennligst pr\xf8v igjen.")})),t({name:"",email:"",message:""})},className:"max-w-lg mx-auto",children:[(0,i.jsx)("div",{className:"mb-4",children:(0,i.jsx)("input",{type:"text",name:"name",placeholder:"Ditt navn",value:e.name,onChange:o,required:!0,className:"w-full p-4 border border-gray-300 rounded-lg"})}),(0,i.jsx)("div",{className:"mb-4",children:(0,i.jsx)("input",{type:"email",name:"email",placeholder:"Din e-post",value:e.email,onChange:o,required:!0,className:"w-full p-4 border border-gray-300 rounded-lg"})}),(0,i.jsx)("div",{className:"mb-4",children:(0,i.jsx)("textarea",{name:"message",placeholder:"Din melding",value:e.message,onChange:o,required:!0,className:"w-full p-4 border border-gray-300 rounded-lg",rows:"5"})}),(0,i.jsx)("button",{className:"px-6 py-3 bg-lollipop text-white font-semibold rounded-lg",children:"Send melding"})]}),s&&(0,i.jsx)("p",{className:"mt-4 text-lg text-green-500",children:s})]})})}},344:(e,t,s)=>{s.d(t,{Ay:()=>l});const n={_origin:"https://api.emailjs.com"},a=(e,t,s)=>{if(!e)throw"The user ID is required. Visit https://dashboard.emailjs.com/admin/integration";if(!t)throw"The service ID is required. Visit https://dashboard.emailjs.com/admin";if(!s)throw"The template ID is required. Visit https://dashboard.emailjs.com/admin/templates";return!0};class r{constructor(e){this.status=e.status,this.text=e.responseText}}const i=function(e,t){let s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return new Promise(((a,i)=>{const l=new XMLHttpRequest;l.addEventListener("load",(e=>{let{target:t}=e;const s=new r(t);200===s.status||"OK"===s.text?a(s):i(s)})),l.addEventListener("error",(e=>{let{target:t}=e;i(new r(t))})),l.open("POST",n._origin+e,!0),Object.keys(s).forEach((e=>{l.setRequestHeader(e,s[e])})),l.send(t)}))},l={init:function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"https://api.emailjs.com";n._userID=e,n._origin=t},send:(e,t,s,r)=>{const l=r||n._userID;a(l,e,t);const o={lib_version:"3.2.0",user_id:l,service_id:e,template_id:t,template_params:s};return i("/api/v1.0/email/send",JSON.stringify(o),{"Content-type":"application/json"})},sendForm:(e,t,s,r)=>{const l=r||n._userID,o=(e=>{let t;if(t="string"===typeof e?document.querySelector(e):e,!t||"FORM"!==t.nodeName)throw"The 3rd parameter is expected to be the HTML form element or the style selector of form";return t})(s);a(l,e,t);const d=new FormData(o);return d.append("lib_version","3.2.0"),d.append("service_id",e),d.append("template_id",t),d.append("user_id",l),i("/api/v1.0/email/send-form",d)}}}}]);
//# sourceMappingURL=237.fb596825.chunk.js.map
function escapeHTML(value){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function sentimentClass(s){return (s||"neutral").toLowerCase();}
function sentimentPill(s){return `<span class="sentiment-pill ${sentimentClass(s)}">${escapeHTML(s)}</span>`;}
function formatDate(value){if(!value)return "";const d=new Date(value);return Number.isNaN(d.getTime())?value:d.toLocaleString();}

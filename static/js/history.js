async function loadHistory(){
 const filter=document.getElementById("sentimentFilter").value;
 const entries=await (await fetch("/api/history?sentiment="+encodeURIComponent(filter))).json();
 document.getElementById("historyCount").textContent=`${entries.length} submission${entries.length===1?"":"s"} found`;
 document.getElementById("historyList").innerHTML=entries.length?entries.map(x=>`<div class="history-item"><div class="history-text">${escapeHTML(x.feedback)}<span class="recent-meta">${formatDate(x.created_at)} · ${x.aspects.map(a=>escapeHTML(a.aspect)).join(", ")}</span></div><div class="history-side">${sentimentPill(x.sentiment)}<button class="delete-btn" onclick="deleteEntry(${x.id})">Delete</button></div></div>`).join(""):'<div class="empty-hint">No feedback matches this filter.</div>';
}
async function deleteEntry(id){if(!confirm("Delete this feedback entry permanently?"))return;const r=await fetch("/api/feedback/"+id,{method:"DELETE"});if(r.ok)loadHistory();else alert("Could not delete this entry.");}
loadHistory().catch(console.error);

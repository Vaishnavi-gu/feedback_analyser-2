const input=document.getElementById("feedbackInput"), count=document.getElementById("charCount");
input.addEventListener("input",()=>count.textContent=`${input.value.length} / 3000`);
async function submitFeedback(){
 const text=input.value.trim(), btn=document.getElementById("analyseBtn"), error=document.getElementById("errorMessage");
 error.textContent="";if(!text){error.textContent="Please enter feedback first.";return;}
 btn.disabled=true;btn.textContent="Analysing…";
 try{
  const response=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({feedback:text})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||"Analysis failed.");
  showResult(data.analysis);input.value="";count.textContent="0 / 3000";
 }catch(e){error.textContent=e.message;}finally{btn.disabled=false;btn.innerHTML='✧ Analyse with AI <span>→</span>';}
}
function showResult(a){
 document.getElementById("resultPanel").classList.remove("hidden");
 document.getElementById("resultSentiment").textContent=a.sentiment;
 document.getElementById("resultConfidence").textContent=Math.round(a.confidence*100)+"%";
 document.getElementById("aspectResults").innerHTML=a.aspects.map(x=>`<span class="chip ${x.sentiment}">${x.aspect} · ${x.sentiment}</span>`).join("");
 document.getElementById("issueResults").innerHTML=a.issues.length?a.issues.map(x=>`<span class="chip negative">${x}</span>`).join(""):'<span class="chip">No known issue pattern detected</span>';
 document.getElementById("keywordResults").innerHTML=a.keywords.map(x=>`<span class="chip">${x}</span>`).join("")||'<span class="chip">No keywords found</span>';
 document.getElementById("recommendationResults").innerHTML=a.recommendations.map(x=>`<li class="recommendation-item">${x}</li>`).join("")||'<li class="recommendation-item">Collect additional feedback to identify a clear improvement opportunity.</li>';
 document.getElementById("resultPanel").scrollIntoView({behavior:"smooth",block:"start"});
}

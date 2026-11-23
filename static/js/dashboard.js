let sentimentChart,issuesChart,trendChart,aspectChart;
const palette={positive:"#19b786",negative:"#e46b75",neutral:"#aeb7c7",mixed:"#e4ad54"};
function makeChart(id,type,data,options={}){const el=document.getElementById(id);return new Chart(el,{type,data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:type==="doughnut",position:"bottom",labels:{boxWidth:8,usePointStyle:true,font:{size:10}}}},...options}});}
async function loadDashboard(){
 const d=await (await fetch("/api/dashboard")).json(), total=d.total||0, c=d.counts;
 document.getElementById("total").textContent=total;document.getElementById("total-center").textContent=total;
 ["positive","negative"].forEach(s=>{document.getElementById(s).textContent=(total?Math.round(c[s]/total*100):0)+"%";document.getElementById(s+"-count").textContent=c[s]+" responses";});
 document.getElementById("satisfaction").textContent=d.satisfaction+"%";
 const sentimentData={labels:["Positive","Negative","Neutral","Mixed"],datasets:[{data:[c.positive,c.negative,c.neutral,c.mixed],backgroundColor:[palette.positive,palette.negative,palette.neutral,palette.mixed],borderWidth:0,hoverOffset:5}]};
 if(sentimentChart)sentimentChart.destroy();sentimentChart=makeChart("sentimentChart","doughnut",sentimentData,{cutout:"76%"});
 const issues=d.issues||[];document.getElementById("issues-empty").style.display=issues.length?"none":"block";
 if(issuesChart)issuesChart.destroy();issuesChart=makeChart("issuesChart","bar",{labels:issues.map(x=>x[0]),datasets:[{data:issues.map(x=>x[1]),backgroundColor:"#8290ff",borderRadius:5,barThickness:18}]},{indexAxis:"y",plugins:{legend:{display:false}},scales:{x:{beginAtZero:true,grid:{color:"#f0f2f7"},ticks:{font:{size:9}}},y:{grid:{display:false},ticks:{font:{size:9}}}}});
 const days=d.daily||[];if(trendChart)trendChart.destroy();trendChart=makeChart("trendChart","line",{labels:days.map(x=>x[0].slice(5)),datasets:[{data:days.map(x=>x[1]),borderColor:"#6579fa",backgroundColor:"#6579fa18",fill:true,tension:.35,pointRadius:3}]},{plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{font:{size:9}}},y:{beginAtZero:true,grid:{color:"#f0f2f7"},ticks:{precision:0,font:{size:9}}}}});
 const aspectEntries=Object.entries(d.aspects||{});if(aspectChart)aspectChart.destroy();aspectChart=makeChart("aspectChart","bar",{labels:aspectEntries.map(x=>x[0]),datasets:[{label:"Positive",data:aspectEntries.map(x=>x[1].positive||0),backgroundColor:palette.positive,borderRadius:3},{label:"Negative",data:aspectEntries.map(x=>x[1].negative||0),backgroundColor:palette.negative,borderRadius:3}]},{plugins:{legend:{position:"bottom",labels:{font:{size:9},boxWidth:8}}},scales:{x:{grid:{display:false},ticks:{font:{size:8}}},y:{beginAtZero:true,ticks:{precision:0,font:{size:9}},grid:{color:"#f0f2f7"}}}});
 const recs=[...new Set(d.recommendations||[])];document.getElementById("recommendations").innerHTML=recs.length?recs.map(r=>`<div class="recommendation-item">${escapeHTML(r)}</div>`).join(""):'<div class="empty-hint">Submit feedback to generate recommendations.</div>';
 document.getElementById("recent-list").innerHTML=d.recent.length?d.recent.map(x=>`<div class="recent-item"><div class="recent-text">${escapeHTML(x.feedback)}<span class="recent-meta">${formatDate(x.created_at)}</span></div>${sentimentPill(x.sentiment)}</div>`).join(""):'<div class="empty-hint">No feedback submitted yet. Start by analysing your first response.</div>';
}
loadDashboard().catch(e=>console.error(e));

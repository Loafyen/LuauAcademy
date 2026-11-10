const phases = [
  ["Luau Fundamentals","Variables, data types, operators, conditionals, loops, functions, tables, scope, events and ModuleScripts.","Core language skills"],
  ["Roblox Engine","Instances, properties, services, players, characters, Humanoids, connections and task scheduling.","Working inside Studio"],
  ["Client & Server","RemoteEvents, RemoteFunctions, replication, server authority, input and exploit prevention.","Secure multiplayer systems"],
  ["Game Architecture","Modules, player data, DataStoreService, inventory systems, state management, debugging and performance.","Systems that scale"],
  ["Build Your Own Game","Combine everything into the systems your game needs, from gameplay and UI to saving and multiplayer.","Apply your skills"]
];

const goalPlans = {
 foundations: {label:"Learn Luau from the beginning", order:[0,1,2,3,4], focus:"Start with the language, then learn how Luau connects to Roblox."},
 gameplay: {label:"Gameplay systems", order:[0,1,3,2,4], focus:"Prioritize functions, tables, events, character systems, and secure gameplay logic."},
 ui: {label:"Roblox interfaces and menus", order:[0,1,2,3,4], focus:"Build fundamentals first, then focus on client-side scripting, input, UI behavior, and reusable modules."},
 multiplayer: {label:"Multiplayer and client-server scripting", order:[0,1,2,3,4], focus:"Move client-server concepts earlier so you can understand replication and secure remote communication."},
 data: {label:"Player data and progression", order:[0,1,3,2,4], focus:"Emphasize tables, modules, DataStoreService, saving, loading, and reliable progression systems."},
 fullgame: {label:"Build a complete Roblox game", order:[0,1,2,3,4], focus:"Follow the full course from fundamentals through architecture and putting systems together."},
 custom: {label:"Custom learning goal", order:[0,1,2,3,4], focus:"Your custom goal is saved. The general course remains the recommended foundation."}
};
const sections = [
 {name:"Fundamentals",desc:"Check your core Luau knowledge.",questions:[
  {q:"In Python, `None` is closest to which Luau value?",opts:["false","nil","0","empty"],a:1,why:"`nil` represents the absence of a value. It is the closest equivalent to Python's `None`."},
  {q:"What does `typeof(42)` return?",opts:["\"string\"","\"boolean\"","\"number\"","\"integer\""],a:2,why:"42 is a number. Luau's `typeof` reports the value's type."},
  {q:"Which statement correctly creates a local variable?",opts:["var health = 100","local health = 100","let health = 100","health := 100"],a:1,why:"Luau uses `local` to declare a local variable."},
  {q:"What does `#items` commonly return for a sequence-style table?",opts:["The table's memory size","The number of array elements","The number of keys including dictionary keys","Always nil"],a:1,why:"The length operator `#` returns the length of a sequence-style table."}
 ]},
 {name:"Code reading",desc:"Read code and reason about what it does.",questions:[
  {q:"What is printed? `local x = 5; x += 3; print(x)`",opts:["5","3","8","Error"],a:2,why:"The augmented assignment adds 3 to x, so it becomes 8."},
  {q:"What does this loop print? `for i = 1, 3 do print(i) end`",opts:["0, 1, 2","1, 2, 3","1, 2","2, 3, 4"],a:1,why:"Numeric for loops include both the start and end values."},
  {q:"What does `return` do inside a function?",opts:["Repeats the function","Ends the script","Sends a value back to the caller and ends that function call","Creates a variable"],a:2,why:"`return` ends the current function call and can provide a result."}
 ]},
 {name:"Luau writing",desc:"Show how you approach writing code.",questions:[
  {q:"Write a function named `heal` that accepts `character` and `amount`, then adds amount to character.health.",code:true,key:"function, heal, character.health, amount",why:"A good solution uses `local function heal(character, amount)` and updates `character.health`."},
  {q:"Create a table named `enemy` with health 100 and damage 15.",code:true,key:"enemy, health, damage",why:"Use a table constructor: `local enemy = { health = 100, damage = 15 }`."}
 ]},
 {name:"Roblox knowledge",desc:"Check your understanding of the Roblox engine.",questions:[
  {q:"Which script type normally handles server-side game logic?",opts:["LocalScript","Script","ModuleScript only","ScreenGui"],a:1,why:"A normal Script runs on the server when placed in a supported server container."},
  {q:"Why should the server validate damage sent by a client?",opts:["Clients cannot use numbers","Exploiters can manipulate client behavior and send dishonest requests","It makes animations smoother","RemoteEvents automatically validate damage"],a:1,why:"Never trust the client with important game outcomes. The server should check whether an action is valid."},
  {q:"What is a RemoteEvent commonly used for?",opts:["Saving data permanently","Communication between client and server","Creating 3D parts","Changing a script's type"],a:1,why:"RemoteEvents allow one side to send a message to the other across the client-server boundary."},
  {q:"Which service is commonly used for persistent player data?",opts:["Lighting","TweenService","DataStoreService","RunService"],a:2,why:"DataStoreService provides persistent data storage, subject to Roblox's data store rules and limits."}
 ]},
 {name:"Practical coding challenge",desc:"Apply your fundamentals to a small practical coding problem.",questions:[
  {q:"Write `takeDamage(character, amount)` and `heal(character, amount)`. Health should never go below 0 or above maxHealth. Explain where this logic should run.",code:true,key:"takeDamage, heal, math.max, math.min, maxHealth",why:"Clamp health with `math.max(0, ...)` and `math.min(character.maxHealth, ...)`. Important combat validation belongs on the server."},
  {q:"If a A character has 100 health, takes 85 damage, then receives 10 healing, what is their health?",opts:["15","25","35","95"],a:1,why:"100 - 85 = 15, then 15 + 10 = 25."}
 ]}
];
const state = JSON.parse(localStorage.getItem("luauAcademy") || '{"completed":[],"placement":null,"answers":{}}');
let currentSection = 0;
function save(){localStorage.setItem("luauAcademy",JSON.stringify(state));renderStats();}
function navigate(page){
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===page));
 document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
 const titles={dashboard:"Dashboard",placement:"Placement test",curriculum:"Curriculum",practice:"Practice arena"};
 document.getElementById("page-title").textContent=titles[page]||"Dashboard";
 window.scrollTo(0,0);
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)navigate(b.dataset.page);});
function renderStats(){
 document.getElementById("stat-lessons").textContent=state.completed.length;
 document.getElementById("stat-progress").textContent=Math.round(state.completed.length/15*100)+"%";
 document.getElementById("stat-placement").textContent=state.placement===null?"Not taken":state.placement+"%";
}
function renderPhases(){
 const goal = state.goal || "foundations";
 const plan = goalPlans[goal] || goalPlans.foundations;
 const ordered = plan.order.map(i=>({phase:phases[i],index:i}));
 document.getElementById("dashboard-phases").innerHTML=ordered.map(({phase:p,index:i},position)=>`<article class="phase-card"><div class="phase-num">0${position+1} / ${position===0?"START HERE":"PHASE"}</div><h3>${p[0]}</h3><p>${p[1]}</p></article>`).join("");
 document.getElementById("curriculum-list").innerHTML=`<div class="goal-explanation panel"><div class="eyebrow">RECOMMENDED ORDER FOR YOUR GOAL</div><strong>${plan.label}</strong><p>${plan.focus}</p></div>`+ordered.map(({phase:p,index:i},position)=>`<article class="panel phase-row"><div class="phase-index">0${position+1}</div><div><h3>${p[0]}</h3><p>${p[1]}</p></div><div class="phase-meta">${position===0?"START HERE":p[2]}</div></article>`).join("");
 const select=document.getElementById("goal-select");
 const custom=document.getElementById("custom-goal");
 if(select){select.value=goal;custom.value=state.customGoal||"";custom.classList.toggle("hidden",goal!=="custom");}
 const status=document.getElementById("goal-status");
 if(status)status.textContent=goal==="custom"&&state.customGoal?`Saved: ${state.customGoal}`:`Current: ${plan.label}`;
}

function renderSectionList(){
 document.getElementById("test-section-list").innerHTML=sections.map((s,i)=>`<button class="test-section ${i===currentSection?"active":""}" data-section="${i}"><span class="num">0${i+1}</span>${s.name}</button>`).join("");
 document.querySelectorAll("[data-section]").forEach(b=>b.addEventListener("click",()=>{currentSection=Number(b.dataset.section);renderTest();}));
}
function renderTest(){
 renderSectionList();
 const s=sections[currentSection];
 const qs=s.questions.map((q,i)=>{
  const key=`${currentSection}-${i}`,saved=state.answers[key];
  let input=q.code?`<textarea class="answer-input" data-answer="${key}" placeholder="Write your answer here...">${saved||""}</textarea>`:
   q.opts.map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}" ${String(saved)===String(j)?"checked":""}><span>${o.replaceAll("<","&lt;")}</span></label>`).join("");
  return `<div class="question"><h3>${i+1}. ${q.q}</h3>${input}</div>`;
 }).join("");
 document.getElementById("test-content").innerHTML=`<div class="eyebrow">SECTION 0${currentSection+1} / 05</div><h2>${s.name}</h2><p>${s.desc}</p>${qs}<div class="test-actions"><span class="tiny muted">${s.questions.length} QUESTIONS · PARTIAL ANSWERS OK</span><button class="btn primary" id="submit-section">Submit section →</button></div><div id="section-feedback" class="feedback hidden"></div>`;
 document.getElementById("submit-section").addEventListener("click",submitSection);
}
function submitSection(){
 const s=sections[currentSection];let score=0,answered=0;
 s.questions.forEach((q,i)=>{
  const key=`${currentSection}-${i}`;
  if(q.code){const val=document.querySelector(`[data-answer="${key}"]`).value.trim();state.answers[key]=val;if(val){answered++;const lower=val.toLowerCase();if(q.key.split(", ").every(k=>lower.includes(k.toLowerCase())))score++;}}
  else{const selected=document.querySelector(`input[name="q${i}"]:checked`);if(selected){state.answers[key]=selected.value;answered++;if(Number(selected.value)===q.a)score++;}}
 });
 state.answers[`submitted-${currentSection}`]=true;save();
 const fb=document.getElementById("section-feedback");fb.classList.remove("hidden");
 const explanations=s.questions.map((q,i)=>`<p><strong>Q${i+1}:</strong> ${q.why}</p>`).join("");
 fb.innerHTML=`<strong>Section saved.</strong> You answered ${answered}/${s.questions.length} questions. ${score} answer(s) matched the expected key. Code answers are checked for key concepts, not full correctness.<br><br>${explanations}<div style="margin-top:12px"><button class="btn secondary" id="next-section">${currentSection===4?"Finish assessment":"Next section →"}</button></div>`;
 document.getElementById("next-section").addEventListener("click",()=>{
  if(currentSection<4){currentSection++;renderTest();}
  else{finishPlacement();}
 });
}
function finishPlacement(){
 let total=0,earned=0;
 sections.forEach((s,si)=>s.questions.forEach((q,i)=>{total++;const v=state.answers[`${si}-${i}`];if(q.code){if(v&&q.key.split(", ").every(k=>v.toLowerCase().includes(k.toLowerCase())))earned++;}else if(v!==undefined&&Number(v)===q.a)earned++;}));
 state.placement=Math.round(earned/total*100);save();
 document.getElementById("test-content").innerHTML=`<div class="eyebrow">ASSESSMENT COMPLETE</div><h2>Your diagnostic result</h2><div style="font:700 56px 'Space Grotesk';color:var(--accent);margin:20px 0">${state.placement}%</div><p>This is an initial automated estimate, not a final judgement of your ability. Written answers are checked for keywords only, so review the explanations and code carefully.</p><div class="feedback">Recommended next step: review the fundamentals phase, then focus on the sections where you felt least confident. Your result is saved in this browser.</div><button class="btn primary" style="margin-top:18px" data-page="curriculum">View learning path →</button>`;
 document.querySelector('[data-page="curriculum"]').addEventListener("click",()=>navigate("curriculum"));
}
document.getElementById("practice-check").addEventListener("click",()=>{
 const v=document.getElementById("practice-answer").value.toLowerCase();
 const checks=[["function","Create a function."],["pairs","Use `pairs(items)` to iterate through the table."],["total","Start a total at zero and add each quantity."],["return","Return the final total."]];
 const missing=checks.filter(([k])=>!v.includes(k));
 const fb=document.getElementById("practice-feedback");fb.classList.remove("hidden");
 fb.innerHTML=missing.length?`<strong>You're on the right track. Check these points:</strong><ul>${missing.map(x=>`<li>${x[1]}</li>`).join("")}</ul>`:"<strong>Nice work!</strong> Your answer includes the main building blocks. A complete solution could use `for _, amount in pairs(items) do total += amount end` and then `return total`. Remember: this page reviews concepts; it doesn't execute Luau.";
});
document.getElementById("practice-reset").addEventListener("click",()=>{document.getElementById("practice-answer").value="";document.getElementById("practice-feedback").classList.add("hidden");});

const goalSelect=document.getElementById("goal-select");
const customGoal=document.getElementById("custom-goal");
goalSelect.addEventListener("change",()=>customGoal.classList.toggle("hidden",goalSelect.value!=="custom"));
document.getElementById("save-goal").addEventListener("click",()=>{
 state.goal=goalSelect.value;
 if(state.goal==="custom"){
   state.customGoal=customGoal.value.trim();
   if(!state.customGoal){document.getElementById("goal-status").textContent="Add a short description of your goal first.";return;}
 }
 save();renderPhases();
 document.getElementById("goal-status").textContent="Goal saved — your learning path has been updated.";
});

renderStats();renderPhases();renderTest();

const phases = [
  ["Luau Fundamentals", "Variables, data types, operators, conditionals, loops, functions, tables, scope, events and ModuleScripts.", "Core language skills"],
  ["Roblox Engine", "Instances, properties, services, players, characters, Humanoids, connections and task scheduling.", "Working inside Studio"],
  ["Client & Server", "RemoteEvents, RemoteFunctions, replication, server authority, input and exploit prevention.", "Secure multiplayer systems"],
  ["Game Architecture", "Modules, player data, DataStoreService, inventory systems, state management, debugging and performance.", "Systems that scale"],
  ["Build Your Own Game", "Combine everything into the systems your game needs, from gameplay and UI to saving and multiplayer.", "Apply your skills"]
];

const lessons = [
  { id: "l1", phaseIndex: 0, title: "Variables & Data Types", desc: "Learn basic data types and local variable assignment.", content: "In Luau, variables hold data. Always use <code>local</code> to create variables in local scope.", exerciseTitle: "Create Health Variable", exercisePrompt: "Declare a local variable named <code>health</code> equal to <code>100</code>.", exerciseSample: "-- declare variable", keys: ["local", "health", "100"], solutionHint: "Use `local health = 100`" },
  { id: "l2", phaseIndex: 0, title: "Conditionals & Control Flow", desc: "Use if statements to make decisions.", content: "Control flow allows code execution based on conditions.", exerciseTitle: "Check Health", exercisePrompt: "Write an if statement checking if <code>health > 0</code>.", exerciseSample: "-- if statement", keys: ["if", "health", ">", "0", "then"], solutionHint: "Use `if health > 0 then ... end`" },
  { id: "l3", phaseIndex: 0, title: "Loops & Iteration", desc: "Repeat actions using loops.", content: "Loops run code multiple times automatically.", exerciseTitle: "Numeric Loop", exercisePrompt: "Write a for loop from 1 to 3.", exerciseSample: "-- for loop", keys: ["for", "do", "end"], solutionHint: "Use `for i = 1, 3 do print(i) end`" },
  { id: "l4", phaseIndex: 0, title: "Functions & Scope", desc: "Encapsulate reusable logic.", content: "Functions keep code modular.", exerciseTitle: "Create Function", exercisePrompt: "Write a function named <code>add</code>.", exerciseSample: "-- function", keys: ["function", "add", "return", "end"], solutionHint: "Use `local function add(a, b) return a + b end`" },
  { id: "l5", phaseIndex: 0, title: "Tables & Dictionaries", desc: "Store lists and key-value pairs.", content: "Tables are Luau's primary data structure.", exerciseTitle: "Table Constructor", exercisePrompt: "Create a table named <code>t</code>.", exerciseSample: "-- table", keys: ["local", "t", "{", "}"], solutionHint: "Use `local t = {}`" },
  { id: "l6", phaseIndex: 1, title: "Instances & Properties", desc: "Manipulate Roblox objects and properties.", content: "Every object in Roblox is an Instance.", exerciseTitle: "Create Part", exercisePrompt: "Create a Part using <code>Instance.new(\"Part\")</code>.", exerciseSample: "-- part", keys: ["Instance.new", "Part"], solutionHint: "Use `local part = Instance.new(\"Part\")`" },
  { id: "l7", phaseIndex: 1, title: "Roblox Services", desc: "Access services like Players and Workspace.", content: "Fetch services using <code>game:GetService()</code>.", exerciseTitle: "Get Players Service", exercisePrompt: "Get the Players service.", exerciseSample: "-- service", keys: ["game:GetService", "Players"], solutionHint: "Use `local Players = game:GetService(\"Players\")`" },
  { id: "l8", phaseIndex: 1, title: "Events & Touched Signals", desc: "Respond to game occurrences.", content: "Connect functions to events using <code>:Connect()</code>.", exerciseTitle: "Touched Event", exercisePrompt: "Connect to <code>part.Touched</code>.", exerciseSample: "-- touched", keys: ["Touched:Connect", "function"], solutionHint: "Use `part.Touched:Connect(function(hit) end)`" },
  { id: "l9", phaseIndex: 2, title: "Client-Server Boundaries", desc: "Understand client vs server scripts.", content: "Never trust client input blindly.", exerciseTitle: "Server Validation", exercisePrompt: "Write a comment explaining server authority.", exerciseSample: "-- comment", keys: ["server"], solutionHint: "Write a comment about server verification." },
  { id: "l10", phaseIndex: 2, title: "RemoteEvents", desc: "Communicate across the network.", content: "RemoteEvents allow data transfer between client and server.", exerciseTitle: "Fire Event", exercisePrompt: "Fire a RemoteEvent.", exerciseSample: "-- remote", keys: ["FireServer"], solutionHint: "Use `event:FireServer()`" },
  { id: "l11", phaseIndex: 3, title: "ModuleScripts", desc: "Structure code into clean components.", content: "ModuleScripts return data or tables.", exerciseTitle: "Return Module", exercisePrompt: "Return a module table.", exerciseSample: "-- module", keys: ["return"], solutionHint: "End with `return Module`" },
  { id: "l12", phaseIndex: 3, title: "DataStoreService", desc: "Save player data persistently.", content: "Always wrap DataStore calls in <code>pcall</code>.", exerciseTitle: "Use pcall", exercisePrompt: "Wrap call in pcall.", exerciseSample: "-- pcall", keys: ["pcall", "function", "end"], solutionHint: "Use `local success, err = pcall(function() ... end)`" },
  { id: "l13", phaseIndex: 4, title: "Build Your Game", desc: "Put everything together.", content: "Combine all systems into a complete project.", exerciseTitle: "Final System", exercisePrompt: "Structure a complete game loop.", exerciseSample: "-- final", keys: ["function"], solutionHint: "Combine services, events, and logic." }
];

const goalPlans = {
  foundations: { label: "Learn Luau from the beginning", order: [0, 1, 2, 3, 4], focus: "Start with the language, then learn how Luau connects to Roblox." },
  gameplay: { label: "Gameplay systems", order: [0, 1, 3, 2, 4], focus: "Prioritize functions, tables, events, character systems, and secure gameplay logic." },
  ui: { label: "Roblox interfaces and menus", order: [0, 1, 2, 3, 4], focus: "Build fundamentals first, then focus on client-side scripting, input, UI behavior, and reusable modules." },
  multiplayer: { label: "Multiplayer and client-server scripting", order: [0, 1, 2, 3, 4], focus: "Move client-server concepts earlier so you can understand replication and secure remote communication." },
  data: { label: "Player data and progression", order: [0, 1, 3, 2, 4], focus: "Emphasize tables, modules, DataStoreService, saving, loading, and reliable progression systems." },
  fullgame: { label: "Build a complete Roblox game", order: [0, 1, 2, 3, 4], focus: "Follow the full course from fundamentals through architecture and putting systems together." },
  custom: { label: "Custom learning goal", order: [0, 1, 2, 3, 4], focus: "Your custom goal is saved. The general course remains the recommended foundation." }
};

const sections = [
  {name:"Fundamentals",desc:"Check your core Luau knowledge.",questions:[
    {q:"In Python, `None` is closest to which Luau value?",opts:["false","nil","0","empty"],a:1,why:"`nil` represents the absence of a value."},
    {q:"What does `typeof(42)` return?",opts:["\"string\"","\"boolean\"","\"number\"","\"integer\""],a:2,why:"42 is a number."},
    {q:"Which statement correctly creates a local variable?",opts:["var health = 100","local health = 100","let health = 100","health := 100"],a:1,why:"Luau uses `local`."},
    {q:"What does `#items` commonly return for a sequence-style table?",opts:["The table's memory size","The number of array elements","The number of keys including dictionary keys","Always nil"],a:1,why:"The length operator `#` returns the length."}
  ]},
  {name:"Code reading",desc:"Read code and reason about what it does.",questions:[
    {q:"What is printed? `local x = 5; x += 3; print(x)`",opts:["5","3","8","Error"],a:2,why:"Augmented assignment adds 3 to x."},
    {q:"What does this loop print? `for i = 1, 3 do print(i) end`",opts:["0, 1, 2","1, 2, 3","1, 2","2, 3, 4"],a:1,why:"Includes start and end values."},
    {q:"What does `return` do inside a function?",opts:["Repeats the function","Ends the script","Sends a value back to the caller and ends that function call","Creates a variable"],a:2,why:"Ends the function call."}
  ]},
  {name:"Luau writing",desc:"Show how you approach writing code.",questions:[
    {q:"Write a function named `heal` that accepts `character` and `amount`.",code:true,key:"function, heal, amount",why:"Use `local function heal(character, amount)`."},
    {q:"Create a table named `enemy` with health 100 and damage 15.",code:true,key:"enemy, health, damage",why:"Use table constructor."}
  ]},
  {name:"Roblox knowledge",desc:"Check your understanding of the Roblox engine.",questions:[
    {q:"Which script type normally handles server-side game logic?",opts:["LocalScript","Script","ModuleScript only","ScreenGui"],a:1,why:"A normal Script runs on the server."},
    {q:"Why should the server validate damage sent by a client?",opts:["Clients cannot use numbers","Exploiters can manipulate client behavior and send dishonest requests","It makes animations smoother","RemoteEvents automatically validate damage"],a:1,why:"Never trust the client."},
    {q:"What is a RemoteEvent commonly used for?",opts:["Saving data permanently","Communication between client and server","Creating 3D parts","Changing a script's type"],a:1,why:"Client-server communication."},
    {q:"Which service is commonly used for persistent player data?",opts:["Lighting","TweenService","DataStoreService","RunService"],a:2,why:"DataStoreService."}
  ]},
  {name:"Practical coding challenge",desc:"Apply your fundamentals.",questions:[
    {q:"Write takeDamage and heal functions with clamped health.",code:true,key:"takeDamage, heal, math",why:"Clamp health with math functions."},
    {q:"If a character has 100 health, takes 85 damage, then receives 10 healing, what is their health?",opts:["15","25","35","95"],a:1,why:"100 - 85 + 10 = 25."}
  ]}
];

let state = JSON.parse(localStorage.getItem("luauAcademy") || '{"completed":[],"placement":null,"answers":{}}');
let currentSection = 0;
let currentLessonId = lessons[0].id;

function save() {
  localStorage.setItem("luauAcademy", JSON.stringify(state));
  renderStats();
}

function getOrderedLessons() {
  const goal = state.goal || "foundations";
  const plan = goalPlans[goal] || goalPlans.foundations;
  let ordered = [];
  plan.order.forEach(pIdx => {
    ordered = ordered.concat(lessons.filter(l => l.phaseIndex === pIdx));
  });
  return ordered;
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === page));
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  const titles = { dashboard: "Dashboard", placement: "Placement test", curriculum: "Curriculum", course: "Course", practice: "Practice arena" };
  document.getElementById("page-title").textContent = titles[page] || "Dashboard";
  
  if (page === "curriculum") {
    renderPhases();
  } else if (page === "course") {
    renderCourse(currentLessonId);
  }
  window.scrollTo(0, 0);
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-page]");
  if (b) {
    navigate(b.dataset.page);
  }
});

function renderStats() {
  document.getElementById("stat-lessons").textContent = state.completed.length;
  document.getElementById("stat-progress").textContent = Math.round((state.completed.length / lessons.length) * 100) + "%";
  document.getElementById("stat-placement").textContent = state.placement === null ? "Not taken" : state.placement + "%";
}

function renderPhases() {
  const goal = state.goal || "foundations";
  const plan = goalPlans[goal] || goalPlans.foundations;
  const orderedPhases = plan.order;

  document.getElementById("dashboard-phases").innerHTML = orderedPhases.map((pIndex, position) => {
    const p = phases[pIndex];
    return `<article class="phase-card"><div class="phase-num">0${position + 1} / ${position === 0 ? "START HERE" : "PHASE"}</div><h3>${p[0]}</h3><p>${p[1]}</p></article>`;
  }).join("");

  const curriculumListElem = document.getElementById("curriculum-list");
  if (curriculumListElem) {
    let html = `<div class="goal-explanation panel"><div class="eyebrow">RECOMMENDED ORDER FOR YOUR GOAL</div><strong>${plan.label}</strong><p>${plan.focus}</p></div>`;
    
    orderedPhases.forEach((pIndex, position) => {
      const p = phases[pIndex];
      const phaseLessons = lessons.filter(l => l.phaseIndex === pIndex);

      html += `<div class="panel phase-row" style="display:block; margin-bottom:15px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div><span class="eyebrow">PHASE 0${position + 1}</span><h3 style="margin:4px 0">${p[0]}</h3><p style="margin:0">${p[1]}</p></div>
          <span class="phase-meta">${position === 0 ? "START HERE" : p[2]}</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">`;

      phaseLessons.forEach(l => {
        const isDone = state.completed.includes(l.id);
        html += `
          <div class="curriculum-item-card" data-lesson-id="${l.id}" style="display:flex; justify-content:space-between; align-items:center; background:var(--panel2); padding:12px 16px; border-radius:8px; cursor:pointer; border:1px solid ${isDone ? 'var(--accent2)' : 'var(--line)'};">
            <div>
              <div style="font-weight:600; color:var(--text);">${l.title}</div>
              <div style="font-size:12px; color:var(--muted);">${l.desc}</div>
            </div>
            <div>
              ${isDone ? '<span style="color:var(--accent2); font-weight:bold; font-size:12px;">✓ Completed</span>' : '<span style="color:var(--accent); font-size:12px;">Start →</span>'}
            </div>
          </div>
        `;
      });

      html += `</div></div>`;
    });

    curriculumListElem.innerHTML = html;

    curriculumListElem.querySelectorAll(".curriculum-item-card").forEach(card => {
      card.addEventListener("click", () => {
        const lessonId = card.getAttribute("data-lesson-id");
        openLesson(lessonId);
      });
    });
  }

  const select = document.getElementById("goal-select");
  const custom = document.getElementById("custom-goal");
  if (select) {
    select.value = goal;
    custom.value = state.customGoal || "";
    custom.classList.toggle("hidden", goal !== "custom");
  }
  const status = document.getElementById("goal-status");
  if (status) status.textContent = goal === "custom" && state.customGoal ? `Saved: ${state.customGoal}` : `Current: ${plan.label}`;
}

function openLesson(lessonId) {
  currentLessonId = lessonId;
  document.getElementById("nav-course-link").style.display = "block";
  navigate("course");
}

function renderCourse(lessonId) {
  const lesson = lessons.find(l => l.id === lessonId) || lessons[0];
  currentLessonId = lesson.id;

  document.getElementById("course-phase-tag").textContent = `LESSON · ${lesson.title.toUpperCase()}`;
  document.getElementById("course-title").textContent = lesson.title;
  document.getElementById("course-desc").textContent = lesson.desc;
  document.getElementById("course-content-body").innerHTML = lesson.content;
  
  document.getElementById("exercise-title").textContent = lesson.exerciseTitle;
  document.getElementById("exercise-prompt").textContent = lesson.exercisePrompt;
  document.getElementById("exercise-code-sample").textContent = lesson.exerciseSample;
  document.getElementById("course-answer").value = state.answers[`lesson-${lesson.id}`] || "";
  document.getElementById("course-feedback").classList.add("hidden");

  const isDone = state.completed.includes(lesson.id);
  const markBtn = document.getElementById("mark-complete-btn");
  if (markBtn) {
    markBtn.textContent = isDone ? "✓ Completed (Click to Toggle)" : "Mark Lesson Complete ✓";
  }

  const ordered = getOrderedLessons();
  const idx = ordered.findIndex(l => l.id === lesson.id);
  
  const prevBtn = document.getElementById("prev-lesson-btn");
  const nextBtn = document.getElementById("next-course-lesson-btn");
  if (prevBtn) {
    prevBtn.disabled = idx <= 0;
    prevBtn.onclick = () => { if (idx > 0) openLesson(ordered[idx - 1].id); };
  }
  if (nextBtn) {
    nextBtn.disabled = idx >= ordered.length - 1;
    nextBtn.onclick = () => { if (idx < ordered.length - 1) openLesson(ordered[idx + 1].id); };
  }
}

document.getElementById("course-check-btn")?.addEventListener("click", () => {
  const lesson = lessons.find(l => l.id === currentLessonId);
  const val = document.getElementById("course-answer").value;
  state.answers[`lesson-${currentLessonId}`] = val;
  save();

  const valLower = val.toLowerCase();
  const missing = lesson.keys.filter(k => !valLower.includes(k.toLowerCase()));
  const fb = document.getElementById("course-feedback");
  fb.classList.remove("hidden");

  if (missing.length === 0) {
    fb.innerHTML = `<strong>Great work!</strong> Solution matches key concepts.<br><em>Hint:</em> ${lesson.solutionHint}`;
    if (!state.completed.includes(lesson.id)) {
      state.completed.push(lesson.id);
      save();
      renderCourse(currentLessonId);
    }
  } else {
    fb.innerHTML = `<strong>Almost there!</strong> Missing keywords: <code>${missing.join(", ")}</code>.<br><em>Hint:</em> ${lesson.solutionHint}`;
  }
});

document.getElementById("course-reset-btn")?.addEventListener("click", () => {
  document.getElementById("course-answer").value = "";
  document.getElementById("course-feedback").classList.add("hidden");
});

document.getElementById("mark-complete-btn")?.addEventListener("click", () => {
  const idx = state.completed.indexOf(currentLessonId);
  if (idx > -1) {
    state.completed.splice(idx, 1);
  } else {
    state.completed.push(currentLessonId);
  }
  save();
  renderCourse(currentLessonId);
});

document.getElementById("next-lesson-btn")?.addEventListener("click", () => {
  const ordered = getOrderedLessons();
  const nextIncomplete = ordered.find(l => !state.completed.includes(l.id)) || ordered[0];
  openLesson(nextIncomplete.id);
});

function renderSectionList() {
  document.getElementById("test-section-list").innerHTML = sections.map((s,i)=>`<button class="test-section ${i===currentSection?"active":""}" data-section="${i}"><span class="num">0${i+1}</span>${s.name}</button>`).join("");
  document.querySelectorAll("[data-section]").forEach(b=>b.addEventListener("click",()=>{currentSection=Number(b.dataset.section);renderTest();}));
}

function renderTest(){
  renderSectionList();
  const s=sections[currentSection];
  const qs=s.questions.map((q,i)=>{
    const key=`${currentSection}-${i}`,saved=state.answers[key];
    let input=q.code?`<textarea class="answer-input" data-answer="${key}" placeholder="Write your answer here...">${saved||""}`:
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
  fb.innerHTML=`<strong>Section saved.</strong> You answered ${answered}/${s.questions.length} questions. ${score} answer(s) matched expected keys.<br><br>${explanations}<div style="margin-top:12px"><button class="btn secondary" id="next-section">${currentSection===4?"Finish assessment":"Next section →"}</button></div>`;
  document.getElementById("next-section").addEventListener("click",()=>{
    if(currentSection<4){currentSection++;renderTest();}
    else{finishPlacement();}
  });
}

function finishPlacement(){
  let total=0,earned=0;
  sections.forEach((s,si)=>s.questions.forEach((q,i)=>{total++;const v=state.answers[`${si}-${i}`];if(q.code){if(v&&q.key.split(", ").every(k=>v.toLowerCase().includes(k.toLowerCase())))earned++;}else if(v!==undefined&&Number(v)===q.a)earned++;}));
  state.placement=Math.round(earned/total*100);save();
  document.getElementById("test-content").innerHTML=`<div class="eyebrow">ASSESSMENT COMPLETE</div><h2>Your diagnostic result</h2><div style="font:700 56px 'Space Grotesk';color:var(--accent);margin:20px 0">${state.placement}%</div><p>Result saved in this browser.</p><button class="btn primary" style="margin-top:18px" data-page="curriculum">View learning path →</button>`;
  document.querySelector('[data-page="curriculum"]').addEventListener("click",()=>navigate("curriculum"));
}

document.getElementById("practice-check").addEventListener("click",()=>{
  const v=document.getElementById("practice-answer").value.toLowerCase();
  const checks=[["function","Create a function."],["pairs","Use `pairs(items)`."],["total","Start total at zero."],["return","Return total."]];
  const missing=checks.filter(([k])=>!v.includes(k));
  const fb=document.getElementById("practice-feedback");fb.classList.remove("hidden");
  fb.innerHTML=missing.length?`<strong>Check these points:</strong><ul>${missing.map(x=>`<li>${x[1]}</li>`).join("")}</ul>`:"<strong>Nice work!</strong> Your answer includes main building blocks.";
});
document.getElementById("practice-reset").addEventListener("click",()=>{document.getElementById("practice-answer").value="";document.getElementById("practice-feedback").classList.add("hidden");});

const goalSelect=document.getElementById("goal-select");
const customGoal=document.getElementById("custom-goal");
goalSelect?.addEventListener("change",()=>customGoal.classList.toggle("hidden",goalSelect.value!=="custom"));
document.getElementById("save-goal")?.addEventListener("click",()=>{
  state.goal=goalSelect.value;
  if(state.goal==="custom"){
    state.customGoal=customGoal.value.trim();
    if(!state.customGoal){document.getElementById("goal-status").textContent="Add description first.";return;}
  }
  save();renderPhases();
  document.getElementById("goal-status").textContent="Goal saved — learning path updated.";
});

renderStats();renderPhases();renderTest();
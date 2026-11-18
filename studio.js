"use strict";

(() => {
  const ink = "#243449";
  const colors = { teal: "#c9e8df", blue: "#d8e7fa", amber: "#fae5b8", coral: "#f6d5ce", white: "#ffffff" };
  const packs = [];
  let sequence = 0;
  let active = null;
  const hash = (s) => [...s].reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) | 0, 7) >>> 0;
  const id = () => `fn-${active ? active.id : "art"}-${++sequence}`;
  const base = (type, x, y, width, height, options = {}) => ({
    id: id(), type, x, y, width, height, angle: 0,
    strokeColor: ink, backgroundColor: "transparent", fillStyle: "solid",
    strokeWidth: 2.2, strokeStyle: "solid", roughness: 0.65, opacity: 100,
    groupIds: [], frameId: null, roundness: null, seed: hash(`${sequence}-${x}-${y}`),
    version: 1, versionNonce: hash(`nonce-${sequence}`), isDeleted: false,
    boundElements: null, updated: 1, link: null, locked: false, ...options,
  });

  class Drawing {
    constructor() { this.elements = []; }
    box(x, y, w, h, fill = "transparent", radius = true) {
      this.elements.push(base("rectangle", x, y, w, h, { backgroundColor: colors[fill] || fill, roundness: radius ? { type: 3 } : null }));
      return this;
    }
    oval(x, y, w, h, fill = "transparent") {
      this.elements.push(base("ellipse", x, y, w, h, { backgroundColor: colors[fill] || fill }));
      return this;
    }
    line(points, options = {}) {
      const x = points[0][0], y = points[0][1];
      const local = points.map(([px, py]) => [px - x, py - y]);
      const xs = local.map(p => p[0]), ys = local.map(p => p[1]);
      this.elements.push(base("line", x, y, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), {
        points: local, lastCommittedPoint: null, startBinding: null, endBinding: null,
        startArrowhead: null, endArrowhead: null, ...options,
      }));
      return this;
    }
    arrow(points, options = {}) {
      this.line(points, options);
      const e = this.elements[this.elements.length - 1];
      e.type = "arrow"; e.endArrowhead = "arrow"; e.elbowed = false;
      return this;
    }
    check(x, y, s = 1) { return this.line([[x, y + 6*s], [x + 6*s, y + 12*s], [x + 18*s, y - 3*s]], { strokeWidth: 3 }); }
    cross(x, y, s = 1) { return this.line([[x, y], [x+13*s,y+13*s]]).line([[x+13*s,y],[x,y+13*s]]); }
    text(x, y, text, size = 16, color = ink) {
      this.elements.push(base("text", x, y, Math.max(...text.split("\n").map(l => l.length)) * size * 0.58, text.split("\n").length * size * 1.25, {
        strokeColor: color, strokeWidth: 1, roughness: 0, text, originalText: text,
        fontSize: size, fontFamily: 2, textAlign: "left", verticalAlign: "top",
        containerId: null, autoResize: true, lineHeight: 1.25,
      }));
      return this;
    }
  }

  function person(d, x, y, s = 1, pose = "neutral", fill = "blue") {
    const p = (a, b) => [x + a*s, y + b*s];
    d.oval(x-7*s, y, 14*s, 16*s, "white");
    d.box(x-10*s, y+22*s, 20*s, 27*s, fill);
    d.line([p(-5,49),p(-8,65)]).line([p(5,49),p(8,65)]);
    const arms = {
      neutral: [[[-10,27],[-17,42]],[[10,27],[17,42]]],
      speak: [[[-10,27],[-18,42]],[[10,27],[24,20],[29,13]]],
      listen: [[[-10,27],[-19,20],[-13,10]],[[10,27],[17,42]]],
      point: [[[-10,27],[-17,42]],[[10,27],[31,27]]],
      open: [[[-10,27],[-26,19]],[[10,27],[26,19]]],
      stop: [[[-10,27],[-16,43]],[[10,27],[22,19],[22,6]]],
      think: [[[-10,27],[-14,41],[10,39]],[[10,27],[17,20],[6,14]]],
      low: [[[-10,27],[-19,46]],[[10,27],[19,46]]],
      raised: [[[-10,27],[-23,13],[-23,2]],[[10,27],[23,13],[23,2]]],
      write: [[[-10,27],[-15,42],[9,42]],[[10,27],[24,40]]],
    };
    (arms[pose] || arms.neutral).forEach(a => d.line(a.map(([px,py]) => p(px,py))));
  }
  function seated(d, x, y, s = 1, fill = "blue") {
    d.oval(x-7*s,y,14*s,16*s,"white").box(x-10*s,y+22*s,20*s,24*s,fill);
    d.line([[x-7*s,y+46*s],[x+18*s,y+46*s],[x+18*s,y+63*s]]);
    d.line([[x+7*s,y+46*s],[x+27*s,y+46*s],[x+27*s,y+63*s]]);
    d.line([[x-17*s,y+28*s],[x-17*s,y+49*s],[x+10*s,y+49*s]]);
    d.line([[x-14*s,y+49*s],[x-14*s,y+64*s]]);
    d.line([[x+9*s,y+27*s],[x+24*s,y+34*s]]);
  }
  function calendar(d, x, y, w = 64, h = 62) {
    d.box(x,y,w,h,"white").box(x,y,w,16,"blue").line([[x+14,y-5],[x+14,y+7]]).line([[x+w-14,y-5],[x+w-14,y+7]]);
  }
  function documentIcon(d,x,y,w=45,h=59,fill="white") {
    d.box(x,y,w,h,fill).line([[x+9,y+13],[x+w-9,y+13]]).line([[x+9,y+23],[x+w-14,y+23]]);
  }
  function clipboard(d,x,y,w=47,h=65) {
    d.box(x,y,w,h,"white").box(x+w*.28,y-5,w*.44,10,"blue");
  }
  function clock(d,x,y,r=17) {
    d.oval(x-r,y-r,r*2,r*2,"white").line([[x,y-r*.6],[x,y],[x+r*.5,y+r*.25]]);
  }
  function bubble(d,x,y,w=44,h=29,fill="white",tail="left") {
    d.box(x,y,w,h,fill);
    const tx = tail === "left" ? x+11 : x+w-11;
    d.line([[tx,y+h],[tx+(tail==="left"?-6:6),y+h+9],[tx+10*(tail==="left"?1:-1),y+h]],{backgroundColor:colors[fill]||fill});
  }
  function shield(d,x,y,w=42,h=48,fill="teal") {
    d.line([[x+w/2,y],[x+w,y+9],[x+w-3,y+h*.6],[x+w*.72,y+h*.85],[x+w/2,y+h],[x+w*.28,y+h*.85],[x+3,y+h*.6],[x,y+9],[x+w/2,y]],{backgroundColor:colors[fill]||fill});
  }
  function lock(d,x,y,s=1) {
    d.oval(x+5*s,y,20*s,23*s,"white").box(x,y+13*s,30*s,25*s,"amber").oval(x+13*s,y+21*s,4*s,5*s,ink);
  }
  function sparkle(d,x,y,s=1) {
    d.line([[x,y-10*s],[x+3*s,y-3*s],[x+10*s,y],[x+3*s,y+3*s],[x,y+10*s],[x-3*s,y+3*s],[x-10*s,y],[x-3*s,y-3*s],[x,y-10*s]],{backgroundColor:colors.amber});
  }
  function model(d,x,y,s=1) {
    d.box(x,y,34*s,29*s,"blue").oval(x+8*s,y+10*s,4*s,4*s,ink).oval(x+22*s,y+10*s,4*s,4*s,ink);
    d.line([[x+11*s,y+22*s],[x+23*s,y+22*s]]).line([[x+17*s,y],[x+17*s,y-7*s]]).oval(x+14*s,y-12*s,6*s,6*s,"amber");
  }
  function rows(d,x,y,w=24,n=3,gap=10) {
    for(let i=0;i<n;i++) d.line([[x,y+i*gap],[x+w-(i%2)*5,y+i*gap]]);
  }
  function addPack(id,title,description,icons,examples,scope) {
    packs.push({id,title,description,icons:icons.map(([name,meaning,draw])=>({name,meaning,draw})),examples,scope,version:"1.0.0"});
  }

  addPack("A052","Patient appointment journey",
    "From finding care to following up: compact, human-centered symbols for service maps, patient education, and clinic operations. Illustrative, not standardized clinical symbols.",[
    ["Find a clinician","Compare suitable care providers.",d=>{
      d.box(20,22,61,73,"white");person(d,48,34,.6);d.oval(73,65,31,31,"teal").line([[99,91],[114,106]]);
    }],
    ["Book an appointment","Request a visit using a booking interface.",d=>{
      d.box(29,12,51,94,"blue").box(35,23,39,65,"white");calendar(d,42,35,25,30);d.line([[49,51],[60,51]]).line([[54,46],[54,56]]).oval(51,94,7,5);
      d.line([[90,65],[90,90],[104,103],[113,102],[116,83],[109,77],[103,78],[103,60],[98,56],[93,59],[93,77]]);
    }],
    ["Choose a time","Select an available appointment slot.",d=>{
      calendar(d,19,22,78,76);d.box(28,47,17,15,"teal").box(51,47,17,15,"amber").box(74,47,14,15,"blue");
      d.line([[31,74],[42,74]]).line([[54,74],[65,74]]);d.arrow([[111,89],[79,64]]);
    }],
    ["Appointment confirmed","A requested visit is now scheduled.",d=>{
      calendar(d,21,26,76,70);d.check(43,59,1.6);d.line([[104,31],[113,24]]).line([[107,45],[120,45]]);
    }],
    ["Visit reminder","An upcoming visit needs attention.",d=>{
      calendar(d,14,34,60,65);d.text(30,60,"12",23);d.line([[88,39],[80,47],[80,69],[74,78],[112,78],[105,69],[105,47],[98,39],[88,39]],{backgroundColor:colors.amber});
      d.oval(89,80,10,7,"white").line([[91,28],[96,28]]).line([[116,43],[122,38]]);
    }],
    ["Pre-visit questionnaire","Complete questions before the visit.",d=>{
      clipboard(d,31,24,53,76);[43,61,79].forEach(y=>{d.box(40,y,8,8);d.line([[54,y+4],[73,y+4]]);});d.check(39,44,.45);
      d.line([[88,80],[111,49],[116,53],[94,85],[86,90],[88,80]],{backgroundColor:colors.amber});
    }],
    ["Bring records","Prepare existing medical documents.",d=>{
      documentIcon(d,35,22,51,65,"blue");documentIcon(d,23,34,51,65);
      d.line([[47,70],[60,70]]).line([[53.5,63.5],[53.5,76.5]]);d.arrow([[99,24],[109,39],[109,85],[85,85]]);
    }],
    ["Access accommodation","Arrange step-free access or mobility support.",d=>{
      d.oval(39,22,15,16,"white").line([[47,43],[49,71],[75,71],[88,94],[99,94]]);
      d.line([[48,49],[75,49]]).oval(27,60,47,47,"blue");d.line([[49,71],[49,84],[64,84]]);
      d.line([[82,111],[113,111],[113,61]]).line([[91,104],[107,88]]);
    }],
    ["Arrival and check-in","Register arrival at the reception desk.",d=>{
      person(d,30,35,.9,"point");d.box(70,59,43,43,"teal").box(79,35,24,20,"white").line([[91,55],[91,59]]);
      d.line([[76,102],[76,111]]).line([[108,102],[108,111]]);d.check(88,76,.65);
    }],
    ["Waiting room","Wait until the care team is ready.",d=>{
      seated(d,43,42,.9);d.line([[78,74],[108,74],[108,109]]).line([[82,74],[82,109]]);clock(d,94,32,19);
    }],
    ["Vitals check","Measure basic observations before consultation.",d=>{
      d.box(62,31,52,47,"white").line([[67,56],[78,56],[83,42],[91,67],[96,52],[108,52]]);
      d.line([[88,78],[88,91],[103,91]]);person(d,26,43,.85,"neutral");
      d.box(29,70,17,12,"teal").line([[46,76],[55,76],[55,64],[62,64]]);
    }],
    ["Clinical consultation","Discuss concerns with a care professional.",d=>{
      seated(d,26,38,.85);seated(d,96,38,.85,"teal");
      d.box(49,72,29,7,"white").line([[53,79],[53,106]]).line([[74,79],[74,106]]);
      bubble(d,46,13,37,25,"blue");d.line([[57,25],[72,25]]).line([[64.5,18],[64.5,32]]);
    }],
    ["Diagnostic referral","Move from a visit to an ordered diagnostic service.",d=>{
      documentIcon(d,12,37,39,57);d.arrow([[56,65],[76,65]]);
      d.line([[88,24],[88,82],[93,94],[105,94],[111,82],[111,24]]).line([[84,24],[115,24]]);
      d.line([[89,67],[110,67]],{strokeColor:"#246b70",strokeWidth:5});
      d.oval(94,73,5,5,"teal");
    }],
    ["Prescription","Receive a medication plan from the clinician.",d=>{
      documentIcon(d,22,22,57,78);d.text(33,48,"Rx",23);
      d.box(82,67,24,40,"amber").box(80,59,28,10,"white").line([[88,86],[100,86]]);
    }],
    ["Follow-up plan","Schedule a next visit after the current one.",d=>{
      calendar(d,55,38,58,61);d.check(74,67,.9);
      d.arrow([[32,95],[17,83],[17,51],[30,35],[47,35]]);
      d.line([[26,21],[36,13],[47,21],[47,31],[36,39],[26,31],[26,21]],{backgroundColor:colors.teal});
    }],
    ["Reschedule a visit","Move an existing booking to a different slot.",d=>{
      calendar(d,9,34,46,56);calendar(d,77,34,46,56);d.line([[20,62],[42,62]]);
      d.arrow([[40,19],[80,19],[94,29]]);d.check(88,62,.9);
    }],
    ["Cancel a visit","Remove a scheduled visit without replacing it.",d=>{
      calendar(d,24,27,76,72);d.line([[43,56],[78,84]],{strokeColor:"#ac4b45",strokeWidth:3}).line([[78,56],[43,84]],{strokeColor:"#ac4b45",strokeWidth:3});
    }],
    ["Telehealth visit","Consult remotely through a video connection.",d=>{
      d.box(17,25,97,65,"blue");d.box(24,32,83,48,"white");person(d,65,40,.52,"open","teal");
      d.line([[58,90],[55,102],[77,102],[74,90]]);d.oval(96,14,22,22,"teal").line([[103,25],[110,25]]).line([[106.5,21.5],[106.5,28.5]]);
    }],
  ],[
    {title:"A routine in-person visit",items:[1,3,8,11,14]},
    {title:"Prepare for remote care",items:[1,5,6,17,14]},
  ],"Patient-facing appointment services; excludes emergency triage, diagnosis, and treatment instructions.");

  addPack("B004","Human approval in AI workflows",
    "A vendor-neutral vocabulary for proposed actions, accountable decisions, bounded execution, and recoverable oversight. Human review is a workflow, not a decorative checkmark.",[
    ["AI-proposed action","A model produces a proposed action, not an executed one.",d=>{
      model(d,13,61);d.arrow([[50,75],[69,75]]);documentIcon(d,80,36,36,56);sparkle(d,97,23,.7);
    }],
    ["Pending review queue","Proposals wait in an ordered review backlog.",d=>{
      documentIcon(d,47,20,50,57,"blue");documentIcon(d,34,32,50,57,"teal");documentIcon(d,21,44,50,57);
      clock(d,96,89,19);
    }],
    ["Assigned reviewer","A specific human owns the review decision.",d=>{
      person(d,27,37,.95,"point","teal");clipboard(d,78,34,39,61);d.line([[86,54],[107,54]]).check(88,71,.7);
    }],
    ["Review supporting evidence","Inspect sources before deciding.",d=>{
      documentIcon(d,20,27,53,72);d.box(29,65,12,19,"blue").box(46,55,12,29,"teal");
      d.oval(73,49,33,33,"white").line([[100,77],[114,92]]);
    }],
    ["Request human approval","Route a proposed action to a person.",d=>{
      model(d,13,62,.9);person(d,99,44,.8,"think","teal");
      d.arrow([[49,70],[69,70],[69,43],[82,43]]);bubble(d,37,11,37,27,"amber");d.text(51,13,"?",21);
    }],
    ["Approve execution","A deliberate human decision opens the execution path.",d=>{
      d.line([[20,98],[20,35],[65,35]]).line([[74,35],[112,35],[112,98]]);d.line([[65,35],[65,73]],{strokeWidth:4});
      d.arrow([[30,82],[93,82]]);d.oval(48,8,38,31,"teal").check(57,20,.9);
    }],
    ["Reject proposal","A review decision stops the proposed action.",d=>{
      documentIcon(d,12,44,36,53);d.arrow([[53,70],[72,70]]);d.line([[88,41],[103,41],[114,52],[114,83],[103,94],[88,94],[77,83],[77,52],[88,41]],{backgroundColor:colors.coral});
      d.cross(87,59,1.2);
    }],
    ["Request changes","Return a proposal for revision and another review.",d=>{
      documentIcon(d,53,27,49,64);d.line([[65,63],[88,63]],{strokeColor:"#ac4b45"});
      d.line([[84,76],[111,48],[116,54],[90,82],[81,85],[84,76]],{backgroundColor:colors.amber});
      d.arrow([[38,94],[20,94],[20,48],[43,48]]);
    }],
    ["Delegate review","Transfer review ownership to another human.",d=>{
      person(d,25,49,.75,"point","blue");person(d,104,49,.75,"listen","teal");
      d.arrow([[38,29],[90,29]]);d.box(51,50,26,31,"white").line([[57,60],[71,60]]).line([[57,69],[68,69]]);
    }],
    ["Multiple approvals","A proposal requires agreement from more than one reviewer.",d=>{
      person(d,25,18,.65,"neutral");person(d,103,18,.65,"neutral","teal");
      d.line([[25,65],[25,80],[61,80]]).line([[103,65],[103,80],[70,80]]);
      d.box(48,81,35,32,"teal").check(55,93,.9);
    }],
    ["Permission boundary","An action must remain inside an explicitly permitted scope.",d=>{
      d.box(15,21,99,84);d.line([[79,21],[79,105]],{strokeStyle:"dashed"});
      model(d,26,52,.85);d.arrow([[60,65],[75,65]]);d.line([[86,59],[102,75]]).line([[102,59],[86,75]]);
    }],
    ["Sensitive action","High-impact operations need heightened authorization.",d=>{
      documentIcon(d,19,39,40,58);d.arrow([[63,70],[78,70]]);lock(d,83,48,1.1);
      d.line([[93,27],[93,17]]).line([[109,32],[117,24]]).line([[77,32],[70,25]]);
    }],
    ["Review timeout","An unanswered approval expires rather than silently succeeding.",d=>{
      d.box(23,24,52,73,"white").line([[29,32],[69,32]]).line([[29,89],[69,89]]);
      d.line([[30,34],[67,34],[49,57],[67,87],[30,87],[49,57],[30,34]],{backgroundColor:colors.amber});
      d.line([[43,78],[54,78]]);d.arrow([[85,56],[112,56]]);d.line([[111,41],[111,72]],{strokeWidth:4});
    }],
    ["Escalate review","Route a blocked decision to a higher-authority reviewer.",d=>{
      person(d,24,62,.65,"point");person(d,101,16,.65,"open","teal");
      d.arrow([[45,94],[60,94],[60,65],[78,65],[78,38]]);
      d.line([[17,112],[50,112],[50,82],[78,82],[78,53],[116,53]]);
    }],
    ["Gated execution","Only an approved action crosses the execution boundary.",d=>{
      model(d,10,66,.8);d.line([[59,24],[59,108]],{strokeStyle:"dashed"});d.box(48,47,22,40,"teal").check(51,61,.7);
      d.arrow([[37,78],[48,78]]).arrow([[73,78],[104,78]]);
      d.line([[99,27],[116,40],[99,53],[99,27]],{backgroundColor:colors.blue});
    }],
    ["Decision audit receipt","Record the actor, decision, and action in a durable trace.",d=>{
      d.line([[28,20],[99,20],[99,108],[87,101],[76,108],[64,101],[52,108],[40,101],[28,108],[28,20]],{backgroundColor:colors.white});
      d.oval(39,32,12,12,"blue").line([[36,51],[55,51]]);d.check(72,38,.7);rows(d,39,66,47,3,12);
    }],
    ["Revoke approval","Withdraw permission before a pending action executes.",d=>{
      shield(d,53,24,53,63);d.check(69,46,1.1);d.line([[48,100],[112,27]],{strokeColor:"#ac4b45",strokeWidth:3});
      d.arrow([[41,40],[18,40],[18,88],[38,88]]);
    }],
    ["Human override","A person interrupts automated execution through an explicit control.",d=>{
      person(d,26,41,.9,"point","teal");d.box(73,61,42,38,"white").oval(81,65,26,16,"coral");
      d.line([[94,81],[94,92]]);model(d,80,15,.72);d.line([[92,40],[92,55]],{strokeStyle:"dashed"});
    }],
  ],[
    {title:"The safe execution path",items:[0,3,2,5,14]},
    {title:"A proposal that needs revision",items:[0,1,7,4,15]},
  ],"Approval and oversight of AI-proposed actions; excludes vendor logos and claims that approval alone guarantees safety.");

  addPack("C015","Disagreement and debate",
    "Expressive, compact scenes for difficult conversations: distinguish viewpoints, exchange evidence, maintain boundaries, and find a constructive next step.",[
    ["Different viewpoints","Two people see the same situation differently.",d=>{
      person(d,28,57,.78,"open");person(d,103,57,.78,"open","teal");
      bubble(d,9,15,45,27,"blue");d.oval(24,22,15,14);bubble(d,77,15,45,27,"teal","right");d.box(92,22,15,14);
    }],
    ["State a position","One speaker presents a clear point of view.",d=>{
      person(d,31,45,.95,"speak");bubble(d,64,23,53,39,"blue");rows(d,75,35,31,2,12);
    }],
    ["Listen before responding","Attend to another person without preparing a rebuttal.",d=>{
      person(d,26,46,.85,"speak");person(d,103,46,.85,"listen","teal");
      bubble(d,18,12,35,24,"blue");rows(d,26,21,18,1);d.line([[74,34],[68,30]]).line([[74,43],[66,43]]);
    }],
    ["Interrupting","Overlapping speech blocks an unfinished contribution.",d=>{
      person(d,25,62,.75,"speak");person(d,104,62,.75,"stop","coral");
      bubble(d,8,15,61,31,"blue");bubble(d,56,31,66,30,"coral","right");d.line([[66,40],[74,49]]).line([[74,40],[66,49]]);
    }],
    ["Ask for clarification","A question opens space for understanding.",d=>{
      person(d,29,48,.9,"think");person(d,105,52,.8,"open","teal");
      bubble(d,50,14,41,30,"amber");d.text(64,15,"?",23);
    }],
    ["Bring evidence","Offer information that can be examined together.",d=>{
      person(d,26,49,.8,"point");d.box(61,21,57,66,"white");
      d.box(71,59,8,16,"blue").box(85,48,8,27,"teal").box(99,35,8,40,"amber");
      d.line([[62,95],[117,95]]);
    }],
    ["Challenge an assumption","Inspect the premise beneath a confident claim.",d=>{
      person(d,29,49,.85,"think");d.box(72,63,36,34,"blue").box(79,42,22,18,"amber");
      d.line([[68,101],[112,101]],{strokeStyle:"dashed"});bubble(d,62,10,37,25);d.text(75,10,"?",21);
    }],
    ["Respectful disagreement","Express a different view without attacking the person.",d=>{
      person(d,26,50,.85,"open");person(d,105,50,.85,"open","teal");
      bubble(d,9,10,43,25,"blue");bubble(d,79,10,43,25,"teal","right");
      d.line([[20,21],[41,21]]).line([[91,17],[111,25]]);d.line([[57,77],[65,83],[74,77]]);
    }],
    ["Conversation heats up","Rising intensity makes the exchange harder to navigate.",d=>{
      person(d,26,54,.85,"stop","coral");person(d,105,54,.85,"stop","amber");
      d.line([[56,19],[69,34],[61,45],[76,59],[72,37],[80,28],[56,19]],{backgroundColor:colors.coral});
      d.line([[13,31],[5,25]]).line([[118,31],[125,25]]);
    }],
    ["Pause the discussion","Take a deliberate break instead of escalating.",d=>{
      person(d,26,50,.85,"neutral");person(d,105,50,.85,"neutral","teal");
      bubble(d,46,15,39,30,"amber");d.box(56,22,6,15,ink,false).box(69,22,6,15,ink,false);
    }],
    ["Set a boundary","State a limit while remaining engaged.",d=>{
      person(d,30,42,.95,"stop","teal");d.line([[73,26],[73,110]],{strokeStyle:"dashed"});
      d.arrow([[113,69],[82,69]]);d.line([[84,51],[84,87]],{strokeWidth:4});
    }],
    ["Reframe the question","Change the frame to reveal another useful interpretation.",d=>{
      person(d,27,52,.8,"point");d.box(65,28,49,51,"white").oval(77,40,24,24,"teal");
      d.arrow([[65,90],[105,90],[105,103]]);d.line([[65,14],[109,14]],{strokeStyle:"dashed"});
    }],
    ["Find common ground","Identify a meaningful area of agreement.",d=>{
      person(d,23,56,.78,"open");person(d,108,56,.78,"open","teal");
      d.oval(37,13,39,36,"blue").oval(58,13,39,36,"teal");d.check(59,27,.6);
    }],
    ["Explore trade-offs","Recognize that each option has benefits and costs.",d=>{
      person(d,27,55,.78,"think");d.line([[83,30],[83,99],[65,105],[101,105]]);
      d.line([[52,47],[114,34]]).line([[59,46],[51,69],[70,69],[59,46]],{backgroundColor:colors.blue});
      d.line([[106,36],[96,60],[116,60],[106,36]],{backgroundColor:colors.amber});
    }],
    ["Negotiate a compromise","Both sides adjust to reach a workable middle.",d=>{
      person(d,25,53,.8,"point");person(d,106,53,.8,"listen","teal");
      d.arrow([[15,28],[52,28]]).arrow([[118,28],[80,28]]);
      d.box(53,15,26,28,"amber").line([[58,30],[63,35],[73,24]]);
      d.line([[54,87],[65,80],[76,87]]);
    }],
    ["Invite a mediator","A third person helps structure a difficult exchange.",d=>{
      person(d,21,59,.72,"neutral");person(d,111,59,.72,"neutral","teal");person(d,66,20,.8,"open","amber");
      d.line([[38,88],[53,76]],{strokeStyle:"dashed"}).line([[94,88],[79,76]],{strokeStyle:"dashed"});
    }],
    ["Agree to disagree","Respectfully retain different conclusions.",d=>{
      person(d,25,56,.8,"open");person(d,107,56,.8,"open","teal");
      bubble(d,8,12,40,25,"blue");d.oval(21,19,13,12);bubble(d,84,12,40,25,"teal","right");d.box(97,19,13,12);
      d.check(57,69,.8);
    }],
    ["Commit to a next step","End with a concrete action rather than an unresolved loop.",d=>{
      person(d,26,50,.82,"point");person(d,106,50,.82,"point","teal");
      clipboard(d,49,24,36,48);d.check(57,43,.8);d.arrow([[49,103],[85,103]]);
    }],
  ],[
    {title:"From friction to understanding",items:[8,9,2,4,12]},
    {title:"Make a constructive decision",items:[5,13,14,16,17]},
  ],"Constructive interpersonal disagreement; no conflict diagnosis, stereotypes, or claims of universally correct emotional responses.");

  function escapeXml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;" }[c]));
  }
  function svgElement(e) {
    const fill = e.backgroundColor === "transparent" ? "none" : e.backgroundColor;
    const attrs = `stroke="${e.strokeColor}" stroke-width="${e.strokeWidth}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"${e.strokeStyle==="dashed"?' stroke-dasharray="5 5"':""}`;
    if(e.type==="rectangle") return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" rx="${e.roundness?Math.min(5,e.width/4,e.height/4):0}" ${attrs}/>`;
    if(e.type==="ellipse") return `<ellipse cx="${e.x+e.width/2}" cy="${e.y+e.height/2}" rx="${e.width/2}" ry="${e.height/2}" ${attrs}/>`;
    if(e.type==="text") return e.text.split("\n").map((line,i)=>`<text x="${e.x}" y="${e.y+e.fontSize+i*e.fontSize*1.25}" font-size="${e.fontSize}" font-family="Arial, sans-serif" fill="${e.strokeColor}">${escapeXml(line)}</text>`).join("");
    const points=e.points.map(([x,y])=>[x+e.x,y+e.y]);
    let result=`<polyline points="${points.map(p=>p.join(",")).join(" ")}" ${attrs}/>`;
    if(e.type==="arrow"&&e.endArrowhead) {
      const end=points.at(-1),prev=points.at(-2),a=Math.atan2(end[1]-prev[1],end[0]-prev[0]),len=8;
      result+=`<polyline points="${end[0]-len*Math.cos(a-.5)},${end[1]-len*Math.sin(a-.5)} ${end.join(",")} ${end[0]-len*Math.cos(a+.5)},${end[1]-len*Math.sin(a+.5)}" stroke="${e.strokeColor}" stroke-width="${e.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return result;
  }
  function artSvg(elements,width=132,height=132) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 132" width="${width}" height="${height}" role="img">${elements.map(svgElement).join("")}</svg>`;
  }
  function copy(elements,dx,dy,group) {
    return elements.map(e=>({...structuredClone(e),id:id(),x:e.x+dx,y:e.y+dy,groupIds:group?[group]:[]}));
  }
  function build(pack) {
    active=pack; sequence=0;
    const items=pack.icons.map((icon,i)=>{
      const drawing=new Drawing();icon.draw(drawing);
      const group=`${pack.id}-icon-${String(i+1).padStart(2,"0")}`;
      drawing.elements.forEach(e=>{e.groupIds=[group];e.customData={portfolio:pack.id[0],pack:pack.id,concept:icon.name,version:pack.version};});
      return {name:icon.name,meaning:icon.meaning,elements:drawing.elements,id:group,status:"unpublished",created:1792540800000};
    });
    const board=new Drawing();
    board.text(28,24,`FIELDNOTES / ${pack.id}`,15,"#246b70").text(28,55,pack.title,32);
    board.text(28,102,`${items.length} original editable icons | v${pack.version} | MIT`,15,"#526477");
    items.forEach((item,i)=>{
      const x=28+(i%6)*220,y=156+Math.floor(i/6)*215;
      board.elements.push(...copy(item.elements,x+28,y,`${pack.id}-sheet-${i}`));
      board.text(x,y+143,`${String(i+1).padStart(2,"0")} / ${item.name}`,13);
    });
    const ey=156+Math.ceil(items.length/6)*215;
    board.text(28,ey,"IN CONTEXT / EXAMPLE COMPOSITIONS",15,"#246b70");
    pack.examples.forEach((example,ei)=>{
      const y=ey+48+ei*190;
      board.text(28,y,example.title,19);
      example.items.forEach((ix,j)=>{
        const x=28+j*250;
        board.elements.push(...copy(items[ix].elements,x,y+30,`${pack.id}-example-${ei}-${j}`));
        board.text(x,y+164,items[ix].name,12);
        if(j<example.items.length-1) board.arrow([[x+154,y+94],[x+215,y+94]]);
      });
    });
    const fy=ey+48+pack.examples.length*190;
    board.text(28,fy,"Original Fieldnotes artwork. Illustrative concepts, not standardized technical or clinical symbols.",13,"#526477");
    return {pack,items,scene:{type:"excalidraw",version:2,source:"https://excalidraw.com",elements:board.elements,appState:{viewBackgroundColor:"#ffffff",gridSize:null},files:{}},library:{type:"excalidrawlib",version:2,source:"https://excalidraw.com",libraryItems:items.map(({name,meaning,...item})=>item)},width:1350,height:fy+55};
  }
  const cache=new Map();
  function getPack(idValue) {
    if(!cache.has(idValue)) {
      const p=packs.find(p=>p.id===idValue);
      if(!p) throw new Error(`Unknown pack: ${idValue}`);
      cache.set(idValue,build(p));
    }
    return cache.get(idValue);
  }
  function slug(pack) {return `${pack.id}-${pack.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-v1.0`;}
  function download(name,data,type="application/json") {
    const blob=data instanceof Blob?data:new Blob([data],{type});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
    return name;
  }
  async function exportPack(packId,kind) {
    const b=getPack(packId),stem=slug(b.pack);
    if(kind==="scene") return download(`${stem}.excalidraw`,JSON.stringify(b.scene,null,2));
    if(kind==="library") return download(`${stem}.excalidrawlib`,JSON.stringify(b.library,null,2));
    if(kind==="preview") {
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${b.width}" height="${b.height}"><rect width="100%" height="100%" fill="white"/>${b.scene.elements.map(svgElement).join("")}</svg>`;
      const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));
      try {
        const image=new Image();
        await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error("Preview SVG could not be rasterized"));image.src=url;});
        const canvas=document.createElement("canvas");canvas.width=b.width*2;canvas.height=b.height*2;
        const ctx=canvas.getContext("2d");if(!ctx) throw new Error("Canvas rendering is unavailable");
        ctx.scale(2,2);ctx.drawImage(image,0,0);
        const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG export failed")),"image/png"));
        return download(`${stem}-preview.png`,blob);
      } finally {URL.revokeObjectURL(url);}
    }
    throw new Error(`Unsupported export kind: ${kind}`);
  }
  function validate(packId) {
    const b=getPack(packId),errors=[];
    if(b.items.length<15||b.items.length>30) errors.push("Icon count outside 15-30");
    const allIds=new Set(),names=new Set();
    b.items.forEach((item,i)=>{
      if(names.has(item.name)) errors.push(`Duplicate concept ${item.name}`);names.add(item.name);
      if(item.elements.length<3) errors.push(`Trivial item ${i}`);
      const groups=new Set(item.elements.flatMap(e=>e.groupIds));
      if(groups.size!==1) errors.push(`Invalid grouping ${i}`);
      item.elements.forEach(e=>{
        if(allIds.has(e.id)) errors.push(`Duplicate ID ${e.id}`);allIds.add(e.id);
        if(![e.x,e.y,e.width,e.height].every(Number.isFinite)) errors.push(`Non-finite geometry ${e.id}`);
        if(e.width<0||e.height<0) errors.push(`Negative size ${e.id}`);
        if(e.type==="image") errors.push(`Raster content ${e.id}`);
        if(e.points&&!e.points.every(p=>p.length===2&&p.every(Number.isFinite))) errors.push(`Invalid points ${e.id}`);
      });
    });
    const sceneIds=b.scene.elements.map(e=>e.id);
    if(new Set(sceneIds).size!==sceneIds.length) errors.push("Duplicate scene IDs");
    if(JSON.parse(JSON.stringify(b.library)).libraryItems.length!==b.items.length) errors.push("Library round-trip failed");
    return {id:packId,icons:b.items.length,nativeElements:b.items.reduce((n,i)=>n+i.elements.length,0),sceneElements:b.scene.elements.length,errors};
  }
  function render(packId) {
    const b=getPack(packId);
    document.getElementById("content").innerHTML=`<h2>${escapeXml(b.pack.title)}</h2><p class="description">${escapeXml(b.pack.description)}</p><p class="meta">${b.pack.id} / ${b.items.length} concepts / Native editable shapes / Independent groups / Original artwork / MIT</p><div class="grid">${b.items.map((item,i)=>`<article class="card">${artSvg(item.elements)}<h3>${String(i+1).padStart(2,"0")} / ${escapeXml(item.name)}</h3><p>${escapeXml(item.meaning)}</p></article>`).join("")}</div><section class="examples">${b.pack.examples.map(example=>`<article class="example"><h3>${escapeXml(example.title)}</h3><div class="steps">${example.items.map((ix,j)=>`${j?'<span class="arrow">&rarr;</span>':""}<div class="step">${artSvg(b.items[ix].elements)}${escapeXml(b.items[ix].name)}</div>`).join("")}</div></article>`).join("")}</section><p class="meta">Scope: ${escapeXml(b.pack.scope)}</p>`;
    const report=validate(packId);
    document.getElementById("status").textContent=report.errors.length?report.errors.join("; "):`${report.icons} icons / ${report.nativeElements} native elements / structural checks passed`;
    document.getElementById("pack").value=packId;
    return report;
  }
  const select=document.getElementById("pack");
  packs.forEach(p=>select.add(new Option(`${p.id} / ${p.title}`,p.id)));
  select.addEventListener("change",()=>render(select.value));
  ["scene","library","preview"].forEach(kind=>document.getElementById(kind).addEventListener("click",()=>{
    exportPack(select.value,kind).catch(error=>{document.getElementById("status").textContent=error.message;console.error(error);});
  }));
  document.getElementById("theme").addEventListener("click",()=>document.body.classList.toggle("dark"));
  window.Fieldnotes={packs,getPack,render,validate,exportPack,artSvg,svgElement,slug};
  render(packs[0].id);
})();

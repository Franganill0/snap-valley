(() => {
 const app=document.getElementById("snap-valley");
 const cardPayload=window.SNAP_VALLEY_DATA||{};
 const locationPayload=window.SNAP_VALLEY_LOCATIONS||{};
 const allCards=Array.isArray(cardPayload.cards)?cardPayload.cards:[];
 const cards=allCards.filter(card=>card.selectable!==false);
 const locations=Array.isArray(locationPayload.locations)?locationPayload.locations:[];
 const cardById=new Map(cards.map(card=>[card.id,card]));
 const cardByName=new Map(cards.map(card=>[norm(card.name),card]));
 const locationById=new Map(locations.map(location=>[location.id,location]));
 const deckKey="snap-valley-deck-v1";
 const seedKey="snap-valley-seeds-v2";
 let deck=Array(12).fill("");
 let seeds=[];
 let activeSlot=null;
 let chosenLocation=null;
 let recommendData=null;
 let toastTimer=null;
 const picker=app.querySelector("[data-picker]");
 const installButton=app.querySelector("[data-install]");

 const archetypes=[
  {id:"destroy",label:"Destrucción",keys:["Deadpool","Carnage","Venom","Deathlok","Killmonger","Death","Knull","X-23","Wolverine","Nimrod","Bucky Barnes","Nova","Arnim Zola","Lady Deathstrike","Sabretooth","Shang-Chi","Squirrel Girl","Nico Minoru"]},
  {id:"discard",label:"Descarte",keys:["Apocalypse","Hela","Morbius","Dracula","MODOK","Proxima Midnight","Swarm","Blade","Lady Sif","Colleen Wing","Hellcow","Corvus Glaive","Miek","Ghost Rider","Daken"]},
  {id:"move",label:"Movimiento",keys:["Human Torch","Dagger","Vulture","Multiple Man","Kraven","Heimdall","Cloak","Doctor Strange","Iron Fist","Ghost-Spider","Madame Web","Araña","Silk","Hercules","Spider-Man 2099"]},
  {id:"bounce",label:"Rebote",keys:["Beast","Falcon","Kitty Pryde","The Hood","Angela","Bishop","Hit-Monkey","Rocket Raccoon","Werewolf By Night","Hawkeye Kate Bishop","Black Swan"]},
  {id:"ongoing",label:"Continuo",keys:["Spectrum","Iron Man","Onslaught","Mystique","Living Tribunal","Devil Dinosaur","Ant-Man","Patriot","Blue Marvel","Super-Skrull","Cosmo","Captain America","Mister Fantastic","Man-Thing","Darkhawk"]},
  {id:"reveal",label:"Al revelar",keys:["Wong","Odin","White Tiger","Ironheart","Hazmat","Absorbing Man","Grand Master","Grandmaster","Silver Surfer","Sage","Gambit","Doctor Doom","Black Panther","Shuri","Arnim Zola","Jane Foster"]},
  {id:"negative",label:"Coste negativo",keys:["Mister Negative","Jane Foster","Ravonna Renslayer","Gorr","Sage","Iron Man","Mystique","Ironheart","Sera"]},
  {id:"afflict",label:"Aflicción",keys:["Hazmat","Scorpion","Luke Cage","Man-Thing","Typhoid Mary","High Evolutionary","Ajax","Cassandra Nova","USAgent","Silver Sable"]},
  {id:"zoo",label:"Fichas y muchas cartas",keys:["Squirrel Girl","Dazzler","Ka-Zar","Blue Marvel","Ultron","Patriot","Debrii","Brood","Mysterio","Mockingbird","Gilgamesh","Shanna"]},
  {id:"ramp",label:"Aceleración",keys:["Electro","Psylocke","Wave","Hope Summers","Corvus Glaive","X-23","Jennifer Kale","Elysia","Arishem","Luna Snow","Makkari"]}
 ];
 const archetypeNames=Object.fromEntries(archetypes.map(item=>[item.id,item.label]));
 const packagePairs=[
  ["Deadpool","Carnage"],["Deadpool","Venom"],["Deadpool","Killmonger"],["Deadpool","Deathlok"],["Deadpool","Knull"],["Deadpool","Death"],["Deadpool","X-23"],["Deadpool","Nico Minoru"],["Deadpool","Hulkbuster"],["Deadpool","Arnim Zola"],["Deadpool","Taskmaster"],["Deadpool","Wolverine"],
  ["Bucky Barnes","Carnage"],["Bucky Barnes","Deathlok"],["Bucky Barnes","Venom"],["Nimrod","Shuri"],["Nimrod","Venom"],["Nimrod","Carnage"],["Nimrod","Arnim Zola"],["Nimrod","Deathlok"],["X-23","Knull"],["X-23","Death"],["Wolverine","Knull"],["Wolverine","Death"],
  ["Blade","Swarm"],["Blade","Apocalypse"],["Lady Sif","Apocalypse"],["Lady Sif","Ghost Rider"],["Lady Sif","Hela"],["Colleen Wing","Swarm"],["Colleen Wing","Proxima Midnight"],["Dracula","Apocalypse"],["MODOK","Apocalypse"],["MODOK","Swarm"],["Hela","Hellcow"],["Hela","Corvus Glaive"],["Hela","Lady Sif"],["Morbius","MODOK"],["Daken","Muramasa Shard"],
  ["Human Torch","Iron Fist"],["Human Torch","Ghost-Spider"],["Human Torch","Hulkbuster"],["Human Torch","Doctor Strange"],["Human Torch","Heimdall"],["Dagger","Cloak"],["Dagger","Doctor Strange"],["Vulture","Cloak"],["Multiple Man","Iron Fist"],["Multiple Man","Hulkbuster"],["Kraven","Cloak"],["Kraven","Heimdall"],["Madame Web","Human Torch"],["Madame Web","Dagger"],["Phoenix Force","Multiple Man"],
  ["Kitty Pryde","Beast"],["Kitty Pryde","Falcon"],["Kitty Pryde","Angela"],["Kitty Pryde","Bishop"],["The Hood","Beast"],["The Hood","Falcon"],["The Hood","Viper"],["The Hood","Annihilus"],["Hit-Monkey","Beast"],["Hit-Monkey","Falcon"],["Angela","Beast"],["Bishop","Beast"],["Rocket Raccoon","Falcon"],
  ["Wong","White Tiger"],["Wong","Odin"],["Wong","Ironheart"],["Wong","Hazmat"],["Wong","Gambit"],["Wong","Black Panther"],["Odin","White Tiger"],["Odin","Ironheart"],["Odin","Hazmat"],["Odin","Silver Surfer"],["Absorbing Man","Wong"],["Shuri","Red Skull"],["Shuri","Taskmaster"],["Black Panther","Arnim Zola"],
  ["Mister Negative","Jane Foster"],["Mister Negative","Iron Man"],["Mister Negative","Mystique"],["Mister Negative","Gorr"],["Mister Negative","Sage"],["Patriot","Ultron"],["Patriot","Debrii"],["Patriot","Squirrel Girl"],["Patriot","Brood"],["Spectrum","Onslaught"],["Iron Man","Mystique"],["Iron Man","Onslaught"],["Iron Man","Living Tribunal"],
  ["Sentry","Annihilus"],["Sentry","Viper"],["Silver Surfer","Brood"],["Silver Surfer","Nova"],["Silver Surfer","Killmonger"],["Silver Surfer","Sebastian Shaw"],["Darkhawk","Rockslide"],["Darkhawk","Korg"],["Thanos","Lockjaw"],["Thanos","Mockingbird"],["Thanos","Cull Obsidian"],["Thanos","Blob"],["High Evolutionary","Hulk"],["High Evolutionary","Cyclops"],["High Evolutionary","The Thing"]
 ];
 const pairSet=new Set(packagePairs.map(pair=>pair.map(norm).sort().join("|")));
 const winKeys={
  destroy:["Knull","Death","Deadpool","Nimrod","Arnim Zola","Taskmaster"],
  discard:["Apocalypse","Hela","Morbius","Dracula","MODOK","Proxima Midnight"],
  move:["Human Torch","Dagger","Vulture","Heimdall","Multiple Man"],
  bounce:["Hit-Monkey","Angela","Bishop","Kitty Pryde"],
  ongoing:["Iron Man","Onslaught","Spectrum","Living Tribunal","Devil Dinosaur"],
  reveal:["Wong","Odin","White Tiger","Black Panther","Doctor Doom"],
  negative:["Mister Negative","Iron Man","Gorr","Sage"],
  afflict:["Ajax","Man-Thing","Cassandra Nova","Hazmat"],
  zoo:["Ultron","Gilgamesh","Ka-Zar","Mockingbird"],
  ramp:["Arishem","Blob","Doctor Doom","The Infinaut"]
 };
 const targetCurve={0:1,1:2,2:3,3:3,4:2,5:1,6:1};

 function norm(value){return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
 function esc(value){return String(value===undefined||value===null?"":value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}
 function cardForName(name){return cardByName.get(norm(name))}
 function storeDeck(){try{localStorage.setItem(deckKey,JSON.stringify(deck))}catch{}}
 function showToast(message){const box=app.querySelector("[data-toast]");box.textContent=message;box.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.hidden=true,2400)}
 function cardTags(card){
  if(!card)return new Set();
  const text=norm(card.ability+" "+card.name),tags=new Set();
  for(const type of archetypes)if(type.keys.some(name=>norm(name)===norm(card.name)))tags.add(type.id);
  if(/destroy|destroyed|destroying/.test(text))tags.add("destroy");
  if(/discard|discarded/.test(text))tags.add("discard");
  if(/move|moveable|moved|movement/.test(text))tags.add("move");
  if(/ongoing/.test(text))tags.add("ongoing");
  if(/on reveal/.test(text))tags.add("reveal");
  if(/afflict|negative power|reduce.{0,14}power|minus \d+ power/.test(text))tags.add("afflict");
  if(/return.{0,20}hand|back to your hand/.test(text))tags.add("bounce");
  if(/cost.{0,25}(less|reduce|\d|decrease)|energy.{0,18}(\d|extra|bonus)/.test(text))tags.add("ramp");
  if(/token|created card|add.{0,25}card|create.{0,25}card/.test(text))tags.add("zoo");
  return tags
 }
 function pairMatches(cardA,cardB){return !!cardA&&!!cardB&&pairSet.has([norm(cardA.name),norm(cardB.name)].sort().join("|"))}
 function synergyCount(card,list){return list.filter(other=>other&&pairMatches(card,other)).length}
 function recognizedDeck(){return deck.map(cardForName).filter(Boolean)}
 function profile(list){
  const counts=new Map();
  list.forEach(card=>cardTags(card).forEach(tag=>counts.set(tag,(counts.get(tag)||0)+1)));
  const ranked=[...counts.entries()].sort((a,b)=>b[1]-a[1]);
  const first=ranked[0]||null;
  return {counts,ranked,main:first&&first[1]>=2?first[0]:"",label:first&&first[1]>=2?archetypeNames[first[0]]:"Plan mixto",count:first&&first[1]||0}
 }
 function deckCore(list,main){
  const present=new Map(list.map(card=>[norm(card.name),card]));
  let candidates=(winKeys[main]||[]).map(name=>present.get(norm(name))).filter(Boolean);
  if(candidates.length<2){
   const paired=list.filter(card=>list.some(other=>other!==card&&pairMatches(card,other)));
   candidates=[...new Set([...candidates,...paired])];
  }
  if(candidates.length<2)candidates=[...new Set([...candidates,...list.filter(card=>card.cost>=5).sort((a,b)=>b.power-a.power)])];
  return candidates.slice(0,2)
 }
 function comboChance(deckSize,keyCount,seenCount,all){
  if(!keyCount||!deckSize||seenCount<0)return 0;
  const choose=(n,k)=>{if(k<0||k>n)return 0;let value=1;for(let i=1;i<=k;i++)value=value*(n-i+1)/i;return value};
  if(all){if(seenCount<keyCount)return 0;return choose(deckSize-keyCount,seenCount-keyCount)/choose(deckSize,seenCount)}
  return 1-choose(deckSize-keyCount,seenCount)/choose(deckSize,seenCount)
 }
 function cardUtility(card){
  const text=norm(card.ability);let bonus=0;
  if(/on reveal|ongoing|activate|end of turn|when destroyed|when discarded/.test(text))bonus+=1.2;
  if(/draw|copy|double|destroy|discard|move|create|add|steal|revive|resurrect|reduce|energy/.test(text))bonus+=.65;
  return card.power*.58+bonus+cardTags(card).size*.18
 }
 function bestTurnSubset(remaining,energy,alreadyPlayed){
  let best={cards:[],score:-Infinity,spent:0};
  for(let mask=1;mask<(1<<remaining.length);mask++){
   let subset=[],spent=0,power=0;
   for(let i=0;i<remaining.length;i++)if(mask&(1<<i)){const card=remaining[i];spent+=Math.max(0,card.cost);if(spent>energy)break;subset.push(card);power+=cardUtility(card)}
   if(spent>energy||!subset.length)continue;
   const pool=[...alreadyPlayed,...subset];let links=0;
   for(let i=0;i<subset.length;i++)for(let j=i+1;j<pool.length;j++)if(pool[j]!==subset[i]&&pairMatches(subset[i],pool[j]))links++;
   const score=spent*1.12+power+links*2.1-Math.max(0,energy-spent)*.62;
   if(score>best.score)best={cards:subset,score,spent}
  }
  return best
 }
 function turnAdvice(turn,cards,spent,played){
  if(!cards.length)return "Guarda la energía si no tienes una jugada que avance tu plan.";
  let card=cards.find(item=>played.some(other=>pairMatches(item,other))||cards.some(other=>other!==item&&pairMatches(item,other)));
  if(card){
   let partner=played.find(other=>pairMatches(card,other))||cards.find(other=>other!==card&&pairMatches(card,other));
   return "Prioriza "+card.name+" para activar o preparar el combo con "+partner.name+". "+(spent<turn?"Te sobran "+(turn-spent)+" de energía; úsala en una carta barata si no rompe la secuencia.":"")
  }
  return spent===turn?"Curva limpia: gastas toda la energía; conserva el espacio de ubicación para tu siguiente pieza.":"Juega "+cards.map(item=>item.name).join(" + ")+", gastas "+spent+" de "+turn+" y mantienes una alternativa para el turno siguiente."
 }
 function buildTurnPlan(list,turnLength){
  const remaining=[...list],played=[],turns=[];
  for(let turn=1;turn<=turnLength;turn++){
   const choice=bestTurnSubset(remaining,turn,played);
   choice.cards.forEach(card=>{const index=remaining.findIndex(item=>item.id===card.id);if(index>=0)remaining.splice(index,1)});
   turns.push({turn,cards:choice.cards,spent:choice.spent,playedBefore:[...played],note:turnAdvice(turn,choice.cards,choice.spent,played)});
   played.push(...choice.cards)
  }
  return turns
 }
 function detectSynergies(list){
  const links=[];
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(pairMatches(list[i],list[j]))links.push({a:list[i],b:list[j]});
  return links
 }
 function renderCurve(list){
  const bins=Array(7).fill(0);list.forEach(card=>bins[Math.min(6,Math.max(0,Number(card.cost)||0))]++);
  const maximum=Math.max(1,...bins);
  app.querySelector("[data-curve]").innerHTML=bins.map((count,cost)=>'<div class="curve-col"><div class="curve-rail"><div class="curve-bar" style="height:'+Math.max(count?7:0,count/maximum*100)+'%"></div></div><div class="curve-label"><strong>'+count+'</strong>'+(cost===6?"6+":cost)+'</div></div>').join("");
  app.querySelector("[data-curve-status]").textContent=list.length+" cartas";
  const average=list.length?list.reduce((total,card)=>total+Math.max(0,card.cost),0)/list.length:0;
  app.querySelector("[data-average]").textContent=list.length?average.toFixed(1):"—";
  app.querySelector("[data-average-note]").textContent=list.length?"Energía media de "+list.length+" carta"+(list.length===1?"":"s"):"Sobre cartas reconocidas";
  const low=list.filter(card=>card.cost<=3).length;
  app.querySelector("[data-low-curve]").textContent=list.length?low+"/"+list.length:"—";
  const top=profile(list),win=deckCore(list,top.main);
  app.querySelector("[data-archetype]").textContent=list.length?top.label:"—";
  app.querySelector("[data-archetype-note]").textContent=list.length?top.count+" cartas conectan con este plan":"Añade cartas para identificarlo";
  app.querySelector("[data-win-condition]").textContent=win.length?win.map(card=>card.name).join(" + "):"—";
  app.querySelector("[data-win-note]").textContent=win.length?"Piezas clave reconocidas en tu lista":"Aún no hay una condición clara"
 }
 function renderAnalysisDeck(list){
  const target=app.querySelector("[data-analysis-deck]");
  if(!list.length){target.innerHTML='<div class="empty-analysis" style="width:100%;min-height:92px"><div><strong>Empieza añadiendo cartas</strong><p>Rellena al menos dos huecos para ver las primeras sinergias. Con las 12 cartas aparecerán las probabilidades de robo y el plan completo.</p></div></div>';return}
  target.innerHTML=list.map(card=>'<span class="mini-card"><b>'+card.cost+'</b><span>'+esc(card.name)+'</span><small>'+card.power+' p.</small></span>').join("")+(deck.filter(Boolean).length<12?'<button class="btn small" data-page-target="builder">＋ Añadir cartas</button>':"")
 }
 function renderPlan(list){
  const target=app.querySelector("[data-turn-plan]");
  if(list.length<2){target.innerHTML='<div class="empty-analysis"><div><strong>Añade dos o más cartas</strong><p>Podré priorizar una curva y escribir opciones por turnos. Con menos cartas no hay información suficiente.</p></div></div>';return}
  const turns=buildTurnPlan(list,Number(app.querySelector("[data-game-length]").value));
  target.innerHTML=turns.map(row=>{
   const cardsHtml=row.cards.length?'<div class="turn-cards">'+row.cards.map(card=>'<span class="turn-card"><b>'+card.cost+'</b> '+esc(card.name)+' <span class="muted">· '+card.power+'</span></span>').join("")+'</div>':'<span class="muted">Sin jugada propuesta</span>';
   return '<article class="turn"><div class="turn-label">TURNO '+row.turn+'<small>'+row.spent+'/'+row.turn+' energía</small></div><div class="turn-content">'+cardsHtml+'<div class="turn-note">'+esc(row.note)+'</div></div></article>'
  }).join("")
 }
 function renderProbabilities(list,main){
  const target=app.querySelector("[data-probabilities]");
  if(deck.filter(Boolean).length<12||list.length<2){target.innerHTML='<div class="empty-analysis" style="min-height:90px"><p>Completa las 12 cartas para estimar qué probabilidad tienes de robar las piezas clave.</p></div>';return}
  const hand=Number(app.querySelector("[data-starting-hand]").value),length=Number(app.querySelector("[data-game-length]").value),core=deckCore(list,main);
  if(!core.length){target.innerHTML='<div class="empty-analysis" style="min-height:90px"><p>No he reconocido una condición de victoria concreta para calcular su robo.</p></div>';return}
  const turns=[3,length].filter((value,index,array)=>array.indexOf(value)===index),lines=[];
  if(core.length===1)turns.forEach(turn=>lines.push({label:"Ver "+core[0].name+" antes del turno "+turn,value:comboChance(12,1,Math.min(12,hand+turn))*100}));
  else{
   const pair=core.slice(0,2);
   turns.forEach(turn=>lines.push({label:"Tener "+pair[0].name+" + "+pair[1].name+" al turno "+turn,value:comboChance(12,pair.length,Math.min(12,hand+turn),true)*100}));
   lines.push({label:"Ver al menos una de tus piezas clave al turno "+length,value:comboChance(12,core.length,Math.min(12,hand+length))*100})
  }
  target.innerHTML=lines.map(row=>'<div class="prob-row"><span>'+esc(row.label)+'</span><b>'+row.value.toFixed(1)+'%</b></div>').join("")
 }
 function renderSynergies(list){
  const target=app.querySelector("[data-synergies]");
  if(list.length<2){target.innerHTML='<div class="empty-analysis" style="min-height:90px"><p>Con dos o más cartas comprobaré combos concretos y familias que se apoyan entre sí.</p></div>';return}
  const links=detectSynergies(list),p=profile(list),html=[];
  links.slice(0,5).forEach(({a,b})=>html.push('<article class="synergy-item"><strong>'+esc(a.name)+' + '+esc(b.name)+'</strong><p>Conexión de combo reconocida. Intenta ordenar el turno para que '+esc(a.name)+' prepare el efecto de '+esc(b.name)+' y evita gastar una pieza clave en una ubicación que la anule.</p></article>'));
  if(p.main)html.push('<article class="synergy-item"><strong>Paquete de '+esc(archetypeNames[p.main])+'</strong><p>'+p.count+' cartas apuntan a '+esc(archetypeNames[p.main].toLowerCase())+'. '+(p.count<4?"La base todavía es corta; el completador puede reforzarla.":"Hay una base reconocible para la condición de victoria y sus apoyos.")+'</p></article>');
  if(!html.length)html.push('<article class="synergy-item"><strong>Plan mixto</strong><p>No aparece un paquete clásico repetido. La curva y las alternativas por energía pesan más que forzar un arquetipo.</p></article>');
  target.innerHTML=html.join("")
 }
 function scoreCandidate(card,base,selected){
  selected=selected||base;
  const tags=cardTags(card),dominant=profile(selected).main,links=selected.filter(other=>pairMatches(card,other));
  let score=links.length*4.2;
  for(const other of selected)for(const tag of tags)if(cardTags(other).has(tag))score+=(tag===dominant?1.5:.62);
  if(dominant&&tags.has(dominant))score+=2.1;
  const bins=Array(7).fill(0);base.forEach(item=>bins[Math.min(6,Math.max(0,item.cost))]++);
  const cost=Math.min(6,Math.max(0,card.cost)),need=(targetCurve[cost]||0)-bins[cost];
  score+=need>0?Math.min(2.3,need*.75):Math.max(-2,need*.65);
  score+=Math.min(3,Math.max(-3,card.power/Math.max(1,card.cost)))*.22;
  if(card.ability)score+=.2;
  return {score,links,tags,need,dominant}
 }
 function candidateReason(card,info){
  if(info.links.length)return "Combo directo con "+info.links.slice(0,2).map(item=>item.name).join(" y ")+".";
  if(info.dominant&&info.tags.has(info.dominant))return "Refuerza el paquete de "+archetypeNames[info.dominant].toLowerCase()+".";
  const cost=Math.min(6,card.cost);
  if(info.need>0)return "Ayuda a completar la curva: todavía faltan cartas de coste "+(cost===6?"6+":cost)+".";
  return "Aporta una alternativa de su coste y mejora la distribución de poder."
 }
 function recommendation(seed){
  const deckList=[...seed],why=new Map(seed.map(card=>[card.id,"Carta elegida por ti."]));
  const available=cards.filter(card=>!deckList.some(chosen=>chosen.id===card.id));
  while(deckList.length<12&&available.length){
   const ranked=available.map(card=>({card,...scoreCandidate(card,deckList,seed)})).sort((a,b)=>b.score-a.score||a.card.name.localeCompare(b.card.name));
   const next=ranked[0];if(!next)break;
   why.set(next.card.id,candidateReason(next.card,next));
   deckList.push(next.card);
   available.splice(available.findIndex(card=>card.id===next.card.id),1)
  }
  const alternates=cards.filter(card=>!deckList.some(chosen=>chosen.id===card.id)).map(card=>({card,...scoreCandidate(card,deckList,seed)})).sort((a,b)=>b.score-a.score||a.card.name.localeCompare(b.card.name)).slice(0,4);
  return {cards:deckList,why,alternates,seed:[...seed]}
 }
 function renderRecommendation(){
  const target=app.querySelector("[data-recommendation]");
  if(!recommendData){target.innerHTML='<div class="empty-analysis"><div><strong>Tu recomendación aparecerá aquí</strong><p>Prueba, por ejemplo, con Deadpool y Carnage, o elige tus propias cartas. Te explicaré por qué entra cada recomendación.</p></div></div>';return}
  const result=recommendData;
  const cardsHtml=result.cards.map(card=>'<div class="rec-card"><span class="rec-cost">'+card.cost+'</span><span><strong>'+esc(card.name)+'</strong><small>'+card.power+' poder</small></span></div>').join("");
  const reasons=result.cards.map(card=>'<li><b>'+esc(card.name)+'</b><span>'+esc(result.why.get(card.id)||candidateReason(card,scoreCandidate(card,result.cards,result.seed)))+'</span></li>').join("");
  const altHtml=result.alternates.map(item=>'<div class="alternative"><span><b>'+esc(item.card.name)+'</b> · coste '+item.card.cost+'</span><span>'+esc(candidateReason(item.card,item))+'</span></div>').join("");
  target.innerHTML='<div class="section-head"><div><p class="eyebrow">Mazo recomendado</p><h2>Tu lista de 12 cartas</h2><p class="sub">'+esc(profile(result.cards).label)+' · '+result.seed.length+' elegidas por ti · '+(12-result.seed.length)+' sugeridas</p></div><button class="btn primary small" data-use-recommend>Usar este mazo</button></div><div class="recommendation-deck">'+cardsHtml+'</div><h3>Por qué las elegí</h3><ul class="rec-why">'+reasons+'</ul><div style="margin-top:14px"><h3>Otras cartas que encajan</h3><div class="alternatives">'+altHtml+'</div></div>'
 }
 function renderSwapSuggestions(list){
  const target=app.querySelector("[data-swaps]");
  if(list.length<5){target.innerHTML='<div class="empty-analysis" style="min-height:90px"><p>Con cinco cartas o más puedo comparar cambios del mismo coste y buscar una sinergia mejor.</p></div>';return}
  const dominant=profile(list).main,existingScore=new Map(list.map(card=>[card.id,scoreCandidate(card,list.filter(other=>other.id!==card.id),list.filter(other=>other.id!==card.id)).score]));
  const weak=[...list].sort((a,b)=>(existingScore.get(a.id)||0)-(existingScore.get(b.id)||0)).slice(0,3),options=[];
  weak.forEach(old=>{
   const rest=list.filter(card=>card.id!==old.id);
   cards.filter(candidate=>!list.some(card=>card.id===candidate.id)&&Math.abs(candidate.cost-old.cost)<=1).forEach(candidate=>{
    const info=scoreCandidate(candidate,rest,rest),current=scoreCandidate(old,rest,rest).score,delta=info.score-current;
    if(delta>1.5)options.push({old,candidate,info,delta})
   })
  });
  options.sort((a,b)=>b.delta-a.delta);
  const unique=[];
  for(const option of options){if(!unique.some(item=>item.old.id===option.old.id||item.candidate.id===option.candidate.id))unique.push(option);if(unique.length===3)break}
  if(!unique.length){target.innerHTML='<div class="empty-analysis" style="min-height:90px"><p>No veo una sustitución clara por sinergia que respete la curva. Eso suele ser mejor que cambiar cartas al azar.</p></div>';return}
  target.innerHTML=unique.map(item=>'<article class="swap-item"><strong>'+esc(item.old.name)+' → '+esc(item.candidate.name)+' <span class="muted">· coste '+item.old.cost+' → '+item.candidate.cost+'</span></strong><p>'+esc(candidateReason(item.candidate,item.info))+' '+(dominant?"Mantiene el plan de "+esc(archetypeNames[dominant].toLowerCase())+".":"")+'</p></article>').join("")
 }
 function locationAdvice(location,list){
  const text=norm(location.ability),p=profile(list),advice=[];
  if(/destroy|destroyed/.test(text)&&p.main==="destroy")advice.push("Favorece tu paquete de Destrucción: reserva una carta prescindible para activar aquí el efecto.");
  if(/move|moved|moveable/.test(text)&&p.main==="move")advice.push("Encaja con Movimiento. Prepara espacio antes de mover y no bloquees la salida de tu carta de valor.");
  if(/discard|discarded/.test(text)&&p.main==="discard")advice.push("Puede alimentar tu paquete de Descarte. Comprueba si el descarte es aleatorio antes de exponer tu condición de victoria.");
  if(/draw|hand|deck/.test(text))advice.push("Afecta al robo o al tamaño de la mano. Prioriza la pieza clave antes de que se resuelva su efecto.");
  if(/can t|cannot|only|no cards|one card|full/.test(text))advice.push("Tiene una restricción de espacio o jugada: reserva el hueco para tu carta de mayor impacto.");
  if(/energy|cost/.test(text)&&p.count)advice.push("Puede cambiar tu curva; guarda la opción de coste más alto para el turno en que la energía adicional esté disponible.");
  return advice.length?advice.join(" "):"No detecto una interacción directa con el arquetipo de tu mazo. Juega la ubicación como una ruta secundaria y compara el poder necesario para ganarla."
 }
 function renderLocationResults(query){
  const target=app.querySelector("[data-location-results]"),needle=norm(query||"");
  const matches=locations.filter(location=>!needle||norm(location.name+" "+location.ability).includes(needle)).slice(0,10);
  target.innerHTML=matches.map(location=>'<button class="location-result" data-location-id="'+esc(location.id)+'"><b>'+esc(location.name)+'</b><small>'+esc(location.ability)+'</small></button>').join("")||'<span class="muted" style="padding:8px;font-size:10px">No encuentro esa ubicación.</span>'
 }
 function renderSelectedLocation(){
  const target=app.querySelector("[data-location-detail]");
  if(!chosenLocation){target.innerHTML="";return}
  target.innerHTML='<div class="location-selected"><h3>'+esc(chosenLocation.name)+'</h3><p>'+esc(chosenLocation.ability)+'</p><p><strong>Con tu mazo:</strong> '+esc(locationAdvice(chosenLocation,recognizedDeck()))+'</p></div>'
 }
 function renderAnalysis(){
  const known=recognizedDeck(),count=deck.filter(Boolean).length;
  app.querySelectorAll("[data-deck-count]").forEach(node=>node.textContent=count+"/12");
  renderAnalysisDeck(known);renderCurve(known);renderPlan(known);renderProbabilities(known,profile(known).main);renderSynergies(known);renderSwapSuggestions(known);renderSelectedLocation()
 }
 function renderSlots(){
  const target=app.querySelector("[data-slots]");
  target.innerHTML=deck.map((name,index)=>{
   const card=cardForName(name);
   return '<button type="button" class="slot '+(name?"filled":"")+'" data-slot="'+index+'" aria-label="'+(name?"Editar "+esc(name):"Añadir carta")+'"><span class="slot-number">'+String(index+1).padStart(2,"0")+'</span>'+(card?'<span class="slot-power">'+card.power+'</span><span class="slot-cost">'+card.cost+'</span>':"")+'<span class="slot-plus">'+(name?"✓":"＋")+'</span><span class="slot-name">'+esc(name||"Elegir carta")+'</span>'+(card?'<span class="slot-ability">'+esc(card.ability)+'</span>':"")+'</button>'
  }).join("");
  const count=deck.filter(Boolean).length;
  app.querySelectorAll("[data-deck-count]").forEach(node=>node.textContent=count+"/12");
  app.querySelector("[data-builder-status]").textContent=count===12?"Mazo completo. Pulsa Analizar para ver curva, combos y probabilidades.":count+"/12 cartas añadidas. Pulsa un hueco vacío para elegir."
 }
 function renderPicker(){
  const query=norm(app.querySelector("[data-picker-search]").value),costFilter=app.querySelector("[data-cost-filter]").value;
  const used=new Set(deck.map(cardForName).filter(Boolean).map(card=>card.id));
  let matching=cards.filter(card=>{
   const found=!query||norm(card.name+" "+card.ability).includes(query),cost=costFilter==="6"?card.cost>=6:costFilter==="all"||card.cost===Number(costFilter);
   return found&&cost
  });
  const total=matching.length;matching=matching.slice(0,60);
  app.querySelector("[data-picker-count]").textContent=Math.min(60,total)+" de "+total;
  app.querySelector("[data-picker-results]").innerHTML=matching.map(card=>{
   const already=used.has(card.id)&&card.id!==cardForName(deck[activeSlot]||"")?.id;
   return '<button type="button" class="pick-result" data-pick-card="'+esc(card.id)+'" '+(already?"disabled":"")+'><span class="rec-cost">'+card.cost+'</span><span><span class="pick-name">'+esc(card.name)+'</span><span class="pick-ability">'+esc(card.ability||"Sin habilidad")+'</span></span><span class="pick-stats">'+card.power+' poder</span></button>'
  }).join("")||'<div class="empty-analysis" style="min-height:80px"><p>No hay cartas que coincidan con la búsqueda.</p></div>'
 }
 function openPicker(slotIndex){
  activeSlot=slotIndex;app.querySelector("[data-picker-search]").value=deck[slotIndex]||"";app.querySelector("[data-cost-filter]").value="all";picker.hidden=false;renderPicker();app.querySelector("[data-picker-search]").focus()
 }
 function closePicker(){picker.hidden=true;activeSlot=null}
 function renderSeedSelection(){
  app.querySelector("[data-seed-count]").textContent=seeds.length;app.querySelector("[data-run-recommend]").disabled=seeds.length<2||seeds.length>11;
  app.querySelector("[data-seed-pills]").innerHTML=seeds.length?seeds.map(id=>{const card=cardById.get(id);return card?'<span class="seed-pill">'+esc(card.name)+' · '+card.cost+'<button type="button" data-remove-seed="'+esc(id)+'" aria-label="Quitar '+esc(card.name)+'">×</button></span>':""}).join(""):'<span class="muted">Elige al menos dos.</span>'
 }
 function renderSeedMatches(){
  const target=app.querySelector("[data-seed-matches]"),query=norm(app.querySelector("[data-seed-search]").value);
  if(!query){target.innerHTML="";return}
  const matching=cards.filter(card=>!seeds.includes(card.id)&&norm(card.name+" "+card.ability).includes(query)).slice(0,20);
  target.innerHTML=matching.map(card=>'<button type="button" class="match-result" data-seed-choice="'+esc(card.id)+'" '+(seeds.length>=11?"disabled":"")+'><b>'+esc(card.name)+' · '+card.cost+' energía · '+card.power+' poder</b><small>'+esc(card.ability||"Sin habilidad")+'</small></button>').join("")||'<span class="muted" style="padding:8px;font-size:10px">No hay resultados.</span>'
 }
 function saveSeeds(){try{localStorage.setItem(seedKey,JSON.stringify(seeds))}catch{}}
 function setPage(page){
  app.querySelectorAll("[data-page]").forEach(section=>section.hidden=section.getAttribute("data-page")!==page);
  app.querySelectorAll(".nav [data-page-target]").forEach(button=>{if(button.dataset.pageTarget===page)button.setAttribute("aria-current","page");else button.removeAttribute("aria-current")});
  const labels={analysis:"Análisis",builder:"Mi mazo",complete:"Completar"};
  app.querySelector("[data-crumb]").textContent=labels[page]||"Snap Valley";
  if(page==="analysis")renderAnalysis();
  if(page==="builder")renderSlots();
  if(page==="complete"){renderSeedSelection();renderSeedMatches()}
  window.scrollTo({top:0,behavior:"smooth"})
 }

 try{const saved=JSON.parse(localStorage.getItem(deckKey)||"[]");if(Array.isArray(saved))deck=Array.from({length:12},(_,i)=>typeof saved[i]==="string"?saved[i]:"")}catch{}
 try{const savedSeeds=JSON.parse(localStorage.getItem(seedKey)||"[]");if(Array.isArray(savedSeeds))seeds=savedSeeds.filter(id=>cardById.has(id)).slice(0,11)}catch{}

 app.addEventListener("click",event=>{
  const nav=event.target.closest("[data-page-target]");
  if(nav&&app.contains(nav)){setPage(nav.dataset.pageTarget);return}
  const slot=event.target.closest("[data-slot]");
  if(slot){openPicker(Number(slot.dataset.slot));return}
  if(event.target.closest("[data-picker-close]")||event.target===picker){closePicker();return}
  const pick=event.target.closest("[data-pick-card]");
  if(pick&&activeSlot!==null){
   const card=cardById.get(pick.dataset.pickCard);if(!card)return;
   if(deck.some((name,index)=>index!==activeSlot&&norm(name)===norm(card.name))){showToast("No puedes incluir dos veces la misma carta.");return}
   deck[activeSlot]=card.name;storeDeck();renderSlots();renderAnalysis();closePicker();showToast(card.name+" añadida al mazo.");return
  }
  if(event.target.closest("[data-clear-deck]")){deck=Array(12).fill("");storeDeck();renderSlots();renderAnalysis();showToast("Mazo vacío.");return}
  const seedChoice=event.target.closest("[data-seed-choice]");
  if(seedChoice){
   if(seeds.length>=11){showToast("Elige como máximo 11 cartas.");return}
   if(!seeds.includes(seedChoice.dataset.seedChoice)){seeds.push(seedChoice.dataset.seedChoice);saveSeeds();renderSeedSelection();renderSeedMatches()}
   return
  }
  const removeSeed=event.target.closest("[data-remove-seed]");
  if(removeSeed){seeds=seeds.filter(id=>id!==removeSeed.dataset.removeSeed);saveSeeds();renderSeedSelection();renderSeedMatches();return}
  if(event.target.closest("[data-clear-seeds]")){seeds=[];recommendData=null;saveSeeds();renderSeedSelection();renderRecommendation();return}
  if(event.target.closest("[data-run-recommend]")){
   if(seeds.length<2){showToast("Elige al menos dos cartas.");return}
   recommendData=recommendation(seeds.map(id=>cardById.get(id)).filter(Boolean));renderRecommendation();return
  }
  if(event.target.closest("[data-use-recommend]")&&recommendData){
   deck=Array.from({length:12},(_,index)=>recommendData.cards[index]?.name||"");storeDeck();renderSlots();renderAnalysis();setPage("analysis");showToast("Mazo recomendado guardado en este dispositivo.");return
  }
  const location=event.target.closest("[data-location-id]");
  if(location){chosenLocation=locationById.get(location.dataset.locationId)||null;renderSelectedLocation();return}
 });
 app.addEventListener("input",event=>{
  if(event.target.matches("[data-picker-search]"))renderPicker();
  if(event.target.matches("[data-seed-search]"))renderSeedMatches();
  if(event.target.matches("[data-location-search]"))renderLocationResults(event.target.value)
 });
 app.addEventListener("change",event=>{
  if(event.target.matches("[data-cost-filter]"))renderPicker();
  if(event.target.matches("[data-starting-hand],[data-game-length]"))renderAnalysis()
 });
 document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!picker.hidden)closePicker()});

 const status=app.querySelector("[data-catalog-status]");
 const dateLabel=cardPayload.retrieved?new Date(cardPayload.retrieved+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"}):"catálogo local";
 status.textContent=cards.length?cards.length+" cartas jugables · "+locations.length+" ubicaciones · "+dateLabel:"No se cargó el catálogo";
 renderSlots();renderSeedSelection();renderRecommendation();renderLocationResults("");
 if(installButton){
  window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();window.snapValleyInstall=event;installButton.hidden=false});
  installButton.addEventListener("click",async()=>{if(!window.snapValleyInstall)return;window.snapValleyInstall.prompt();await window.snapValleyInstall.userChoice;window.snapValleyInstall=null;installButton.hidden=true});
  window.addEventListener("appinstalled",()=>installButton.hidden=true)
 }
 if("serviceWorker"in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("./sw.js").catch(()=>{});
 renderAnalysis()
})();

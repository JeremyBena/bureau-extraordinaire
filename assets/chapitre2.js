function portrait(file){
 return `<div class="speech-portrait"><img alt="" src="assets/${file}.png" draggable="false"></div>`;
}
function speechPanel(who,words,file){return `<div class="speech">${portrait(file)}<div class="speech-copy"><div class="person">${who}</div><p class="dialogue">${words}</p></div></div>`}
function showAnswerReview(i,action,actions,original){
 const selected=actions[i].label;
 const fresh=reviewQuestion(original.html);
 const options=original.options||{};
 const reviewMsg=action.review;
 // The question is preserved: students can reread what they selected before continuing.
 popup(original.title,fresh+`<div class="review-answered"><b>${texte("commun.interface.votre_reponse")}</b><span class="chosen">${selected}</span>${reviewMsg}</div>`,[
  {...libelleAction("commun.interface.actions.revoir_propositions"),alt:true,fn:()=>popup(original.title,fresh,actions,options)},
  {...libelleAction("commun.interface.actions.continuer"),gold:true,fn:action.fn}
 ],options);
}


'use strict';
const $=s=>document.querySelector(s), canvas=$('#world'),ctx=canvas.getContext('2d'),overlay=$('#overlay'),modal=$('#modal');ctx.imageSmoothingEnabled=false;
const symbols=['circle','cross','waves','square','star'], names=contenu("commun.cartes.symboles"), pred=['circle','waves','star','cross','square'];
const S={started:false,stage:0,player:{x:155,y:325},keys:{},locked:true,opinion:'',revealed:0,total:0,first:0,perfect:0,last:null,hunted:false,reflection:false,checked:false,simOpened:false,reportDone:false};
const ri=n=>Math.floor(Math.random()*n),fint=n=>n.toLocaleString('fr-FR'),percent=(n,d)=>d?100*n/d:0;
function symSVG(id){const core={circle:'<circle cx="30" cy="30" r="19"/>',cross:'<path d="M30 10V50M10 30H50"/>',waves:'<path d="M7 15 Q15 5 23 15 T39 15 T55 15 M7 30 Q15 20 23 30 T39 30 T55 30 M7 45 Q15 35 23 45 T39 45 T55 45"/>',square:'<rect x="12" y="12" width="36" height="36"/>',star:'<path d="M30 7 L36 23 L53 23 L40 34 L45 51 L30 41 L15 51 L20 34 L7 23 L24 23 Z"/>'}[id];return `<svg class="symbol" viewBox="0 0 60 60" fill="none" stroke="#29433e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${core}</svg>`}
function cardLabel(id, classes) {
 const result = classes.split(' ');
 const status = result.includes('good') ? texte("commun.cartes.correspondance") : result.includes('bad') ? texte("commun.cartes.ecart") : '';
 return (names[id] || texte("commun.cartes.masquee")) + status;
}
function card(id,cls=''){return `<div class="card ${cls} ${!id?'back':''}" role="img" aria-label="${cardLabel(id, cls)}">${id?symSVG(id):'✦'}</div>`}
function rowCards(arr,clsFn=()=>'',n=5){return `<div class="cards">${Array.from({length:n},(_,i)=>card(arr[i],clsFn(i))).join('')}</div>`}

const dialogFocus = createDialogFocus(overlay, [...document.querySelectorAll(
 '.head, #world, .scene-actions, .hud, .toolbar, .bottom'
)]);

function setObj(text, next) {
 const objective = ' — ' + text;
 $('#objective').textContent = objective;
 $('#dialog-objective').textContent = 'Objectif' + objective;
 document.querySelectorAll('[data-hotspot]').forEach(button => {
  const active = button.dataset.hotspot === next;
  button.classList.toggle('is-next', active);
  const label = button.textContent.trim();
  button.setAttribute('aria-label', label);
  button.title = (active ? texte("commun.interface.prochaine_etape") : '') + label;
  if (active) button.setAttribute('aria-current', 'step');
  else button.removeAttribute('aria-current');
 });
}


const answerOrderCache=new Map();
function questionKey(actions){return actions.map(action=>action.id).join("|")}
function orderQuestionActions(actions){
 if(actions.__ordered)return actions;
 if(!actions.some(a=>Object.hasOwn(a,"review")))return actions;
 const key=questionKey(actions);
 if(!answerOrderCache.has(key)){
  const ids=actions.map((a,i)=>a.alt?-1:i).filter(i=>i>=0);
  for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
  answerOrderCache.set(key,ids)
 }
 const result=[...answerOrderCache.get(key).map(i=>actions[i]),...actions.filter(a=>a.alt)];result.__ordered=true;return result;
}

function popup(title,html,actions=[],options={}){overlay.classList.remove('hidden');overlay.classList.toggle('intro',!!options.intro);overlay.classList.toggle('dialog-mode',!!options.dialogue);actions=orderQuestionActions(actions);const original={title,html,options};const activeSeries=document.activeElement?.dataset.series;modal.innerHTML=`<h2 id="dialog-title" tabindex="-1">${title}</h2>${html}<div class="actions ${options.compact?'compact':actions.length>3?'':'row'}">${actions.map((a,i)=>`<button class="btn ${a.alt?'alt':''} ${a.gold?'gold':''} ${a.small?'small':''}" data-action="${i}" data-action-id="${a.id}" ${a.disabled?'disabled':''}>${a.label}</button>`).join('')}</div>`;modal.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.action),a=actions[i];Object.hasOwn(a,"review")?showAnswerReview(i,a,actions,original):a.fn()}));S.locked=true;modal.scrollTop=0;
 $('#dialog-objective').textContent=texte("commun.interface.objectif")+$('#objective').textContent;
 const seriesButton=activeSeries !== undefined && modal.querySelector(`[data-series="${activeSeries}"]:enabled`);
 dialogFocus.render(seriesButton || $('#dialog-title'));
}
function close(){overlay.classList.add('hidden');S.locked=false;dialogFocus.dismiss($('.is-next') || $('[data-hotspot]'))}
function speak(who,words,actions,file){popup(texte("commun.interface.titre_dialogue"),speechPanel(who,words,file),actions||[{...libelleAction("commun.interface.actions.continuer"),fn:close}],{dialogue:true})}
function toast(t){let el=$('#toast');el.textContent=t;el.classList.remove('hidden');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>el.classList.add('hidden'),2000)}
function intro(){popup(texte("ecrans.dossier_elias.titre"),texte("ecrans.dossier_elias.texte"),[{...libelleAction("ecrans.dossier_elias.actions.prendre_dossier"),fn:()=>{S.started=true;S.stage=0;setObj(texte("objectifs.parler_professeur_sig_nificatif_bureau"), 'null');close();toast(texte("notifications.nouveau_dossier_ouvert"))}}],{intro:true})}
function nullTalk(){if(S.stage===0){speak(texte("dialogues.mission_elias.personnage"),texte("dialogues.mission_elias.texte"),[{...libelleAction("dialogues.mission_elias.actions.voir_elias_salle_experimentation"),fn:()=>{S.stage=1;close();setObj(texte("objectifs.rencontrer_elias_salle_experimentation"), 'candidate')}}], "null");return}
 if(S.stage===3)speak(texte("dialogues.invitation_au_simulateur.personnage"),texte("dialogues.invitation_au_simulateur.texte"),[{...libelleAction("dialogues.invitation_au_simulateur.actions.examiner_simulateur"),fn:()=>{close();setObj(texte("objectifs.explorer_simulateur_s_02_gauche"), 'sim')}}], "null");
 else if(S.stage===4)speak(texte("dialogues.comparaison_simulateur.personnage"),texte("dialogues.comparaison_simulateur.texte"), undefined, "null");
 else if(S.stage===5)speak(texte("dialogues.invitation_au_rapport.personnage"),texte("dialogues.invitation_au_rapport.texte"), undefined, "null");
 else if(S.stage>=6)ending();
 else speak(texte("dialogues.invitation_au_terminal.personnage"),texte("dialogues.invitation_au_terminal.texte"), undefined, "null");}
function candidate(){if(S.stage<1){speak(texte("dialogues.attente_elias.personnage"),texte("dialogues.attente_elias.texte"), undefined, "elias");return}
 if(S.stage===1){speak(texte("dialogues.protocole_elias.personnage"),texte("dialogues.protocole_elias.texte"), [{...libelleAction("dialogues.protocole_elias.actions.allons_je_vais_terminal"),fn:()=>{S.stage=2;close();setObj(texte("objectifs.lancer_cinq_tirages_terminal_droite"), 'experiment')}}], "elias");return}
 speak(texte("dialogues.commentaire_elias.personnage"),(S.stage<3 ? texte("dialogues.commentaire_elias.texte.avant_tirages") : texte("dialogues.commentaire_elias.texte.apres_tirages")), undefined, "elias")}
function zener(){popup(texte("ecrans.panneau_zener.titre"),texte("ecrans.panneau_zener.texte", { cartes: rowCards(symbols) }),[{...libelleAction("ecrans.panneau_zener.actions.compris"),fn:close}])}
function experiment(){if(S.stage<2){speak(texte("dialogues.terminal_verrouille.personnage"),texte("dialogues.terminal_verrouille.texte"), undefined, "null");return}if(S.stage>2){expCompleted();return}expUI()}
function expUI(){let shown=pred.map((s,i)=>i<S.revealed?s:null),completed=S.revealed===5;
 popup((completed ? texte("ecrans.tirages_elias.titre.apres_tirages") : texte("ecrans.tirages_elias.titre.avant_tirages")),texte("ecrans.tirages_elias.texte", { predictions: rowCards(pred), cartes_tirees: rowCards(shown,(i)=>i<S.revealed?'good':''), pluriel: (S.revealed===0 ? texte("ecrans.tirages_elias.variantes.texte_pluriel.avant_tirages") : texte("ecrans.tirages_elias.variantes.texte_pluriel.tirages_en_cours", { cartes_revelees: S.revealed, pluriel: S.revealed>1?'s':'', pluriel_2: S.revealed>1?'s':'', cartes_revelees_2: S.revealed })), resultat_final: (completed ? texte("ecrans.tirages_elias.variantes.texte_resultat_final.apres_tirages") : '') }),
 completed?[{...libelleAction("ecrans.tirages_elias.actions.conclure_cette_performance"),gold:true,fn:initialReaction}]:[{...libelleAction("ecrans.tirages_elias.actions.reveler_tirage_5", { numero_tirage: S.revealed+1 }),fn:()=>{S.revealed++;expUI()}},{...libelleAction("ecrans.tirages_elias.actions.revenir_salle"),alt:true,fn:close}]);}
function initialReaction(){popup(texte("questions.intuition_cinq_reussites.titre"),texte("questions.intuition_cinq_reussites.texte"),[{...libelleAction("questions.intuition_cinq_reussites.reponses.presque_impossible"),fn:()=>saveReaction('rare')},{...libelleAction("questions.intuition_cinq_reussites.reponses.aussi_facile_qu_une_carte"),fn:()=>saveReaction('common')},{...libelleAction("questions.intuition_cinq_reussites.reponses.ne_sait_pas"),alt:true,fn:()=>saveReaction('unsure')}]);}
function saveReaction(v){S.opinion=v;S.stage=3;speak(texte("dialogues.comparaison_monde_sans_pouvoir.personnage"),texte("dialogues.comparaison_monde_sans_pouvoir.texte"),[{...libelleAction("dialogues.comparaison_monde_sans_pouvoir.actions.aller_simulateur"),fn:()=>{close();setObj(texte("objectifs.rejoindre_simulateur_s_02_gauche"), 'sim')}}], "null");}
function expCompleted(){speak(texte("dialogues.tirages_archives.personnage"),texte("dialogues.tirages_archives.texte"), undefined, "null");}
function simMachine(){if(S.stage<3){speak(texte("dialogues.simulateur_verrouille.personnage"),texte("dialogues.simulateur_verrouille.texte"), undefined, "null");return}if(S.stage===3&&!S.simOpened){S.simOpened=true;simIntro();return}simUI();}
function simIntro(){popup(texte("ecrans.mode_emploi_simulateur.titre"),texte("ecrans.mode_emploi_simulateur.texte"),[{...libelleAction("ecrans.mode_emploi_simulateur.actions.lancer_parties_virtuelles"),fn:()=>{S.stage=4;setObj(texte("objectifs.simuler_parties_sans_pouvoirs_puis_comparer_resultats"), 'sim');simUI()}}]);}
function generate(){const guesses=Array.from({length:5},()=>ri(5)),draws=Array.from({length:5},()=>ri(5));let k=guesses.reduce((s,g,i)=>s+(g===draws[i]?1:0),0);S.total++;if(guesses[0]===draws[0])S.first++;if(k===5)S.perfect++;S.last={guesses,draws,k};return k===5}
function run(n){for(let i=0;i<n;i++)generate();simUI()}
function hunt(){let count=0,found=false;while(count<150000&&!found){found=generate();count++}S.hunted=true;S.huntLast=count;S.huntFound=found;simUI();}
function simUI(msg=''){let last=S.last;const n=S.total,first=percent(S.first,n),perfect=percent(S.perfect,n),allow=n>=1000;
 let ex=(last ? texte("ecrans.simulateur.derniere_partie.oui", { predictions: rowCards(last.guesses.map(i=>symbols[i])), cartes_tirees: rowCards(last.draws.map(i=>symbols[i]),i=>last.guesses[i]===last.draws[i]?'good':'bad'), reussites: last.k, pluriel: last.k>1?'s':'', pluriel_2: last.k>1?'s':'' }) : texte("ecrans.simulateur.derniere_partie.non"));
 let hist=(S.hunted ? texte("ecrans.simulateur.recherche_reussite.oui", { parties_examinees: fint(S.huntLast), pluriel: S.huntLast>1?'s':'', pluriel_2: S.huntLast>1?'s':'', issue_recherche: (S.huntFound ? texte("ecrans.simulateur.variantes.recherche_reussite_oui_issue_recherche.reussite") : texte("ecrans.simulateur.variantes.recherche_reussite_oui_issue_recherche.limite")) }) : '');
 popup(texte("ecrans.simulateur.titre"),texte("ecrans.simulateur.texte", { derniere_partie: ex, parties: fint(n), premieres_cartes_correctes: fint(S.first), parties_parfaites: fint(S.perfect), largeur_premiere_carte: first, frequence_premiere_carte: first.toFixed(2).replace('.',','), largeur_reussites_parfaites: perfect, frequence_reussites_parfaites: perfect.toFixed(3).replace('.',','), avertissement: (n>0&&S.perfect===0 ? texte("ecrans.simulateur.variantes.texte_avertissement.oui") : ''), recherche_reussite: hist, message: msg?`<p class="note">${msg}</p>`:'', indication_progression: (allow ? texte("ecrans.simulateur.variantes.texte_indication_progression.simulation_suffisante") : texte("ecrans.simulateur.variantes.texte_indication_progression.simulation_insuffisante")) }),[
 {...libelleAction("ecrans.simulateur.actions.1_partie"),small:true,fn:()=>run(1)},{...libelleAction("ecrans.simulateur.actions.20_parties"),small:true,fn:()=>run(20)},{...libelleAction("ecrans.simulateur.actions.200_parties"),small:true,fn:()=>run(200)},{...libelleAction("ecrans.simulateur.actions.2_000_parties"),small:true,fn:()=>run(2000)},{...libelleAction("ecrans.simulateur.actions.10_000_parties"),small:true,fn:()=>run(10000)},
 {...libelleAction("ecrans.simulateur.actions.chercher_reussite_parfaite_hasard"),alt:true,small:true,fn:hunt},
 ...(allow&&S.stage<6?[{...libelleAction("ecrans.simulateur.actions.j_ai_compris_comparaison"),gold:true,fn:simReflection}]:[]),
 {...libelleAction("ecrans.simulateur.actions.quitter_simulateur"),alt:true,fn:close}
 ],{compact:true});
}
function simReflection(msg=''){popup(texte("questions.absence_de_reussite_parfaite.titre"),texte("questions.absence_de_reussite_parfaite.texte", { feedback: encadreFeedback(msg, "note") }),[{...libelleAction("questions.absence_de_reussite_parfaite.reponses.reussite_impossible"),fn:()=>simReflection(texte("questions.absence_de_reussite_parfaite.reponses.reussite_impossible.feedback"))},{...libelleAction("questions.absence_de_reussite_parfaite.reponses.rarete_compatible"),review:texte("questions.absence_de_reussite_parfaite.reponses.rarete_compatible.feedback"),fn:()=>{S.reflection=true;S.stage=5;speak(texte("dialogues.explication_rarete.personnage"),texte("dialogues.explication_rarete.texte"),[{...libelleAction("dialogues.explication_rarete.actions.rediger_rapport"),fn:()=>{close();setObj(texte("objectifs.rapport_piece_gauche_grande_feuille_claire_bas"), 'report')}}], "null")}},{...libelleAction("questions.absence_de_reussite_parfaite.reponses.preuve_pouvoir"),fn:()=>simReflection(texte("questions.absence_de_reussite_parfaite.reponses.preuve_pouvoir.feedback"))},{...libelleAction("questions.absence_de_reussite_parfaite.actions.revenir_simulations"),alt:true,fn:simUI}]);}
function report(){if(S.stage<5){speak(texte("dialogues.rapport_indisponible.personnage"),texte("dialogues.rapport_indisponible.texte"), undefined, "null");return}if(S.stage>=6){ending();return}reportUI();}
function reportUI(msg=''){popup(texte("questions.rapport_elias.titre"),texte("questions.rapport_elias.texte", { feedback: encadreFeedback(msg, "note") }),[
 {...libelleAction("questions.rapport_elias.reponses.serie_plus_rare"),review:texte("questions.rapport_elias.reponses.serie_plus_rare.feedback"),fn:()=>{S.stage=6;S.reportDone=true;ending()}},
 {...libelleAction("questions.rapport_elias.reponses.preuve_pouvoir"),fn:()=>reportUI(texte("questions.rapport_elias.reponses.preuve_pouvoir.feedback"))},
 {...libelleAction("questions.rapport_elias.reponses.meme_frequence"),fn:()=>reportUI(texte("questions.rapport_elias.reponses.meme_frequence.feedback"))},
 {...libelleAction("questions.rapport_elias.reponses.simulateur_defectueux"),fn:()=>reportUI(texte("questions.rapport_elias.reponses.simulateur_defectueux.feedback"))},
 {...libelleAction("questions.rapport_elias.actions.revoir_simulateur"),alt:true,fn:simUI}
 ]);}
function ending(){popup(texte("ecrans.fin_chapitre.titre"),texte("ecrans.fin_chapitre.texte"),[{...libelleAction("ecrans.fin_chapitre.actions.continuer_chapitre_3"),gold:true,fn:()=>location.href='chapitre3.html'},{...libelleAction("ecrans.fin_chapitre.actions.retourner_laboratoire"),fn:()=>{close();setObj(texte("objectifs.chapitre_2_termine_rapport_valide"))}},{...libelleAction("ecrans.fin_chapitre.actions.recommencer_chapitre"),alt:true,fn:()=>location.reload()}]);}
function help(){popup(texte("ecrans.aide.titre"),texte("ecrans.aide.texte"),[{...libelleAction("ecrans.aide.actions.reprendre"),fn:close}]);}
function about(){popup(texte("commun.a_propos.chapitre.titre"),texte("commun.a_propos.texte")+texte("commun.a_propos.chapitre.note"),[{...libelleAction("commun.a_propos.chapitre.actions.revenir_jeu"),fn:close}])}

function licence(){popup(texte("commun.licence.chapitre.titre"),texte("commun.licence.chapitre.texte"),[{...libelleAction("commun.licence.chapitre.actions.revenir_jeu"),fn:close}])}
document.getElementById('licence').onclick=licence;

// Exploration : deux pièces reliées par un passage central.
const objects=[{id:'null',x:168,y:176,rx:35,ry:36,label:'Professeur Sig. Nificatif'},{id:'candidate',x:565,y:163,rx:35,ry:36,label:'Elias'},{id:'zener',x:706,y:95,rx:42,ry:38,label:'Panneau des cartes'},{id:'experiment',x:626,y:301,rx:41,ry:39,label:'Terminal de tirage'},{id:'sim',x:93,y:95,rx:44,ry:39,label:'Simulateur S-02'},{id:'report',x:278,y:306,rx:43,ry:37,label:'Rapport d’enquête'}];
function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w|0,h|0)}
function txt(t,x,y,color='#dce8d0',size=12){ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.fillText(t,x,y)}
function monitor(x,y,glow){px(x,y,60,46,'#0b1419');px(x+4,y+4,52,32,'#777a63');px(x+8,y+7,44,25,glow);px(x+13,y+13,29,2,'#bce4b6');px(x+13,y+19,18,2,'#8fb4a5');px(x+24,y+36,12,7,'#767c70');px(x+13,y+43,35,4,'#666959')}
function room(){px(0,0,800,450,'#111f25');for(let i=0;i<40;i++)for(let j=0;j<23;j++)px(i*20,j*20,19,19,(i+j)%2?'#25383a':'#293e3d');px(0,0,800,18,'#63746a');px(0,431,800,19,'#63746a');px(0,0,18,450,'#63746a');px(782,0,18,450,'#63746a');px(384,0,20,165,'#63746a');px(384,265,20,185,'#63746a');px(385,165,20,100,'#304643');for(let y=26;y<431;y+=42)px(382,y,3,9,'#92a28b');txt(texte("decor.bureau_archives"),100,30,'#ccd6b0',13);txt(texte("decor.salle_experimentation"),485,30,'#ccd6b0',13);px(35,51,127,71,'#4a3d31');px(38,54,121,66,'#89755a');px(49,60,100,55,'#2b3d39');monitor(65,66,'#24634f');txt('S-02',78,87,'#bbe5ad',10);px(218,53,115,59,'#644e39');px(222,57,107,52,'#94734f');px(240,65,40,27,'#d2c9ab');for(let i=0;i<4;i++)px(245,70+i*5,31,2,'#6f6754');txt(texte("decor.rapport"),242,269,'#f8db99',11);px(240,274,99,76,'#634a39');px(244,278,91,68,'#897451');px(248,282,83,61,'#ded0a6');for(let i=0;i<6;i++)px(253,290+i*8,62,2,'#796b55');px(23,285,81,116,'#313d40');for(let i=0;i<4;i++){px(27,291+i*27,73,21,'#65706b');px(55,299+i*27,18,2,'#273230')}px(450,66,160,73,'#6c553d');px(454,70,152,65,'#937451');px(458,74,144,56,'#ad9268');px(482,92,38,24,'#e7ddc6');px(532,92,38,24,'#e7ddc6');px(689,45,75,84,'#e0d7b7');txt(texte("commun.interface.decor_zener"),700,60,'#273d3a',11);const points=[[707,75],[727,75],[748,75],[717,98],[739,98]];for(let k=0;k<5;k++){ctx.fillStyle='#2d5147';ctx.beginPath();ctx.arc(points[k][0],points[k][1],8,0,Math.PI*2);ctx.fill()}monitor(607,259,'#2c675a');px(586,304,104,21,'#816348');px(591,325,10,42,'#634e3e');px(677,325,10,42,'#634e3e');px(433,319,86,80,'#394848');px(440,330,72,21,'#8d775e');px(440,356,72,22,'#8d775e');px(452,384,46,4,'#92a590');px(18,199,348,10,'#354945');px(417,199,346,10,'#354945');}
function character(x,y,shirt,hair='#443832',skin='#cf9f76'){px(x-12,y-8,24,26,'#0d1418');px(x-10,y-6,20,21,shirt);px(x-8,y+14,7,11,'#26383e');px(x+1,y+14,7,11,'#26383e');px(x-9,y-26,18,19,skin);px(x-11,y-28,22,9,hair);px(x-5,y-14,3,3,'#2d2a29');px(x+3,y-14,3,3,'#2d2a29')}
function nearest(){return objects.find(o=>Math.abs(S.player.x-o.x)<o.rx+20&&Math.abs(S.player.y-o.y)<o.ry+14)}
function draw(){ctx.clearRect(0,0,800,450);room();character(168,176,'#728e78','#c5c6c0','#edb795');character(565,163,'#c5a05a','#252a30','#674634');character(S.player.x,S.player.y,'#b98a56','#283e40','#e5be97');let o=nearest();if(o&&!S.locked){px(o.x-34,o.y-51,74,15,'#101d23');txt('Cliquer',o.x-24,o.y-40,'#f2df9a',10)}requestAnimationFrame(draw)}
function interact(){if(!S.started||S.locked)return;let o=nearest();if(!o){toast(texte("notifications.approchez_vous_element_interactif"));return}({null:nullTalk,candidate,zener,experiment,sim:simMachine,report})[o.id]()}
function move(dx,dy){if(!S.started||S.locked)return;let x=Math.min(758,Math.max(41,S.player.x+dx)),y=Math.min(407,Math.max(49,S.player.y+dy));if((S.player.x<380&&x>380||S.player.x>408&&x<408)&&!(y>160&&y<274))return;if(x>=380&&x<=408&&!(y>160&&y<274))return;S.player.x=x;S.player.y=y}
let lastTime=0;function tick(t){if(t-lastTime>20){let k=S.keys;if(k.arrowup||k.w||k.z)move(0,-4);if(k.arrowdown||k.s)move(0,4);if(k.arrowleft||k.a||k.q)move(-4,0);if(k.arrowright||k.d)move(4,0);lastTime=t}requestAnimationFrame(tick)}

canvas.addEventListener('click',e=>{if(S.locked)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*800,y=(e.clientY-r.top)/r.height*450;let o=objects.find(obj=>Math.abs(x-obj.x)<obj.rx+20&&Math.abs(y-obj.y)<obj.ry+20);if(o){S.player.x=Math.max(50,Math.min(754,o.x+(o.id==='null'?45:0)));S.player.y=Math.max(55,Math.min(405,o.y+30));interact()}else{S.player.x=Math.max(45,Math.min(755,x));S.player.y=Math.max(55,Math.min(405,y))}});


function zenerCanvasSymbol(id,cx,cy,scale=1){
 ctx.save();ctx.strokeStyle='#264b44';ctx.fillStyle='#264b44';ctx.lineWidth=Math.max(1.7,2.5*scale);ctx.lineCap='round';ctx.lineJoin='round';
 const x=cx,y=cy,r=5.6*scale;ctx.beginPath();
 if(id===0){ctx.arc(x,y,r,0,Math.PI*2)}
 if(id===1){ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r)}
 if(id===2){for(let j=-1;j<=1;j++){const yy=y+j*r*.66;ctx.moveTo(x-r,yy);ctx.quadraticCurveTo(x-r/2,yy-r/2,x,yy);ctx.quadraticCurveTo(x+r/2,yy+r/2,x+r,yy)}}
 if(id===3){ctx.rect(x-r,y-r,r*2,r*2)}
 if(id===4){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.46:r;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.closePath()}
 ctx.stroke();ctx.restore();
}
function upgradedRoom(){
 const txt=(t,x,y,color='#dce8d0',size=12)=>{ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.fillText(t,x,y)};
 px(0,0,800,450,'#102127');
 for(let i=0;i<40;i++)for(let j=0;j<23;j++)px(i*20,j*20,19,19,(i+j)%2?'#273b3a':'#2c403e');
 // exterior masonry and communicating door
 px(0,0,800,16,'#748274');px(0,433,800,17,'#748274');px(0,0,17,450,'#748274');px(782,0,18,450,'#748274');
 px(382,0,22,164,'#748274');px(382,269,22,181,'#748274');px(384,164,18,105,'#52605a');
 for(let y=172;y<259;y+=24){px(390,y,6,11,'#a8af8b')}
 txt(texte("decor.bureau_dossiers"),95,32,'#f2e0ae',13);
 txt(texte("decor.salle_experimentation"),464,32,'#f2e0ae',12);
 // books and wall cabinet
 px(31,72,117,30,'#302b2a');px(34,75,111,22,'#6f5644');
 for(let i=0;i<13;i++){let x=37+i*8;px(x,79,6,15,['#698c75','#bc856a','#d8bc83','#5b7a86'][i%4]);px(x+1,84,3,2,'#2c3736')}
 px(38,282,82,117,'#253133');for(let i=0;i<4;i++){px(42,288+i*27,74,23,'#718179');px(70,298+i*27,19,3,'#344942')}
 // simulator station, top-left
 px(45,50,136,73,'#755b48');px(50,55,126,62,'#9c7f5c');
 px(60,60,73,44,'#141d21');px(65,64,63,33,'#738b75');px(70,68,53,25,'#1c644d');
 for(let i=0;i<4;i++)px(75,73+i*5,28+i*4,2,i===0?'#d1f2c9':'#6bc8a1');
 px(81,99,30,8,'#545c53');px(75,105,43,4,'#444e48');
 px(143,72,23,32,'#d7ccb3');for(let i=0;i<3;i++)px(147,79+i*7,15,2,'#8a947a');
 txt(texte("decor.simulateur"),45,142,'#8de2b5',12);
 // clear dossier desk bottom left
 px(205,272,146,111,'#5c4436');px(210,277,136,101,'#9c8058');
 px(229,285,97,83,'#f0e3c0');px(236,292,83,7,'#beab84');
 for(let i=0;i<6;i++)px(238,307+i*9,70-i*3,2,'#a99778');
 px(315,343,5,7,'#a95e4d');txt(texte("decor.rapport"),231,265,'#ffe6a9',12);
 // subject experiment desk, right side
 px(464,70,170,78,'#5d453b');px(469,74,159,70,'#a78360');px(475,79,147,60,'#c3a078');
 for(let i=0;i<5;i++){px(481+i*25,100,20,30,'#e8dcc1');zenerCanvasSymbol(i,491+i*25,114,.75)}
 // panel with Zener cards, clear and recognizable
 px(670,48,104,125,'#253b39');px(676,54,92,113,'#dfd1ad');
 txt(texte("commun.interface.decor_zener"),688,67,'#253f3b',11);
 for(let i=0;i<5;i++){let xx=687+(i%3)*28,yy=83+Math.floor(i/3)*39;px(xx,yy,24,33,'#fff4d6');px(xx+2,yy+2,20,29,'#e3d9bf');zenerCanvasSymbol(i,xx+12,yy+17,.90)}
 txt(texte("decor.cartes"),681,190,'#f8d7a0',11);
 // experiment terminal, lower right
 px(574,273,156,99,'#785a41');px(580,279,144,85,'#9b7953');
 px(608,248,79,65,'#182328');px(614,254,67,49,'#91a78e');px(620,259,55,36,'#1b5e4e');
 zenerCanvasSymbol(4,648,276,1.1);px(628,313,42,7,'#474d42');
 for(let i=0;i<5;i++)px(586+i*15,340,11,16,'#e5dbb9');
 txt(texte("decor.terminal"),597,393,'#f8d7a0',11);
 // chairs and plants
 px(455,355,85,45,'#374b4a');px(466,362,65,19,'#a08a67');
 px(740,354,22,43,'#715644');px(736,336,30,22,'#467e60');
}
function upgradedCharacter(x,y,shirt='#789083',hair='#4c392f',skin='#dca985'){
 // A legible 28x47 pixel figure
 const isNull=(hair==='#c5c6c0'||hair==='#c1c3b8'||shirt==='#728e78');
 px(x-14,y-12,28,36,'#17272b');px(x-12,y-9,24,30,shirt);
 px(x-10,y+20,8,12,'#344a4f');px(x+2,y+20,8,12,'#344a4f');
 px(x-10,y-34,20,24,skin);px(x-13,y-31,5,18,hair);px(x+8,y-31,5,18,hair);
 if(isNull){px(x-10,y-35,20,7,'#d5d4c8');px(x-9,y-18,18,10,'#edece0');px(x-8,y-26,6,5,'#263b3b');px(x+2,y-26,6,5,'#263b3b');px(x-2,y-24,4,2,'#d9dcd0')}
 else{px(x-12,y-37,24,9,hair);px(x-10,y-30,4,8,hair)}
 px(x-5,y-25,2,2,'#26333a');px(x+3,y-25,2,2,'#26333a');
 px(x-3,y-16,6,2,isNull?'#7c695e':'#a76c62');
 px(x-16,y-5,4,17,shirt);px(x+12,y-5,4,17,shirt);
}
room=upgradedRoom;
if(typeof char!=='undefined')char=upgradedCharacter;
if(typeof character!=='undefined')character=upgradedCharacter;

function initialiserJeu() {
 intro();
 requestAnimationFrame(draw);
 requestAnimationFrame(tick);
}


// Toolbar actions, kept independent of movement controls.
document.getElementById('about').addEventListener('click',about);
document.getElementById('help').addEventListener('click',help);
document.getElementById('reset').addEventListener('click',()=>{if(confirm(texte("commun.interface.confirmer_recommencer")))location.reload()});
document.getElementById('back').addEventListener('click',()=>location.href='chapitre1.html');

// Direct mouse/touch interaction: no keyboard or E key required.
document.querySelectorAll('[data-hotspot]').forEach(button=>{
 button.addEventListener('click',()=>{
  if(!S.started || S.locked)return;
  const id=button.dataset.hotspot;
  const target=objects.find(o=>o.id===id);
  if(target){S.player.x=target.x;S.player.y=target.y+22;}
  const go={null:nullTalk,candidate:candidate,zener:zener,experiment:experiment,sim:simMachine,report:report};
  go[id]?.();
 });
});

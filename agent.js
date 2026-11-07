import {accounts,priorityFor,sequenceApproach,sequenceTouches,money} from './data.js?v=13';
export function recommendAccount(prompt,previousId=null){
 const q=prompt.toLowerCase();
 const named=accounts.find(a=>q.includes(a.name.toLowerCase()));
 const growth=/new business|acquisition|acquire|hunting|growth only|new customer/.test(q);
 const expansion=/expansion|upsell|existing customer/.test(q);
 const next=/next|contact|prioriti|prioriti|recommend|who|account/.test(q);
 const followup=/revenue|value|strategy|outreach|why|reason|plan|pitch|email|more|this|that/.test(q);
 if(!named&&!next&&!followup)return {clarification:'I can help prioritise the demo accounts, explain revenue potential and prepare an outreach plan. Try “What is the next account I should contact?”, “New business only”, or name an account. This is a local conversational demo, not a general-purpose AI model.'};
 const pool=accounts.filter(a=>!growth||a.motion==='Acquire').filter(a=>!expansion||a.motion==='Expand');
 const ranked=[...pool].sort((a,b)=>{const pa=priorityFor(a),pb=priorityFor(b);return Number(pb.retentionUrgent)-Number(pa.retentionUrgent)||pb.score-pa.score||b.potential-a.potential;});
 const a=named||(!growth&&!expansion&&followup&&!next&&previousId?accounts.find(a=>a.id===previousId):null)||ranked[0];
 if(!a)return {clarification:'There are no accounts matching that request. Try new business or existing customers.'};
 const p=priorityFor(a),mode=sequenceApproach(a);
 return {accountId:a.id,name:a.name,headline:p.retentionUrgent?'Contact Bloom Wellness next: restore customer value.':`Contact ${a.name} ${named?'to explore the opportunity':'next'}.`,
 reasons:p.retentionUrgent?['Low adoption makes this a high-priority customer-value review, independently of the T2 expansion score.',`Renewal is in ${p.renewalDays} days. Assess actual risk with the account team rather than assuming churn.`,`${money(a.acv)} current ACV deserves attention before any additional product conversation.`]:[`${a.motion==='Acquire'?'Acquisition':'Expansion'} T${p.tier} · ${p.score.toFixed(1)}/5 on potential, buying signals and timing.`,a.signal,p.need],
 strategy:p.retentionUrgent?p.retentionAction:`${mode.label}. Start with ${a.persona.toLowerCase()}. ${p.next} Use nine planned touches across 30 days; stop for replies or opt-outs.`,
 revenue:p.retentionUrgent?`${money(a.acv)} current annual contract value to support and retain. ${money(a.potential)} additional annual potential is a later discovery hypothesis, not immediate revenue or a forecast.`:`${money(a.potential)} indicative additional annual revenue potential. ${a.acv?`${money(a.acv)} existing ACV is separate. `:''}Validate scope, budget and timing; no revenue is guaranteed.`,
 mode:mode.label,retention:p.retentionUrgent,scope:named?'Named account':growth?'New business only':expansion?'Existing customers':'Whole territory'};
}
export function makeAgentPlan(accountId){
 const a=accounts.find(a=>a.id===accountId);if(!a)throw new Error('Unknown account');const p=priorityFor(a);
 const tasks=p.retentionUrgent?[
 {day:1,channel:'Internal coordination',title:'Review adoption and support history with the account owner',status:'Queued for human review'},
 {day:1,channel:'Phone call',title:'Invite the customer to an adoption and value review',status:'Queued for human review'},
 {day:3,channel:'Working session',title:'Agree blockers, enablement actions, owners and success measures',status:'Queued for human review'},
 {day:7,channel:'Review',title:'Check adoption progress and assess renewal risk before expansion',status:'Queued for human review'}
 ]:sequenceTouches(a).map(t=>({day:t.day,channel:t.channel,title:t.title,content:t.content,execution:t.execution,status:'Queued for human review'}));
 return {id:`agent-plan-${a.id}-${p.retentionUrgent?'adoption':'growth'}`,accountId:a.id,account:a.name,mode:p.retentionUrgent?'Adoption & customer value':'Growth outreach',tasks,status:'Demo plan queued locally',createdAt:new Date().toISOString()};
}
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let messages=[],contextId=null,notice='',pending=null;
let responseTimers=[];
const progressSteps=['Reviewing account signals','Checking priority and revenue context','Preparing the outreach plan'];
function thinkingCard(){return `<div class="agent-thinking" id="agent-thinking" role="status"><div class="thinking-heading"><span class="thinking-spark" aria-hidden="true">✧</span><strong>Working on your next step</strong><span class="thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span></div><ol>${progressSteps.map((step,i)=>`<li class="${i<pending.stage?'complete':i===pending.stage?'current':'waiting'}"><span aria-hidden="true">${i<pending.stage?'✓':i===pending.stage?'◌':'·'}</span>${step}</li>`).join('')}</ol><small>Demo processing animation · local account data</small></div>`;}
function scrollChat(){const log=document.querySelector('.agent-messages');if(log)log.scrollTop=log.scrollHeight;}
function readPlans(){try{const p=JSON.parse(localStorage.getItem('signal-agent-plans')||'[]');return Array.isArray(p)?p:[];}catch{return [];}}
export function agentPage(){
 const plans=readPlans();
 return `<div class="title-row"><div><span class="eyebrow">YOUR CONVERSATIONAL TERRITORY ASSISTANT</span><h1>Ask. Prioritise. Take the next step.</h1><p class="subtitle">Account context, commercial reasoning and an actionable plan in one conversation.</p></div><span class="agent-demo-label">Demo agent · local account data</span></div><div class="agent-layout"><section class="card agent-conversation"><div class="agent-intro"><span class="agent-orb">✧</span><div><strong>Your next best action, explained.</strong><p>Ask who to contact next, then explore the reasons, strategy and revenue.</p></div></div><div class="agent-messages" role="log" aria-label="Conversation" aria-live="polite" aria-busy="${Boolean(pending)}">${messages.map((m,i)=>m.role==='user'?`<div class="agent-user"><small>YOU</small><p>${escape(m.text)}</p></div>`:m.answer.clarification?`<div class="agent-answer"><p>${escape(m.answer.clarification)}</p></div>`:answerCard(m.answer,i,plans)).join('')}${pending?thinkingCard():''}</div><div class="agent-prompts">${['What is the next account I should contact?','New business only: who should I contact?','What revenue could this bring?'].map(q=>`<button class="btn" data-agent-prompt="${escape(q)}" ${pending?'disabled':''}>${escape(q)}</button>`).join('')}</div><form id="agent-form"><label for="agent-input">Ask your territory assistant</label><div class="agent-input-row"><textarea id="agent-input" rows="2" maxlength="1000" placeholder="What is the next account I should contact?" ${pending?'disabled':''} required></textarea><button class="btn primary" type="submit" ${pending?'disabled':''}>${pending?'Preparing reply…':'Ask agent →'}</button></div>${pending?'<button class="btn agent-stop" id="stop-agent" type="button">Stop response</button>':''}</form><p class="agent-disclosure">Local, rule-based conversational demo using fictional dashboard data; no live AI model or external research. Plans are queued in this browser only. No emails, calls or CRM updates are executed.</p></section><aside class="agent-side"><section class="card"><span class="eyebrow">HOW I PRIORITISE</span><h2>Value first. Growth next.</h2><ol><li>Surface low-adoption customers needing attention.</li><li>Rank growth opportunities by potential, signals and timing.</li><li>Match the plan to account tier and customer health.</li></ol><p>Ask “new business only” to focus on acquisition. Name an account to explore it directly.</p></section><section class="card agent-plan-list"><span class="eyebrow">MY DEMO ACTION QUEUE</span><h2>${plans.length} account plan${plans.length===1?'':'s'}</h2><p class="agent-notice" role="status">${escape(notice)}</p>${plans.length?plans.map(p=>`<div class="queued-plan"><strong>${escape(p.account)}</strong><span>${escape(p.mode)} · ${p.tasks.length} tasks</span><details><summary>Review queued tasks</summary><ol>${p.tasks.map(t=>`<li><b>Day ${t.day} · ${escape(t.channel)}</b><span>${escape(t.title)}</span></li>`).join('')}</ol></details></div>`).join(''):'<p>Ask for a recommendation, then execute the demo plan to queue its tasks.</p>'}${plans.length?'<button class="btn" id="clear-agent-plans">Clear demo queue</button>':''}</section></aside></div>`;
}
function answerCard(a,i,plans){const queued=plans.some(p=>p.accountId===a.accountId);return `<article class="agent-answer"><span class="eyebrow">SIGNAL AGENT · ${escape(a.scope)}</span><h2>${escape(a.headline)}</h2><div class="agent-reasons"><h3>Why this account</h3><ul>${a.reasons.map(r=>`<li>${escape(r)}</li>`).join('')}</ul></div><h3>The outreach strategy</h3><p>${escape(a.strategy)}</p><div class="agent-revenue"><h3>What it could bring</h3><p>${escape(a.revenue)}</p></div><div class="agent-answer-actions"><button class="btn primary" data-execute-agent="${i}" ${queued?'disabled':''}>${queued?'Plan queued ✓':'Execute demo plan →'}</button><button class="btn" data-priority="${a.accountId}">See account reasoning</button><button class="btn" data-account="${a.accountId}">View outreach drafts</button></div><small>Queues ${a.retention?'an adoption review plan':'nine reviewable outreach tasks'} locally. Nothing is sent.</small></article>`;}
export function bindAgent(refresh){
 const send=text=>{
  const value=text.trim();if(!value||pending)return;
  messages.push({role:'user',text:value});notice='';pending={stage:0};refresh();scrollChat();
  const update=stage=>{if(!pending)return;pending.stage=stage;const card=document.querySelector('#agent-thinking');if(card){card.outerHTML=thinkingCard();scrollChat();}};
  responseTimers=[setTimeout(()=>update(1),1000),setTimeout(()=>update(2),2100),setTimeout(()=>{
   if(!pending)return;const answer=recommendAccount(value,contextId);if(answer.accountId)contextId=answer.accountId;
   messages.push({role:'assistant',answer});pending=null;responseTimers=[];
   if(document.querySelector('#agent-form')){refresh();scrollChat();document.querySelector('#agent-input').focus();}
  },3400)];
 };
 const stop=document.querySelector('#stop-agent');if(stop)stop.onclick=()=>{responseTimers.forEach(clearTimeout);responseTimers=[];pending=null;notice='Response stopped. Ask another question when ready.';refresh();document.querySelector('#agent-input').focus();};
 document.querySelector('#agent-form').onsubmit=e=>{e.preventDefault();send(document.querySelector('#agent-input').value);};
 document.querySelectorAll('[data-agent-prompt]').forEach(b=>b.onclick=()=>send(b.dataset.agentPrompt));
 document.querySelectorAll('[data-execute-agent]').forEach(b=>b.onclick=()=>{const a=messages[+b.dataset.executeAgent]?.answer;if(!a?.accountId)return;const plan=makeAgentPlan(a.accountId),plans=readPlans();if(!plans.some(p=>p.id===plan.id))plans.push(plan);try{localStorage.setItem('signal-agent-plans',JSON.stringify(plans));notice=`${plan.account}: ${plan.tasks.length} tasks queued for human review. No outreach sent.`;}catch{notice='Browser storage unavailable. The plan was not saved.';}refresh();});
 const clear=document.querySelector('#clear-agent-plans');if(clear)clear.onclick=()=>{try{localStorage.removeItem('signal-agent-plans');notice='Demo queue cleared.';}catch{notice='Unable to clear browser storage.';}refresh();};
}

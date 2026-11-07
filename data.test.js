import test from 'node:test';
import assert from 'node:assert/strict';
import {accounts,results,aggregate} from './data.js';
test('every account has one coherent sequence cohort',()=>{assert.equal(new Set(accounts.map(a=>a.id)).size,accounts.length);assert.equal(results.length,accounts.length);for(const a of accounts){const r=results.filter(r=>r.account===a.id);assert.equal(r.length,1);const m=r[0];assert.ok(m.contacted>=m.delivered&&m.delivered>=m.opens&&m.opens>=m.replies&&m.replies>=m.meetings&&m.meetings>=m.opps);}});
test('territory potential and cohort totals reconcile',()=>{assert.equal(accounts.reduce((s,a)=>s+a.potential,0),200000);assert.equal(aggregate(results).pipeline,174000);assert.equal(aggregate(results).meetings,30);assert.equal(aggregate([]).pipeline,0);});

test('every account gets nine distinct drafts with the exact 30-day channel mix',async()=>{
 const {sequenceTouches}=await import('./data.js');
 for(const a of accounts){
  const touches=sequenceTouches(a);
  assert.equal(touches.length,9);
  assert.deepEqual(touches.map(t=>t.day),[1,3,5,9,13,17,22,26,30]);
  const count=channel=>touches.filter(t=>t.channel===channel).length;
  assert.equal(count('Email'),3);assert.equal(count('Phone call'),3);
  assert.equal(count('LinkedIn message'),2);assert.equal(count('LinkedIn connection request'),1);
  assert.equal(new Set(touches.map(t=>t.content)).size,9);
  for(const t of touches){assert.ok(t.content.length>100);assert.ok(t.content.includes(a.name));}
  assert.ok(touches.filter(t=>t.channel==='LinkedIn message').every(t=>t.guidance.includes('pending')));
 }
});

test('weighted priorities reconcile with every displayed tier and keep retention separate',async()=>{
 const {priorityFor,priorityScore,tierForScore}=await import('./data.js');
 assert.equal(priorityScore(5,1,1),2.6);
 assert.equal(tierForScore(4.2),1);assert.equal(tierForScore(4.1),2);assert.equal(tierForScore(2.5),2);assert.equal(tierForScore(2.4),3);
 for(const a of accounts){const p=priorityFor(a);assert.equal(p.tier,a.tier);assert.ok(p.need&&p.next&&p.promote&&p.demote);}
 const bloom=priorityFor(accounts.find(a=>a.id===6));assert.equal(bloom.tier,2);assert.equal(bloom.risk,'Review now');
});

test('low adoption creates a service priority independently of growth score and renewal timing',async()=>{
 const {priorityFor,priorityEvidence}=await import('./data.js');
 const a=accounts.find(a=>a.id===6),original=priorityEvidence[6];
 try{
  priorityEvidence[6]={...original,risk:'Monitor',renewalDays:365,signalScore:1,timingScore:1};
  const p=priorityFor(a);assert.equal(p.retentionUrgent,true);assert.equal(p.tier,3);assert.equal(p.accountPriority,'High · restore customer value');
 }finally{priorityEvidence[6]=original;}
 assert.equal(priorityFor(accounts[0]).retentionUrgent,false);
});

test('tier changes alter actual drafts and execution, while adoption overrides expansion',async()=>{
 const {sequenceTouches,sequenceApproach}=await import('./data.js');
 const tier1=sequenceTouches(accounts[1]);assert.ok(tier1[0].content.includes('eight planned AE hires'));assert.ok(tier1[4].content.includes('ramp-readiness map'));assert.ok(tier1.every(t=>!t.template&&t.execution.startsWith('Individually')));
 const tier3=sequenceTouches(accounts[6]);assert.equal(tier3.filter(t=>t.execution==='Scheduled email · proposed').length,3);assert.ok(tier3.every(t=>t.template.includes('{{company}}')));assert.ok(tier3.filter(t=>t.channel.startsWith('LinkedIn')).every(t=>t.execution==='Queued manual LinkedIn task'));
 assert.ok(!tier3[0].content.includes(accounts[6].signal));assert.ok(sequenceTouches({...accounts[6],tier:2})[0].content.includes(accounts[6].signal));
 const lowAdoption=accounts[5];assert.match(sequenceApproach(lowAdoption).label,/Adoption first/);assert.ok(sequenceTouches(lowAdoption).every(t=>t.execution==='Account-team review required'&&t.content.includes('not a proposal to buy')));
});

test('date-filtered cohorts reconcile totals and suggestions respect the selected data',async()=>{
 const {performanceCohorts,filteredPerformance,testingSuggestion}=await import('./data.js');
 assert.deepEqual(aggregate(filteredPerformance()),aggregate(results));
 for(const r of performanceCohorts)assert.ok(r.contacted>=r.delivered&&r.delivered>=r.opens&&r.opens>=r.replies&&r.replies>=r.meetings&&r.meetings>=r.opps);
 const august=filteredPerformance({start:'2026-08-01',end:'2026-08-31'});assert.ok(aggregate(august).contacted<aggregate(results).contacted);
 assert.equal(filteredPerformance({start:'2027-01-01'}).length,0);assert.equal(filteredPerformance({start:'2026-10-01',end:'2026-08-01'}).length,0);
 const suggestion=testingSuggestion(filteredPerformance());assert.equal(suggestion.source.id,2);assert.equal(suggestion.target.id,3);assert.equal(suggestion.comparable,true);
 assert.equal(testingSuggestion(filteredPerformance({account:6})),null);
 assert.equal(accounts.filter(a=>a.acv>0).length,3);assert.equal(accounts.reduce((n,a)=>n+(a.acv||0),0),146000);
});

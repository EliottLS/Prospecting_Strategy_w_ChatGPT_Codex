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

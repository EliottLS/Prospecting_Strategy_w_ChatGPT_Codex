import test from 'node:test';
import assert from 'node:assert/strict';
import {accounts,results,aggregate} from './data.js';
test('every account has one coherent sequence cohort',()=>{assert.equal(new Set(accounts.map(a=>a.id)).size,accounts.length);assert.equal(results.length,accounts.length);for(const a of accounts){const r=results.filter(r=>r.account===a.id);assert.equal(r.length,1);const m=r[0];assert.ok(m.contacted>=m.delivered&&m.delivered>=m.opens&&m.opens>=m.replies&&m.replies>=m.meetings&&m.meetings>=m.opps);}});
test('territory potential and cohort totals reconcile',()=>{assert.equal(accounts.reduce((s,a)=>s+a.potential,0),200000);assert.equal(aggregate(results).pipeline,174000);assert.equal(aggregate(results).meetings,30);assert.equal(aggregate([]).pipeline,0);});

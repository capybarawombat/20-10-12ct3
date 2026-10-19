import { describe,it } from 'node:test';
import assert from 'node:assert/strict';
const expect=(value:unknown)=>({toBe:(other:unknown)=>assert.equal(value,other),toEqual:(other:unknown)=>assert.deepEqual(value,other),toHaveLength:(length:number)=>assert.equal((value as unknown[]).length,length)});
const vi={stubGlobal:(key:string,value:unknown)=>{Object.defineProperty(globalThis,key,{value,configurable:true});},unstubAllGlobals:()=>{Reflect.deleteProperty(globalThis,'localStorage');}};
import { reducer,initialState,KEY,type State } from '../src/hooks/useWishProgress.ts';
import { wishes,themes } from '../src/data/wishes.ts';
const tree:State={phase:'TREE',collected:[],active:null,chops:0};
describe('wish state machine',()=>{
it('opens the introduction and enters the tree',()=>{const start:State={...tree,phase:'INTRO'};expect(reducer(start,{type:'ENTER'})).toBe(start);const letter=reducer(start,{type:'OPEN_INTRO'});expect(letter.phase).toBe('INTRO_LETTER_OPEN');expect(reducer(letter,{type:'ENTER'}).phase).toBe('TREE');});
it('has exactly twenty unique editable wishes and ten themes',()=>{expect(wishes).toHaveLength(20);expect(new Set(wishes.map(w=>w.id)).size).toBe(20);expect(new Set(wishes.map(w=>w.text)).size).toBe(20);expect(new Set(wishes.map(w=>w.animationTheme)).size).toBe(themes.length);});
it('rejects invalid wish ids without entering an unreachable card state',()=>{for(const id of [0,21,1.5,NaN,Infinity])expect(reducer(tree,{type:'OPEN',id})).toBe(tree);});
it('only collects after closing and landing, prevents races',()=>{let s=reducer(tree,{type:'OPEN',id:1});expect(s.collected).toEqual([]);expect(reducer(s,{type:'OPEN',id:2})).toBe(s);expect(reducer(s,{type:'LANDED'})).toBe(s);s=reducer(s,{type:'CLOSE'});expect(s.phase).toBe('WISH_CLOSING');expect(s.collected).toEqual([]);s=reducer(s,{type:'LANDED'});expect(s.collected).toEqual([1]);expect(reducer(s,{type:'LANDED'})).toBe(s);expect(reducer(s,{type:'OPEN',id:1})).toBe(s);});
it('collects every wish, requires exactly three chops, and resets',()=>{let s=tree;expect(reducer(s,{type:'CHOP'})).toBe(s);for(const w of wishes){s=reducer(s,{type:'OPEN',id:w.id});s=reducer(s,{type:'CLOSE'});s=reducer(s,{type:'LANDED'});}expect(s.phase).toBe('ALL_COLLECTED');for(let i=1;i<=3;i++){s=reducer(s,{type:'CHOP'});expect(s.chops).toBe(i);if(i<3)expect(reducer(s,{type:'FINISH'})).toBe(s);}expect(reducer(s,{type:'CHOP'})).toBe(s);s=reducer(s,{type:'FINISH'});expect(s.phase).toBe('FINALE');expect(reducer(s,{type:'RESTART'})).toEqual({...tree,phase:'INTRO'});});
it('validates persisted data and recovers when storage is unavailable',()=>{vi.stubGlobal('localStorage',{getItem:(key:string)=>key===KEY?JSON.stringify({collected:[1,1,2,99,'4',null],finished:false}):null});expect(initialState()).toEqual({...tree,collected:[1,2]});vi.stubGlobal('localStorage',{getItem:()=>{throw new Error('blocked');}});expect(initialState().phase).toBe('INTRO');vi.unstubAllGlobals();});
});

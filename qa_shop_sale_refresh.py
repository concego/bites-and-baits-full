#!/usr/bin/env python3
"""Regression QA: successful shop sales refresh money, sell stock and buy affordance."""
from pathlib import Path
import json
import dukpy

source = Path(__file__).with_name('shop-sell-view.js').read_text()
harness = r'''
function classList() {
  var s = {};
  return {
    add: function (x) { s[x] = true; },
    remove: function () { for (var i=0;i<arguments.length;i++) delete s[arguments[i]]; },
    toggle: function (x, force) { if (force) s[x]=true; else delete s[x]; },
    contains: function (x) { return !!s[x]; }
  };
}
function El() {
  this.classList=classList(); this.textContent=''; this.innerHTML=''; this.children=[];
  this.handlers={}; this.dataset={}; this.value='1';
}
Object.defineProperty(El.prototype,'innerHTML',{get:function(){return this._html||'';},set:function(v){this._html=String(v);this.children=[];this.childrenBySelector={};}});
El.prototype.appendChild=function(x){this.children.push(x);};
El.prototype.addEventListener=function(type,fn){this.handlers[type]=fn;};
El.prototype.querySelector=function(sel){
  if(!this.childrenBySelector)this.childrenBySelector={};
  if(!this.childrenBySelector[sel]) {
    var e=new El();
    if(sel==='.btn-sell-equip') e.dataset={itemId:'rod_reinforced',sellPrice:'5'};
    this.childrenBySelector[sel]=e;
  }
  return this.childrenBySelector[sel];
};
El.prototype.click=function(){ if(this.handlers.click)this.handlers.click.call(this,{currentTarget:this}); };
var ids=['shop-feedback','sell-fish-list','sell-fish-empty','sell-baits-list','sell-baits-empty','sell-equip-list','sell-equip-empty','shop-coins'];
var dom={}; ids.forEach(function(id){dom[id]=new El();});
globalThis.document={getElementById:function(id){return dom[id]||null;},createElement:function(){return new El();}};
var checks=0;
function check(x,msg){if(!x)throw new Error(msg);checks++;}
function scenario(kind, succeeds) {
  var balance=0, fish=[{id:'fish1',fishId:'roach',nameKey:'roach',value:10}], baits={worm:1}, owned=['rod_reinforced'];
  var buyRefreshes=0, canBuy=false, calls=[];
  var inventory=()=>fish;
  var saveOptions={
    translate:function(k){return k;}, getInventory:inventory, isProtected:function(){return false;},
    getBaits:function(){return baits;}, getEquip:function(){return {};}, getOwnedEquip:function(){return owned;},
    catalog:[{id:'rod_reinforced',type:'rod',price:10,nameKey:'rod',emoji:'R'},{id:'bait_worm',type:'bait',price:10,qty:1,nameKey:'worm',emoji:'W'}],
    baitCatalog:{worm:{nameKey:'worm',emoji:'W'}}, defaults:[], coins:function(){return balance;},
    feedback:function(el,msg,ok){el.textContent=msg;},
    refreshBuy:function(){ buyRefreshes++; canBuy=balance>=10; calls.push('buy:'+balance); }
  };
  saveOptions.sellAll=function(){
    if(kind!=='all'||!succeeds)return {ok:false,reason:'no'};
    balance+=10; fish=[]; return {ok:true,count:1,earned:10};
  };
  saveOptions.sellFishQty=function(){
    if(kind!=='fish'||!succeeds)return {ok:false,reason:'no'};
    balance+=10; fish=[]; return {ok:true,sold:1,earned:10};
  };
  saveOptions.sellBaits=function(){
    if(kind!=='bait'||!succeeds)return {ok:false,reason:'no'};
    balance+=10; baits={}; return {ok:true,sold:1,earned:10};
  };
  saveOptions.sellEquip=function(){
    if(kind!=='equip'||!succeeds)return {ok:false,reason:'no'};
    balance+=10; owned=[]; return {ok:true,earned:10};
  };
  ShopSellView.render(saveOptions);
  var button;
  if(kind==='all') button=dom['sell-fish-list'].children[0];
  else if(kind==='fish') button=dom['sell-fish-list'].children[1].querySelector('.btn-sell-fish-qty');
  else if(kind==='bait') button=dom['sell-baits-list'].children[0].querySelector('.btn-sell-bait');
  else button=dom['sell-equip-list'].children[0].querySelector('.btn-sell-equip');
  button.click();
  if(succeeds){
    check(balance===10,kind+' sale increased wallet');
    check(String(dom['shop-coins'].textContent)==='10',kind+' sale updated visible wallet got='+dom['shop-coins'].textContent+' calls='+calls.join(','));
    check(buyRefreshes===1 && canBuy,kind+' sale enabled newly affordable purchase');
    check(calls[0]==='buy:10',kind+' buy list refreshed after sale');
  } else {
    check(balance===0,kind+' rejected sale left wallet unchanged');
    check(buyRefreshes===0,kind+' rejected sale did not refresh purchase list');
  }
}
scenario('all',true); scenario('fish',true); scenario('bait',true); scenario('equip',true);
scenario('fish',false); scenario('bait',false); scenario('equip',false);
JSON.stringify({checks:checks});
'''
result=json.loads(dukpy.evaljs(source+'\n'+harness))
print(f"PASS: shop sell-to-buy live refresh regression: {result['checks']} assertions across fish, bulk fish, bait, equipment and failed sales.")

var Ge=Object.defineProperty,Je=Object.defineProperties;var Ze=Object.getOwnPropertyDescriptors;var we=Object.getOwnPropertySymbols;var et=Object.prototype.hasOwnProperty,tt=Object.prototype.propertyIsEnumerable;var Ce=(e,a,i)=>a in e?Ge(e,a,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[a]=i,W=(e,a)=>{for(var i in a||(a={}))et.call(a,i)&&Ce(e,i,a[i]);if(we)for(var i of we(a))tt.call(a,i)&&Ce(e,i,a[i]);return e},ae=(e,a)=>Je(e,Ze(a));import{Q as at,a as ke}from"./QBtn.5dd18780.js";import{c as F,h as R,a as ot,b as nt,d as qe}from"./use-align.fa6ab44d.js";import{c as f,h as x,r as L,w as p,f as Te,a as fe,g as ve,l as me,j as P,n as rt,k as it,m as N,p as oe,q as _e,s as ne,t as ue,v as re,x as lt,o as ut,y as $e,z as st,A as dt,B as ct,C as ze,_ as Qe,D as V,E as j,G as _,d as C,H as ft,I as se,J as de,u as vt,K as mt,L as Be,M as Le,N as ht,O as pt,F as yt,P as gt}from"./index.537da17a.js";import{Q as bt,a as wt}from"./QLayout.d51d1469.js";import{Q as xe,a as ce,b as Ct,c as kt}from"./QItem.aa9bb720.js";import{c as qt,u as _t,a as $t,b as Bt,d as Lt,e as xt,f as Dt}from"./selection.a41fcf3b.js";import{u as St,a as Ot}from"./use-dark.11a8fb07.js";import{b as X}from"./format.a33550d6.js";import{api as Tt}from"./axios.a5422dc0.js";import"./scroll.9c684672.js";import"./index.2cf0d985.js";var zt=F({name:"QToolbarTitle",props:{shrink:Boolean},setup(e,{slots:a}){const i=f(()=>"q-toolbar__title ellipsis"+(e.shrink===!0?" col-shrink":""));return()=>x("div",{class:i.value},R(a.default))}}),Qt=F({name:"QToolbar",props:{inset:Boolean},setup(e,{slots:a}){const i=f(()=>"q-toolbar row no-wrap items-center"+(e.inset===!0?" q-toolbar--inset":""));return()=>x("div",{class:i.value},R(a.default))}}),Et=F({name:"QHeader",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,revealOffset:{type:Number,default:250},bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(e,{slots:a,emit:i}){const{proxy:{$q:c}}=ve(),t=fe(me,()=>{console.error("QHeader needs to be child of QLayout")}),o=L(parseInt(e.heightHint,10)),l=L(!0),m=f(()=>e.reveal===!0||t.view.value.indexOf("H")>-1||c.platform.is.ios&&t.isContainer.value===!0),v=f(()=>{if(e.modelValue!==!0)return 0;if(m.value===!0)return l.value===!0?o.value:0;const s=o.value-t.scroll.value.position;return s>0?s:0}),r=f(()=>e.modelValue!==!0||m.value===!0&&l.value!==!0),$=f(()=>e.modelValue===!0&&r.value===!0&&e.reveal===!0),k=f(()=>"q-header q-layout__section--marginal "+(m.value===!0?"fixed":"absolute")+"-top"+(e.bordered===!0?" q-header--bordered":"")+(r.value===!0?" q-header--hidden":"")+(e.modelValue!==!0?" q-layout--prevent-focus":"")),g=f(()=>{const s=t.rows.value.top,B={};return s[0]==="l"&&t.left.space===!0&&(B[c.lang.rtl===!0?"right":"left"]=`${t.left.size}px`),s[2]==="r"&&t.right.space===!0&&(B[c.lang.rtl===!0?"left":"right"]=`${t.right.size}px`),B});function u(s,B){t.update("header",s,B)}function y(s,B){s.value!==B&&(s.value=B)}function b({height:s}){y(o,s),u("size",s)}function h(s){$.value===!0&&y(l,!0),i("focusin",s)}p(()=>e.modelValue,s=>{u("space",s),y(l,!0),t.animate()}),p(v,s=>{u("offset",s)}),p(()=>e.reveal,s=>{s===!1&&y(l,e.modelValue)}),p(l,s=>{t.animate(),i("reveal",s)}),p(t.scroll,s=>{e.reveal===!0&&y(l,s.direction==="up"||s.position<=e.revealOffset||s.position-s.inflectionPoint<100)});const Q={};return t.instances.header=Q,e.modelValue===!0&&u("size",o.value),u("space",e.modelValue),u("offset",v.value),Te(()=>{t.instances.header===Q&&(t.instances.header=void 0,u("size",0),u("offset",0),u("space",!1))}),()=>{const s=ot(a.default,[]);return e.elevated===!0&&s.push(x("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),s.push(x(bt,{debounce:0,onResize:b})),x("header",{class:k.value,style:g.value,onFocusin:h},s)}}});const he={left:!0,right:!0,up:!0,down:!0,horizontal:!0,vertical:!0},Mt=Object.keys(he);he.all=!0;function De(e){const a={};for(const i of Mt)e[i]===!0&&(a[i]=!0);return Object.keys(a).length===0?he:(a.horizontal===!0?a.left=a.right=!0:a.left===!0&&a.right===!0&&(a.horizontal=!0),a.vertical===!0?a.up=a.down=!0:a.up===!0&&a.down===!0&&(a.vertical=!0),a.horizontal===!0&&a.vertical===!0&&(a.all=!0),a)}function Se(e,a){return a.event===void 0&&e.target!==void 0&&e.target.draggable!==!0&&typeof a.handler=="function"&&e.target.nodeName.toUpperCase()!=="INPUT"&&(e.qClonedBy===void 0||e.qClonedBy.indexOf(a.uid)===-1)}function ie(e,a,i){const c=ue(e);let t,o=c.left-a.event.x,l=c.top-a.event.y,m=Math.abs(o),v=Math.abs(l);const r=a.direction;r.horizontal===!0&&r.vertical!==!0?t=o<0?"left":"right":r.horizontal!==!0&&r.vertical===!0?t=l<0?"up":"down":r.up===!0&&l<0?(t="up",m>v&&(r.left===!0&&o<0?t="left":r.right===!0&&o>0&&(t="right"))):r.down===!0&&l>0?(t="down",m>v&&(r.left===!0&&o<0?t="left":r.right===!0&&o>0&&(t="right"))):r.left===!0&&o<0?(t="left",m<v&&(r.up===!0&&l<0?t="up":r.down===!0&&l>0&&(t="down"))):r.right===!0&&o>0&&(t="right",m<v&&(r.up===!0&&l<0?t="up":r.down===!0&&l>0&&(t="down")));let $=!1;if(t===void 0&&i===!1){if(a.event.isFirst===!0||a.event.lastDir===void 0)return{};t=a.event.lastDir,$=!0,t==="left"||t==="right"?(c.left-=o,m=0,o=0):(c.top-=l,v=0,l=0)}return{synthetic:$,payload:{evt:e,touch:a.event.mouse!==!0,mouse:a.event.mouse===!0,position:c,direction:t,isFirst:a.event.isFirst,isFinal:i===!0,duration:Date.now()-a.event.time,distance:{x:m,y:v},offset:{x:o,y:l},delta:{x:c.left-a.event.lastX,y:c.top-a.event.lastY}}}}let Pt=0;var le=nt({name:"touch-pan",beforeMount(e,{value:a,modifiers:i}){if(i.mouse!==!0&&P.has.touch!==!0)return;function c(o,l){i.mouse===!0&&l===!0?lt(o):(i.stop===!0&&ne(o),i.prevent===!0&&_e(o))}const t={uid:"qvtp_"+Pt++,handler:a,modifiers:i,direction:De(i),noop:rt,mouseStart(o){Se(o,t)&&it(o)&&(N(t,"temp",[[document,"mousemove","move","notPassiveCapture"],[document,"mouseup","end","passiveCapture"]]),t.start(o,!0))},touchStart(o){if(Se(o,t)){const l=o.target;N(t,"temp",[[l,"touchmove","move","notPassiveCapture"],[l,"touchcancel","end","passiveCapture"],[l,"touchend","end","passiveCapture"]]),t.start(o)}},start(o,l){if(P.is.firefox===!0&&oe(e,!0),t.lastEvt=o,l===!0||i.stop===!0){if(t.direction.all!==!0&&(l!==!0||t.modifiers.mouseAllDir!==!0)){const r=o.type.indexOf("mouse")>-1?new MouseEvent(o.type,o):new TouchEvent(o.type,o);o.defaultPrevented===!0&&_e(r),o.cancelBubble===!0&&ne(r),Object.assign(r,{qKeyEvent:o.qKeyEvent,qClickOutside:o.qClickOutside,qAnchorHandled:o.qAnchorHandled,qClonedBy:o.qClonedBy===void 0?[t.uid]:o.qClonedBy.concat(t.uid)}),t.initialEvent={target:o.target,event:r}}ne(o)}const{left:m,top:v}=ue(o);t.event={x:m,y:v,time:Date.now(),mouse:l===!0,detected:!1,isFirst:!0,isFinal:!1,lastX:m,lastY:v}},move(o){if(t.event===void 0)return;const l=ue(o),m=l.left-t.event.x,v=l.top-t.event.y;if(m===0&&v===0)return;t.lastEvt=o;const r=t.event.mouse===!0,$=()=>{c(o,r),i.preserveCursor!==!0&&(document.documentElement.style.cursor="grabbing"),r===!0&&document.body.classList.add("no-pointer-events--children"),document.body.classList.add("non-selectable"),qt(),t.styleCleanup=u=>{if(t.styleCleanup=void 0,i.preserveCursor!==!0&&(document.documentElement.style.cursor=""),document.body.classList.remove("non-selectable"),r===!0){const y=()=>{document.body.classList.remove("no-pointer-events--children")};u!==void 0?setTimeout(()=>{y(),u()},50):y()}else u!==void 0&&u()}};if(t.event.detected===!0){t.event.isFirst!==!0&&c(o,t.event.mouse);const{payload:u,synthetic:y}=ie(o,t,!1);u!==void 0&&(t.handler(u)===!1?t.end(o):(t.styleCleanup===void 0&&t.event.isFirst===!0&&$(),t.event.lastX=u.position.left,t.event.lastY=u.position.top,t.event.lastDir=y===!0?void 0:u.direction,t.event.isFirst=!1));return}if(t.direction.all===!0||r===!0&&t.modifiers.mouseAllDir===!0){$(),t.event.detected=!0,t.move(o);return}const k=Math.abs(m),g=Math.abs(v);k!==g&&(t.direction.horizontal===!0&&k>g||t.direction.vertical===!0&&k<g||t.direction.up===!0&&k<g&&v<0||t.direction.down===!0&&k<g&&v>0||t.direction.left===!0&&k>g&&m<0||t.direction.right===!0&&k>g&&m>0?(t.event.detected=!0,t.move(o)):t.end(o,!0))},end(o,l){if(t.event!==void 0){if(re(t,"temp"),P.is.firefox===!0&&oe(e,!1),l===!0)t.styleCleanup!==void 0&&t.styleCleanup(),t.event.detected!==!0&&t.initialEvent!==void 0&&t.initialEvent.target.dispatchEvent(t.initialEvent.event);else if(t.event.detected===!0){t.event.isFirst===!0&&t.handler(ie(o===void 0?t.lastEvt:o,t).payload);const{payload:m}=ie(o===void 0?t.lastEvt:o,t,!0),v=()=>{t.handler(m)};t.styleCleanup!==void 0?t.styleCleanup(v):v()}t.event=void 0,t.initialEvent=void 0,t.lastEvt=void 0}}};e.__qtouchpan=t,i.mouse===!0&&N(t,"main",[[e,"mousedown","mouseStart",`passive${i.mouseCapture===!0?"Capture":""}`]]),P.has.touch===!0&&N(t,"main",[[e,"touchstart","touchStart",`passive${i.capture===!0?"Capture":""}`],[e,"touchmove","noop","notPassiveCapture"]])},updated(e,a){const i=e.__qtouchpan;i!==void 0&&(a.oldValue!==a.value&&(typeof value!="function"&&i.end(),i.handler=a.value),i.direction=De(a.modifiers))},beforeUnmount(e){const a=e.__qtouchpan;a!==void 0&&(a.event!==void 0&&a.end(),re(a,"main"),re(a,"temp"),P.is.firefox===!0&&oe(e,!1),a.styleCleanup!==void 0&&a.styleCleanup(),delete e.__qtouchpan)}});const Oe=150;var Vt=F({name:"QDrawer",inheritAttrs:!1,props:ae(W(W({},_t),St),{side:{type:String,default:"left",validator:e=>["left","right"].includes(e)},width:{type:Number,default:300},mini:Boolean,miniToOverlay:Boolean,miniWidth:{type:Number,default:57},breakpoint:{type:Number,default:1023},showIfAbove:Boolean,behavior:{type:String,validator:e=>["default","desktop","mobile"].includes(e),default:"default"},bordered:Boolean,elevated:Boolean,overlay:Boolean,persistent:Boolean,noSwipeOpen:Boolean,noSwipeClose:Boolean,noSwipeBackdrop:Boolean}),emits:[...$t,"on-layout","mini-state"],setup(e,{slots:a,emit:i,attrs:c}){const t=ve(),{proxy:{$q:o}}=t,l=Ot(e,o),{preventBodyScroll:m}=Dt(),{registerTimeout:v}=Bt(),r=fe(me,()=>{console.error("QDrawer needs to be child of QLayout")});let $,k,g;const u=L(e.behavior==="mobile"||e.behavior!=="desktop"&&r.totalWidth.value<=e.breakpoint),y=f(()=>e.mini===!0&&u.value!==!0),b=f(()=>y.value===!0?e.miniWidth:e.width),h=L(e.showIfAbove===!0&&u.value===!1?!0:e.modelValue===!0),Q=f(()=>e.persistent!==!0&&(u.value===!0||Pe.value===!0));function s(n,d){if(Ee(),n!==!1&&r.animate(),q(0),u.value===!0){const w=r.instances[I.value];w!==void 0&&w.belowBreakpoint===!0&&w.hide(!1),S(1),r.isContainer.value!==!0&&m(!0)}else S(0),n!==!1&&Z(!1);v(()=>{n!==!1&&Z(!0),d!==!0&&i("show",n)},Oe)}function B(n,d){Me(),n!==!1&&r.animate(),S(0),q(T.value*b.value),ee(),d!==!0&&v(()=>{i("hide",n)},Oe)}const{show:U,hide:E}=Lt({showing:h,hideOnRouteChange:Q,handleShow:s,handleHide:B}),{addToHistory:Ee,removeFromHistory:Me}=xt(h,E,Q),A={belowBreakpoint:u,hide:E},D=f(()=>e.side==="right"),T=f(()=>(o.lang.rtl===!0?-1:1)*(D.value===!0?1:-1)),pe=L(0),z=L(!1),Y=L(!1),ye=L(b.value*T.value),I=f(()=>D.value===!0?"left":"right"),K=f(()=>h.value===!0&&u.value===!1&&e.overlay===!1?e.miniToOverlay===!0?e.miniWidth:b.value:0),G=f(()=>e.overlay===!0||e.miniToOverlay===!0||r.view.value.indexOf(D.value?"R":"L")>-1||o.platform.is.ios===!0&&r.isContainer.value===!0),M=f(()=>e.overlay===!1&&h.value===!0&&u.value===!1),Pe=f(()=>e.overlay===!0&&h.value===!0&&u.value===!1),Ve=f(()=>"fullscreen q-drawer__backdrop"+(h.value===!1&&z.value===!1?" hidden":"")),Fe=f(()=>({backgroundColor:`rgba(0,0,0,${pe.value*.4})`})),ge=f(()=>D.value===!0?r.rows.value.top[2]==="r":r.rows.value.top[0]==="l"),Ae=f(()=>D.value===!0?r.rows.value.bottom[2]==="r":r.rows.value.bottom[0]==="l"),Ie=f(()=>{const n={};return r.header.space===!0&&ge.value===!1&&(G.value===!0?n.top=`${r.header.offset}px`:r.header.space===!0&&(n.top=`${r.header.size}px`)),r.footer.space===!0&&Ae.value===!1&&(G.value===!0?n.bottom=`${r.footer.offset}px`:r.footer.space===!0&&(n.bottom=`${r.footer.size}px`)),n}),He=f(()=>{const n={width:`${b.value}px`,transform:`translateX(${ye.value}px)`};return u.value===!0?n:Object.assign(n,Ie.value)}),We=f(()=>"q-drawer__content fit "+(r.isContainer.value!==!0?"scroll":"overflow-auto")),Ne=f(()=>`q-drawer q-drawer--${e.side}`+(Y.value===!0?" q-drawer--mini-animate":"")+(e.bordered===!0?" q-drawer--bordered":"")+(l.value===!0?" q-drawer--dark q-dark":"")+(z.value===!0?" no-transition":h.value===!0?"":" q-layout--prevent-focus")+(u.value===!0?" fixed q-drawer--on-top q-drawer--mobile q-drawer--top-padding":` q-drawer--${y.value===!0?"mini":"standard"}`+(G.value===!0||M.value!==!0?" fixed":"")+(e.overlay===!0||e.miniToOverlay===!0?" q-drawer--on-top":"")+(ge.value===!0?" q-drawer--top-padding":""))),Xe=f(()=>{const n=o.lang.rtl===!0?e.side:I.value;return[[le,Ye,void 0,{[n]:!0,mouse:!0}]]}),je=f(()=>{const n=o.lang.rtl===!0?I.value:e.side;return[[le,be,void 0,{[n]:!0,mouse:!0}]]}),Re=f(()=>{const n=o.lang.rtl===!0?I.value:e.side;return[[le,be,void 0,{[n]:!0,mouse:!0,mouseAllDir:!0}]]});function J(){Ke(u,e.behavior==="mobile"||e.behavior!=="desktop"&&r.totalWidth.value<=e.breakpoint)}p(u,n=>{n===!0?($=h.value,h.value===!0&&E(!1)):e.overlay===!1&&e.behavior!=="mobile"&&$!==!1&&(h.value===!0?(q(0),S(0),ee()):U(!1))}),p(()=>e.side,(n,d)=>{r.instances[d]===A&&(r.instances[d]=void 0,r[d].space=!1,r[d].offset=0),r.instances[n]=A,r[n].size=b.value,r[n].space=M.value,r[n].offset=K.value}),p(r.totalWidth,()=>{(r.isContainer.value===!0||document.qScrollPrevented!==!0)&&J()}),p(()=>e.behavior+e.breakpoint,J),p(r.isContainer,n=>{h.value===!0&&m(n!==!0),n===!0&&J()}),p(r.scrollbarWidth,()=>{q(h.value===!0?0:void 0)}),p(K,n=>{O("offset",n)}),p(M,n=>{i("on-layout",n),O("space",n)}),p(D,()=>{q()}),p(b,n=>{q(),te(e.miniToOverlay,n)}),p(()=>e.miniToOverlay,n=>{te(n,b.value)}),p(()=>o.lang.rtl,()=>{q()}),p(()=>e.mini,()=>{e.modelValue===!0&&(Ue(),r.animate())}),p(y,n=>{i("mini-state",n)});function q(n){n===void 0?$e(()=>{n=h.value===!0?0:b.value,q(T.value*n)}):(r.isContainer.value===!0&&D.value===!0&&(u.value===!0||Math.abs(n)===b.value)&&(n+=T.value*r.scrollbarWidth.value),ye.value=n)}function S(n){pe.value=n}function Z(n){const d=n===!0?"remove":r.isContainer.value!==!0?"add":"";d!==""&&document.body.classList[d]("q-body--drawer-toggle")}function Ue(){clearTimeout(k),t.proxy&&t.proxy.$el&&t.proxy.$el.classList.add("q-drawer--mini-animate"),Y.value=!0,k=setTimeout(()=>{Y.value=!1,t&&t.proxy&&t.proxy.$el&&t.proxy.$el.classList.remove("q-drawer--mini-animate")},150)}function Ye(n){if(h.value!==!1)return;const d=b.value,w=X(n.distance.x,0,d);if(n.isFinal===!0){w>=Math.min(75,d)===!0?U():(r.animate(),S(0),q(T.value*d)),z.value=!1;return}q((o.lang.rtl===!0?D.value!==!0:D.value)?Math.max(d-w,0):Math.min(0,w-d)),S(X(w/d,0,1)),n.isFirst===!0&&(z.value=!0)}function be(n){if(h.value!==!0)return;const d=b.value,w=n.direction===e.side,H=(o.lang.rtl===!0?w!==!0:w)?X(n.distance.x,0,d):0;if(n.isFinal===!0){Math.abs(H)<Math.min(75,d)===!0?(r.animate(),S(1),q(0)):E(),z.value=!1;return}q(T.value*H),S(X(1-H/d,0,1)),n.isFirst===!0&&(z.value=!0)}function ee(){m(!1),Z(!0)}function O(n,d){r.update(e.side,n,d)}function Ke(n,d){n.value!==d&&(n.value=d)}function te(n,d){O("size",n===!0?e.miniWidth:d)}return r.instances[e.side]=A,te(e.miniToOverlay,b.value),O("space",M.value),O("offset",K.value),e.showIfAbove===!0&&e.modelValue!==!0&&h.value===!0&&e["onUpdate:modelValue"]!==void 0&&i("update:modelValue",!0),ut(()=>{i("on-layout",M.value),i("mini-state",y.value),$=e.showIfAbove===!0;const n=()=>{(h.value===!0?s:B)(!1,!0)};if(r.totalWidth.value!==0){$e(n);return}g=p(r.totalWidth,()=>{g(),g=void 0,h.value===!1&&e.showIfAbove===!0&&u.value===!1?U(!1):n()})}),Te(()=>{g!==void 0&&g(),clearTimeout(k),h.value===!0&&ee(),r.instances[e.side]===A&&(r.instances[e.side]=void 0,O("size",0),O("offset",0),O("space",!1))}),()=>{const n=[];u.value===!0&&(e.noSwipeOpen===!1&&n.push(st(x("div",{key:"open",class:`q-drawer__opener fixed-${e.side}`,"aria-hidden":"true"}),Xe.value)),n.push(qe("div",{ref:"backdrop",class:Ve.value,style:Fe.value,"aria-hidden":"true",onClick:E},void 0,"backdrop",e.noSwipeBackdrop!==!0&&h.value===!0,()=>Re.value)));const d=y.value===!0&&a.mini!==void 0,w=[x("div",ae(W({},c),{key:""+d,class:[We.value,c.class]}),d===!0?a.mini():R(a.default))];return e.elevated===!0&&h.value===!0&&w.push(x("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),n.push(qe("aside",{ref:"content",class:Ne.value,style:He.value},w,"contentclose",e.noSwipeClose!==!0&&u.value===!0,()=>je.value)),x("div",{class:"q-drawer-container"},n)}}}),Ft=F({name:"QPageContainer",setup(e,{slots:a}){const{proxy:{$q:i}}=ve(),c=fe(me,()=>{console.error("QPageContainer needs to be child of QLayout")});dt(ct,!0);const t=f(()=>{const o={};return c.header.space===!0&&(o.paddingTop=`${c.header.size}px`),c.right.space===!0&&(o[`padding${i.lang.rtl===!0?"Left":"Right"}`]=`${c.right.size}px`),c.footer.space===!0&&(o.paddingBottom=`${c.footer.size}px`),c.left.space===!0&&(o[`padding${i.lang.rtl===!0?"Right":"Left"}`]=`${c.left.size}px`),o});return()=>x("div",{class:"q-page-container",style:t.value},R(a.default))}});const At=ze({name:"EssentialLink",props:{title:{type:String,required:!0},caption:{type:String,default:""},link:{type:String,default:"#"},icon:{type:String,default:""}}});function It(e,a,i,c,t,o){return V(),j(Ct,{clickable:"",tag:"a",href:e.link},{default:_(()=>[e.icon?(V(),j(xe,{key:0,avatar:""},{default:_(()=>[C(at,{name:e.icon},null,8,["name"])]),_:1})):ft("",!0),C(xe,null,{default:_(()=>[C(ce,null,{default:_(()=>[se(de(e.title),1)]),_:1}),C(ce,{caption:""},{default:_(()=>[se(de(e.caption),1)]),_:1})]),_:1})]),_:1},8,["href"])}var Ht=Qe(At,[["render",It]]);const Wt=[{title:"\u8A8D\u53EF\u6A5F\u80FD\u306E\u8A2D\u5B9A",caption:"",icon:"settings",link:"#settings"},{title:"\u8A8D\u53EF\u4E00\u89A7",caption:"",icon:"view_list",link:"#list"},{title:"\u8A8D\u53EF\u767B\u9332",caption:"",icon:"add",link:"#register"}],Nt=ze({name:"MainLayout",components:{EssentialLink:Ht},setup(){const e=mt(),a=vt(),i=L(!1);let c=L("");p(()=>a.cadde_user_id,(o,l)=>{c.value=o||"-"});function t(){let o={};o.cadde_user_id="",a.updateLoginInfo(o),Tt.get("/cadde/api/v4/ui/logout").then(l=>{console.log("\u30ED\u30B0\u30A2\u30A6\u30C8\u30EC\u30B9\u30DD\u30F3\u30B9",l)}).catch(l=>{console.log("\u30ED\u30B0\u30A2\u30A6\u30C8\u30A8\u30E9\u30FC",l),this.confirmDialog.isDisplay=!0,this.confirmDialog.status=l.response.status+" "+l.response.statusText,this.confirmDialog.message=l.response.data.msg}),e.push({path:"/"})}return{essentialLinks:Wt,leftDrawerOpen:i,login_name:c,logout:t,toggleLeftDrawer(){i.value=!i.value}}}}),Xt=se(" \u8A8D\u53EF\u6A5F\u80FD "),jt={class:"q-px-md"};function Rt(e,a,i,c,t,o){const l=Be("EssentialLink"),m=Be("router-view");return V(),j(wt,{view:"lHh Lpr lFf"},{default:_(()=>[C(Et,{elevated:""},{default:_(()=>[C(Qt,null,{default:_(()=>[C(ke,{flat:"",dense:"",round:"",icon:"menu","aria-label":"Menu",onClick:e.toggleLeftDrawer},null,8,["onClick"]),C(zt,null,{default:_(()=>[Xt]),_:1}),Le("div",jt,"Login : "+de(e.login_name),1),Le("div",null,[C(ke,{outline:"",size:"md",style:{color:"rgb(86, 15, 240)"},color:"primary",onClick:a[0]||(a[0]=v=>e.logout()),class:"full-width text-white",label:"\u30ED\u30B0\u30A2\u30A6\u30C8"})])]),_:1})]),_:1}),C(Vt,{modelValue:e.leftDrawerOpen,"onUpdate:modelValue":a[1]||(a[1]=v=>e.leftDrawerOpen=v),"show-if-above":"",bordered:""},{default:_(()=>[C(kt,null,{default:_(()=>[C(ce,{header:""}),(V(!0),ht(yt,null,pt(e.essentialLinks,v=>(V(),j(l,gt({key:v.title},v),null,16))),128))]),_:1})]),_:1},8,["modelValue"]),C(Ft,null,{default:_(()=>[C(m)]),_:1})]),_:1})}var la=Qe(Nt,[["render",Rt]]);export{la as default};

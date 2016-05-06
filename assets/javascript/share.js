function twitter() {
  window.twttr=window.twttr||{};var D=550,A=450,C=screen.height,B=screen.width,H=Math.round((B/2)-(D/2)),G=0,F=document,E;if(C>A){G=Math.round((C/2)-(A/2))}window.twttr.shareWin=window.open('httpse://twitter.com/share','','left='+H+',top='+G+',width='+D+',height='+A+',personalbar=0,toolbar=0,scrollbars=1,resizable=1');E=F.createElement('script');E.src='https://platform.twitter.com/bookmarklets/share.js?v=1';F.getElementsByTagName('head')[0].appendChild(E);
}
function pocket() {
  var e=function(t,n,r,i,s){var o=[4480503,6888216,5438817,1715529,3576108,2507148,6862136,1369812,2557725,6179118];var i=i||0,u=0,n=n||[],r=r||0,s=s||0;var a={'a':97,'b':98,'c':99,'d':100,'e':101,'f':102,'g':103,'h':104,'i':105,'j':106,'k':107,'l':108,'m':109,'n':110,'o':111,'p':112,'q':113,'r':114,'s':115,'t':116,'u':117,'v':118,'w':119,'x':120,'y':121,'z':122,'A':65,'B':66,'C':67,'D':68,'E':69,'F':70,'G':71,'H':72,'I':73,'J':74,'K':75,'L':76,'M':77,'N':78,'O':79,'P':80,'Q':81,'R':82,'S':83,'T':84,'U':85,'V':86,'W':87,'X':88,'Y':89,'Z':90,'0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'\/':47,':':58,'?':63,'=':61,'-':45,'_':95,'&':38,'$':36,'!':33,'.':46};if(!s||s==0){t=o[0]+t}for(var f=0;f<t.length;f++){var l=function(e,t){return a[e[t]]?a[e[t]]:e.charCodeAt(t)}(t,f);if(!l*1)l=3;var c=l*(o[i]+l*o[u%o.length]);n[r]=(n[r]?n[r]+c:c)+s+u;var p=c%(50*1);if(n[p]){var d=n[r];n[r]=n[p];n[p]=d}u+=c;r=r==50?0:r+1;i=i==o.length-1?0:i+1}if(s==148){var v='';for(var f=0;f<n.length;f++){v+=String.fromCharCode(n[f]%(25*1)+97)}o=function(){};return v+'eb1b8b4bd7'}else{return e(u+'',n,r,i,s+1)}};var t=document,n=t.location.href,r=t.title;var i=e(n);var s=t.createElement('script');s.type='text/javascript';s.src='https://getpocket.com/b/r4.js?h='+i+'&u='+encodeURIComponent(n)+'&t='+encodeURIComponent(r);e=i=function(){};var o=t.getElementsByTagName('head')[0]||t.documentElement;o.appendChild(s)
}
var SHARE_PROVIDERS = {
  "pocket": function() { pocket(); },
  "twitter": function() { twitter(); },
  "facebook": "https://www.facebook.com/share.php?src=bm&v=4&i=1462529243&u={0}&t={1}",
  "googleplus": "https://plus.google.com/share?url={0}",
  "linkedin": "//www.linkedin.com/shareArticle?mini=true&ro=false&trk=bookmarklet&title={1}&url={0}",
  "hackernews": "//news.ycombinator.com/submitlink?u={0}&t={1}",
  "reddit": "//www.reddit.com/submit?url={0}&title={1}"
};
function share(provider) {
  if (typeof provider === 'function') { provider(); return; }
  window.open(provider
    .replace("{0}", encodeURIComponent(document.location))
    .replace("{1}", encodeURIComponent(document.title)),
    '', 'menubar=no,location=no,status=no');
};
$("[data-share-target]").click(function(evt) {
  evt.preventDefault();
  share(SHARE_PROVIDERS[$(this).attr("data-share-target")]);
});
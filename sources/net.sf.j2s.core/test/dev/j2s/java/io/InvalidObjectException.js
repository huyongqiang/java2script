Clazz.load (["java.io.ObjectStreamException"], "java.io.InvalidObjectException", null, function () {
;
(function(){var C$ = Clazz.decorateAsClass (function () {
Clazz.newInstance$ (this, arguments);
}, java.io, "InvalidObjectException", java.io.ObjectStreamException);

Clazz.newMethod$(C$, '$init$', function () {
}, 1);

Clazz.newMethod$ (C$, 'construct$S', function (detailMessage) {
C$.superClazz.construct$S.apply(this, [detailMessage]);
C$.$init$.apply(this);
}, 1);

Clazz.newMethod$(C$, 'construct', function () {Clazz.super$(C$, this);
C$.$init$.apply(this);
},true);
})()
});

//Created 2017-08-08 06:13:41

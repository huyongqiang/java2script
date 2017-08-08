Clazz.load (["java.io.Closeable", "java.lang.Readable"], "java.io.Reader", ["java.io.IOException", "java.lang.IllegalArgumentException", "$.NullPointerException"], function () {
;
(function(){var C$ = Clazz.decorateAsClass (function () {
Clazz.newInstance$ (this, arguments);
}, java.io, "Reader", null, [Readable, java.io.Closeable]);

Clazz.newMethod$(C$, '$init$', function () {
this.lock = null;
}, 1);

Clazz.newMethod$ (C$, 'construct', function () {
this.lock = this;
}, 1);

Clazz.newMethod$ (C$, 'construct$O', function (lock) {
C$.$init$.apply(this);
if (lock != null) this.lock = lock;
 else throw Clazz.$new(NullPointerException.construct);
}, 1);

Clazz.newMethod$ (C$, 'mark$I', function (readLimit) {
throw Clazz.$new(java.io.IOException.construct);
});

Clazz.newMethod$ (C$, 'markSupported', function () {
return false;
});

Clazz.newMethod$ (C$, 'read', function () {
{
var charArray =  Clazz.newCharArray (1, '\0');
if (this.read$charA$I$I (charArray, 0, 1) != -1) return charArray[0];
return -1;
}});

Clazz.newMethod$ (C$, 'read$charA', function (buf) {
return this.read$charA$I$I (buf, 0, buf.length);
});

Clazz.newMethod$ (C$, 'ready', function () {
return false;
});

Clazz.newMethod$ (C$, 'reset', function () {
throw Clazz.$new(java.io.IOException.construct);
});

Clazz.newMethod$ (C$, 'skip$L', function (count) {
if (count >= 0) {
{
var skipped = 0;
var toRead = count < 512 ? count : 512;
var charsSkipped =  Clazz.newCharArray (toRead, '\0');
while (skipped < count) {
var read = this.read$charA$I$I (charsSkipped, 0, toRead);
if (read == -1) {
return skipped;
}skipped += read;
if (read < toRead) {
return skipped;
}if (count - skipped < toRead) {
toRead = (count - skipped);
}}
return skipped;
}}throw Clazz.$new(IllegalArgumentException.construct);
});

Clazz.newMethod$ (C$, 'read$java_nio_CharBuffer', function (target) {
if (null == target) {
throw Clazz.$new(NullPointerException.construct);
}var length = target.length ();
var buf =  Clazz.newCharArray (length, '\0');
length = Math.min (length, this.read$charA (buf));
if (length > 0) {
target.put$charA$I$I (buf, 0, length);
}return length;
});
})()
});

//Created 2017-08-08 06:13:42

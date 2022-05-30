/*!
 *  howler.js v1.1.26
 *  howlerjs.com
 *
 *  (c) 2013-2015, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
(function() {
  var n = {},
    g = null,
    l = !0,
    q = !1;
  try {
    "undefined" !== typeof AudioContext
      ? (g = new AudioContext())
      : "undefined" !== typeof webkitAudioContext
      ? (g = new webkitAudioContext())
      : (l = !1);
  } catch (z) {
    l = !1;
  }
  if (!l)
    if ("undefined" !== typeof Audio)
      try {
        new Audio();
      } catch (A) {
        q = !0;
      }
    else q = !0;
  if (l) {
    var p = "undefined" === typeof g.createGain ? g.createGainNode() : g.createGain();
    p.gain.value = 1;
    p.connect(g.destination);
  }
  var t = function(a) {
    this._volume = 1;
    this._muted = !1;
    this.usingWebAudio = l;
    this.ctx = g;
    this.noAudio = q;
    this._howls = [];
    this._codecs = a;
    this.iOSAutoEnable = !0;
  };
  t.prototype = {
    volume: function(a) {
      a = parseFloat(a);
      if (0 <= a && 1 >= a) {
        this._volume = a;
        l && (p.gain.value = a);
        for (var b in this._howls)
          if (this._howls.hasOwnProperty(b) && !1 === this._howls[b]._webAudio)
            for (a = 0; a < this._howls[b]._audioNode.length; a++)
              this._howls[b]._audioNode[a].volume =
                this._howls[b]._volume * this._volume;
        return this;
      }
      return l ? p.gain.value : this._volume;
    },
    mute: function() {
      this._setMuted(!0);
      return this;
    },
    unmute: function() {
      this._setMuted(!1);
      return this;
    },
    _setMuted: function(a) {
      this._muted = a;
      l && (p.gain.value = a ? 0 : this._volume);
      for (var b in this._howls)
        if (this._howls.hasOwnProperty(b) && !1 === this._howls[b]._webAudio)
          for (var c = 0; c < this._howls[b]._audioNode.length; c++)
            this._howls[b]._audioNode[c].muted = a;
    },
    codecs: function(a) {
      return this._codecs[a];
    },
    _enableiOSAudio: function() {
      var a = this;
      if (!g || (!a._iOSEnabled && /iPhone|iPad|iPod/i.test(navigator.userAgent))) {
        a._iOSEnabled = !1;
        var b = function() {
          var c = g.createBuffer(1, 1, 22050),
            d = g.createBufferSource();
          d.buffer = c;
          d.connect(g.destination);
          "undefined" === typeof d.start ? d.noteOn(0) : d.start(0);
          setTimeout(function() {
            if (
              d.playbackState === d.PLAYING_STATE ||
              d.playbackState === d.FINISHED_STATE
            )
              (a._iOSEnabled = !0),
                (a.iOSAutoEnable = !1),
                window.removeEventListener("touchstart", b, !1);
          }, 0);
        };
        window.addEventListener("touchstart", b, !1);
        return a;
      }
    }
  };
  var h = null,
    u = {};
  q ||
    ((h = new Audio()),
    (u = {
      mp3: !!h.canPlayType("audio/mpeg;").replace(/^no$/, ""),
      opus: !!h.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
      ogg: !!h.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
      wav: !!h.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
      aac: !!h.canPlayType("audio/aac;").replace(/^no$/, ""),
      m4a: !!(
        h.canPlayType("audio/x-m4a;") ||
        h.canPlayType("audio/m4a;") ||
        h.canPlayType("audio/aac;")
      ).replace(/^no$/, ""),
      mp4: !!(
        h.canPlayType("audio/x-mp4;") ||
        h.canPlayType("audio/mp4;") ||
        h.canPlayType("audio/aac;")
      ).replace(/^no$/, ""),
      weba: !!h.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")
    }));
  var k = new t(u),
    r = function(a) {
      this._autoplay = a.autoplay || !1;
      this._buffer = a.buffer || !1;
      this._duration = a.duration || 0;
      this._format = a.format || null;
      this._loop = a.loop || !1;
      this._loaded = !1;
      this._sprite = a.sprite || {};
      this._src = a.src || "";
      this._pos3d = a.pos3d || [0, 0, -0.5];
      this._volume = void 0 !== a.volume ? a.volume : 1;
      this._urls = a.urls || [];
      this._rate = a.rate || 1;
      this._model = a.model || null;
      this._onload = [a.onload || function() {}];
      this._onloaderror = [a.onloaderror || function() {}];
      this._onend = [a.onend || function() {}];
      this._onpause = [a.onpause || function() {}];
      this._onplay = [a.onplay || function() {}];
      this._onendTimer = [];
      this._webAudio = l && !this._buffer;
      this._audioNode = [];
      this._webAudio && this._setupAudioNode();
      "undefined" !== typeof g && g && k.iOSAutoEnable && k._enableiOSAudio();
      k._howls.push(this);
      this.load();
    };
  r.prototype = {
    load: function() {
      var a = this,
        b = null;
      if (!q) {
        for (var c = 0; c < a._urls.length; c++) {
          var d, e;
          if (a._format) d = a._format;
          else if (
            ((e = a._urls[c]),
            (d = /^data:audio\/([^;,]+);/i.exec(e)) ||
              (d = /\.([^.]+)$/.exec(e.split("?", 1)[0])),
            d)
          )
            d = d[1].toLowerCase();
          else {
            a.on("loaderror");
            return;
          }
          if (u[d]) {
            b = a._urls[c];
            break;
          }
        }
        if (b) {
          a._src = b;
          if (a._webAudio) x(a, b);
          else {
            var f = new Audio();
            f.addEventListener(
              "error",
              function() {
                f.error && 4 === f.error.code && (t.noAudio = !0);
                a.on("loaderror", { type: f.error ? f.error.code : 0 });
              },
              !1
            );
            a._audioNode.push(f);
            f.src = b;
            f._pos = 0;
            f.preload = "auto";
            f.volume = k._muted ? 0 : a._volume * k.volume();
            var g = function() {
              a._duration = Math.ceil(10 * f.duration) / 10;
              0 === Object.getOwnPropertyNames(a._sprite).length &&
                (a._sprite = { _default: [0, 1e3 * a._duration] });
              a._loaded || ((a._loaded = !0), a.on("load"));
              a._autoplay && a.play();
              f.removeEventListener("canplaythrough", g, !1);
            };
            f.addEventListener("canplaythrough", g, !1);
            f.load();
          }
          return a;
        }
      }
      a.on("loaderror");
    },
    urls: function(a) {
      return a
        ? (this.stop(),
          (this._urls = "string" === typeof a ? [a] : a),
          (this._loaded = !1),
          this.load(),
          this)
        : this._urls;
    },
    play: function(a, b) {
      var c = this;
      "function" === typeof a && (b = a);
      (a && "function" !== typeof a) || (a = "_default");
      if (!c._loaded)
        return (
          c.on("load", function() {
            c.play(a, b);
          }),
          c
        );
      if (!c._sprite[a]) return "function" === typeof b && b(), c;
      c._inactiveNode(function(d) {
        d._sprite = a;
        var e = 0 < d._pos ? d._pos : c._sprite[a][0] / 1e3,
          f = 0;
        c._webAudio
          ? ((f = c._sprite[a][1] / 1e3 - d._pos),
            0 < d._pos && (e = c._sprite[a][0] / 1e3 + e))
          : (f = c._sprite[a][1] / 1e3 - (e - c._sprite[a][0] / 1e3));
        var h = !(!c._loop && !c._sprite[a][2]),
          m = "string" === typeof b ? b : Math.round(Date.now() * Math.random()) + "",
          l;
        (function() {
          l = setTimeout(function() {
            !c._webAudio && h && c.stop(m).play(a, m);
            c._webAudio &&
              !h &&
              ((c._nodeById(m).paused = !0),
              (c._nodeById(m)._pos = 0),
              c._clearEndTimer(m));
            c._webAudio || h || c.stop(m);
            c.on("end", m);
          }, 1e3 * f);
          c._onendTimer.push({ timer: l, id: m });
        })();
        if (c._webAudio) {
          var n = c._sprite[a][0] / 1e3,
            p = c._sprite[a][1] / 1e3;
          d.id = m;
          d.paused = !1;
          y(c, [h, n, p], m);
          c._playStart = g.currentTime;
          d.gain.value = c._volume;
          "undefined" === typeof d.bufferSource.start
            ? h
              ? d.bufferSource.noteGrainOn(0, e, 86400)
              : d.bufferSource.noteGrainOn(0, e, f)
            : h
            ? d.bufferSource.start(0, e, 86400)
            : d.bufferSource.start(0, e, f);
        } else if (4 === d.readyState || (!d.readyState && navigator.isCocoonJS))
          (d.readyState = 4),
            (d.id = m),
            (d.currentTime = e),
            (d.muted = k._muted || d.muted),
            (d.volume = c._volume * k.volume()),
            setTimeout(function() {
              d.play();
            }, 0);
        else
          return (
            c._clearEndTimer(m),
            (function() {
              var e = a,
                f = b,
                g = function() {
                  c.play(e, f);
                  d.removeEventListener("canplaythrough", g, !1);
                };
              d.addEventListener("canplaythrough", g, !1);
            })(),
            c
          );
        c.on("play");
        "function" === typeof b && b(m);
        return c;
      });
      return c;
    },
    pause: function(a) {
      var b = this;
      if (!b._loaded)
        return (
          b.on("play", function() {
            b.pause(a);
          }),
          b
        );
      b._clearEndTimer(a);
      var c = a ? b._nodeById(a) : b._activeNode();
      if (c)
        if (((c._pos = b.pos(null, a)), b._webAudio)) {
          if (!c.bufferSource || c.paused) return b;
          c.paused = !0;
          "undefined" === typeof c.bufferSource.stop
            ? c.bufferSource.noteOff(0)
            : c.bufferSource.stop(0);
        } else c.pause();
      b.on("pause");
      return b;
    },
    stop: function(a) {
      var b = this;
      if (!b._loaded)
        return (
          b.on("play", function() {
            b.stop(a);
          }),
          b
        );
      b._clearEndTimer(a);
      var c = a ? b._nodeById(a) : b._activeNode();
      if (c)
        if (((c._pos = 0), b._webAudio)) {
          if (!c.bufferSource || c.paused) return b;
          c.paused = !0;
          "undefined" === typeof c.bufferSource.stop
            ? c.bufferSource.noteOff(0)
            : c.bufferSource.stop(0);
        } else isNaN(c.duration) || (c.pause(), (c.currentTime = 0));
      return b;
    },
    mute: function(a) {
      var b = this;
      if (!b._loaded)
        return (
          b.on("play", function() {
            b.mute(a);
          }),
          b
        );
      var c = a ? b._nodeById(a) : b._activeNode();
      c && (b._webAudio ? (c.gain.value = 0) : (c.muted = !0));
      return b;
    },
    unmute: function(a) {
      var b = this;
      if (!b._loaded)
        return (
          b.on("play", function() {
            b.unmute(a);
          }),
          b
        );
      var c = a ? b._nodeById(a) : b._activeNode();
      c && (b._webAudio ? (c.gain.value = b._volume) : (c.muted = !1));
      return b;
    },
    volume: function(a, b) {
      var c = this;
      a = parseFloat(a);
      if (0 <= a && 1 >= a) {
        c._volume = a;
        if (!c._loaded)
          return (
            c.on("play", function() {
              c.volume(a, b);
            }),
            c
          );
        var d = b ? c._nodeById(b) : c._activeNode();
        d && (c._webAudio ? (d.gain.value = a) : (d.volume = a * k.volume()));
        return c;
      }
      return c._volume;
    },
    loop: function(a) {
      return "boolean" === typeof a ? ((this._loop = a), this) : this._loop;
    },
    sprite: function(a) {
      return "object" === typeof a ? ((this._sprite = a), this) : this._sprite;
    },
    pos: function(a, b) {
      var c = this;
      if (!c._loaded)
        return (
          c.on("load", function() {
            c.pos(a);
          }),
          "number" === typeof a ? c : c._pos || 0
        );
      a = parseFloat(a);
      var d = b ? c._nodeById(b) : c._activeNode();
      if (d)
        return 0 <= a
          ? (c.pause(b), (d._pos = a), c.play(d._sprite, b), c)
          : c._webAudio
          ? d._pos + (g.currentTime - c._playStart)
          : d.currentTime;
      if (0 <= a) return c;
      for (d = 0; d < c._audioNode.length; d++)
        if (c._audioNode[d].paused && 4 === c._audioNode[d].readyState)
          return c._webAudio ? c._audioNode[d]._pos : c._audioNode[d].currentTime;
    },
    pos3d: function(a, b, c, d) {
      var e = this;
      b = "undefined" !== typeof b && b ? b : 0;
      c = "undefined" !== typeof c && c ? c : -0.5;
      if (!e._loaded)
        return (
          e.on("play", function() {
            e.pos3d(a, b, c, d);
          }),
          e
        );
      if (0 <= a || 0 > a) {
        if (e._webAudio) {
          var f = d ? e._nodeById(d) : e._activeNode();
          f &&
            ((e._pos3d = [a, b, c]),
            f.panner.setPosition(a, b, c),
            (f.panner.panningModel = e._model || "HRTF"));
        }
      } else return e._pos3d;
      return e;
    },
    rate: function(a, b) {
      var c = this;
      if (!c._loaded)
        return (
          c.on("play", function() {
            c.playback_rate(a, b);
          }),
          c
        );
      if (0 <= a && 1e3 >= a) {
        if (c._webAudio) {
          var d = b ? c._nodeById(b) : c._activeNode();
          d && ((c._rate = a), (d.bufferSource.playbackRate.value = a));
        }
      } else return c._rate;
      return c;
    },
    fade: function(a, b, c, d, e) {
      var f = this,
        g = Math.abs(a - b),
        h = a > b ? "down" : "up",
        g = g / 0.01,
        l = c / g;
      if (!f._loaded)
        return (
          f.on("load", function() {
            f.fade(a, b, c, d, e);
          }),
          f
        );
      f.volume(a, e);
      for (var k = 1; k <= g; k++)
        (function() {
          var a = Math.round(1e3 * (f._volume + ("up" === h ? 0.01 : -0.01) * k)) / 1e3;
          setTimeout(function() {
            f.volume(a, e);
            a === b && d && d();
          }, l * k);
        })();
    },
    fadeIn: function(a, b, c) {
      return this.volume(0)
        .play()
        .fade(0, a, b, c);
    },
    fadeOut: function(a, b, c, d) {
      var e = this;
      return e.fade(
        e._volume,
        a,
        b,
        function() {
          c && c();
          e.pause(d);
          e.on("end");
        },
        d
      );
    },
    _nodeById: function(a) {
      for (var b = this._audioNode[0], c = 0; c < this._audioNode.length; c++)
        if (this._audioNode[c].id === a) {
          b = this._audioNode[c];
          break;
        }
      return b;
    },
    _activeNode: function() {
      for (var a = null, b = 0; b < this._audioNode.length; b++)
        if (!this._audioNode[b].paused) {
          a = this._audioNode[b];
          break;
        }
      this._drainPool();
      return a;
    },
    _inactiveNode: function(a) {
      for (var b = null, c = 0; c < this._audioNode.length; c++)
        if (this._audioNode[c].paused && 4 === this._audioNode[c].readyState) {
          a(this._audioNode[c]);
          b = !0;
          break;
        }
      this._drainPool();
      if (!b) {
        var d;
        if (this._webAudio) (d = this._setupAudioNode()), a(d);
        else {
          this.load();
          d = this._audioNode[this._audioNode.length - 1];
          var e = navigator.isCocoonJS ? "canplaythrough" : "loadedmetadata",
            f = function() {
              d.removeEventListener(e, f, !1);
              a(d);
            };
          d.addEventListener(e, f, !1);
        }
      }
    },
    _drainPool: function() {
      var a = 0,
        b;
      for (b = 0; b < this._audioNode.length; b++) this._audioNode[b].paused && a++;
      for (b = this._audioNode.length - 1; 0 <= b && !(5 >= a); b--)
        this._audioNode[b].paused &&
          (this._webAudio && this._audioNode[b].disconnect(0),
          a--,
          this._audioNode.splice(b, 1));
    },
    _clearEndTimer: function(a) {
      for (var b = 0, c = 0; c < this._onendTimer.length; c++)
        if (this._onendTimer[c].id === a) {
          b = c;
          break;
        }
      if ((a = this._onendTimer[b]))
        clearTimeout(a.timer), this._onendTimer.splice(b, 1);
    },
    _setupAudioNode: function() {
      var a = this._audioNode,
        b = this._audioNode.length;
      a[b] = "undefined" === typeof g.createGain ? g.createGainNode() : g.createGain();
      a[b].gain.value = this._volume;
      a[b].paused = !0;
      a[b]._pos = 0;
      a[b].readyState = 4;
      a[b].connect(p);
      a[b].panner = g.createPanner();
      a[b].panner.panningModel = this._model || "equalpower";
      a[b].panner.setPosition(this._pos3d[0], this._pos3d[1], this._pos3d[2]);
      a[b].panner.connect(a[b]);
      return a[b];
    },
    on: function(a, b) {
      var c = this["_on" + a];
      if ("function" === typeof b) c.push(b);
      else for (var d = 0; d < c.length; d++) b ? c[d].call(this, b) : c[d].call(this);
      return this;
    },
    off: function(a, b) {
      var c = this["_on" + a],
        d = b ? b.toString() : null;
      if (d)
        for (var e = 0; e < c.length; e++) {
          if (d === c[e].toString()) {
            c.splice(e, 1);
            break;
          }
        }
      else this["_on" + a] = [];
      return this;
    },
    unload: function() {
      for (var a = this._audioNode, b = 0; b < this._audioNode.length; b++)
        a[b].paused || (this.stop(a[b].id), this.on("end", a[b].id)),
          this._webAudio ? a[b].disconnect(0) : (a[b].src = "");
      for (b = 0; b < this._onendTimer.length; b++)
        clearTimeout(this._onendTimer[b].timer);
      a = k._howls.indexOf(this);
      null !== a && 0 <= a && k._howls.splice(a, 1);
      delete n[this._src];
    }
  };
  if (l)
    var x = function(a, b) {
        if (b in n) (a._duration = n[b].duration), v(a);
        else if (/^data:[^;]+;base64,/.test(b)) {
          for (
            var c = atob(b.split(",")[1]), d = new Uint8Array(c.length), e = 0;
            e < c.length;
            ++e
          )
            d[e] = c.charCodeAt(e);
          w(d.buffer, a, b);
        } else {
          var f = new XMLHttpRequest();
          f.open("GET", b, !0);
          f.responseType = "arraybuffer";
          f.onload = function() {
            w(f.response, a, b);
          };
          f.onerror = function() {
            a._webAudio &&
              ((a._buffer = !0),
              (a._webAudio = !1),
              (a._audioNode = []),
              delete a._gainNode,
              delete n[b],
              a.load());
          };
          try {
            f.send();
          } catch (g) {
            f.onerror();
          }
        }
      },
      w = function(a, b, c) {
        g.decodeAudioData(
          a,
          function(a) {
            a && ((n[c] = a), v(b, a));
          },
          function(a) {
            b.on("loaderror");
          }
        );
      },
      v = function(a, b) {
        a._duration = b ? b.duration : a._duration;
        0 === Object.getOwnPropertyNames(a._sprite).length &&
          (a._sprite = { _default: [0, 1e3 * a._duration] });
        a._loaded || ((a._loaded = !0), a.on("load"));
        a._autoplay && a.play();
      },
      y = function(a, b, c) {
        c = a._nodeById(c);
        c.bufferSource = g.createBufferSource();
        c.bufferSource.buffer = n[a._src];
        c.bufferSource.connect(c.panner);
        c.bufferSource.loop = b[0];
        b[0] &&
          ((c.bufferSource.loopStart = b[1]), (c.bufferSource.loopEnd = b[1] + b[2]));
        c.bufferSource.playbackRate.value = a._rate;
      };
  "function" === typeof define &&
    define.amd &&
    define(function() {
      return { Howler: k, Howl: r };
    });
  "undefined" !== typeof exports && ((exports.Howler = k), (exports.Howl = r));
  "undefined" !== typeof window && ((window.Howler = k), (window.Howl = r));
})();

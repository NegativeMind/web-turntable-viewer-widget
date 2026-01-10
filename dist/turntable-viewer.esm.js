const x = ':host{all:initial;display:block!important;visibility:visible!important;opacity:1!important;box-sizing:border-box!important}.turntable-wrapper{box-sizing:border-box;margin:0;padding:0;border:none;background:none;font-family:inherit;line-height:normal;display:inline-block;width:auto;max-width:100%;vertical-align:top}[vimeo-video-id]{box-sizing:border-box;margin:0;padding:0;background:none;font-family:inherit;line-height:normal;position:relative;display:block;width:auto;opacity:0;visibility:hidden;transition:opacity .3s ease;min-height:300px;overflow:hidden;border:1px solid transparent;touch-action:none;-webkit-touch-callout:none}[vimeo-video-id].initialized{opacity:1;visibility:visible}[vimeo-video-id] iframe{box-sizing:border-box;margin:0;padding:0;border:none;max-width:none;min-width:0;background:transparent;display:block;opacity:0;visibility:hidden;transition:opacity .3s ease}[vimeo-video-id] iframe.size-ready{opacity:1;visibility:visible}.drag-overlay{box-sizing:border-box;margin:0;padding:0;border:none;background:none;position:absolute;top:0;left:0;width:100%;height:100%;cursor:grab;user-select:none;touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none}#angle-display{box-sizing:border-box;margin:0;padding:6px 10px;border:1px solid rgba(255,255,255,.1);position:absolute;bottom:10px;left:50%;transform:translate(-50%);background:#000000bf;color:#fff;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 2px 8px #0000004d;pointer-events:none;z-index:5;display:none;justify-content:center;align-items:center;width:60px;white-space:nowrap;font-variant-numeric:tabular-nums;min-width:60px;font-feature-settings:"tnum" 1}.reload-button{box-sizing:border-box;margin:0;padding:0;position:absolute;top:8px;left:8px;width:32px;height:32px;background:#0000004d;border:1px solid rgba(255,255,255,.1);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:15;transition:all .2s ease;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}.reload-button:hover{background:#00000080;border-color:#ffffff40;transform:scale(1.05)}.reload-button:active{transform:scale(.95)}.reload-icon{width:16px;height:16px;color:#fffc;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.reload-button.loading .reload-icon{animation:reload-spin 1s linear infinite}@keyframes reload-spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}#rotation-angle{display:inline-block;width:30px;text-align:right;font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}.degree-symbol{display:inline-block;width:10px;text-align:left}#angle{display:inline-block;width:2.2em;text-align:right;font-variant-numeric:tabular-nums}.loading-overlay{box-sizing:border-box;margin:0;padding:0;border:none;position:absolute;top:0;left:0;width:100%;height:100%;min-height:300px;background:#000c;display:flex;align-items:center;justify-content:center;z-index:10;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);transition:opacity .3s ease;border-radius:inherit}.loading-overlay.hidden{opacity:0;pointer-events:none}.loading-content{text-align:center;color:#fff;padding:20px;border-radius:8px;background:#ffffff1a;min-width:250px;box-sizing:border-box}.loading-text{font-size:16px;margin-bottom:15px;font-weight:500}.progress-container{display:flex;align-items:center;gap:10px}.progress-bar{flex:1;height:8px;background:#fff3;border-radius:4px;overflow:hidden;position:relative}.progress-fill{height:100%;background:linear-gradient(90deg,#4caf50,#81c784);border-radius:4px;width:0%;transition:width .3s ease;position:relative}.progress-fill:after{content:"";position:absolute;top:0;left:0;height:100%;width:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);animation:shimmer 2s infinite}@keyframes shimmer{0%{transform:translate(-100%)}to{transform:translate(100%)}}.progress-text{font-size:14px;font-weight:700;min-width:35px}.vimeo-viewer-wrapper{box-sizing:border-box;margin:0;padding:0;display:inline-block;width:auto}.vimeo-link{box-sizing:border-box;margin:8px 0 0;padding:6px 12px;border:none;display:block;text-align:center;color:#666;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;font-size:12px;font-weight:500;text-decoration:none;border-radius:4px;background:#0000000d;transition:color .3s ease,background-color .3s ease;width:auto;opacity:0;pointer-events:none}.vimeo-link.visible{opacity:1;pointer-events:auto}.vimeo-link:hover{color:#06c;background:#0066cc1a;text-decoration:none}.drag-overlay.dragging,[vimeo-video-id].dragging{touch-action:none}@media (max-width: 768px){.turntable-wrapper{display:block;width:100%;max-width:none;min-width:100%;box-sizing:border-box;margin:0 auto}[vimeo-video-id]{display:block;width:100%;max-width:none;min-width:100%;min-height:auto;box-sizing:border-box;margin:0 auto}[vimeo-video-id] iframe{display:block;width:100%;max-width:none;min-width:100%;height:auto;aspect-ratio:1 / 1;box-sizing:border-box;margin:0 auto}.loading-overlay{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;min-height:auto;box-sizing:border-box;margin:0;padding:0}.loading-content{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:70%;max-width:300px;min-width:200px;padding:12px 16px;box-sizing:border-box}.loading-text{font-size:14px;margin-bottom:10px;text-align:center}.progress-container{gap:8px;align-items:center;justify-content:center}.progress-bar{height:6px;flex:1;min-width:120px}.progress-text{font-size:12px;min-width:35px;text-align:center}.drag-overlay{width:100%;height:100%;box-sizing:border-box}#angle-display{bottom:5px;font-size:11px;padding:4px 8px;min-width:50px;width:50px}#rotation-angle{width:25px}.vimeo-link{font-size:11px;padding:4px 8px;margin-top:6px;display:block;text-align:center;width:100%;box-sizing:border-box}}';
class k {
  constructor(e, t, i, o, a, n, s) {
    this.loadingStartTime = null, this.lastProgressTime = 0, this.lastProgressPercentage = 0, this.container = e, this.iframe = t, this.loadingOverlay = i, this.loadingText = o, this.progressFill = a, this.progressText = n, this.config = s, this.progressText = n;
  }
  /**
   * プログレスバーを更新
   */
  updateProgress(e, t = null) {
    console.log(`Progress update: ${e}% - ${t || "No text"}`), this.progressFill ? (this.progressFill.style.width = `${e}%`, console.log(`Progress fill updated to ${e}%`)) : console.warn("Progress fill element not found"), this.progressText ? this.progressText.textContent = `${Math.round(e)}%` : console.warn("Progress text element not found"), t && this.loadingText && (this.loadingText.textContent = t), this.checkLoadingTimeout(e);
  }
  /**
   * ローディングオーバーレイを表示
   */
  showLoadingOverlay() {
    if (this.loadingOverlay) {
      const e = this.container.querySelector("#angle-display");
      e && (e.style.display = "none"), this.loadingOverlay.classList.remove("hidden"), this.updateProgress(0, "Initializing video player..."), this.adjustLoadingOverlaySize(), setTimeout(() => this.adjustLoadingOverlaySize(), 10);
    }
  }
  /**
   * ローディングオーバーレイを隠す
   */
  hideLoadingOverlay() {
    this.loadingOverlay && setTimeout(() => {
      if (this.loadingOverlay.classList.add("hidden"), this.config.showAngle) {
        const e = this.container.querySelector("#angle-display");
        e ? (e.style.display = "block", console.log("Angle display made visible after loading")) : console.log("Angle display element not found (optional element)");
      }
    }, 500);
  }
  /**
   * ローディングオーバーレイのサイズをiframe要素に合わせて調整
   */
  adjustLoadingOverlaySize() {
    if (!this.loadingOverlay || !this.iframe) return;
    const e = parseInt(this.iframe.getAttribute("width") || "0"), t = parseInt(this.iframe.getAttribute("height") || "0");
    if (e && t)
      this.loadingOverlay.style.width = `${e}px`, this.loadingOverlay.style.height = `${t}px`, console.log(`Adjusted loading overlay size: ${e}x${t}`);
    else {
      const o = Math.round(270);
      this.loadingOverlay.style.width = "480px", this.loadingOverlay.style.height = `${o}px`, console.log(`Adjusted loading overlay size to default: 480x${o}`);
    }
  }
  /**
   * ローディングタイムアウトをチェック
   */
  checkLoadingTimeout(e) {
    if (!this.loadingStartTime) {
      this.loadingStartTime = Date.now(), this.lastProgressTime = Date.now(), this.lastProgressPercentage = e;
      return;
    }
    const t = Date.now(), i = t - this.loadingStartTime, o = t - this.lastProgressTime;
    if (e > this.lastProgressPercentage) {
      this.lastProgressTime = t, this.lastProgressPercentage = e;
      return;
    }
    (o > 3e4 || i > 6e4) && (console.warn(`Loading timeout detected. Stalled: ${o}ms, Total: ${i}ms`), this.loadingText && (this.loadingText.textContent = "ローディングが停止しました - リロードボタンを押してください", this.loadingText.style.color = "#ff6b6b"), this.loadingStartTime = null);
  }
  /**
   * タイムアウトタイマーをリセット
   */
  resetTimeout() {
    this.loadingStartTime = null, this.lastProgressTime = 0, this.lastProgressPercentage = 0;
  }
  /**
   * エラー表示（ローディングオーバーレイをエラー表示に変更）
   */
  showError(e, t) {
    this.loadingOverlay && (this.loadingOverlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-text" style="color: #ff6b6b;">${e}</div>
                    <div style="color: #ffa8a8; font-size: 11px; margin-top: 8px; line-height: 1.4;">
                        ${t}
                    </div>
                </div>
            `, this.loadingOverlay.style.display = "flex", this.loadingOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)", console.error(`${e}: ${t}`));
  }
}
function p(d) {
  return d instanceof Error ? d.message : String(d);
}
function m(d) {
  return new Promise((e) => setTimeout(e, d));
}
function f(d, e, t) {
  return Promise.race([
    d,
    new Promise(
      (i, o) => setTimeout(() => o(new Error(t || "Operation timed out")), e)
    )
  ]);
}
class b {
  constructor(e, t, i) {
    this.container = e, this.iframe = t, this.config = i;
  }
  /**
   * 表示サイズに基づいてPIXELS_PER_ROTATIONを動的に計算
   */
  calculatePixelsPerRotation() {
    const e = parseInt(this.iframe.getAttribute("width") || "0"), t = this.container.clientWidth || 0, i = this.iframe.clientWidth || 0, o = Math.max(t, i) || 0, a = e || o || 320;
    console.log(`Container width for calculation: ${a}px (html: ${e}, container: ${t}, iframe: ${i})`);
    let r = a / 640 * 1200;
    return a <= 480 && (r *= 1.2), r = Math.max(250, Math.min(3e3, r)), console.log(`Calculated PIXELS_PER_ROTATION: ${Math.round(r)} for width: ${a}px`), Math.round(r);
  }
  /**
   * 表示サイズに応じた動画品質選択
   */
  selectVideoQuality() {
    const e = parseInt(this.container.getAttribute("video-width") || "0"), t = parseInt(this.container.getAttribute("video-height") || "0"), i = parseInt(this.iframe.getAttribute("width") || "0"), o = parseInt(this.iframe.getAttribute("height") || "0"), a = this.iframe.clientWidth || this.container.clientWidth || 0;
    this.iframe.clientHeight || this.container.clientHeight;
    const n = e || i || a || 480, s = t || o || n, r = n * s, g = Math.sqrt(r), c = window.devicePixelRatio || 1;
    let l;
    if (i && o || e && t) {
      const u = Math.min(c, 1.5);
      l = g * u;
    } else
      l = g * c;
    let h = "240p";
    return l <= 240 ? h = "240p" : l <= 360 ? h = "360p" : l <= 480 ? h = "540p" : l <= 960 ? h = "720p" : l <= 1280 ? h = "1080p" : l <= 1920 ? h = "2k" : h = "4k", console.log(`Selected quality: ${h} for effective size: ${l}px (${n}x${s})`), h;
  }
  /**
   * 動画URLを構築
   */
  buildVideoUrl() {
    var l;
    const e = this.selectVideoQuality(), t = parseInt(this.container.getAttribute("video-width") || "0"), i = parseInt(this.container.getAttribute("video-height") || "0"), o = parseInt(this.iframe.getAttribute("width") || "0"), a = parseInt(this.iframe.getAttribute("height") || "0");
    let n = t || o || 480, s = i || a || n;
    const r = window.innerWidth || document.documentElement.clientWidth;
    if (r <= 768) {
      const h = this.container.clientWidth || ((l = this.container.parentElement) == null ? void 0 : l.clientWidth) || r, u = Math.floor(h * 0.9);
      u > 200 && (n = u, s = u);
    }
    this.iframe.setAttribute("width", n.toString()), this.iframe.setAttribute("height", s.toString()), r <= 768 && (this.iframe.style.width = n + "px", this.iframe.style.height = s + "px", this.iframe.style.maxWidth = "none", this.iframe.style.display = "block", console.log(`Applied direct CSS styles: ${n}x${s}`));
    const g = new URLSearchParams({
      background: "1",
      byline: "0",
      portrait: "0",
      title: "0",
      speed: "0",
      transparent: "1",
      gesture: "media",
      autopause: "0",
      muted: "1",
      loop: "1",
      controls: "0",
      quality: e,
      responsive: "0",
      dnt: "1"
    }), c = `https://player.vimeo.com/video/${this.config.videoId}?${g.toString()}`;
    return console.log(`Video URL set: ${c} (Size: ${n}x${s}, Screen: ${r})`), c;
  }
  /**
   * Vimeo oEmbed APIから動画情報を事前取得
   */
  async getVideoInfoFromAPI() {
    try {
      if (!/^\d+$/.test(this.config.videoId))
        throw new Error("Invalid video ID format for API call");
      const e = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${this.config.videoId}`;
      console.log(`Fetching video info from: ${e}`), await m(Math.random() * 500);
      const t = new AbortController(), i = setTimeout(() => t.abort(), 1e4), o = await fetch(e, {
        signal: t.signal,
        referrerPolicy: "no-referrer",
        headers: {
          Accept: "application/json"
        }
      });
      if (clearTimeout(i), !o.ok)
        throw o.status === 404 ? new Error(`Video not found (ID: ${this.config.videoId}). Please check the video ID.`) : o.status === 403 ? new Error(`Access denied to video (ID: ${this.config.videoId}). Video may be private.`) : o.status >= 500 ? new Error(`Vimeo server error (status: ${o.status}). Please try again later.`) : new Error(`HTTP error! status: ${o.status}`);
      const a = await o.json();
      if (!a || typeof a != "object")
        throw new Error("Invalid API response format");
      if (!a.width || !a.height || a.width <= 0 || a.height <= 0)
        throw new Error("Invalid video dimensions in API response");
      const n = a.height / a.width;
      return console.log(`API Video dimensions: ${a.width}x${a.height}, aspect ratio: ${n.toFixed(3)}`), {
        width: a.width,
        height: a.height,
        aspectRatio: n,
        title: a.title || "Untitled Video"
      };
    } catch (e) {
      return e.name === "AbortError" ? console.warn("API request timed out, using default aspect ratio") : console.warn("Could not fetch video info from API:", p(e)), {
        width: 1920,
        height: 1080,
        aspectRatio: 9 / 16,
        title: "Untitled Video"
      };
    }
  }
  /**
   * 初期サイズを設定（API情報から）
   */
  async setInitialSizeFromAPI(e, t) {
    try {
      const i = parseInt(this.iframe.getAttribute("width") || "0"), o = parseInt(this.iframe.getAttribute("height") || "0");
      if (this.iframe.style.visibility = "hidden", i && o) {
        console.log(`Both width and height specified: ${i}x${o}`), this.container.classList.add("initialized"), this.iframe.style.visibility = "visible", this.iframe.classList.add("size-ready"), console.log("Container and iframe ready with fixed size"), t == null || t();
        return;
      }
      if (i || o) {
        e == null || e(5, "Getting video information...");
        const a = await this.getVideoInfoFromAPI();
        if (i && !o) {
          const n = Math.round(i * a.aspectRatio);
          this.iframe.setAttribute("height", n.toString()), console.log(`Set height from width: ${i}x${n} (aspect ratio: ${a.aspectRatio.toFixed(3)})`);
        } else if (o && !i) {
          const n = Math.round(o / a.aspectRatio);
          this.iframe.setAttribute("width", n.toString()), console.log(`Set width from height: ${n}x${o} (aspect ratio: ${a.aspectRatio.toFixed(3)})`);
        }
        this.container.classList.add("initialized"), this.iframe.style.visibility = "visible", this.iframe.classList.add("size-ready"), console.log("Container and iframe size ready, made visible"), t == null || t();
      } else {
        e == null || e(5, "Getting video information...");
        const n = await this.getVideoInfoFromAPI(), s = Math.round(480 * n.aspectRatio);
        this.iframe.setAttribute("width", "480"), this.iframe.setAttribute("height", s.toString()), console.log(`Set default size: 480x${s} (aspect ratio: ${n.aspectRatio.toFixed(3)})`), this.container.classList.add("initialized"), this.iframe.style.visibility = "visible", this.iframe.classList.add("size-ready"), console.log("Container and iframe size ready with default size"), t == null || t();
      }
      console.log("setInitialSizeFromAPI completed");
    } catch (i) {
      console.warn("Could not set initial size from API:", i), this.setInitialSizeFallback(t);
    }
  }
  /**
   * 初期サイズを設定（フォールバック版）
   */
  setInitialSizeFallback(e) {
    try {
      const t = parseInt(this.iframe.getAttribute("width") || "0"), i = parseInt(this.iframe.getAttribute("height") || "0");
      if (t && i)
        console.log(`Fallback: Both width and height specified: ${t}x${i}`);
      else if (t && !i) {
        const o = Math.round(t * 0.5625);
        this.iframe.setAttribute("height", o.toString()), console.log(`Fallback: Set height from width: ${t}x${o} (16:9 default aspect ratio)`);
      } else if (i && !t) {
        const o = Math.round(i / 0.5625);
        this.iframe.setAttribute("width", o.toString()), console.log(`Fallback: Set width from height: ${o}x${i} (16:9 default aspect ratio)`);
      } else {
        const a = Math.round(270);
        this.iframe.setAttribute("width", "480"), this.iframe.setAttribute("height", a.toString()), console.log(`Fallback: Set default size: 480x${a} (16:9 default aspect ratio)`);
      }
      this.container.classList.add("initialized"), this.iframe.style.visibility = "visible", this.iframe.classList.add("size-ready"), console.log("Container and iframe size ready (fallback), made visible"), e == null || e();
    } catch (t) {
      console.warn("Could not set fallback initial size:", t);
    }
  }
  /**
   * 動画プレイヤーのセットアップ
   */
  setupVideoPlayer() {
    const e = this.buildVideoUrl();
    this.iframe.src = e;
  }
}
class w {
  constructor(e, t) {
    this.container = e, this.iframe = t;
  }
  /**
   * Vimeoプレイヤーを作成
   */
  async createPlayer(e) {
    try {
      return e == null || e(40, "Connecting to player..."), new Vimeo.Player(this.iframe);
    } catch (t) {
      throw new Error(`Failed to create Vimeo player: ${p(t)}`);
    }
  }
  /**
   * プレイヤーの基本情報取得
   */
  async getPlayerDuration(e, t = !1, i) {
    i == null || i(60, "Loading player settings...");
    const o = t ? 15e3 : 1e4, a = await f(
      e.getDuration(),
      o,
      "Failed to get video duration"
    );
    if (console.log("Duration:", a), !a || a <= 0)
      throw new Error("Invalid video duration received");
    return a;
  }
  /**
   * 動画のアスペクト比を調整（プレイヤー情報から詳細確認）
   */
  async adjustVideoAspectRatio(e, t) {
    try {
      console.log("Getting video dimensions...");
      const i = await f(
        e.getVideoWidth(),
        3e3,
        "Failed to get video width"
      ), o = await f(
        e.getVideoHeight(),
        3e3,
        "Failed to get video height"
      ), a = o / i;
      console.log(`Player Video dimensions: ${i}x${o}, aspect ratio: ${a.toFixed(3)}`);
      const n = parseInt(this.iframe.getAttribute("width") || "480"), r = parseInt(this.iframe.getAttribute("height") || "480") / n;
      if (!parseInt(this.container.getAttribute("video-height") || "0") && Math.abs(r - a) > 0.01) {
        const c = Math.round(n * a);
        this.iframe.setAttribute("height", c.toString()), console.log(`Fine-tuned iframe size: ${n}x${c} (aspect ratio: ${a.toFixed(3)})`), t == null || t();
      } else
        console.log("Aspect ratio already correct, no adjustment needed");
    } catch (i) {
      console.warn("Could not get video dimensions, keeping current size:", p(i)), t == null || t();
    }
  }
  /**
   * プレイヤー設定を個別にエラーハンドリング付きで適用
   */
  async applyPlayerSettings(e, t) {
    t == null || t(75, "Applying player settings...");
    const i = [
      {
        name: "loop",
        action: () => e.setLoop(!0),
        fallback: () => console.warn("Could not set loop mode")
      },
      {
        name: "volume",
        action: () => e.setVolume(0),
        fallback: () => console.warn("Could not set volume")
      }
    ];
    for (const o of i)
      try {
        await f(o.action(), 3e3, `Failed to set ${o.name}`), console.log(`Successfully set ${o.name}`);
      } catch (a) {
        console.warn(`Setting ${o.name} failed:`, p(a)), o.fallback();
      }
  }
  /**
   * 動画の事前ロード（失敗しても続行可能）
   */
  async preloadVideo(e, t, i) {
    try {
      i == null || i(85, "Buffering video..."), console.log("Starting video buffer preload...");
      const o = [0, 0.5];
      for (let a = 0; a < o.length; a++) {
        const n = o[a], s = t * n;
        await f(
          e.setCurrentTime(s),
          5e3,
          `Preload seek timeout at ${n * 100}%`
        ), await m(300), i == null || i(85 + (a + 1) * 2, `Buffering ${Math.round(n * 100)}%...`);
      }
      return await f(e.setCurrentTime(0), 5e3, "Preload final seek timeout"), console.log("Video buffer preload completed"), !0;
    } catch (o) {
      return console.log("Video buffer preload skipped:", p(o)), !1;
    }
  }
  /**
   * 初期プレイヤー状態の設定
   */
  async setInitialPlayerState(e, t) {
    t == null || t(90, "Setting initial state...");
    const i = [
      { name: "play", action: () => e.play(), optional: !0 },
      { name: "pause", action: () => e.pause(), optional: !1 },
      { name: "seek to start", action: () => e.setCurrentTime(0), optional: !1 }
    ];
    for (const o of i)
      try {
        await f(o.action(), 3e3, `Failed to ${o.name}`), console.log(`Successfully executed: ${o.name}`);
      } catch (a) {
        o.optional ? console.log(`${o.name} skipped (likely blocked by browser autoplay policy)`) : console.warn(`Action ${o.name} failed:`, p(a));
      }
  }
}
class M {
  constructor(e, t, i, o, a, n) {
    this.container = e, this.dragOverlay = t, this.state = i, this.config = o, this.calculatePixelsPerRotation = a, this.onAngleUpdate = n, this.boundMouseDown = this.onMouseDown.bind(this), this.boundMouseMove = this.onMouseMove.bind(this), this.boundMouseUp = this.onMouseUp.bind(this), this.boundTouchStart = this.onTouchStart.bind(this), this.boundTouchMove = this.onTouchMove.bind(this), this.boundTouchEnd = this.onTouchEnd.bind(this);
  }
  /**
   * イベントリスナーを追加
   */
  attachEventListeners() {
    this.dragOverlay.addEventListener("mousedown", this.boundMouseDown), this.dragOverlay.addEventListener("touchstart", this.boundTouchStart, { passive: !1 });
  }
  /**
   * イベントリスナーを削除
   */
  removeEventListeners() {
    this.dragOverlay.removeEventListener("mousedown", this.boundMouseDown), this.dragOverlay.removeEventListener("touchstart", this.boundTouchStart), document.removeEventListener("mousemove", this.boundMouseMove), document.removeEventListener("mouseup", this.boundMouseUp), document.removeEventListener("touchmove", this.boundTouchMove), document.removeEventListener("touchend", this.boundTouchEnd);
  }
  /**
   * 新しい再生時間を計算（ループ対応）
   */
  calculateNewTime(e) {
    const i = this.calculatePixelsPerRotation(), a = e * 0.9 / i, n = this.config.isClockwise ? -a * this.state.duration : a * this.state.duration;
    return ((this.state.startTime + n) % this.state.duration + this.state.duration) % this.state.duration;
  }
  /**
   * ドラッグ操作の共通処理
   */
  handleDragMove(e) {
    if (!this.state.isDragging || !this.state.isPlayerReady || this.state.startTime === void 0 || this.state.startTime === null || this.state.dragStartX === void 0 || this.state.dragStartX === null) return;
    const t = e - this.state.dragStartX;
    if (Math.abs(t) > 2e3) {
      console.warn("Extreme deltaX detected, ignoring:", t);
      return;
    }
    const i = this.calculateNewTime(t);
    this.onAngleUpdate(i);
    const o = performance.now();
    o - this.state.lastDragUpdate < 100 || (this.state.lastDragUpdate = o, this.state.pendingApiCall && cancelAnimationFrame(this.state.pendingApiCall), this.state.pendingApiCall = requestAnimationFrame(() => {
      var n;
      this.state.isDragging && this.state.isPlayerReady && ((n = this.state.player) == null || n.setCurrentTime(i).catch((s) => {
        console.warn("Vimeo API call ignored due to performance:", s);
      })), this.state.pendingApiCall = null;
    }));
  }
  /**
   * ドラッグ開始の共通処理
   */
  async handleDragStart(e) {
    if (!this.state.isPlayerReady) return !1;
    this.state.isDragging = !1, this.state.dragStartX = e, this.dragOverlay.style.cursor = "grabbing";
    try {
      return this.state.startTime = await this.state.player.getCurrentTime(), this.state.isDragging = !0, this.dragOverlay.classList.add("dragging"), this.container.classList.add("dragging"), this.state.dragStartX = e, console.log("Drag started at time:", this.state.startTime, "position:", e), !0;
    } catch (t) {
      return console.error("Failed to get current time:", t), this.state.isDragging = !1, this.dragOverlay.classList.remove("dragging"), this.container.classList.remove("dragging"), this.dragOverlay.style.cursor = "grab", !1;
    }
  }
  /**
   * ドラッグ終了の共通処理
   */
  handleDragEnd() {
    var e;
    this.state.isDragging && (this.state.isDragging = !1, this.dragOverlay.classList.remove("dragging"), this.container.classList.remove("dragging"), this.state.pendingApiCall && (cancelAnimationFrame(this.state.pendingApiCall), this.state.pendingApiCall = null), this.dragOverlay.style.cursor = "grab", (e = this.state.player) == null || e.pause());
  }
  /**
   * マウスダウンイベントハンドラー
   */
  async onMouseDown(e) {
    this.state.isDragging || !await this.handleDragStart(e.clientX) || (document.addEventListener("mousemove", this.boundMouseMove), document.addEventListener("mouseup", this.boundMouseUp), e.preventDefault());
  }
  /**
   * マウスムーブイベントハンドラー
   */
  onMouseMove(e) {
    this.handleDragMove(e.clientX);
  }
  /**
   * マウスアップイベントハンドラー
   */
  onMouseUp() {
    this.handleDragEnd(), document.removeEventListener("mousemove", this.boundMouseMove), document.removeEventListener("mouseup", this.boundMouseUp);
  }
  /**
   * タッチスタートイベントハンドラー
   */
  async onTouchStart(e) {
    this.state.isDragging || (e.preventDefault(), e.stopPropagation(), !await this.handleDragStart(e.touches[0].clientX)) || (document.addEventListener("touchmove", this.boundTouchMove, { passive: !1 }), document.addEventListener("touchend", this.boundTouchEnd, { passive: !1 }));
  }
  /**
   * タッチムーブイベントハンドラー
   */
  onTouchMove(e) {
    e.preventDefault(), e.stopPropagation(), this.handleDragMove(e.touches[0].clientX);
  }
  /**
   * タッチエンドイベントハンドラー
   */
  onTouchEnd(e) {
    e.preventDefault(), e.stopPropagation(), this.handleDragEnd(), document.removeEventListener("touchmove", this.boundTouchMove), document.removeEventListener("touchend", this.boundTouchEnd);
  }
}
class E {
  constructor(e, t, i, o, a, n, s, r) {
    this.container = e, this.iframe = t, this.angleEl = i, this.angleDisplay = o, this.config = a, this.state = n, this.progressManager = s, this.onReload = r, this.reloadButton = document.createElement("button"), this.createReloadButton();
  }
  /**
   * リロードボタンを作成
   */
  createReloadButton() {
    this.reloadButton.className = "reload-button", this.reloadButton.title = "ビデオを再読み込み", this.reloadButton.innerHTML = `
            <svg class="reload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 4v6h-6"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
        `, this.reloadButton.addEventListener("click", () => {
      this.onReload();
    }), this.container.appendChild(this.reloadButton);
  }
  /**
   * リロードボタンを表示
   */
  showReloadButton() {
    this.reloadButton && (this.reloadButton.style.display = "flex");
  }
  /**
   * リロードボタンを非表示
   */
  hideReloadButton() {
    this.reloadButton && (this.reloadButton.style.display = "none");
  }
  /**
   * リロード処理のローディング状態を設定
   */
  setReloadLoading(e) {
    e ? this.reloadButton.classList.add("loading") : this.reloadButton.classList.remove("loading");
  }
  /**
   * 角度表示更新
   */
  updateAngle(e) {
    let t;
    if (this.config.isClockwise ? t = e / this.state.duration * 360 : t = 360 - e / this.state.duration * 360, t = t % 360, t < 0 && (t += 360), !this.angleEl) return;
    const i = Math.round(t);
    this.state.isDragging ? (this.angleEl.textContent = i.toString(), this.state.lastDisplayedAngle = i) : this.state.lastDisplayedAngle !== i && (this.angleEl.textContent = i.toString(), this.state.lastDisplayedAngle = i);
  }
  /**
   * 角度表示の位置を調整
   */
  adjustAngleDisplayPosition() {
    if (!this.angleDisplay || !this.iframe) {
      console.log("angleDisplay or iframe not found, skipping position adjustment");
      return;
    }
    const e = this.angleDisplay.style.display === "none";
    e && (this.angleDisplay.style.visibility = "hidden", this.angleDisplay.style.display = "block"), console.log("Angle display positioned at bottom center via CSS"), e && (this.angleDisplay.style.display = "none", this.angleDisplay.style.visibility = "visible");
  }
  /**
   * 角度表示を表示
   */
  showAngleDisplay() {
    this.angleDisplay && this.config.showAngle && (this.adjustAngleDisplayPosition(), this.angleDisplay.style.display = "block", console.log("Angle display enabled after successful initialization and position adjustment"));
  }
  /**
   * 角度表示を非表示
   */
  hideAngleDisplay() {
    this.angleDisplay && (this.angleDisplay.style.display = "none");
  }
  /**
   * Vimeoリンクを表示
   */
  showVimeoLink() {
    var t;
    const e = ((t = this.container.parentNode) == null ? void 0 : t.querySelector(".vimeo-link")) || this.container.querySelector(".vimeo-link");
    if (e && this.config.videoId) {
      if (!/^\d+$/.test(this.config.videoId)) {
        console.warn("Invalid video ID format detected, skipping Vimeo link generation");
        return;
      }
      if (e.href = `https://vimeo.com/${this.config.videoId}`, this.iframe) {
        const i = this.iframe.offsetWidth;
        i > 0 && (e.style.width = `${i}px`, console.log(`Vimeo link width adjusted to ${i}px`));
      }
      e.classList.add("visible"), console.log("Vimeo link displayed");
    } else e || console.log("Vimeo link element not found (optional element)");
  }
  /**
   * ローディングオーバーレイを隠す（UI調整含む）
   */
  hideLoadingOverlay() {
    this.progressManager.hideLoadingOverlay(), this.angleDisplay && this.adjustAngleDisplayPosition(), this.showVimeoLink();
  }
  /**
   * エラー表示
   */
  showError(e, t) {
    this.progressManager.showError(e, t);
  }
}
class y {
  constructor(e, t = document) {
    this.isReloading = !1, this.dragHandler = null, this.root = t;
    const i = this.root.getElementById(e);
    if (!i)
      throw new Error(`Container element with id "${e}" not found`);
    this.container = i;
    const o = this.container.querySelector("iframe");
    if (!o)
      throw new Error("iframe element not found in container");
    this.iframe = o;
    const a = this.container.querySelector("#rotation-angle"), n = this.container.querySelector("#angle-display"), s = this.container.querySelector(".drag-overlay");
    if (!s)
      throw new Error("drag-overlay element not found in container");
    this.dragOverlay = s;
    const r = this.container.querySelector(".loading-overlay"), g = this.container.querySelector(".loading-text"), c = this.container.querySelector(".progress-fill"), l = this.container.querySelector(".progress-text");
    if (!r || !g || !c || !l)
      throw new Error("Required loading elements not found in container");
    if (this.progressManager = new k(
      this.container,
      this.iframe,
      r,
      g,
      c,
      l,
      this.config
    ), console.log("DOM elements check:"), console.log("- container:", !!this.container), console.log("- iframe:", !!this.iframe), console.log("- loadingOverlay:", !!r), console.log("- progressFill:", !!c), console.log("- progressText:", !!l), console.log("- loadingText:", !!g), console.log("- angleEl (optional):", !!a), console.log("- angleDisplay (optional):", !!n), !this.container || !this.iframe || !r)
      throw new Error("Required elements not found: container, iframe, or loading-overlay");
    console.log("DOM elements validation passed");
    try {
      this.config = this.getConfig(), console.log("Configuration loaded:", this.config);
    } catch (h) {
      const u = p(h);
      throw console.error("Configuration error:", u), this.showError("Configuration Error", u), h;
    }
    this.state = {
      player: null,
      duration: 0,
      isPlayerReady: !1,
      isDragging: !1,
      dragStartX: 0,
      startTime: 0,
      lastDragUpdate: 0,
      lastDisplayedAngle: null,
      pendingApiCall: null
    }, this.videoConfigManager = new b(this.container, this.iframe, this.config), this.playerInitializer = new w(this.container, this.iframe), this.uiManager = new E(
      this.container,
      this.iframe,
      a,
      n,
      this.config,
      this.state,
      this.progressManager,
      this.handleReload.bind(this)
    ), this.initialize();
  }
  /**
   * 設定を取得
   */
  getConfig() {
    const e = this.container.getAttribute("vimeo-video-id"), t = this.container.getAttribute("clockwise-rotation");
    let i = !0;
    if (t !== null && (t === "" || t === "true" || t === "1" ? i = !0 : t === "false" || t === "0" ? i = !1 : (console.warn(`Invalid clockwise-rotation attribute value: "${t}". Using default "true".`), i = !0)), !e)
      throw new Error("vimeo-video-id attribute is required on the container element");
    if (!/^\d+$/.test(e))
      throw new Error(`Invalid vimeo-video-id format: "${e}". Only numeric IDs are allowed.`);
    return {
      PLAYER_LOAD_DELAY_MS: 1e3,
      DRAG_THROTTLE_MS: 16,
      isClockwise: i,
      videoId: e,
      showAngle: this.container.hasAttribute("show-angle")
    };
  }
  /**
   * 初期化
   */
  async initialize() {
    this.uiManager.hideAngleDisplay(), this.progressManager.showLoadingOverlay();
    try {
      await this.initializePlayer(), this.attachEventListeners(), console.log("TurntableViewer initialized successfully"), this.uiManager.showAngleDisplay();
    } catch (e) {
      console.error("TurntableViewer initialization failed:", e), this.progressManager.updateProgress(100, "初期化エラーが発生しました"), this.uiManager.hideLoadingOverlay();
    }
  }
  /**
   * リロード処理
   */
  async handleReload() {
    if (!this.isReloading) {
      this.isReloading = !0, this.uiManager.setReloadLoading(!0);
      try {
        if (console.log("Reloading turntable viewer..."), this.dragHandler && (this.dragHandler.removeEventListeners(), this.dragHandler = null), !this.iframe || !this.iframe.parentElement)
          throw console.error("iframe or parent element not found, cannot reload"), new Error("Cannot reload: iframe element not properly initialized");
        const e = this.iframe.parentElement, t = this.iframe.id, i = this.iframe.className, o = this.iframe.getAttribute("width") || "", a = this.iframe.getAttribute("height") || "";
        if (this.state.player) {
          try {
            await this.state.player.destroy(), console.log("Player destroyed successfully");
          } catch (s) {
            console.warn("Error destroying player:", s);
          }
          this.state.player = null;
        }
        this.iframe.parentElement ? (this.iframe.remove(), console.log("Old iframe removed")) : console.log("iframe already removed by player.destroy()");
        const n = document.createElement("iframe");
        n.id = t, n.className = i, n.setAttribute("allow", "autoplay; fullscreen; picture-in-picture"), n.setAttribute("loading", "lazy"), o && n.setAttribute("width", o), a && n.setAttribute("height", a), e.appendChild(n), this.iframe = n, console.log("iframe element recreated with size:", o, "x", a), this.videoConfigManager = new b(this.container, this.iframe, this.config), this.playerInitializer = new w(this.container, this.iframe), await m(300), this.state = {
          player: null,
          duration: 0,
          isPlayerReady: !1,
          isDragging: !1,
          startTime: 0,
          dragStartX: 0,
          lastDragUpdate: 0,
          pendingApiCall: null,
          lastDisplayedAngle: 0
        }, this.progressManager.resetTimeout(), await this.initialize();
      } catch (e) {
        console.error("Reload failed:", e);
      } finally {
        this.isReloading = !1, this.uiManager.setReloadLoading(!1);
      }
    }
  }
  /**
   * Vimeoプレイヤー初期化
   */
  async initializePlayer() {
    try {
      await this.videoConfigManager.setInitialSizeFromAPI(
        (e, t) => {
          this.progressManager.updateProgress(e, t);
        },
        () => {
          this.progressManager.adjustLoadingOverlaySize();
        }
      ), this.videoConfigManager.setupVideoPlayer(), this.progressManager.updateProgress(20, "Creating player..."), this.isReloading ? (await m(2e3), console.log("Extended delay for reload")) : await m(this.config.PLAYER_LOAD_DELAY_MS), this.state.player = await this.playerInitializer.createPlayer((e, t) => {
        this.progressManager.updateProgress(e, t);
      }), this.isReloading ? (await m(2e3), console.log("Extended player load delay for reload")) : await m(this.config.PLAYER_LOAD_DELAY_MS), this.progressManager.updateProgress(60, "Loading player settings..."), this.state.duration = await this.playerInitializer.getPlayerDuration(
        this.state.player,
        this.isReloading,
        (e, t) => this.progressManager.updateProgress(e, t)
      ), await this.playerInitializer.adjustVideoAspectRatio(
        this.state.player,
        () => this.progressManager.adjustLoadingOverlaySize()
      ), this.progressManager.updateProgress(75, "Applying player settings..."), await this.playerInitializer.applyPlayerSettings(this.state.player), await this.playerInitializer.preloadVideo(
        this.state.player,
        this.state.duration,
        (e, t) => this.progressManager.updateProgress(e, t)
      ), this.progressManager.updateProgress(90, "Setting initial state..."), await this.playerInitializer.setInitialPlayerState(this.state.player), this.uiManager.updateAngle(0), this.state.isPlayerReady = !0, console.log("Player ready"), this.progressManager.updateProgress(100, "Initialization complete!"), setTimeout(() => {
        this.uiManager.hideLoadingOverlay();
      }, 500);
    } catch (e) {
      console.error("Player initialization failed:", e);
      const t = p(e);
      t.includes("Failed to create Vimeo player") ? this.showError("Player Error", "Failed to create player. Check connection and reload.") : t.includes("Video not found") ? this.showError("Video Not Found", "The specified video was not found. Check the video ID.") : t.includes("Access denied") ? this.showError("Access Denied", "This video is private or restricted.") : t.includes("Failed to get video duration") ? this.showError("Failed to Load", "Could not retrieve video duration. Check network and reload.") : this.showError("Initialization Error", `Failed to load video player.<br><br>Error: ${t}<br><br>Click reload to retry.`), this.videoConfigManager.setInitialSizeFallback(() => {
        this.progressManager.adjustLoadingOverlaySize();
      }), console.log("Error state maintained, loading overlay not hidden");
    }
  }
  /**
   * イベントリスナーの追加
   */
  attachEventListeners() {
    this.dragHandler = new M(
      this.container,
      this.dragOverlay,
      this.state,
      this.config,
      () => this.videoConfigManager.calculatePixelsPerRotation(),
      (e) => this.uiManager.updateAngle(e)
    ), this.dragHandler.attachEventListeners(), window.addEventListener("resize", this.onWindowResize.bind(this));
  }
  /**
   * ウィンドウリサイズイベントハンドラー
   */
  async onWindowResize() {
    const e = this.videoConfigManager.selectVideoQuality();
    this.iframe.src.includes(`quality=${e}`) || (console.log("Reinitializing player due to quality change:", e), this.state.isPlayerReady = !1, await this.initializePlayer());
    const i = this.videoConfigManager.calculatePixelsPerRotation();
    console.log("Window resized, new PIXELS_PER_ROTATION:", i);
  }
  /**
   * エラー表示（ProgressManagerを使用）
   */
  showError(e, t) {
    this.progressManager.showError(e, t);
  }
  /**
   * エラー表示（非推奨：後方互換性のため残す）
   */
  showError_old(e, t) {
    this.uiManager.showError(e, t);
  }
  /**
   * クリーンアップ
   */
  destroy() {
    this.dragHandler && this.dragHandler.removeEventListeners(), window.removeEventListener("resize", this.onWindowResize.bind(this)), console.log("TurntableViewer destroyed");
  }
}
typeof window < "u" && (window.TurntableViewer = y);
class v extends HTMLElement {
  constructor() {
    super(), this.viewer = null, this.shadowContainer = null, this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["vimeo-video-id", "clockwise-rotation", "width", "height", "show-angle"];
  }
  connectedCallback() {
    this.render(), this.initializeViewer();
  }
  disconnectedCallback() {
    this.viewer;
  }
  render() {
    const e = this.getAttribute("vimeo-video-id"), t = this.getAttribute("clockwise-rotation"), i = this.getAttribute("width") || "480", o = this.getAttribute("height") || "", a = this.hasAttribute("show-angle");
    if (!e) {
      console.error("vimeo-video-id attribute is required");
      return;
    }
    if (this.shadowRoot) {
      let n = "";
      t !== null && (n = `clockwise-rotation="${t}"`), this.shadowRoot.innerHTML = `
                <style>${x}</style>
                <div class="turntable-wrapper">
                    <div id="turntable-container" vimeo-video-id="${e}" ${n} ${a ? "show-angle" : ""}>
                        <iframe ${`width="${i}"`} ${o ? `height="${o}"` : ""} frameborder="0" allowfullscreen></iframe>
                        <div class="drag-overlay">
                            <button class="reload-button" title="Reload video">
                                <svg class="reload-icon" viewBox="0 0 24 24">
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                                </svg>
                            </button>
                            <div id="angle-display">
                                <span id="angle"><span id="rotation-angle">0</span><span class="degree-symbol">°</span></span>
                            </div>
                        </div>
                        <div class="loading-overlay">
                            <div class="loading-content">
                                <div class="loading-text">Loading turntable...</div>
                                <div class="progress-container">
                                    <div class="progress-bar"><div class="progress-fill"></div></div>
                                    <div class="progress-text">0%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a class="vimeo-link" href="#" target="_blank">View on Vimeo</a>
                </div>
            `, this.shadowContainer = this.shadowRoot.getElementById("turntable-container");
    }
  }
  initializeViewer() {
    if (!(!this.shadowContainer || !this.shadowRoot))
      try {
        this.viewer = new y("turntable-container", this.shadowRoot);
      } catch (e) {
        console.error("Failed to initialize TurntableViewer:", e);
      }
  }
}
customElements.get("turntable-viewer") || customElements.define("turntable-viewer", v);
typeof window < "u" && (window.TurntableViewer = y, window.TurntableViewerElement = v);
export {
  y as TurntableViewer,
  v as TurntableViewerElement
};
//# sourceMappingURL=turntable-viewer.esm.js.map

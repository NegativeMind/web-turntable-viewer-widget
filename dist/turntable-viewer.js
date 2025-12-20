class M {
  constructor(e, t, i, a, s, o) {
    this.loadingStartTime = null, this.lastProgressTime = 0, this.lastProgressPercentage = 0, this.container = e, this.iframe = t, this.loadingOverlay = i, this.loadingText = a, this.progressFill = s, this.progressText = o;
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
      this.loadingOverlay.classList.add("hidden");
      const e = this.container.querySelector("#angle-display");
      e ? (e.style.display = "block", console.log("Angle display made visible after loading")) : console.log("Angle display element not found (optional element)");
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
      const a = Math.round(270);
      this.loadingOverlay.style.width = "480px", this.loadingOverlay.style.height = `${a}px`, console.log(`Adjusted loading overlay size to default: 480x${a}`);
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
    const t = Date.now(), i = t - this.loadingStartTime, a = t - this.lastProgressTime;
    if (e > this.lastProgressPercentage) {
      this.lastProgressTime = t, this.lastProgressPercentage = e;
      return;
    }
    (a > 3e4 || i > 6e4) && (console.warn(`Loading timeout detected. Stalled: ${a}ms, Total: ${i}ms`), this.loadingText && (this.loadingText.textContent = "ローディングが停止しました - リロードボタンを押してください", this.loadingText.style.color = "#ff6b6b"), this.loadingStartTime = null);
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
function u(l) {
  return l instanceof Error ? l.message : String(l);
}
function m(l) {
  return new Promise((e) => setTimeout(e, l));
}
function f(l, e, t) {
  return Promise.race([
    l,
    new Promise(
      (i, a) => setTimeout(() => a(new Error(t || "Operation timed out")), e)
    )
  ]);
}
class w {
  constructor(e, t, i) {
    this.container = e, this.iframe = t, this.config = i;
  }
  /**
   * 表示サイズに基づいてPIXELS_PER_ROTATIONを動的に計算
   */
  calculatePixelsPerRotation() {
    const e = parseInt(this.iframe.getAttribute("width") || "0"), t = this.container.clientWidth || 0, i = this.iframe.clientWidth || 0, a = Math.max(t, i) || 0, s = e || a || 320;
    console.log(`Container width for calculation: ${s}px (html: ${e}, container: ${t}, iframe: ${i})`);
    let r = s / 640 * 1200;
    return s <= 480 && (r *= 1.2), r = Math.max(250, Math.min(3e3, r)), console.log(`Calculated PIXELS_PER_ROTATION: ${Math.round(r)} for width: ${s}px`), Math.round(r);
  }
  /**
   * 表示サイズに応じた動画品質選択
   */
  selectVideoQuality() {
    const e = parseInt(this.container.getAttribute("video-width") || "0"), t = parseInt(this.container.getAttribute("video-height") || "0"), i = parseInt(this.iframe.getAttribute("width") || "0"), a = parseInt(this.iframe.getAttribute("height") || "0"), s = this.iframe.clientWidth || this.container.clientWidth || 0;
    this.iframe.clientHeight || this.container.clientHeight;
    const o = e || i || s || 480, n = t || a || o, r = o * n, g = Math.sqrt(r), c = window.devicePixelRatio || 1;
    let d;
    if (i && a || e && t) {
      const p = Math.min(c, 1.5);
      d = g * p;
    } else
      d = g * c;
    let h = "240p";
    return d <= 240 ? h = "240p" : d <= 360 ? h = "360p" : d <= 480 ? h = "540p" : d <= 960 ? h = "720p" : d <= 1280 ? h = "1080p" : d <= 1920 ? h = "2k" : h = "4k", console.log(`Selected quality: ${h} for effective size: ${d}px (${o}x${n})`), h;
  }
  /**
   * 動画URLを構築
   */
  buildVideoUrl() {
    var d;
    const e = this.selectVideoQuality(), t = parseInt(this.container.getAttribute("video-width") || "0"), i = parseInt(this.container.getAttribute("video-height") || "0"), a = parseInt(this.iframe.getAttribute("width") || "0"), s = parseInt(this.iframe.getAttribute("height") || "0");
    let o = t || a || 480, n = i || s || o;
    const r = window.innerWidth || document.documentElement.clientWidth;
    if (r <= 768) {
      const h = this.container.clientWidth || ((d = this.container.parentElement) == null ? void 0 : d.clientWidth) || r, p = Math.floor(h * 0.9);
      p > 200 && (o = p, n = p);
    }
    this.iframe.setAttribute("width", o.toString()), this.iframe.setAttribute("height", n.toString()), r <= 768 && (this.iframe.style.width = o + "px", this.iframe.style.height = n + "px", this.iframe.style.maxWidth = "none", this.iframe.style.display = "block", console.log(`Applied direct CSS styles: ${o}x${n}`));
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
    return console.log(`Video URL set: ${c} (Size: ${o}x${n}, Screen: ${r})`), c;
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
      const t = new AbortController(), i = setTimeout(() => t.abort(), 1e4), a = await fetch(e, {
        signal: t.signal,
        referrerPolicy: "no-referrer",
        headers: {
          Accept: "application/json"
        }
      });
      if (clearTimeout(i), !a.ok)
        throw a.status === 404 ? new Error(`Video not found (ID: ${this.config.videoId}). Please check the video ID.`) : a.status === 403 ? new Error(`Access denied to video (ID: ${this.config.videoId}). Video may be private.`) : a.status >= 500 ? new Error(`Vimeo server error (status: ${a.status}). Please try again later.`) : new Error(`HTTP error! status: ${a.status}`);
      const s = await a.json();
      if (!s || typeof s != "object")
        throw new Error("Invalid API response format");
      if (!s.width || !s.height || s.width <= 0 || s.height <= 0)
        throw new Error("Invalid video dimensions in API response");
      const o = s.height / s.width;
      return console.log(`API Video dimensions: ${s.width}x${s.height}, aspect ratio: ${o.toFixed(3)}`), {
        width: s.width,
        height: s.height,
        aspectRatio: o,
        title: s.title || "Untitled Video"
      };
    } catch (e) {
      return e.name === "AbortError" ? console.warn("API request timed out, using default aspect ratio") : console.warn("Could not fetch video info from API:", u(e)), {
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
      const i = parseInt(this.iframe.getAttribute("width") || "0"), a = parseInt(this.iframe.getAttribute("height") || "0");
      if (this.iframe.style.visibility = "hidden", i && a) {
        console.log(`Both width and height specified: ${i}x${a}`), this.container.classList.add("initialized"), this.iframe.style.visibility = "visible", this.iframe.classList.add("size-ready"), console.log("Container and iframe ready with fixed size"), t == null || t();
        return;
      }
      if (i || a) {
        e == null || e(5, "Getting video information...");
        const s = await this.getVideoInfoFromAPI();
        if (i && !a) {
          const o = Math.round(i * s.aspectRatio);
          this.iframe.setAttribute("height", o.toString()), console.log(`Set height from width: ${i}x${o} (aspect ratio: ${s.aspectRatio.toFixed(3)})`);
        } else if (a && !i) {
          const o = Math.round(a / s.aspectRatio);
          this.iframe.setAttribute("width", o.toString()), console.log(`Set width from height: ${o}x${a} (aspect ratio: ${s.aspectRatio.toFixed(3)})`);
        }
        this.container.classList.add("initialized"), this.iframe.style.visibility = "visible", this.iframe.classList.add("size-ready"), console.log("Container and iframe size ready, made visible"), t == null || t();
      } else {
        e == null || e(5, "Getting video information...");
        const o = await this.getVideoInfoFromAPI(), n = Math.round(480 * o.aspectRatio);
        this.iframe.setAttribute("width", "480"), this.iframe.setAttribute("height", n.toString()), console.log(`Set default size: 480x${n} (aspect ratio: ${o.aspectRatio.toFixed(3)})`), this.container.classList.add("initialized"), this.iframe.style.visibility = "visible", this.iframe.classList.add("size-ready"), console.log("Container and iframe size ready with default size"), t == null || t();
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
        const a = Math.round(t * 0.5625);
        this.iframe.setAttribute("height", a.toString()), console.log(`Fallback: Set height from width: ${t}x${a} (16:9 default aspect ratio)`);
      } else if (i && !t) {
        const a = Math.round(i / 0.5625);
        this.iframe.setAttribute("width", a.toString()), console.log(`Fallback: Set width from height: ${a}x${i} (16:9 default aspect ratio)`);
      } else {
        const s = Math.round(270);
        this.iframe.setAttribute("width", "480"), this.iframe.setAttribute("height", s.toString()), console.log(`Fallback: Set default size: 480x${s} (16:9 default aspect ratio)`);
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
class v {
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
      throw new Error(`Failed to create Vimeo player: ${u(t)}`);
    }
  }
  /**
   * プレイヤーの基本情報取得
   */
  async getPlayerDuration(e, t = !1, i) {
    i == null || i(60, "Loading player settings...");
    const a = t ? 15e3 : 1e4, s = await f(
      e.getDuration(),
      a,
      "Failed to get video duration"
    );
    if (console.log("Duration:", s), !s || s <= 0)
      throw new Error("Invalid video duration received");
    return s;
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
      ), a = await f(
        e.getVideoHeight(),
        3e3,
        "Failed to get video height"
      ), s = a / i;
      console.log(`Player Video dimensions: ${i}x${a}, aspect ratio: ${s.toFixed(3)}`);
      const o = parseInt(this.iframe.getAttribute("width") || "480"), r = parseInt(this.iframe.getAttribute("height") || "480") / o;
      if (!parseInt(this.container.getAttribute("video-height") || "0") && Math.abs(r - s) > 0.01) {
        const c = Math.round(o * s);
        this.iframe.setAttribute("height", c.toString()), console.log(`Fine-tuned iframe size: ${o}x${c} (aspect ratio: ${s.toFixed(3)})`), t == null || t();
      } else
        console.log("Aspect ratio already correct, no adjustment needed");
    } catch (i) {
      console.warn("Could not get video dimensions, keeping current size:", u(i)), t == null || t();
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
    for (const a of i)
      try {
        await f(a.action(), 3e3, `Failed to set ${a.name}`), console.log(`Successfully set ${a.name}`);
      } catch (s) {
        console.warn(`Setting ${a.name} failed:`, u(s)), a.fallback();
      }
  }
  /**
   * 動画の事前ロード（失敗しても続行可能）
   */
  async preloadVideo(e, t, i) {
    try {
      i == null || i(85, "Buffering video..."), console.log("Starting video buffer preload...");
      const a = [0, 0.5];
      for (let s = 0; s < a.length; s++) {
        const o = a[s], n = t * o;
        await f(
          e.setCurrentTime(n),
          5e3,
          `Preload seek timeout at ${o * 100}%`
        ), await m(300), i == null || i(85 + (s + 1) * 2, `Buffering ${Math.round(o * 100)}%...`);
      }
      return await f(e.setCurrentTime(0), 5e3, "Preload final seek timeout"), console.log("Video buffer preload completed"), !0;
    } catch (a) {
      return console.log("Video buffer preload skipped:", u(a)), !1;
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
    for (const a of i)
      try {
        await f(a.action(), 3e3, `Failed to ${a.name}`), console.log(`Successfully executed: ${a.name}`);
      } catch (s) {
        a.optional ? console.log(`${a.name} skipped (likely blocked by browser autoplay policy)`) : console.warn(`Action ${a.name} failed:`, u(s));
      }
  }
}
class E {
  constructor(e, t, i, a, s, o) {
    this.container = e, this.dragOverlay = t, this.state = i, this.config = a, this.calculatePixelsPerRotation = s, this.onAngleUpdate = o, this.boundMouseDown = this.onMouseDown.bind(this), this.boundMouseMove = this.onMouseMove.bind(this), this.boundMouseUp = this.onMouseUp.bind(this), this.boundTouchStart = this.onTouchStart.bind(this), this.boundTouchMove = this.onTouchMove.bind(this), this.boundTouchEnd = this.onTouchEnd.bind(this);
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
    const i = this.calculatePixelsPerRotation(), s = e * 0.9 / i, o = this.config.isClockwise ? -s * this.state.duration : s * this.state.duration;
    return ((this.state.startTime + o) % this.state.duration + this.state.duration) % this.state.duration;
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
    const a = performance.now();
    a - this.state.lastDragUpdate < 100 || (this.state.lastDragUpdate = a, this.state.pendingApiCall && cancelAnimationFrame(this.state.pendingApiCall), this.state.pendingApiCall = requestAnimationFrame(() => {
      var o;
      this.state.isDragging && this.state.isPlayerReady && ((o = this.state.player) == null || o.setCurrentTime(i).catch((n) => {
        console.warn("Vimeo API call ignored due to performance:", n);
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
class T {
  constructor(e, t, i, a, s, o, n, r) {
    this.container = e, this.iframe = t, this.angleEl = i, this.angleDisplay = a, this.config = s, this.state = o, this.progressManager = n, this.onReload = r, this.reloadButton = document.createElement("button"), this.createReloadButton();
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
    this.angleDisplay && (this.adjustAngleDisplayPosition(), this.angleDisplay.style.display = "block", console.log("Angle display enabled after successful initialization and position adjustment"));
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
class b {
  constructor(e) {
    this.isReloading = !1, this.dragHandler = null;
    const t = document.getElementById(e);
    if (!t)
      throw new Error(`Container element with id "${e}" not found`);
    this.container = t;
    const i = this.container.querySelector("iframe");
    if (!i)
      throw new Error("iframe element not found in container");
    this.iframe = i;
    const a = this.container.querySelector("#rotation-angle"), s = this.container.querySelector("#angle-display"), o = this.container.querySelector(".drag-overlay");
    if (!o)
      throw new Error("drag-overlay element not found in container");
    this.dragOverlay = o;
    const n = this.container.querySelector(".loading-overlay"), r = this.container.querySelector(".loading-text"), g = this.container.querySelector(".progress-fill"), c = this.container.querySelector(".progress-text");
    if (!n || !r || !g || !c)
      throw new Error("Required loading elements not found in container");
    if (this.progressManager = new M(
      this.container,
      this.iframe,
      n,
      r,
      g,
      c
    ), console.log("DOM elements check:"), console.log("- container:", !!this.container), console.log("- iframe:", !!this.iframe), console.log("- loadingOverlay:", !!n), console.log("- progressFill:", !!g), console.log("- progressText:", !!c), console.log("- loadingText:", !!r), console.log("- angleEl (optional):", !!a), console.log("- angleDisplay (optional):", !!s), !this.container || !this.iframe || !n)
      throw new Error("Required elements not found: container, iframe, or loading-overlay");
    console.log("DOM elements validation passed");
    try {
      this.config = this.getConfig(), console.log("Configuration loaded:", this.config);
    } catch (d) {
      const h = u(d);
      throw console.error("Configuration error:", h), this.showError("Configuration Error", h), d;
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
    }, this.videoConfigManager = new w(this.container, this.iframe, this.config), this.playerInitializer = new v(this.container, this.iframe), this.uiManager = new T(
      this.container,
      this.iframe,
      a,
      s,
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
      RESIZE_DEBOUNCE_MS: 500,
      PLAYER_LOAD_DELAY_MS: 1e3,
      DRAG_THROTTLE_MS: 16,
      isClockwise: i,
      videoId: e
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
        const e = this.iframe.parentElement, t = this.iframe.id, i = this.iframe.className, a = this.iframe.getAttribute("width") || "", s = this.iframe.getAttribute("height") || "";
        if (this.state.player) {
          try {
            await this.state.player.destroy(), console.log("Player destroyed successfully");
          } catch (n) {
            console.warn("Error destroying player:", n);
          }
          this.state.player = null;
        }
        this.iframe.parentElement ? (this.iframe.remove(), console.log("Old iframe removed")) : console.log("iframe already removed by player.destroy()");
        const o = document.createElement("iframe");
        o.id = t, o.className = i, o.setAttribute("allow", "autoplay; fullscreen; picture-in-picture"), o.setAttribute("loading", "lazy"), a && o.setAttribute("width", a), s && o.setAttribute("height", s), e.appendChild(o), this.iframe = o, console.log("iframe element recreated with size:", a, "x", s), this.videoConfigManager = new w(this.container, this.iframe, this.config), this.playerInitializer = new v(this.container, this.iframe), await m(300), this.state = {
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
      const t = u(e);
      t.includes("Failed to create Vimeo player") ? this.showError("プレイヤーエラー", "ビデオプレイヤーを作成できませんでした。接続を確認してリロードしてください。") : t.includes("Video not found") ? this.showError("ビデオが見つかりません", "指定されたビデオが見つかりませんでした。ビデオIDを確認してください。") : t.includes("Access denied") ? this.showError("アクセス拒否", "このビデオは非公開または制限されています。ビデオの権限を確認してください。") : t.includes("Failed to get video duration") ? this.showError("ビデオ情報の取得に失敗", "ビデオの長さを取得できませんでした。ネットワーク接続を確認してリロードしてください。") : this.showError("初期化エラー", `ビデオプレイヤーの読み込みに失敗しました。<br><br>エラー: ${t}<br><br>リロードボタンを押して再試行してください。`), this.videoConfigManager.setInitialSizeFallback(() => {
        this.progressManager.adjustLoadingOverlaySize();
      }), console.log("Error state maintained, loading overlay not hidden");
    }
  }
  /**
   * イベントリスナーの追加
   */
  attachEventListeners() {
    this.dragHandler = new E(
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
window.turntableViewerInstances || (window.turntableViewerInstances = /* @__PURE__ */ new Set());
function y() {
  const l = document.querySelectorAll("[vimeo-video-id]");
  if (l.length === 0) {
    console.warn("No turntable containers found. Make sure elements have vimeo-video-id attribute.");
    return;
  }
  console.log(`Found ${l.length} turntable container(s), checking for new instances...`), l.forEach((e, t) => {
    try {
      if (e.id || (e.id = `turntable-container-${Date.now()}-${t}`, console.log(`Auto-generated ID: ${e.id}`)), window.turntableViewerInstances.has(e.id)) {
        console.log(`TurntableViewer already initialized for container: ${e.id}`);
        return;
      }
      new b(e.id), window.turntableViewerInstances.add(e.id), console.log(`TurntableViewer initialized for container: ${e.id}`);
    } catch (i) {
      console.error(`Failed to initialize TurntableViewer for container ${t}:`, i);
    }
  });
}
document.addEventListener("DOMContentLoaded", y);
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", y) : y();
typeof window < "u" && (window.TurntableViewer = b);
export {
  b as TurntableViewer
};
//# sourceMappingURL=turntable-viewer.js.map

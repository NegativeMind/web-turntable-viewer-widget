/**
 * アプリケーション全体で使用する定数
 * マジックナンバーをここに集約し、意図を明示する
 */

// ─── ドラッグ操作 ─────────────────────────────────────────────────────────────

/** ドラッグ感度係数（deltaX に掛ける倍率） */
export const DRAG_SENSITIVITY_FACTOR = 0.9;

/** この値を超える deltaX は異常値とみなしてスキップ */
export const DRAG_EXTREME_DELTA_PX = 2000;

/** Vimeo API コールの最小間隔（ms）。連続ドラッグ中のスロットリングに使用 */
export const DRAG_API_THROTTLE_MS = 100;

// ─── ローディング・タイムアウト ──────────────────────────────────────────────

/** プログレスが進んでいないと判断するまでの時間（ms） */
export const LOADING_STALL_TIMEOUT_MS = 30_000;

/** ローディング開始からの最大許容時間（ms） */
export const LOADING_TOTAL_TIMEOUT_MS = 60_000;

/** ローディングオーバーレイを非表示にする前の遅延（ms） */
export const LOADING_OVERLAY_HIDE_DELAY_MS = 500;

// ─── デフォルトサイズ・アスペクト比 ─────────────────────────────────────────

/** width / height 属性が省略されたときのデフォルト幅（px） */
export const DEFAULT_VIDEO_WIDTH_PX = 480;

/** API からアスペクト比を取得できなかった場合のフォールバック（9:16 = 縦長） */
export const DEFAULT_ASPECT_RATIO = 9 / 16;

// ─── PIXELS_PER_ROTATION 計算 ────────────────────────────────────────────────

/** 基準となる 1 回転あたりのドラッグ量（px）。baseScreenSize での値 */
export const PPR_BASE_PIXELS = 1200;

/** PPR_BASE_PIXELS が適用される基準画面幅（px） */
export const PPR_BASE_SCREEN_SIZE_PX = 640;

/** この幅以下のとき PPR_SMALL_SCREEN_MULTIPLIER を乗算する */
export const PPR_SMALL_SCREEN_BREAKPOINT_PX = 480;

/** 小画面での感度補正係数 */
export const PPR_SMALL_SCREEN_MULTIPLIER = 1.2;

/** PIXELS_PER_ROTATION の最小クランプ値 */
export const PPR_MIN = 250;

/** PIXELS_PER_ROTATION の最大クランプ値 */
export const PPR_MAX = 3000;

// ─── 動画品質選択 ────────────────────────────────────────────────────────────

/** デバイスピクセル比の上限（高 DPR デバイスで過剰な品質を防ぐ） */
export const QUALITY_DPR_LIMIT = 1.5;

/** スマートフォン判定のブレークポイント（px）。CSS の @media breakpoint と統一する */
export const MOBILE_BREAKPOINT_PX = 768;

// ─── プレーヤー初期化タイムアウト ────────────────────────────────────────────

/** getDuration() の通常タイムアウト（ms） */
export const PLAYER_DURATION_TIMEOUT_MS = 10_000;

/** リロード時の getDuration() タイムアウト（ms）。リロード後は安定まで時間がかかるため長め */
export const PLAYER_DURATION_RELOAD_TIMEOUT_MS = 15_000;

/** setLoop / setVolume 等の個別設定タイムアウト（ms） */
export const PLAYER_SETTING_TIMEOUT_MS = 3_000;

/** preloadVideo での seek タイムアウト（ms） */
export const PLAYER_PRELOAD_TIMEOUT_MS = 5_000;

/** preload の各シーク間の待機時間（ms） */
export const PLAYER_PRELOAD_DELAY_MS = 300;

/** 事前バッファリングするシーク位置（動画全体に対する割合） */
export const PLAYER_PRELOAD_POINTS: readonly number[] = [0.5];

// ─── 慣性スクロール ──────────────────────────────────────────────────────────

/** 慣性の減衰係数（1フレーム=16.67ms あたり）。1に近いほど長く続く */
export const INERTIA_FRICTION = 0.92;

/** この速度（px/ms）を下回ったら慣性を停止する */
export const INERTIA_MIN_VELOCITY_PX_MS = 0.05;

/** 速度計算に使うサンプリングウィンドウ（ms） */
export const INERTIA_VELOCITY_SAMPLE_WINDOW_MS = 80;

// ─── 初期化・リロード遅延 ────────────────────────────────────────────────────

/** iframe に src を設定してからプレーヤー生成までの待機時間（ms） */
export const PLAYER_LOAD_DELAY_MS = 1000;

/** リロード時の追加待機時間（ms）。通常より長く取ることでプレーヤーの安定を待つ */
export const PLAYER_RELOAD_EXTRA_DELAY_MS = 2000;

/** リロード後、DOM が更新されるまでの短い待機時間（ms） */
export const PLAYER_DOM_SETTLE_DELAY_MS = 300;

/**
 * 共通ユーティリティ関数
 */

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function withTimeout<T = any>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(errorMessage || 'Operation timed out')), timeoutMs)
        )
    ]);
}

/**
 * 動画の再生時刻を回転角度（度）に変換する
 * @param seconds  現在の再生時刻（秒）
 * @param duration 動画の総時間（秒）
 * @param isClockwise 時計回りの場合 true
 * @returns 0〜360 の範囲の角度（度）
 */
export function timeToAngle(seconds: number, duration: number, isClockwise: boolean): number {
    if (duration <= 0) return 0;
    const ratio = seconds / duration;
    const raw = isClockwise ? ratio * 360 : 360 - ratio * 360;
    return ((raw % 360) + 360) % 360;
}

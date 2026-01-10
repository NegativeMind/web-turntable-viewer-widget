/**
 * 共通ユーティリティ関数
 */

/**
 * エラーメッセージを取得
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

/**
 * 遅延関数
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * タイムアウト付きPromise実行
 */
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

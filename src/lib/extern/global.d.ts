declare const console: Console;

// KWin's QML engine routes `console.warn` to qWarning, which makes it visible in the journal
// (unlike `console.log`, which goes through qDebug and is filtered out by default).
declare interface Console {
    warn(...data: any[]): void;
}

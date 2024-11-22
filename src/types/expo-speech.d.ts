declare module 'expo-speech' {
    export function speak(text: string, options?: { language?: string, pitch?: number, rate?: number, onDone?: () => void }): void;
    export function stop(): void;
    export function isSpeaking(): boolean;
}

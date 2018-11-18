export type CssClassMap = { [className: string]: boolean };

export type TranslationSet = { [translationKey: string]: string };


export interface TranslationServiceInterface {
    define(translations: TranslationSet): void
    translate(str: string, fallback?: string): string
    bind(selector?: string): void
}

export interface TranslationServiceInjectorInterface {
    create(): Promise<TranslationServiceInterface>
}

export interface FieldInvalidatorInterface {
    invalidate(field: HTMLInputElement, messageKey: string, message?: string): void,
    validate(field: HTMLInputElement)
}
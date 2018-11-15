import { TranslationServiceInterface, TranslationSet } from '../common/interfaces';

export class TranslationService implements TranslationServiceInterface {
    
    
    translations: TranslationSet;

    constructor() {
        this.translations = {};
    }
    
    define(translations: TranslationSet) {
        this.translations = {...this.translations, ...translations};
    }    
    
    translate(key: string, fallback: string = ''): string {
        return this.translations[key] || fallback;
    }

    bind(selector?: string): void {
        let translateElements =
            Array.from(document.querySelectorAll(`${selector || 'body'} [data-ms-translate]`)).map(c => c as any).map(c => c as HTMLElement);
        (translateElements || []).forEach( el => {
            if (el.dataset['msTranslate']) {
                el.textContent = this.translate(el.dataset['msTranslate'] || el.textContent, el.textContent);
            }
            el.classList.add('ms-translated');
        });

        let tooltipElements = 
            Array.from(document.querySelectorAll('[data-tooltip-key]')).map(c => c as any).map(c => c as HTMLElement);

        (tooltipElements || []).forEach( el => {
            let key = el.dataset['tooltipKey'];
            let tooltip = el.dataset['tooltip'];

            if (key) {
                el.dataset['tooltip'] = this.translate(key, tooltip);
            }
        });

    }
}
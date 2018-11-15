import { Component, Method } from '@stencil/core';
import { TranslationServiceInterface, TranslationServiceInjectorInterface } from '../../common/interfaces';
import { TranslationService } from '../../shared/translation-service';

const translator = new TranslationService();

@Component({
    tag: 'ms-translate'
})
export class MsTranslate implements TranslationServiceInjectorInterface {
    
    @Method()
    create(): Promise<TranslationServiceInterface> {
        return new Promise(resolve => { resolve(translator)});
    }
}

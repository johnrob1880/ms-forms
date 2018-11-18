import { Component, Prop, State, Watch, Method } from '@stencil/core';
import { TranslationSet, TranslationServiceInterface, TranslationServiceInjectorInterface } from '../../common/interfaces';

@Component({
    tag: 'ms-language',
    styleUrl: 'ms-language.css'
})
export class MsLanguage {
    @Prop() languageResourcesUrl: string = "/assets/lang"
    @Prop() autoDetect: boolean
    @Prop() definitionJson: string
    @Prop() definition: TranslationSet
    @Prop() scope: string = 'body'
    @Prop() serviceRef: (obj:TranslationServiceInterface) => void
    @State() injected: boolean
    
    @Prop({connect: 'ms-translate'}) injector: TranslationServiceInjectorInterface
    private translationService: TranslationServiceInterface

    private languageKey: string = "en-US"

    @State() currentDefinition: TranslationSet

    @Watch('definition')
    handleDefinition(definition: TranslationSet) {
        if (definition) {
            this.currentDefinition = definition;
            if (this.translationService) {
                this.translationService.define(definition);
                this.translationService.bind(this.scope);
            }
        }
    }

    @Watch('definitionJson')
    handleJson(json: string) {
        if (json && json.length) {
            this.currentDefinition = JSON.parse(json) as TranslationSet;
            if (this.translationService) {
                this.translationService.define(this.currentDefinition);
                this.translationService.bind(this.scope);
            }
        }
    }

    @Method()
    async getCurrentDefinition() {
        return new Promise(resolve => {
            resolve({...this.currentDefinition});
        });        
    }

    @Method() 
    async getLanguageKey() {
        return new Promise(resolve => {
            resolve(this.languageKey);
        });
    }

    render() {
        return (
            <slot></slot>
        );
    }

    componentWillLoad() {
        this.injector.create().then(translationService => {
            this.translationService = translationService;
            this.translationService.define(this.currentDefinition);
            this.translationService.bind(this.scope);

            if (this.definition) {
                this.handleDefinition(this.definition);
            } else if (this.definitionJson) {
                this.handleJson(this.definitionJson);
            }

            if (this.serviceRef) {
                this.serviceRef(this.translationService)
            }

            this.injected = true;
            this.translationService.bind(this.scope);
            
        });
    }

    @Method()
    loadLanguage(url: string) {
        fetch(url).then(res => res.json()).then(result => {
            this.handleDefinition(result);
        }).catch(err => console.error(err));
    }

    componentDidLoad() {
        this.handleJson(this.definitionJson);
        this.handleDefinition(this.definition || {});

        if (this.autoDetect) {
            this.languageKey = (window.navigator as any).userLanguage || window.navigator.language;
            this.loadLanguage(`${this.languageResourcesUrl}/${this.languageKey}.json`);
        }
    }
}

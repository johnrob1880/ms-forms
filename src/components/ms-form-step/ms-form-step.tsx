import { Component, Element, Prop, State, Watch, Method } from '@stencil/core';


@Component({
    tag: 'ms-form-step',
    styleUrl: 'ms-form-step.css'
})
export class MsFormStep {

    @Element() el: HTMLElement
    @Prop() step: number
    @Prop() heading: string
    @Prop() translate: string
    @Prop() show: boolean
    @Prop() renderFunc: (values) => void
    @Prop({mutable: true}) translator: (str:string, fallback?:string) => string
    @State() visible: boolean
    @State() isValid: boolean
    @State() formValues: any = {}
    @Prop() values: {}
    @State() validationMessages: any = {}
    @State() translationKey: string
    headingEl: HTMLElement

    render() {
        return (
            <div class={`ms-form__panel${this.visible && ' ms-show' || ''}`} data-panel={`step${this.step}`}>
                <h4 ref={c => this.headingEl = c as HTMLElement}>{this.heading}</h4>
                { this.renderFunc && this.renderFunc(this.formValues) }
                <slot></slot>
                {Object.keys(this.validationMessages).map(key => 
                    <p class="ms-validation-message" data-ms-translate={key}>{this.validationMessages[key]}</p>)}
            </div>
        );
    }

    @Watch('translator') 
    handleTranslator(newValue: any) {
        this.translator = newValue;
    }

    @Watch('values')
    handleValues(newValues: any) {
        this.formValues = newValues;
    }

    @Watch('show')
    handleShow(newValue: boolean) {
        this.visible = newValue;
    }

    @Method()
    async validates() {
        return Promise.resolve(this.isValid);
    }

    @Method()
    async validate() {
        this.isValid = true;
        this.translationKey = '';

        return new Promise((resolve) => {
            let inputs = Array.from(this.el.querySelectorAll('input, select, textarea'));
            this.validationMessages = {};
            inputs.forEach(inp => {
                let input = inp as HTMLInputElement;
                
                if ('checkValidity' in input && !input.checkValidity()) {
                    this.isValid = false;

                    if (!this.translator) {
                        this.validationMessages['default'] = input.validationMessage;
                        return;
                    } 

                    for(var key in input.validity){
                        if (key !== 'valid') {
                            if (input.validity[key]) {
                                // translate
                                let message = this.translator(`validity.${key}.${input.type}`, this.translator(`validity.${key}`)) || input.validationMessage;
                                let messageKey = `validity.${key}`;

                                if (input.dataset['msTranslationScope']) {
                                    messageKey = `${input.dataset['msTranslationScope']}.validity.${key}`;
                                    message = this.translator(messageKey) || message;
                                }

                                this.validationMessages[messageKey] = message;
                            }
                        }
                   }
                }            
            });
            if (Object.keys(this.validationMessages || {}).length) {
                Array.from(this.el.querySelectorAll('input, select, textarea')).forEach( ctrl => {
                    ctrl.classList.add('ms-touched');
                });
                
            }
            resolve({step: this.step, valid: this.isValid, messages: {...this.validationMessages} });
        })
    }

    componentDidLoad() {
        this.visible = this.show;
        this.isValid = false;
        this.formValues = this.values || {};

        if (this.translate) {
            this.headingEl.dataset['msTranslate'] = this.translate;
        }
    }
}

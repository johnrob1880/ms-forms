import { Component, Element, Prop, State, Watch, Method } from '@stencil/core';
import { FieldInvalidatorInterface } from '../../common/interfaces';
import serialize from 'form-serialize';

@Component({
    tag: 'ms-form-step',
    styleUrl: 'ms-form-step.css'
})
export class MsFormStep {

    @Element() el: HTMLElement
    @Prop() form: string
    @Prop() step: number
    @Prop() heading: string
    @Prop() tooltip: string
    @Prop() tooltipKey: string
    @Prop() headingKey: string
    @Prop() show: boolean
    @Prop() settings: any
    @Prop() settingsIcon: string = "⚙"
    @Prop() renderSettingsFunc: (settings, actions) => void
    @Prop() renderFunc: (values) => void
    @Prop({mutable: true}) translator: (str:string, fallback?:string) => string
    @State() visible: boolean
    @State() isValid: boolean
    @State() formValues: any = {}    
    @Prop() values: {}
    @Prop() validateFunc: (values: any, invalidator: FieldInvalidatorInterface) => boolean
    @State() validationMessages: any = {}
    @State() translationKey: string
    @State() settingsVisible: boolean = false
    @State() stepSettings: any
    headingEl: HTMLElement
    private formName: string

    shouldRenderSettings() {
        return !!(Object.keys(this.stepSettings || {}).length && this.renderSettingsFunc);
    }


    render() {
        let settingsActions = {
            set: (name, val) => {
                this.settings = {...this.settings, ...{[name]: val}};
            },
            close: (e:UIEvent) => {
                e.preventDefault();
                this.settingsVisible = false;
            }
        }

        
        return (
            <div class={`ms-form__panel${this.visible && ' ms-show' || ''}`} data-panel={`step${this.step}`}>
                <h4><span ref={c => this.headingEl = c as HTMLElement}>{this.heading}</span>
                    {this.shouldRenderSettings() && <a data-tooltip="Settings" data-tooltip-position="left" data-tooltip-key="settings" href="javascript: void(0);" onClick={this.handleSettingsClick.bind(this)} class="ms-form__panel__settings-icon">{this.settingsIcon}</a>}
                </h4>
                {this.shouldRenderSettings() && <div style={{display: this.settingsVisible ? 'block' : 'none'}} class="ms-form__panel_settings">
                    {this.renderSettingsFunc(this.stepSettings, settingsActions)}
                </div>}
                { this.renderFunc && this.renderFunc(this.formValues) }
                <slot></slot>
                {Object.keys(this.validationMessages).map(key => 
                    <p class="ms-validation-message" data-ms-translate={key}>{this.validationMessages[key]}</p>)}
            </div>
        );
    }

    handleSettingsClick(e:UIEvent) {
        e.preventDefault();
        this.settingsVisible = !this.settingsVisible
    }

    @Watch('headingKey') 
    handleHeadingKeyValue(newValue: string) {
        this.headingEl.dataset['msTranslate'] = newValue;
    }

    @Watch('translator') 
    handleTranslator(newValue: any) {
        this.translator = newValue;
    }

    @Watch('settings') 
    handleSettings(newSettings: any) {
        this.stepSettings = {...newSettings};
    }

    @Watch('values')
    handleValues(newValues: any) {
        this.formValues = newValues;
    }

    @Watch('show')
    handleShow(newValue: boolean) {
        this.visible = newValue;
    }

    @Watch('form')
    handleForm(name: string) {
        this.formName = name;
    }

    @Method()
    async validates() {
        return Promise.resolve(this.isValid);
    }

    @Method()
    async validate() {
        this.isValid = true;
        this.translationKey = '';
        this.el.classList.remove('ms-has-errors');

        return new Promise((resolve) => {
            let inputs = Array.from(this.el.querySelectorAll('input, select, textarea'));
            this.validationMessages = {};

            if (this.validateFunc) {
                console.log('validate el', this.el.parentNode, serialize);
                
                let values = serialize(document.forms[this.formName], { hash: true, empty: true});

                if (!this.validateFunc(values, { 
                    invalidate: (field: HTMLInputElement, messageOrKey: string) => {

                        field.setCustomValidity(this.translator(messageOrKey, messageOrKey || 'This field is invalid.'));                        
                    },
                    validate: (field: HTMLInputElement) => {
                        field.setCustomValidity('');
                    }
                })) {
                    this.isValid = false;
                }
            }

            inputs.forEach(inp => {
                let input = inp as HTMLInputElement;
                
                if ('checkValidity' in input && !input.checkValidity()) {
                    this.isValid = false;
                    this.el.classList.add('ms-has-errors');

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

                                if (input.dataset['msCustomError']) {
                                    messageKey = messageKey.replace('customError', input.dataset['msCustomError']);
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
        this.stepSettings = {...this.settings};
        this.formName = this.form;

        if (this.headingKey) {
            this.headingEl.dataset['msTranslate'] = this.headingKey;
        }
    }
}

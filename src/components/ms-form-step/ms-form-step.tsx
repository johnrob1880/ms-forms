import { Component, Element, Prop, State, Watch, Method } from '@stencil/core';


@Component({
    tag: 'ms-form-step',
    styleUrl: 'ms-form-step.css'
})
export class MsFormStep {

    @Element() el: HTMLElement
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
    @State() validationMessages: any = {}
    @State() translationKey: string
    @State() settingsVisible: boolean = false
    @State() stepSettings: any
    headingEl: HTMLElement

    shouldRenderSettings() {
        return !!(Object.keys(this.stepSettings || {}).length && this.renderSettingsFunc);
    }


    render() {
        let settingsActions = {
            set: (name, val) => {
                this.settings = {...this.settings, ...{[name]: val}};
                console.log('setting set', this.settings);
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
        console.log('click', this.settingsVisible, this.renderSettingsFunc); 
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
        this.stepSettings = {...this.settings};

        if (this.headingKey) {
            this.headingEl.dataset['msTranslate'] = this.headingKey;
        }
    }
}

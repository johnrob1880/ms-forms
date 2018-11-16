import { Component, Prop, State, Element } from '@stencil/core';
import { CssClassMap, TranslationServiceInjectorInterface, TranslationServiceInterface } from '../../common/interfaces';

import serialize from 'form-serialize';

const without = (values, name) => {
    let temp = {...values};
    delete temp[name];
    return temp;
}

@Component({
    tag: 'ms-form',
    styleUrl: 'ms-form.scss'
})
export class MsForm {

    @Element() el: Element;
    @Prop() id: string
    @Prop() heading: string
    @Prop() steps: number
    @Prop() finishText: string = "Finish 🠪"
    @Prop() backText: string = "🠨 Back"
    @Prop() nextText: string = "Next 🠪"
    @Prop() visibleOnResults: boolean = true

    @Prop({connect: 'ms-translate'}) injector: TranslationServiceInjectorInterface
    
    @State() activeStep: number = 0
    @State() finished: boolean
    @State() canComplete: boolean
    @State() injected: boolean
    formEl: HTMLFormElement
    panelCache: HTMLMsFormStepElement[];
    resultsCache: HTMLMsFormResultElement[];
    stepValidations: any = {}
    private translationService: TranslationServiceInterface

    async setActive(step) {
        if (this.finished) {
            this.finished = false;
            this.resultsCache.forEach( result => {
                result.show = false;
            })
        } else if (step === this.activeStep) return;  

        let visitedPanels = this.canComplete ? [...this.panelCache] : this.panelCache.filter(panel => panel.step <= this.activeStep) || [];

        const move = () => {
            this.activeStep = step;

            if (this.activeStep === this.steps) {
                this.canComplete = true;
            }

            const values = without(serialize(this.formEl, { hash: true, empty: true}), '__ms_stage');

            this.panelCache.forEach(panel => {
                if (this.activeStep == panel.step) {
                    panel.values = values;
                    panel.show = true;

                    // set focus
                    let inp = panel.querySelectorAll('input, select, textarea')[0];
                    
                    if (inp && inp instanceof HTMLElement) {
                        setTimeout(() => {
                            (inp as HTMLElement).focus();
                        }, 10);                        
                    }

                } else {
                    panel.show = false;
                }

            });
        }

        if (visitedPanels.length) {

            let promises = [];

            visitedPanels.forEach(currentPanel => {
                promises.push(currentPanel.validate());
            })

            await Promise.all(promises).then((data) => {
                [...data].forEach( d => {
                    this.stepValidations[d.step] = d.valid ? '✓' : 'ǃ'
                })
                move();
            }).catch(err => {
                console.log('panel errors', err);
                move();
            })
        } else {
           move();
        }
    }

    async validate(panels: HTMLMsFormStepElement[]) {
        return new Promise( async (resolve, reject) => {
            let promises = [];

            panels.forEach(currentPanel => {
                promises.push(currentPanel.validate());
            })

            await Promise.all(promises).then((data) => {
                [...data].forEach( d => {
                    this.stepValidations[d.step] = d.valid ? '✓' : 'ǃ'
                })
                resolve(true);

            }).catch(err => {
                console.log('panel errors', err);
                reject(err);
            })
        })
    }

    async moveNext(e: UIEvent) {
        e.preventDefault();
        this.setActive(this.activeStep + 1);

    }
    async moveBack(e: UIEvent) {
        e.preventDefault();
        this.setActive(this.activeStep - 1);
    }
    async finish(e: UIEvent) {
        e.preventDefault();
        if (!this.formEl.checkValidity()) {
            return;
        }

        this.finished = true;

        this.panelCache.forEach( panel => {
            panel.show = false;
        });

        this.resultsCache.forEach( result => {
            result.show = true;
            let actions = { 
                reset: (e) => { e.preventDefault(); this.setActive(1) }, 
                back: (e) => { e.preventDefault(); this.setActive(this.steps) }
            };
            result.actions = actions;
            result.values = without(serialize(this.formEl, { hash: true, empty: true}), '__ms_stage');
        });
    }

    private getTooltip(step) {
        let panel = this.panelCache && this.panelCache[step - 1];        
        if (!panel) { return '' }
        let text = panel.heading || `Step ${step}`;
        return panel.translate && this.translate(panel.translate, text) || text;
    }

    private getTooltipKey(step) {
        let panel = this.panelCache && this.panelCache[step - 1];        
        if (!panel) { return '' }
        return panel.translate || '';
    }


    private translate(str, fallback) {
        //console.log('t', str, fallback, this.translationService);
        return this.translationService && this.translationService.translate(str, fallback) || fallback;
    }

    render() {
        let n = Array.from(Array(this.steps).keys());

        let styles = {
            '--ms-form-progress-width': `calc(100% / ${this.steps - 1} * ${this.activeStep > 1 ? this.activeStep - 1 : 0})`
        }

        return (
            <form ref={c => this.formEl = c as HTMLFormElement} class="ms-form" style={styles} novalidate>
                <div style={{display: this.finished ? (this.visibleOnResults ? 'block' : 'none') : 'block'}}>
                    <slot name="header"></slot>
                    {n.map(step => <input type="radio" data-steps={this.steps} data-step={step + 1} id={`step${step + 1}`} name="__ms_stage" checked={step + 1 === this.activeStep} onClick={this.setActive.bind(this, step + 1)} />)}
                    <div class="ms-form__stages">
                        {n.map(step => <div><label data-tooltip-key={this.getTooltipKey.call(this, step + 1)} data-tooltip={this.getTooltip.call(this, step + 1)} class={this.getStepClassMap(step + 1)} htmlFor={`step${step + 1}`}>{this.getStepLabel(step + 1)}</label></div>)}
                    </div>
                    <div class="ms-form__progress"><div></div></div>
                    <div class="ms-form__panels">
                        <slot name="steps"></slot>
                        {!this.finished && <div class="ms-form__panels__actions">
                            <div>{this.activeStep > 1 && <button class="ms-back-btn" tabindex={-1} onClick={this.moveBack.bind(this)} data-ms-translate="actions.back">{this.backText}</button>}</div>
                            <div>{this.activeStep < this.steps && <button class="ms-primary ms-next-btn" onClick={this.moveNext.bind(this)} data-ms-translate="actions.next">{this.nextText}</button>}
                            {this.canFinish() && <button class="ms-primary ms-finish-btn" type="submit" onClick={this.finish.bind(this)} data-ms-translate="actions.finish">{this.finishText}</button>}</div>
                        </div>}
                    </div>
                </div>
                <div class={this.getResultsClassMap()}>
                    <slot name="results"></slot>
                </div>
            </form>
        );
    }

    private getStepClassMap(index): CssClassMap {
        return {
          ['ms-complete']: this.activeStep > index || this.canComplete,
          ['ms-errors']: this.stepValidations[index] === 'ǃ' && !this.finished,
          ['ms-active']: this.activeStep === index
        };
    }

    private getResultsClassMap(): CssClassMap {
        return {
            ['ms-form__results']: true,
            ['ms-results-only']: !this.visibleOnResults
        }
    }

    private getStepLabel(index): string {
        if (this.finished) {
            return `${index}`
        }
        //{step + 1 < this.activeStep ? (this.stepValidations[step + 1] === '' ? : '') : (this.finished ? '✓' : `${step + 1}`)}
        return (this.activeStep === index && !this.finished) ? `${index}` : (this.stepValidations[index] === '✓' ? '✓' : `${index}`);
    }

    private canFinish():boolean {
        return this.activeStep === this.steps || this.canComplete;
    }

    componentWillLoad() {
        this.injector.create().then(translationService => {
            this.translationService = translationService;
            this.translationService.bind('body');

            const t = (str: string, fallback?:string) => {
                return this.translationService.translate(str, fallback);
            }
            // inject translator
            (this.panelCache || []).forEach( panel => {
                panel.translator = t;
            })
            
            this.injected = true;
        });
    }
    
    componentDidLoad() {
        this.panelCache = Array.from(this.el.querySelectorAll('ms-form-step')).map(c => c as any).map(c => c as HTMLMsFormStepElement);
        this.resultsCache = Array.from(this.el.querySelectorAll('ms-form-result')).map(c => c as any).map(c => c as HTMLMsFormResultElement);
        
        let n = Array.from(Array(this.steps).keys());
        n.forEach( i => {
            this.stepValidations[i] = `ǃ`;
        })
        this.setActive(1);

        const addTouched = (e:UIEvent) => {
            (e.target as HTMLElement).classList.add('ms-touched');

            if (e instanceof KeyboardEvent === false) return;

            // move on enter
            let keyEvent = (e as KeyboardEvent);
            let key = keyEvent.keyCode || keyEvent.which;
            if (key == 13) {
                e.preventDefault();
                e.stopPropagation();
                if (this.activeStep < this.steps) {
                    this.setActive(this.activeStep + 1);
                } else if (this.activeStep === this.steps) {
                    this.finish(e);
                }
            }
        }

        // Validation styles only after touched
        Array.from(this.el.querySelectorAll('input, select, textarea')).forEach( inp => {
            inp.addEventListener('blur', addTouched);
            inp.addEventListener('keydown', addTouched);
        });

        document.body.addEventListener('keydown', (e: KeyboardEvent) => {
            let keyCode = e.keyCode || e.which;

            if (keyCode === 27) {  
                e.preventDefault();              
                this.setActive(1);
            }

            if(e.shiftKey && keyCode == 9 && this.activeStep > 1) { 
                e.preventDefault();
                this.setActive(this.activeStep - 1);
            } else if (keyCode === 9 && this.activeStep + 1 < this.steps) {
                e.preventDefault();
                this.setActive(this.activeStep + 1);
            }
        });       
    }
}

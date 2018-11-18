import { Component, State } from '@stencil/core';
import { TranslationServiceInterface } from '../../common/interfaces';

@Component({
    tag: 'ms-form-example',
    styleUrl: 'ms-form-example.css'
})
export class MsFormExample {

    @State() settings: any

    settingsEl: JSX.Element
    translate: TranslationServiceInterface

    render() {

        return (
            <ms-language autoDetect={true} serviceRef={c => this.translate = c as TranslationServiceInterface}>
                <ms-form steps={5} name="exampleForm">
                    <div class="ms-form__header" slot="header">
                    <h2 data-ms-translate="form.title">Multistep Form Example</h2>
                    <p data-ms-translate="form.description" class="ms-description">An example multi-step form with language support.</p>
                    </div>
                    <div slot="steps">
                    <ms-form-step step={1} heading="Firstname" headingKey="firstname" tooltipKey="firstname.tooltip"
                        settings={this.settings} renderSettingsFunc={this.renderSettings.bind(this)}>
                        <input data-ms-translation-scope="firstname" type="text" name="firstname" required minlength="3" />                        
                    </ms-form-step>
                    <ms-form-step step={2} heading="Lastname" headingKey="lastname"
                        validateFunc={(values, invalidator) => {
                            console.log('invalidate values', values);
                            if (values.firstname === 'Donald' && values.lastname === 'Trump') {
                                invalidator.invalidate(
                                    document.querySelector('[name="lastname"]'), 
                                    'validity.lastname.trumpNotAllowed', 
                                    'Firstname cannot be Donald when lastname is Trump. Only Ivanka is allowed!'
                                    );
                                return false;
                            } else {
                                invalidator.validate(document.querySelector('[name="lastname"]'));
                            }
                            return true;
                        }}>
                        <input type="text" name="lastname" data-ms-translation-scope="lastname" data-ms-custom-error="trumpNotAllowed" required />
                    </ms-form-step>
                    <ms-form-step step={3} heading="Email" headingKey="email">
                        <input type="email" name="email" required />
                    </ms-form-step>
                    <ms-form-step step={4} heading="Age" headingKey="age">
                        <input type="number" name="age" min="1" max="130" required />
                    </ms-form-step>
                    <ms-form-step step={5} heading="Comments" headingKey="comments">
                        <textarea name="comments"></textarea> 
                    </ms-form-step>
                    </div>
                    <div slot="results">
                    <ms-dump-result lang="en"></ms-dump-result>
                    </div>
                </ms-form>
                </ms-language>
        );
    }

    renderSettings(settings) {

        const updateSetting = (name, val) => {            
            this.settings = {...this.settings, ...{[name]: val}}
        }

        return (
            <div>
                <label>Measurement System: </label>
                <input type="radio" value="imperial" onClick={() => updateSetting('measurementSystem', 'imperial')} name="measurementSystem" checked={settings.measurementSystem === 'imperial'} /> lbs
                <input type="radio" value="metric" onClick={() => updateSetting('measurementSystem', 'metric')} name="measurementSystem"  /> kg
            </div>
        )
    }

    componentWillLoad() {
        this.settings = {
            measurementSystem: 'imperial'
        }
    }
}

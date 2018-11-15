import { Component, Prop, State } from '@stencil/core';

@Component({
    tag: 'ms-dump-result',
    styleUrl: 'ms-dump-result.css'
})
export class MsDumpResult {


    @Prop() lang: string = "en"

    @State() injected: boolean
    render() {
        return (
            <ms-form-result
                template={(values, actions) => (
                <div>{Object.keys(values).map( key => (<p>
                    <label data-ms-translate={key}>{key}</label>: {values[key]}
                </p>))}
                <div class="ms-form-actions">
                    <button onClick={actions.back} data-ms-translate="actions.back">🠨 Go Back</button>
                    <button class="ms-primary ms-start-over" onClick={actions.reset} data-ms-translate="actions.start-over">Start Over ⟳</button>
                </div>
                </div>)
            }></ms-form-result>
        );
    }
}

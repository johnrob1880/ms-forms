import { Component, Prop, State, Watch } from '@stencil/core';


@Component({
    tag: 'ms-form-result',
    styleUrl: 'ms-form-result.scss'
})
export class MsFormResult {

    @Prop() show: boolean
    @Prop() template: (values, actions) => void
    @Prop() values: any
    @Prop() actions: any
    @State() isVisible: boolean
    @State() formValues: any = {}
    @State() formActions: any = {}

    render() {
        return (
            <div class={`ms-form__result${this.isVisible ? ' ms-show' : ''}`}>
                {this.template && this.template(this.formValues || {}, this.actions || {})}
            </div>
        );
    }

    @Watch('show') 
    handleShow(newValue: boolean) {
        this.isVisible = newValue;
    }

    @Watch('actions') 
    handleActions(newValue: any) {
        this.formActions = newValue;
    }

    @Watch('values') 
    handleValues(newValues: any) {
        this.formValues = newValues;
    }
    
    componentDidLoad() {
        this.isVisible = this.show;
        this.formValues = this.values || {};
        this.formActions = this.actions || {};
    }

}

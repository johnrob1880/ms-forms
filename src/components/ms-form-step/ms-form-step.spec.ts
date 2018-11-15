import { TestWindow } from '@stencil/core/testing';
import { MsFormStep } from './ms-form-step';

describe('ms-form-step', () => {
  it('should build', () => {
    expect(new MsFormStep()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLMsFormStepElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [MsFormStep],
        html: '<ms-form-step></ms-form-step>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});

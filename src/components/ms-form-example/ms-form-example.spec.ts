import { TestWindow } from '@stencil/core/testing';
import { MsFormExample } from './ms-form-example';

describe('ms-form-example', () => {
  it('should build', () => {
    expect(new MsFormExample()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLMsFormExampleElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [MsFormExample],
        html: '<ms-form-example></ms-form-example>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});

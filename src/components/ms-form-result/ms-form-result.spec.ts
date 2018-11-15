import { TestWindow } from '@stencil/core/testing';
import { MsFormResult } from './ms-form-result';

describe('ms-form-result', () => {
  it('should build', () => {
    expect(new MsFormResult()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLMsFormResultElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [MsFormResult],
        html: '<ms-form-result></ms-form-result>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});

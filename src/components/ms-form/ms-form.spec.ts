import { TestWindow } from '@stencil/core/testing';
import { MsForm } from './ms-form';

describe('ms-form', () => {
  it('should build', () => {
    expect(new MsForm()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLMsFormElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [MsForm],
        html: '<ms-form></ms-form>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});

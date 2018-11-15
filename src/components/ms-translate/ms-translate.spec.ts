import { TestWindow } from '@stencil/core/testing';
import { MsTranslate } from './ms-translate';

describe('ms-translate', () => {
  it('should build', () => {
    expect(new MsTranslate()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLMsTranslateElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [MsTranslate],
        html: '<ms-translate></ms-translate>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});

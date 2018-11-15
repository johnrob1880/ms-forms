import { TestWindow } from '@stencil/core/testing';
import { MsLanguage } from './ms-language';

describe('ms-language', () => {
  it('should build', () => {
    expect(new MsLanguage()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLMsLanguageElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [MsLanguage],
        html: '<ms-language></ms-language>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});

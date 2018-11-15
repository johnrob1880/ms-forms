import { TestWindow } from '@stencil/core/testing';
import { MsCompleteResult } from './ms-dump-result';

describe('ms-complete-result', () => {
  it('should build', () => {
    expect(new MsCompleteResult()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLMsCompleteResultElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [MsCompleteResult],
        html: '<ms-complete-result></ms-complete-result>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {cursor}

  });
});

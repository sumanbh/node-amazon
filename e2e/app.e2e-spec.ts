import { AmazonV2Page } from './app.po';

describe('amazon-v2 App', function() {
  let page: AmazonV2Page;

  beforeEach(() => {
    page = new AmazonV2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

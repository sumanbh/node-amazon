import { AmazonPage } from './app.po';

describe('amazon-v2 App', function() {
  let page: AmazonPage;

  beforeEach(() => {
    page = new AmazonPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

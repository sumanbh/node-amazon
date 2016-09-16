import { CyranoPage } from './app.po';

describe('cyrano App', function() {
  let page: CyranoPage;

  beforeEach(() => {
    page = new CyranoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

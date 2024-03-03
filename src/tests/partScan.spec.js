describe("Part Page Scan", function () {

  it('test1', async function() {
    const a11yText = await this.a11yPanel.locator('div.startup-screen-title').textContent();
    const pageText = await this.page.locator(`h1`).textContent();
    await new Promise(function (resolve) {
      setTimeout(resolve, 10000);
    });
    console.log(a11yText)
    console.log(pageText)
  });
  
});
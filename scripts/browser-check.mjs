import { chromium } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const chrome =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let browser;
try {
  browser = await chromium.launch({
    ...(existsSync(chrome) ? { executablePath: chrome } : {}),
    headless: true,
  });
} catch (error) {
  console.error(
    "BROWSER CHECK BLOCKED: browser could not start.\n" +
      error.message.split("\n").slice(0, 2).join("\n"),
  );
  process.exit(1);
}
const base = process.env.CREATOR_TEST_URL || "http://127.0.0.1:3000";
const ids = ["home", "about", "works", "motion", "faq", "contact"];
mkdirSync("test-results", { recursive: true });
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 1000 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.waitForFunction(
      () =>
        document.querySelector("[data-clock]")?.textContent !== "--:--:-- UTC",
    );
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({
      content: "html { scroll-behavior: auto !important; }",
    });
    assert.ok(
      await page.evaluate(() =>
        document.fonts.check('12px "JetBrains Mono Variable"'),
      ),
      "Local font loaded",
    );
    const clock = page.locator("[data-clock]").first();
    const time = await clock.textContent();
    await page.waitForFunction(
      (previous) =>
        document.querySelector("[data-clock]").textContent !== previous,
      time,
    );
    assert.notEqual(await clock.textContent(), time, "Live timestamp advances");
    const geometry = await page.evaluate(
      (ids) => ({
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
        height: document.documentElement.scrollHeight,
        vh: innerHeight,
        tops: ids.map(
          (id) =>
            document.getElementById(id).getBoundingClientRect().top + scrollY,
        ),
        overflow: getComputedStyle(document.body).overflowY,
      }),
      ids,
    );
    assert.ok(
      geometry.width <= geometry.viewport + 1,
      "No horizontal overflow",
    );
    assert.ok(geometry.height > geometry.vh * 4, "Real page height");
    assert.ok(
      geometry.tops.every((top, i, all) => i === 0 || top > all[i - 1]),
      "Sections naturally stacked",
    );
    assert.notEqual(geometry.overflow, "hidden");
    await page.screenshot({
      path: `test-results/${mobile ? "mobile" : "desktop"}-hero.png`,
    });
    const cdp = mobile ? await context.newCDPSession(page) : null;
    async function scroll(direction) {
      if (!mobile) await page.mouse.wheel(0, direction * 600);
      else {
        const start = direction > 0 ? 690 : 220,
          end = direction > 0 ? 220 : 690;
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: 190, y: start }],
        });
        for (let i = 1; i <= 10; i++) {
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: 190, y: start + ((end - start) * i) / 10 }],
          });
          await page.waitForTimeout(20);
        }
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      }
      await page.waitForTimeout(300);
    }
    const reached = new Set(["home"]);
    await scroll(1);
    assert.ok(
      (await page.evaluate(() => scrollY)) > 50,
      "Input physically moves document",
    );
    for (let i = 0; i < 100; i++) {
      const state = await page.evaluate(
        (ids) => ({
          bottom:
            scrollY + innerHeight >= document.documentElement.scrollHeight - 3,
          visible: ids.filter((id) => {
            const r = document.getElementById(id).getBoundingClientRect();
            return r.top < innerHeight && r.bottom > 0;
          }),
        }),
        ids,
      );
      state.visible.forEach((id) => reached.add(id));
      if (state.bottom) break;
      await scroll(1);
    }
    assert.equal(reached.size, 6, "Every section accessible by wheel/touch");
    assert.ok(
      await page.evaluate(
        () =>
          scrollY + innerHeight >= document.documentElement.scrollHeight - 3,
      ),
      "Bottom reached",
    );
    for (let i = 0; i < 100 && (await page.evaluate(() => scrollY > 2)); i++)
      await scroll(-1);
    assert.ok(await page.evaluate(() => scrollY <= 2), "Scroll returns to top");
    if (mobile) await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /WORKS/ })
      .click();
    const stage = page.locator(".gallery-enhanced");
    await stage.waitFor();
    const stageStart = await stage.evaluate(
      (el) => el.getBoundingClientRect().top + scrollY,
    );
    const distance = await page.evaluate(
      () => Math.max(550, innerHeight * 0.85) * 5,
    );
    await page.evaluate((y) => scrollTo(0, y), stageStart + distance * 0.22);
    await page.waitForTimeout(1000);
    const pinnedTop = await stage.evaluate(
      (el) => el.getBoundingClientRect().top,
    );
    const pose = await page
      .locator(".camera-perspective")
      .first()
      .evaluate((el) => getComputedStyle(el).transform);
    await page.evaluate((y) => scrollTo(0, y), stageStart + distance * 0.65);
    await page.waitForTimeout(1000);
    assert.ok(
      Math.abs(
        (await stage.evaluate((el) => el.getBoundingClientRect().top)) -
          pinnedTop,
      ) < 3,
      "Gallery remains pinned while cards rotate",
    );
    assert.notEqual(
      await page
        .locator(".camera-perspective")
        .first()
        .evaluate((el) => getComputedStyle(el).transform),
      pose,
      "Orbit transforms respond to scroll",
    );
    await page.evaluate((y) => scrollTo(0, y), stageStart + distance + 250);
    await page.waitForTimeout(1000);
    assert.ok(
      (await stage.evaluate((el) => el.getBoundingClientRect().top)) < -150,
      "Pin releases after the final card",
    );
    await page.evaluate((y) => scrollTo(0, y), stageStart + distance * 0.4);
    await page.waitForTimeout(1000);
    assert.ok(
      Math.abs(await stage.evaluate((el) => el.getBoundingClientRect().top)) <
        3,
      "Upward scrolling re-enters the finite pin",
    );
    await page.evaluate((y) => scrollTo(0, y), stageStart + 1);
    await page.waitForTimeout(1000);
    const card = page.locator(".camera-card").first();
    await page.screenshot({
      path: `test-results/${mobile ? "mobile" : "desktop"}-orbit.png`,
    });
    await card.click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("button", { name: "Next world" }).click();
    assert.match(await page.locator("#project-title").textContent(), /VELORA/);
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    await page.locator("#faq").scrollIntoViewIfNeeded();
    const question = page.getByRole("button", {
      name: /Can we work together remotely/,
    });
    await question.click();
    assert.equal(await question.getAttribute("aria-expanded"), "true");
    assert.ok(await page.locator("#answer-1").isVisible());
    await question.click();
    assert.equal(await question.getAttribute("aria-expanded"), "false");
    await page.getByRole("link", { name: "BACK TO TOP" }).click();
    await page.getByRole("button", { name: "Pause visual effects" }).click();
    assert.equal(await page.locator(".effects-paused").count(), 1);
    assert.deepEqual(errors, [], "No runtime/hydration errors");
    console.log(
      `PASS ${mobile ? "mobile touch" : "desktop wheel"}: sections, reverse scroll, live clocks, 3D transforms, navigation, project dialog, FAQ and effects control.`,
    );
    await context.close();
  }
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(base);
  await page.locator(".effects-paused").waitFor();
  for (const id of ids) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    assert.ok(await page.locator(`#${id}`).isVisible());
  }
  assert.equal(
    await page
      .locator(".camera-card")
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
    "none",
  );
  console.log(
    "PASS reduced motion: all content accessible without 3D transforms.",
  );
  await context.close();
} finally {
  await browser.close();
}

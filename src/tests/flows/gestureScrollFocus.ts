tests.register("Gesture scroll focus", 15, () => {
    const config = getDefaultConfig();
    config.gestureScroll = true;
    config.gestureScrollFocus = true;
    config.gestureScrollStep = 1; // scroll by pixels, so the amounts below are easy to read

    // Scrolling to a window focuses it, even if the previously focused window is still visible
    {
        const { qtMock, workspaceMock, world } = init(config);
        const [client1, client2, client3] = workspaceMock.createClientsWithWidths(384, 768, 384);
        qtMock.fireShortcut("karousel-focus-start"); // client1 focused, scrolled to the left edge
        Assert.assert(workspaceMock.activeWindow === client1);
        Assert.equal(client1.getActualFrameGeometry().x, tilingArea.x);

        // 50% | 100% | 50%, gesturing so that only the middle (100%) window is in view
        world.gestureScroll(392);
        world.gestureScrollFinish();
        Assert.equal(client2.getActualFrameGeometry().x, tilingArea.x);
        Assert.assert(workspaceMock.activeWindow === client2);

        // gesturing back to the left edge focuses the leftmost window
        world.gestureScroll(-392);
        world.gestureScrollFinish();
        Assert.equal(client1.getActualFrameGeometry().x, tilingArea.x);
        Assert.assert(workspaceMock.activeWindow === client1);
    }

    // A window doesn't have to be entirely in view: a wide window which is only partially visible
    // still wins over a narrow window which is entirely visible, if its center is closer to the
    // center of the screen
    {
        const { qtMock, workspaceMock, world } = init(config);
        const [client1, client2, client3] = workspaceMock.createClientsWithWidths(200, 700, 400);
        Assert.assert(workspaceMock.activeWindow === client3);

        // scrolled to the left edge: client1 is entirely in view, but client2 is centered
        world.gestureScroll(-548);
        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client2);
        // focusing the lazy way also scrolls the focused window entirely into view
        Assert.equal(rectRight(client2.getActualFrameGeometry()), rectRight(tilingArea));
    }

    // When more than one window is in view, the one whose center is the closest to the center of
    // the screen is focused. Client4 is focused (and 100 wide, at the right edge) to
    // start with, so the gesture below moves the view by a single pixel.
    {
        const { qtMock, workspaceMock, world } = init(config);
        const [client1, client2, client3, client4] = workspaceMock.createClientsWithWidths(100, 300, 300, 100);
        Assert.assert(workspaceMock.activeWindow === client4);
        Assert.equal(rectRight(client4.getActualFrameGeometry()), rectRight(tilingArea));

        // scrolled almost to the right edge, the three rightmost windows are in view
        world.gestureScroll(-1);
        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client3);

        // scrolled to the left edge, the three leftmost windows are in view
        world.gestureScroll(-55);
        world.gestureScrollFinish();
        Assert.equal(client1.getActualFrameGeometry().x, tilingArea.x);
        Assert.assert(workspaceMock.activeWindow === client2);
    }

    // Two equally distant windows are in view: the focus doesn't wander
    {
        const { qtMock, workspaceMock, world } = init(config);
        const [client1, client2, client3, client4] = workspaceMock.createClientsWithWidths(152, 300, 300, 100);
        Assert.assert(workspaceMock.activeWindow === client4);
        Assert.equal(rectRight(client4.getActualFrameGeometry()), rectRight(tilingArea));

        // scrolled just past the middle between the two equally wide windows, client3 is closer
        world.gestureScroll(-27);
        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client3);

        // the very middle: equally distant, so the focused window stays
        world.gestureScroll(-1);
        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client3, { message: "client2 and client3 are equally distant, the focus should stay on client3" });

        // one pixel further and client2 is closer already
        world.gestureScroll(-1);
        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client2);
    }

    // Columns as wide as the screen: the one whose center is the closest to the center of the
    // screen is focused
    {
        const { qtMock, workspaceMock, world } = init(config);
        const [client1, client2] = workspaceMock.createClientsWithWidths(768, 768);
        Assert.assert(workspaceMock.activeWindow === client2);
        Assert.equal(client1.getActualFrameGeometry().x, tilingArea.x - 776);

        world.gestureScroll(-400);
        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client1);

        world.gestureScroll(-176);
        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client1);

        world.gestureScroll(776);
        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client2);
    }

    // A gesture which doesn't scroll doesn't change the focus
    {
        const { qtMock, workspaceMock, world } = init(config);
        const [client1, client2, client3] = workspaceMock.createClientsWithWidths(384, 768, 384);
        qtMock.fireShortcut("karousel-focus-start");
        Assert.assert(workspaceMock.activeWindow === client1);

        world.gestureScrollFinish();
        Assert.assert(workspaceMock.activeWindow === client1);
    }
});

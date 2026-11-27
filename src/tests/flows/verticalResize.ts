tests.register("Vertical resize", 10, () => {
    const config = getDefaultConfig();

    const stepSize = config.verticalResizeStep;

    const h1 = getWindowHeight(1);
    const h2 = getWindowHeight(2);
    const h3 = getWindowHeight(3);
    let client1: MockKwinClient, client2: MockKwinClient, client3: MockKwinClient;

    // Single window
    {
        const { qtMock, workspaceMock, world } = init(config);
        [client1] = workspaceMock.createClientsWithWidths(300);
        qtMock.fireShortcut("karousel-focus-start");
        const g1 = client1.getActualFrameGeometry();
        Assert.equal(g1.height, h1);
        Assert.equal(g1.width, 300);

        qtMock.fireShortcut("karousel-window-height-increase-up"); // no-op
        const g1n = client1.getActualFrameGeometry();
        Assert.equal(g1, g1n);
    }

    // Two windows
    {
        const { qtMock, workspaceMock, world } = init(config);
        [client1, client2] = workspaceMock.createClientsWithWidths(300, 300);
        qtMock.fireShortcut("karousel-window-move-left");
        // Verify the layout
        {
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            Assert.equal(g1.height, h2);
            Assert.equal(g2.height, h2);
            Assert.equal(g1.width, 300);
            Assert.equal(g2.width, 300);
        }

        // Upper window
        {
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            qtMock.fireShortcut("karousel-focus-up");
            qtMock.fireShortcut("karousel-window-height-increase-up"); // no-op
            const g1n1 = client1.getActualFrameGeometry();
            const g2n1 = client2.getActualFrameGeometry();
            Assert.equal(g1.height, g1n1.height);
            Assert.equal(g2.height, g2n1.height);
            qtMock.fireShortcut("karousel-window-height-increase-down");
            const g1n2 = client1.getActualFrameGeometry();
            const g2n2 = client2.getActualFrameGeometry();
            Assert.equal(g1.height + stepSize, g1n2.height);
            Assert.equal(g2.height - stepSize, g2n2.height);
        }

        // Lower window
        {
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            qtMock.fireShortcut("karousel-focus-down");
            qtMock.fireShortcut("karousel-window-height-increase-down"); // no-op
            const g1n1 = client1.getActualFrameGeometry();
            const g2n1 = client2.getActualFrameGeometry();
            Assert.equal(g1.height, g1n1.height);
            Assert.equal(g2.height, g2n1.height);
            qtMock.fireShortcut("karousel-window-height-increase-up");
            const g1n2 = client1.getActualFrameGeometry();
            const g2n2 = client2.getActualFrameGeometry();
            Assert.equal(g1.height - stepSize, g1n2.height);
            Assert.equal(g2.height + stepSize, g2n2.height);
        }
    }

    // Three windows
    {
        const { qtMock, workspaceMock, world } = init(config);
        [client1, client2, client3] = workspaceMock.createClientsWithWidths(300, 300, 300);
        qtMock.fireShortcut("karousel-focus-left");
        qtMock.fireShortcut("karousel-window-move-left");
        qtMock.fireShortcut("karousel-focus-right");
        qtMock.fireShortcut("karousel-window-move-left");
        qtMock.fireShortcut("karousel-focus-up");
        qtMock.fireShortcut("karousel-focus-up");
        // Verify the layout
        {
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            const g3 = client3.getActualFrameGeometry();
            Assert.equal(g1.height, h3);
            Assert.equal(g2.height, h3);
            Assert.equal(g3.height, h3);
            Assert.equal(g1.width, 300);
            Assert.equal(g2.width, 300);
            Assert.equal(g3.width, 300);
            Assert.assert(g1.y + g1.height < g2.y);
            Assert.assert(g2.y + g2.height < g3.y);
        }

        // Upper window
        {
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            const g3 = client3.getActualFrameGeometry();
            qtMock.fireShortcut("karousel-window-height-increase-up"); // no-op
            const g1n1 = client1.getActualFrameGeometry();
            const g2n1 = client2.getActualFrameGeometry();
            const g3n1 = client3.getActualFrameGeometry();
            Assert.equal(g1.height, g1n1.height);
            Assert.equal(g2.height, g2n1.height);
            Assert.equal(g3.height, g3n1.height);
            qtMock.fireShortcut("karousel-window-height-increase-down");
            const g1n2 = client1.getActualFrameGeometry();
            const g2n2 = client2.getActualFrameGeometry();
            const g3n2 = client3.getActualFrameGeometry();
            Assert.equal(g1.height + stepSize, g1n2.height);
            Assert.equal(g2.height - stepSize, g2n2.height);
            Assert.equal(g3.height, g3n2.height);
        }

        // Middle window
        {
            qtMock.fireShortcut("karousel-focus-down");
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            const g3 = client3.getActualFrameGeometry();
            qtMock.fireShortcut("karousel-window-height-increase-up");
            const g1n1 = client1.getActualFrameGeometry();
            const g2n1 = client2.getActualFrameGeometry();
            const g3n1 = client3.getActualFrameGeometry();
            Assert.equal(g1.height - stepSize, g1n1.height);
            Assert.equal(g2.height + stepSize, g2n1.height);
            Assert.equal(g3.height, g3n1.height);
            qtMock.fireShortcut("karousel-window-height-increase-down");
            const g1n2 = client1.getActualFrameGeometry();
            const g2n2 = client2.getActualFrameGeometry();
            const g3n2 = client3.getActualFrameGeometry();
            Assert.equal(g1n1.height, g1n2.height);
            Assert.equal(g2n1.height + stepSize, g2n2.height);
            Assert.equal(g3n1.height - stepSize, g3n2.height);
        }

        // Lower window
        {
            qtMock.fireShortcut("karousel-focus-down");
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            const g3 = client3.getActualFrameGeometry();
            qtMock.fireShortcut("karousel-window-height-increase-up");
            const g1n1 = client1.getActualFrameGeometry();
            const g2n1 = client2.getActualFrameGeometry();
            const g3n1 = client3.getActualFrameGeometry();
            Assert.equal(g1.height, g1n1.height);
            Assert.equal(g2.height - stepSize, g2n1.height);
            Assert.equal(g3.height + stepSize, g3n1.height);
            qtMock.fireShortcut("karousel-window-height-increase-down"); // no-op
            const g1n2 = client1.getActualFrameGeometry();
            const g2n2 = client2.getActualFrameGeometry();
            const g3n2 = client3.getActualFrameGeometry();
            Assert.equal(g1n1.height, g1n2.height);
            Assert.equal(g2n1.height, g2n2.height);
            Assert.equal(g3n1.height, g3n2.height);
        }
    }

    // Minimum heights
    {
        const { qtMock, workspaceMock, world } = init(config);
        [client1, client2] = workspaceMock.createClientsWithWidths(300, 300);
        // `minSize` is the minimum size of the client area, the frame is 20 pixels taller in the mock
        const minFrameHeight = h2 - 10;
        client2.minSize = new MockQmlSize(0, minFrameHeight - 20);
        qtMock.fireShortcut("karousel-window-move-left");

        // The minimum still fits, so the column is split evenly
        {
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            Assert.equal(g1.height, h2);
            Assert.equal(g2.height, h2);
        }

        // Resizing stops at the neighbor's minimum height instead of pushing it below it
        {
            qtMock.fireShortcut("karousel-focus-up");
            qtMock.fireShortcut("karousel-window-height-increase-down");
            const g1 = client1.getActualFrameGeometry();
            const g2 = client2.getActualFrameGeometry();
            Assert.equal(g1.height, tilingArea.height - gapV - minFrameHeight);
            Assert.equal(g2.height, minFrameHeight);
            Assert.assert(g1.height < h2 + stepSize); // clamped, not just increased by the step

            qtMock.fireShortcut("karousel-window-height-increase-down");
            const g1n = client1.getActualFrameGeometry();
            const g2n = client2.getActualFrameGeometry();
            Assert.equal(g1n, g1);
            Assert.equal(g2n, g2);
        }
    }

    // Columns too short for the minimum heights of all its windows
    {
        const { qtMock, workspaceMock, world } = init(config);
        [client1, client2] = workspaceMock.createClientsWithWidths(300, 300);
        client1.minSize = new MockQmlSize(0, 400);
        client2.minSize = new MockQmlSize(0, 400);
        qtMock.fireShortcut("karousel-window-move-left");

        // The minimums can't be satisfied, but the windows still fit into the tiling area
        const g1 = client1.getActualFrameGeometry();
        const g2 = client2.getActualFrameGeometry();
        Assert.equal(g1.height, h2);
        Assert.equal(g2.height, h2);
        Assert.equal(g2.y, g1.y + g1.height + gapV);
        Assert.equal(g2.y + g2.height, tilingArea.y + tilingArea.height);
    }
});

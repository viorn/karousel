class Column {
    public grid: Grid;
    public gridX: number;
    private width: number; // TODO: increase column width to contain transients
    private readonly windows: LinkedList<Window>;
    private stacked: boolean;
    private focusTaker: Window|null;
    private static readonly minWidth = 40;

    constructor(grid: Grid, leftColumn: Column|null) {
        this.gridX = 0;
        this.width = 0;
        this.windows = new LinkedList();
        this.stacked = grid.config.stackColumnsByDefault;
        this.focusTaker = null;
        this.grid = grid;
        this.grid.onColumnAdded(this, leftColumn);
    }

    public moveToGrid(targetGrid: Grid, leftColumn: Column|null) {
        if (targetGrid === this.grid) {
            this.grid.moveColumn(this, leftColumn);
        } else {
            this.grid.onColumnRemoved(this, this.isFocused() ? FocusPassing.Type.Immediate : FocusPassing.Type.None);
            this.grid = targetGrid;
            targetGrid.onColumnAdded(this, leftColumn);
            for (const window of this.windows.iterator()) {
                window.client.kwinClient.desktops = [targetGrid.desktop.kwinDesktop];
            }
        }
    }

    public isToTheLeftOf(other: Column) {
        return this.gridX < other.gridX;
    }

    public isToTheRightOf(other: Column) {
        return this.gridX > other.gridX;
    }

    public moveWindowUp(window: Window) {
        this.windows.moveBack(window);
        this.grid.desktop.onLayoutChanged();
    }

    public moveWindowDown(window: Window) {
        this.windows.moveForward(window);
        this.grid.desktop.onLayoutChanged();
    }

    public getWindowCount() {
        return this.windows.length();
    }

    public isEmpty() {
        return this.getWindowCount() === 0;
    }

    public getFirstWindow(): Window {
        return this.windows.getFirst()!;
    }

    public getLastWindow(): Window {
        return this.windows.getLast()!;
    }

    public getAboveWindow(window: Window) {
        return this.windows.getPrev(window);
    }

    public getBelowWindow(window: Window) {
        return this.windows.getNext(window);
    }

    public getWidth() {
        return this.width;
    }

    public getMinWidth() {
        let maxMinWidth = Column.minWidth;
        for (const window of this.windows.iterator()) {
            const minWidth = window.client.kwinClient.minSize.width.ceil();
            if (minWidth > maxMinWidth) {
                maxMinWidth = minWidth;
            }
        }
        return Math.min(maxMinWidth, this.grid.desktop.tilingArea.width); // min width mustn't exceed tilingArea width
    }

    public getMaxWidth() {
        let minMaxWidth = this.grid.desktop.tilingArea.width;
        for (const window of this.windows.iterator()) {
            const maxWidth = window.client.kwinClient.maxSize.width.floor();
            if (maxWidth < minMaxWidth) {
                minMaxWidth = maxWidth;
            }
        }
        return Math.max(minMaxWidth, this.getMinWidth()); // max width mustn't be lower than min width
    }

    public setWidth(width: number, setPreferred: boolean) {
        width = clamp(width, this.getMinWidth(), this.getMaxWidth());
        if (width === this.width) {
            return;
        }

        this.width = width;
        if (setPreferred) {
            for (const window of this.windows.iterator()) {
                window.client.preferredWidth = width;
            }
        }
        this.grid.onColumnWidthChanged(this);
    }

    public adjustWidth(widthDelta: number, setPreferred: boolean) {
        this.setWidth(this.width + widthDelta, setPreferred);
    }

    public updateWidth() {
        let minErr = Infinity;
        let closestPreferredWidth = this.width;
        for (const window of this.windows.iterator()) {
            const err = Math.abs(window.client.preferredWidth - this.width);
            if (err < minErr) {
                minErr = err;
                closestPreferredWidth = window.client.preferredWidth;
            }
        }
        this.setWidth(closestPreferredWidth, false);
    }

    // returns x position of left edge in grid space
    public getLeft() {
        return this.gridX;
    }

    // returns x position of right edge in grid space
    public getRight() {
        return this.gridX + this.width;
    }

    public onUserResizeWidth(
        startWidth: number,
        currentDelta: number,
        resizingLeftSide: boolean,
        neighbor?: { column: Column, startWidth: number },
    ) {
        const oldColumnWidth = this.getWidth();
        this.setWidth(startWidth + currentDelta, true);
        const actualDelta = this.getWidth() - startWidth;

        let leftEdgeDeltaStep = resizingLeftSide ? oldColumnWidth - this.getWidth() : 0;
        if (neighbor !== undefined) {
            const oldNeighborWidth = neighbor.column.getWidth();
            neighbor.column.setWidth(neighbor.startWidth - actualDelta, true);
            if (resizingLeftSide) {
                leftEdgeDeltaStep -= neighbor.column.getWidth() - oldNeighborWidth;
            }
        }
        this.grid.desktop.adjustScroll(-leftEdgeDeltaStep, true);
    }

    public adjustWindowHeight(window: Window, heightDelta: number, top: boolean) {
        const otherWindow = top ? this.windows.getPrev(window) : this.windows.getNext(window);
        if (otherWindow === null) {
            return;
        }

        // The two windows share a constant amount of height, so the divider between them can
        // only move between the point where `window` hits its minimum height and the point
        // where `otherWindow` does. Clamping the divider (instead of just applying the delta)
        // keeps both windows above their minimums and their heights summing up to the same total.
        const totalHeight = window.height + otherWindow.height;
        const lowestHeight = Math.min(window.getMinHeight(), totalHeight);
        const highestHeight = Math.max(totalHeight - otherWindow.getMinHeight(), lowestHeight);
        const newHeight = clamp(window.height + heightDelta, lowestHeight, highestHeight);
        if (newHeight === window.height) {
            return;
        }

        window.height = newHeight;
        otherWindow.height = totalHeight - newHeight;

        this.grid.desktop.onLayoutChanged();
    }

    public resizeWindows() {
        const nWindows = this.windows.length();
        if (nWindows === 0) {
            return;
        }
        if (nWindows === 1) {
            this.stacked = this.grid.config.stackColumnsByDefault;
        }

        const availableHeight = Math.max(
            0,
            this.grid.desktop.tilingArea.height - (nWindows-1) * this.grid.config.gapsInnerVertical,
        );

        const minHeights: number[] = [];
        let totalMinHeight = 0;
        for (const window of this.windows.iterator()) {
            const minHeight = Math.min(window.getMinHeight(), availableHeight);
            minHeights.push(minHeight);
            totalMinHeight += minHeight;
        }

        const heights = totalMinHeight <= availableHeight
            ? Column.distributeHeights(minHeights, availableHeight)
            : Column.shrinkProportionally(minHeights, availableHeight);

        let i = 0;
        for (const window of this.windows.iterator()) {
            window.height = heights[i++];
        }

        this.grid.desktop.onLayoutChanged();
    }

    // Splits the available height evenly, except for the windows which would end up below their
    // minimum height — those get their minimum, and the rest of the windows share what's left.
    // With no minimum heights this is just an even split, and the total always adds up exactly.
    private static distributeHeights(minHeights: number[], availableHeight: number) {
        const nWindows = minHeights.length;
        const heights = new Array<number>(nWindows).fill(0);
        const frozen = new Array<boolean>(nWindows).fill(false);
        let remainingHeight = availableHeight;
        let remainingWindows = nWindows;

        // Freezing the most violated window first keeps the result independent of the window order.
        for (;;) {
            if (remainingWindows === 0) {
                return heights;
            }
            const fairShare = Math.round(remainingHeight / remainingWindows);
            let violatedWindow = -1;
            let biggestDeficit = 0;
            for (let i = 0; i < nWindows; ++i) {
                if (frozen[i]) {
                    continue;
                }
                const deficit = minHeights[i] - fairShare;
                if (deficit > biggestDeficit) {
                    biggestDeficit = deficit;
                    violatedWindow = i;
                }
            }
            if (violatedWindow === -1) {
                break;
            }
            frozen[violatedWindow] = true;
            heights[violatedWindow] = minHeights[violatedWindow];
            remainingHeight -= minHeights[violatedWindow];
            --remainingWindows;
        }

        for (let i = 0; i < nWindows; ++i) {
            if (frozen[i]) {
                continue;
            }
            const height = Math.round(remainingHeight / remainingWindows);
            heights[i] = height;
            remainingHeight -= height;
            --remainingWindows;
        }
        return heights;
    }

    // The minimum heights don't all fit into the tiling area. At least one of them has to be
    // violated anyway, so shrink the windows proportionally rather than letting them overflow.
    private static shrinkProportionally(minHeights: number[], availableHeight: number) {
        const weights = minHeights.some((minHeight) => minHeight > 0) ? minHeights : minHeights.map(() => 1);
        let remainingHeight = availableHeight;
        let remainingWeight = weights.reduce((total, weight) => total + weight, 0);

        const heights: number[] = [];
        for (const weight of weights) {
            const height = remainingWeight > 0
                ? clamp(Math.round(remainingHeight * weight / remainingWeight), 0, remainingHeight)
                : 0;
            heights.push(height);
            remainingHeight -= height;
            remainingWeight -= weight;
        }
        return heights;
    }

    public getFocusTaker() {
        if (this.focusTaker === null || !this.windows.contains(this.focusTaker)) {
            return null;
        }
        return this.focusTaker;
    }

    public getWindowToFocus() {
        return this.getFocusTaker() ?? this.windows.getFirst()!;
    }

    public isFocused() {
        const lastFocusedWindow = this.grid.getLastFocusedWindow();
        if (lastFocusedWindow === null) {
            return false;
        }
        return lastFocusedWindow.column === this && lastFocusedWindow.isFocused();
    }

    public arrange(x: number, visibleRange: Range, forceOpaque: boolean) {
        if (this.grid.config.offScreenOpacity < 1.0 && !forceOpaque) {
            const opacity = Range.contains(visibleRange, this) ? 100 : this.grid.config.offScreenOpacity;
            for (const window of this.windows.iterator()) {
                window.client.kwinClient.opacity = opacity;
            }
        }

        if (this.stacked && this.windows.length() >= 2) {
            this.arrangeStacked(x);
            return;
        }
        let y = this.grid.desktop.tilingArea.y;
        for (const window of this.windows.iterator()) {
            window.arrange(x, y, this.width, window.height);
            y += window.height + this.grid.config.gapsInnerVertical;
        }
    }

    public arrangeStacked(x: number) {
        const nWindows = this.windows.length();
        const windowWidth = this.width - (nWindows - 1) * this.grid.config.stackOffsetX;
        const windowHeight = this.grid.desktop.tilingArea.height - (nWindows - 1) * this.grid.config.stackOffsetY;

        let windowX = x;
        let windowY = this.grid.desktop.tilingArea.y;
        for (const window of this.windows.iterator()) {
            window.arrange(windowX, windowY, windowWidth, windowHeight);
            windowX += this.grid.config.stackOffsetX;
            windowY += this.grid.config.stackOffsetY;
        }

        this.arrangeZ();
    }

    public arrangeZ() {
        for (const window of this.windows.iterator()) {
            if (window === this.focusTaker) {
                break;
            }
            window.raise();
        }
        for (const window of this.windows.iteratorReverse()) {
            window.raise();
            if (window === this.focusTaker) {
                break;
            }
        }
    }

    public toggleStacked() {
        if (this.windows.length() < 2) {
            return;
        }
        this.stacked = !this.stacked;
        this.grid.desktop.onLayoutChanged();
    }

    public onWindowAdded(window: Window, bottom: boolean) {
        if (bottom) {
            this.windows.insertEnd(window);
        } else {
            this.windows.insertStart(window);
        }

        if (this.width === 0) {
            this.setWidth(window.client.preferredWidth, false);
        } else {
            this.setWidth(this.width, false); // re-apply width constraints of the new window
        }

        this.resizeWindows();

        if (window.isFocused()) {
            this.onWindowFocused(window);
        }

        this.grid.desktop.onLayoutChanged();
    }

    public onWindowRemoved(window: Window, passFocus: FocusPassing.Type) {
        const lastWindow = this.windows.length() === 1;
        const windowToFocus = this.getAboveWindow(window) ?? this.getBelowWindow(window);

        this.windows.remove(window);

        if (window === this.focusTaker) {
            this.focusTaker = windowToFocus;
        }

        if (lastWindow) {
            console.assert(this.isEmpty());
            this.destroy(passFocus);
        } else {
            this.resizeWindows();
            if (windowToFocus !== null) {
                switch (passFocus) {
                case FocusPassing.Type.Immediate:
                    windowToFocus.focus();
                    break;
                case FocusPassing.Type.OnUnfocus:
                    this.grid.focusPasser.request(windowToFocus.client.kwinClient);
                    break;
                }
            }
        }

        this.grid.desktop.onLayoutChanged();
    }

    public onWindowFocused(window: Window) {
        this.grid.onColumnFocused(this, window);
        this.focusTaker = window;
        if (this.stacked) {
            this.arrangeZ();
        }
    }

    public restoreToTiled(focusedWindow: Window) {
        const lastFocusedWindow = this.getFocusTaker();
        if (lastFocusedWindow !== null && lastFocusedWindow !== focusedWindow) {
            lastFocusedWindow.restoreToTiled();
        }
    }

    private destroy(passFocus: FocusPassing.Type) {
        this.grid.onColumnRemoved(this, passFocus);
    }
}

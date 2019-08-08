//@flow
import * as React from "react";
import { Dimensions } from "react-native";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView
} from "recyclerlistview";

import Animated from "react-native-reanimated";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import type { ScrollEvent } from "react-native/Libraries/Types/CoreEventTypes";

const { cond, eq, add, call, Value, event, or } = Animated;

interface LayoutRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutChangeEvent {
  nativeEvent: {
    layout: LayoutRectangle
  };
}

function immutableMove(arr, from, to) {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, []);
}

type RState = {
  rowsDataProvider: typeof DataProvider,
  isDraggingRow: boolean,
  draggingRowIdx: number
};
export class SortableList<T> extends React.PureComponent<Props<T>, RState> {
  // Hold a reference to the list so that we can trigger updates on it for scrolling.
  recylerListViewRef = React.createRef<RecyclerListView<any, any>>();
  _layoutProvider: typeof LayoutProvider;
  rowCenterY: Animated.Node<number>;
  absoluteY = new Value(0);
  gestureState = new Value(-1);
  onGestureEvent: any;
  halfRowHeightValue: Animated.Value<number>;

  // Holds the row index from the currently rendered list for any row being dragged
  // -1 if no row is being dragged.
  currIdx = -1;
  scrollOffset = 0;
  flatlistHeight = 0;
  topOffset = 0;
  isScrolling = false;

  constructor(props: Props<T>) {
    super(props);

    this.halfRowHeightValue = new Value(-props.rowHeight / 2);

    const { width } = Dimensions.get("window");

    this.onGestureEvent = event(
      [
        {
          nativeEvent: {
            absoluteY: this.absoluteY,
            state: this.gestureState
          }
        }
      ],
      { useNativeDriver: true }
    );

    this.rowCenterY = add(this.absoluteY, this.halfRowHeightValue);

    this._layoutProvider = new LayoutProvider(
      index => {
        return 1;
      },
      (type, dim) => {
        dim.width = width;
        dim.height = props.rowHeight;
      }
    );

    const dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    }, props.indexToKey);

    this.state = {
      rowsDataProvider: dataProvider.cloneWithRows(props.data),
      isDraggingRow: false,
      draggingRowIdx: -1
    };
  }

  componentDidUpdate(prevProps: Props<T>) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        rowsDataProvider: this.state.rowsDataProvider.cloneWithRows(
          this.props.data
        )
      });
    }
  }

  handleScroll = (rawEvent: ScrollEvent, offsetX: number, offsetY: number) => {
    this.scrollOffset = offsetY;
  };

  handleLayout = (e: LayoutChangeEvent) => {
    const { height, y } = e.nativeEvent.layout;
    this.flatlistHeight = height;
    this.topOffset = y;
  };

  // Converts an absolute y value into the index in the array
  yToIndex = (y: number) =>
    Math.min(
      this.state.rowsDataProvider.getSize() - 1,
      Math.max(
        0,
        Math.floor(
          (y + this.scrollOffset - this.topOffset) / this.props.rowHeight
        )
      )
    );

  recyclerListComponentScroll = (scrollAmountY: number) => {
    if (!this.isScrolling) {
      // Cope with being cancelled on callback
      console.debug(
        "moveList, !this.scrolling (not scrolling, not doing anything"
      );
      return;
    }

    if (this.recylerListViewRef.current === null) {
      console.debug("moveList, no this.list.current, not doing anything");
      return;
    }

    this.recylerListViewRef.current.scrollToOffset(
      // this.scrollOffset + amount,
      0,
      this.scrollOffset + scrollAmountY,
      false
    );
    requestAnimationFrame(() => {
      this.recyclerListComponentScroll(scrollAmountY);
    });
  };

  animatedCodeReset = () => {
    const newData = this.state.rowsDataProvider.getAllData();
    this.setState({
      rowsDataProvider: this.state.rowsDataProvider.cloneWithRows(newData),
      isDraggingRow: false,
      draggingRowIdx: -1
    });
    this.isScrolling = false;
    this.currIdx = -1;
    this.props.onSort(newData);
  };

  animatedCodeRowDragStart = ([y]: { y: number }) => {
    /*Determine the index of the row that is being dragged and store it so that we
     * know what row is being moved and can:
     *   1) Determine what row to show animated above the non-moving rows of the list.
     *   2) Know where to place a blank placeholder row where the one we are dragging was originally from.
     *   3) Ultimately figure out how to update the array elements that are being dragged around
     * */

    this.currIdx = this.yToIndex(y);
    this.setState({ isDraggingRow: true, draggingRowIdx: this.currIdx });
  };

  animatedCodeRowMoving = ([y]: { y: number }) => {
    /*
     * First up, have we dragged the row sufficiently towards the Bottom or Top of the screen that we should
     * moving the view port on the list by scrolling Down or Up.
     */

    const scrollOnset = 100;

    if (y > this.flatlistHeight - scrollOnset) {
      // Dragged row towards bottom of screen
      if (!this.isScrolling) {
        this.isScrolling = true;
        this.recyclerListComponentScroll(20); // mv view on list down
      }
    } else if (y < scrollOnset) {
      // ... towards top of screen
      if (!this.isScrolling) {
        this.isScrolling = true;
        this.recyclerListComponentScroll(-20); // mv view on list up
      }
    } else {
      this.isScrolling = false;
    }

    /*
     * Every time the dragged row moves over its immediate (above or below) neighbouring row update:
     * 1) The underlying data list order.
     * 2) Our references to what is being dragged in that list.
     */
    const draggedRowOverListIdx = this.yToIndex(y);
    if (draggedRowOverListIdx !== this.currIdx) {
      this.setState({
        rowsDataProvider: this.state.rowsDataProvider.cloneWithRows(
          immutableMove(
            this.state.rowsDataProvider.getAllData(),
            this.currIdx,
            draggedRowOverListIdx
          )
        ),
        draggingRowIdx: draggedRowOverListIdx
      });
      this.currIdx = draggedRowOverListIdx;
    }
  };

  _rowRenderer = (type, data, index) => {
    // Render the row if it's not being dragged, else render a filler placeholder
    return this.props.renderRow(
      data,
      index,
      this.state.draggingRowIdx === index ? "placeholder" : "normal",
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={this.onGestureEvent}
        onHandlerStateChange={this.onGestureEvent}
      >
        <Animated.View>{this.props.renderDragHandle()}</Animated.View>
      </PanGestureHandler>
    );
  };

  render() {
    return (
      <>
        <Animated.Code>
          {() =>
            cond(
              or(
                eq(this.gestureState, State.END),
                eq(this.gestureState, State.CANCELLED),
                eq(this.gestureState, State.FAILED),
                eq(this.gestureState, State.UNDETERMINED)
              ),
              call([], this.animatedCodeReset)
            )
          }
        </Animated.Code>

        <Animated.Code>
          {() =>
            cond(
              eq(this.gestureState, State.BEGAN),
              call([this.absoluteY], this.animatedCodeRowDragStart)
            )
          }
        </Animated.Code>

        <Animated.Code>
          {() =>
            cond(
              eq(this.gestureState, State.ACTIVE),
              call([this.absoluteY], this.animatedCodeRowMoving)
            )
          }
        </Animated.Code>

        {/* If we are not dragging then render list as normal.
        If we are dragging then we render:
           1) The list but with the row that is being dragged as the background colour, our case white.
           2) The row that is being dragged in its own view ontop of the list, i.e. absolute and
           with a zIndex > than the list
        */}
        {this.state.isDraggingRow ? (
          <Animated.View
            style={{
              top: this.rowCenterY,
              position: "absolute",
              width: "100%",
              zIndex: 99,
              elevation: 99
            }}
          >
            {this.props.renderRow(
              this.state.rowsDataProvider.getDataForIndex(
                this.state.draggingRowIdx
              ),
              this.state.draggingRowIdx,
              "dragging",
              this.props.renderDragHandle()
            )}
          </Animated.View>
        ) : null}

        <RecyclerListView
          ref={this.recylerListViewRef}
          style={{ flex: 1 }}
          onScroll={this.handleScroll}
          onLayout={this.handleLayout}
          layoutProvider={this._layoutProvider}
          dataProvider={this.state.rowsDataProvider}
          rowRenderer={this._rowRenderer}
          extendedState={{ dragging: true }}
        />
      </>
    );
  }
}

type Props<T> = {
  rowHeight: number,
  data: Array<T>,
  indexToKey: (index: number) => string,
  renderRow: (
    dataItem: T,
    dataItemIndex: number,
    dataItemState: "normal" | "dragging" | "placeholder",
    dataItemDragHandle: React.Node
  ) => React.Node | null,
  renderDragHandle: () => React.Node,
  onSort: (newData: Array<T>) => void
};

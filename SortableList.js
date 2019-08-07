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
  dataProvider: typeof DataProvider,
  dragging: boolean,
  draggingIdx: number
};
export class SortableList<T> extends React.PureComponent<Props<T>, RState> {
  list = React.createRef<RecyclerListView<any, any>>();
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
  scrollingTrigger = false;

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
      dataProvider: dataProvider.cloneWithRows(props.data),
      dragging: false,
      draggingIdx: -1
    };
  }

  componentDidUpdate(prevProps: Props<T>) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        dataProvider: this.state.dataProvider.cloneWithRows(this.props.data)
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

  // Converts and absolute y value into the index in the array
  yToIndex = (y: number) =>
    Math.min(
      this.state.dataProvider.getSize() - 1,
      Math.max(
        0,
        Math.floor(
          (y + this.scrollOffset - this.topOffset) / this.props.rowHeight
        )
      )
    );

  moveList = (amountY: number) => {
    if (!this.scrollingTrigger) {
      console.debug(
        "moveList, !this.scrolling (not scrolling, not doing anything"
      );
      return;
    }

    if (this.list.current === null) {
      console.debug("moveList, no this.list.current, not doing anything");
      return;
    }

    this.list.current.scrollToOffset(
      // this.scrollOffset + amount,
      0,
      this.scrollOffset + amountY,
      false
    );
    requestAnimationFrame(() => {
      this.moveList(amountY);
    });
  };

  animatedCodeDragStart = ([y]: { y: number }) => {
    this.currIdx = this.yToIndex(y);
    this.setState({ dragging: true, draggingIdx: this.currIdx });
  };

  animatedCodeReset = () => {
    const newData = this.state.dataProvider.getAllData();
    this.setState({
      dataProvider: this.state.dataProvider.cloneWithRows(newData),
      dragging: false,
      draggingIdx: -1
    });
    this.scrollingTrigger = false;
    this.currIdx = -1;
    this.props.onSort(newData);
  };

  animatedCodeRowMoving = ([y]: { y: number }) => {
    // Do we want to trigger scrolling
    const scrollOnset = 100;
    if (y > this.flatlistHeight - scrollOnset) {
      if (!this.scrollingTrigger) {
        this.scrollingTrigger = true;
        this.moveList(20);
      }
    } else if (y < scrollOnset) {
      if (!this.scrollingTrigger) {
        this.scrollingTrigger = true;
        this.moveList(-20);
      }
    } else {
      this.scrollingTrigger = false;
    }

    // Update both the index the row is over and the data
    // being shown.
    const nextIndex = this.yToIndex(y);
    if (nextIndex !== this.currIdx) {
      this.setState({
        dataProvider: this.state.dataProvider.cloneWithRows(
          immutableMove(
            this.state.dataProvider.getAllData(),
            this.currIdx,
            nextIndex
          )
        ),
        draggingIdx: nextIndex
      });
      this.currIdx = nextIndex;
    }
  };

  _rowRenderer = (type, data, index) => {
    return this.props.renderRow(
      data,
      index,
      this.state.draggingIdx === index ? "placeholder" : "normal",
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
    const { dataProvider, dragging, draggingIdx } = this.state;

    return (
      <>
        <Animated.Code>
          {() =>
            cond(
              eq(this.gestureState, State.BEGAN),
              call([this.absoluteY], this.animatedCodeDragStart)
            )
          }
        </Animated.Code>

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
        {dragging ? (
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
              dataProvider.getDataForIndex(draggingIdx),
              draggingIdx,
              "dragging",
              this.props.renderDragHandle()
            )}
          </Animated.View>
        ) : null}

        <RecyclerListView
          ref={this.list}
          style={{ flex: 1 }}
          onScroll={this.handleScroll}
          onLayout={this.handleLayout}
          layoutProvider={this._layoutProvider}
          dataProvider={dataProvider}
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
    data: T,
    index: number,
    state: "normal" | "dragging" | "placeholder",
    dragHandle: React.Node
  ) => React.Node | null,
  renderDragHandle: () => React.Node,
  onSort: (newData: Array<T>) => void
};

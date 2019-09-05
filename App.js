// @flow

import * as React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { SortableList } from "./SortableList";
import SwipeableRow from "./SwipeableRow";
import type { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheet";
import IconIonicons from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP } from "react-native-responsive-screen";

export type dataItem = {
  from: string,
  when: string,
  message: string
};

const TEST_DATA: Array<dataItem> = [
  {
    from: "D'Artagnan",
    when: "3:11 PM",
    message:
      "El first o on list o Unus pro omnibus, omnes pro uno. Nunc scelerisque, massa non lacinia porta, quam odio dapibus enim, nec tincidunt dolor leo non neque"
  },
  {
    from: "Aramis",
    when: "11:46 AM",
    message:
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus hendrerit ligula dignissim maximus aliquet. Integer tincidunt, tortor at finibus molestie, ex tellus laoreet libero, lobortis consectetur nisl diam viverra justo."
  },
  {
    from: "Athos",
    when: "6:06 AM",
    message:
      "Sed non arcu ullamcorper, eleifend velit eu, tristique metus. Duis id sapien eu orci varius malesuada et ac ipsum. Ut a magna vel urna tristique sagittis et dapibus augue. Vivamus non mauris a turpis auctor sagittis vitae vel ex. Curabitur accumsan quis mauris quis venenatis."
  },
  {
    from: "Porthos",
    when: "Yesterday",
    message:
      "Vivamus id condimentum lorem. Duis semper euismod luctus. Morbi maximus urna ut mi tempus fermentum. Nam eget dui sed ligula rutrum venenatis."
  },
  {
    from: "Domestos",
    when: "2 days ago",
    message:
      "Aliquam imperdiet dolor eget aliquet feugiat. Fusce tincidunt mi diam. Pellentesque cursus semper sem. Aliquam ut ullamcorper massa, sed tincidunt eros."
  },
  {
    from: "Cardinal Richelieu",
    when: "2 days ago",
    message:
      "Pellentesque id quam ac tortor pellentesque tempor tristique ut nunc. Pellentesque posuere ut massa eget imperdiet. Ut at nisi magna. Ut volutpat tellus ut est viverra, eu egestas ex tincidunt. Cras tellus tellus, fringilla eget massa in, ultricies maximus eros."
  },
  {
    from: "D'Artagnan",
    when: "Week ago",
    message:
      "Aliquam non aliquet mi. Proin feugiat nisl maximus arcu imperdiet euismod nec at purus. Vestibulum sed dui eget mauris consequat dignissim."
  },
  {
    from: "Cardinal Richelieu",
    when: "2 weeks ago",
    message:
      "Vestibulum ac nisi non augue viverra ullamcorper quis vitae mi. Donec vitae risus aliquam, posuere urna fermentum, fermentum risus. "
  },
  {
    from: "Bog wiper",
    when: "2 weeks ago",
    message:
      "Bog wiper ac nisi non augue viverra ullamcorper quis vitae mi. Donec vitae risus aliquam, posuere urna fermentum, fermentum risus. "
  },
  {
    from: "Hocum pokum ",
    when: "1 weeks ago",
    message:
      "Blah blah augue viverra ullamcorper quis vitae mi. Donec vitae risus aliquam, posuere urna fermentum, fermentum risus. "
  },
  {
    from: "No see um when reload u ",
    when: "1 weeks ago",
    message:
      "Blah blah augue viverra ullamcorper quis vitae mi. Donec vitae risus aliquam, posuere urna fermentum, fermentum risus. Brexit, blah blah, brexit "
  },
  {
    from: "No see um when reload u ",
    when: "2 weeks ago",
    message:
      "Blah blah augue viverra ullamcorper quis vitae mi. Donec vitae risus aliquam, posuere urna fermentum, fermentum risus. Trump trump trump trump"
  },
  {
    from: "No see um when reload u ",
    when: "20 weeks ago",
    message:
      "Longusto mucho blah blah augue viverra ullamcorper quis vitae mi. Donec vitae risus aliquam, posuere urna fermentum, fermentum risus. Trump trump trump trump"
  }
];

const data = TEST_DATA;
const rowHeight = 110;

const App = () => {
  /*
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SwipeableRow
        dataItem={data[0]}
        rowContent={styles.row}
        rowSwipedContent={styles.rowContentSwiped}
      />
    </SafeAreaView>
  );*/

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SortableList
        data={data}
        onSort={x => console.log(x)}
        rowHeight={rowHeight}
        indexToKey={idx => idx.toString()}
        renderDragHandle={() => (
          <IconIonicons name="ios-reorder" size={30} color="lightgrey" />
        )}
        renderRow={(
          dataItem,
          dataItemIdx,
          dataItemState,
          dataItemDragHandle
        ) => {
          return (
            <View
              style={
                dataItemState === "dragging"
                  ? styles.rowBeingDragged
                  : dataItemState === "placeholder"
                  ? styles.rowPlaceholderInList
                  : styles.row
              }
            >
              <View style={styles.dragHandle}>{dataItemDragHandle}</View>
              <SwipeableRow
                dataItem={dataItem}
                rowContent={styles.content}
                rowSwipedContent={styles.contentSwiped}
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const vsRow: ViewStyle = {
  height: rowHeight,
  flexDirection: "row",
  flex: 1,
  justifyContent: "space-around",
  opacity: 1,
  borderColor: "lightgrey",
  borderTopWidth: 1,
  // borderBottomWidth: 2,
  backgroundColor: "white"
};

const vsRowPlaceholderInList: ViewStyle = {
  ...vsRow,
  opacity: 0 // Hide any text it contains so as not to conflict with what's being dragged.
};

const elevation = 10;
const vsRowBeingDragged: ViewStyle = {
  ...vsRow,
  shadowColor: "black",
  shadowOffset: { width: 0, height: 0.5 * elevation },
  shadowOpacity: 0.3,
  shadowRadius: 0.8 * elevation,
  opacity: 1
};

const vsDragHandle: ViewStyle = {
  width: widthPercentageToDP(10),
  justifyContent: "center",
  alignContent: "center",
  paddingLeft: 10
  // borderColor: "green",
  // borderWidth: 2
};

const vsContent: ViewStyle = {
  height: "100%",
  width: widthPercentageToDP(90)
  // borderColor: "red",
  // borderWidth: 2
};

const vsContentSwiped: ViewStyle = {
  ...vsContent
  // borderColor: "blue"
};

const styles = StyleSheet.create({
  row: vsRow,
  rowPlaceholderInList: vsRowPlaceholderInList,
  rowBeingDragged: vsRowBeingDragged,
  dragHandle: vsDragHandle,
  content: vsContent,
  contentSwiped: vsContentSwiped
});

export default App;

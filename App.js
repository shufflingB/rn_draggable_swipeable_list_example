// @flow

import * as React from "react";
import { SafeAreaView, StatusBar, Text, View, StyleSheet } from "react-native";
import { SortableList } from "./SortableList";
import { RectButton } from "react-native-gesture-handler";
import AppleStyleSwipeableRow from "./AppleStyleSwipeableRow";
import type { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheet";

const TEST_DATA = [
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

const colorMap = {};

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const data = TEST_DATA;

const Row = ({ item }) => (
  <AppleStyleSwipeableRow>
    <RectButton style={styles.rectButton} onPress={() => alert(item.from)}>
      <Text style={styles.fromText}>{item.from}</Text>
      <Text numberOfLines={2} style={styles.messageText}>
        {item.message}
      </Text>
      <Text style={styles.dateText}>
        {item.when} {"❭"}
      </Text>
    </RectButton>
  </AppleStyleSwipeableRow>
);

const rowHeight = 100;
const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SortableList
        data={data}
        onSort={x => console.log(x)}
        rowHeight={rowHeight}
        indexToKey={idx => idx.toString()}
        renderDragHandle={() => <Text style={{ fontSize: 32 }}>@</Text>}
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
                  ? styles.rowDragging
                  : dataItemState === "placeholder"
                  ? styles.rowPlaceholder
                  : styles.row
              }
              // onLayout={onLayout}
            >
              {dataItemDragHandle}
              <AppleStyleSwipeableRow>
                <RectButton
                  style={styles.rectButton}
                  onPress={() => alert(dataItem.from)}
                >
                  <Text style={styles.fromText}>{dataItem.from}</Text>
                  <Text numberOfLines={2} style={styles.messageText}>
                    {dataItem.message}
                  </Text>
                  <Text style={styles.dateText}>
                    {dataItem.when} {"❭"}
                  </Text>
                </RectButton>
              </AppleStyleSwipeableRow>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const viewStyleRow: ViewStyle = {
  height: rowHeight,
  padding: 16,
  backgroundColor: "grey",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  opacity: 1,
  borderColor: "red",
  borderWidth: 1
};
const viewStyleRowBeingDragged: ViewStyle = {
  ...viewStyleRow,
  backgroundColor: "purple"
};
const viewStyleRowPlaceholderInList = {
  ...viewStyleRow,
  opacity: 0 // Hide any text it contains so as not to conflict with what's being dragged.
};

const styles = StyleSheet.create({
  row: viewStyleRow,
  rowDragging: viewStyleRowBeingDragged,
  rowPlaceholder: viewStyleRowPlaceholderInList,
  rectButton: {
    flex: 1,
    height: rowHeight - 9,
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: "space-between",
    flexDirection: "column",
    borderWidth: 2,
    backgroundColor: "lightgrey"
  },
  fromText: {
    fontWeight: "bold",
    backgroundColor: "transparent"
  },
  messageText: {
    color: "#999",
    backgroundColor: "transparent"
  },
  dateText: {
    backgroundColor: "transparent",
    position: "absolute",
    right: 20,
    top: 10,
    color: "#999",
    fontWeight: "bold"
  }
});

export default App;

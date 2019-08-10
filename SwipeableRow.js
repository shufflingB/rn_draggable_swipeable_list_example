// @flow
import * as React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { RectButton } from "react-native-gesture-handler";

import Swipeable from "react-native-gesture-handler/Swipeable";
import type { dataItem } from "./App";
import type { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheet";

type State = {};
export default class SwipeableRow extends React.Component<Props, State> {
  _swipeableRowRef;

  renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [-20, 0, 0, 1]
    });
    return (
      <RectButton style={styles.leftAction} onPress={this.close}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ translateX: trans }]
            }
          ]}
        >
          Archive
        </Animated.Text>
      </RectButton>
    );
  };
  renderRightAction = (text: string, color: string, x: number, number) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0]
    });
    const pressHandler = () => {
      this.close();
      alert(text);
    };
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={pressHandler}
        >
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };
  renderRightActions = (progress: number) => (
    <View style={{ width: 192, flexDirection: "row" }}>
      {this.renderRightAction("More", "#C8C7CD", 192, progress)}
      {this.renderRightAction("Flag", "#ffab00", 128, progress)}
      {this.renderRightAction("More", "#dd2c00", 64, progress)}
    </View>
  );
  updateRef = (ref: any) => {
    this._swipeableRowRef = ref;
  };
  close = () => {
    this._swipeableRowRef.close();
  };
  render() {
    return (
      <Swipeable
        containerStyle={this.props.style}
        ref={this.updateRef}
        friction={2}
        leftThreshold={50}
        rightThreshold={40}
        renderLeftActions={this.renderLeftActions}
        renderRightActions={this.renderRightActions}
      >
        <RectButton onPress={() => alert(this.props.dataItem.from)}>
          <View accessible>
            <View style={styles.messageStatusLine}>
              <Text style={styles.fromText}>{this.props.dataItem.from}</Text>
              <Text style={styles.dateText}>
                {this.props.dataItem.when} {"❭"}
              </Text>
            </View>

            <Text numberOfLines={3} style={styles.messageText}>
              {this.props.dataItem.message}
            </Text>
          </View>
        </RectButton>
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  messageStatusLine: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  fromText: {
    fontWeight: "bold",
    backgroundColor: "transparent"
  },
  dateText: {
    backgroundColor: "transparent",
    color: "#999",
    fontWeight: "bold"
  },
  messageText: {
    color: "#999",
    backgroundColor: "transparent"
  },
  leftAction: {
    flex: 1,
    backgroundColor: "#497AFC",
    justifyContent: "center"
  },
  actionText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "transparent",
    padding: 10
  },
  rightAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

type Props = { dataItem: dataItem, style: ViewStyle };

// @flow
import * as React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { RectButton } from "react-native-gesture-handler";

import Swipeable from "react-native-gesture-handler/Swipeable";

type State = {};
export default class AppleStyleSwipeableRow extends React.Component<
  Props,
  State
> {
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
  renderRightAction = (text: string, color, x, progress) => {
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
        childrenContainerStyle={{
          flex: 1,
          height: 90,
          borderColor: "pink",
          justifyContent: "space-between",
          flexDirection: "column",
          borderWidth: 2,
          backgroundColor: "lightgrey"
        }}
        ref={this.updateRef}
        friction={2}
        leftThreshold={30}
        rightThreshold={40}
        renderLeftActions={this.renderLeftActions}
        renderRightActions={this.renderRightActions}
      >
        {this.props.children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
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

type Props = { children: React.Node };

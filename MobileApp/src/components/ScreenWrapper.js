import React from "react";
import { View, Image, StyleSheet, Platform, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import pbsheader from "./pbsheader.png";

const ScreenWrapper = ({ children }) => {
  return (
    <>
      <StatusBar backgroundColor="#F1EFEC" barStyle="dark-content" />
      <LinearGradient
        colors={['#123458', '#D4C9BE', '#123458', '#030303']}
        locations={[0, 0.33, 0.66, 1]}
        style={styles.container}
      >
        <View style={styles.statusBarBackground} />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image source={pbsheader} style={styles.headerImage} resizeMode="contain" />
          </View>
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EFEC",
  },
  statusBarBackground: {
    height: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: "#F1EFEC",
    width: '100%',
    zIndex: 20,
  },
  header: {
    backgroundColor: "#F1EFEC",
    paddingTop: Platform.OS === 'android' ? 0 : 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    paddingBottom: 10,
  },
  headerImage: {
    width: "100%",
    height: 60,
  },
  content: {
    flex: 1,
  },
});

export default ScreenWrapper;

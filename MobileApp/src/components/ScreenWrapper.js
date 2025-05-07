import React from "react";
import { View, Image, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import pbsheader from "./pbsheader.png";

const ScreenWrapper = ({ children }) => {
  return (
    <LinearGradient
      colors={['#123458', '#D4C9BE', '#123458', '#030303']}
      locations={[0, 0.33, 0.66, 1]}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={pbsheader} style={styles.headerImage} resizeMode="contain" />
        </View>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1EFEC",
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
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
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

import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import pbsheader from "./pbsheader.png";

const ScreenWrapper = ({ children }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#123458', '#D4C9BE', '#123458', '#030303']}
        locations={[0, 0.33, 0.66, 1]}
        style={styles.container}
      >
        <View style={styles.header}>
          <Image source={pbsheader} style={styles.headerImage} resizeMode="contain" />
        </View>
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F1EFEC",
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#F1EFEC", // matched to gradient dark blue
    paddingVertical: 10,
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
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

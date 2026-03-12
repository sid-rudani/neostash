import { FlashList } from "@shopify/flash-list";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DATA = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  title: `Image ${i + 1}`,
}));

const gallery = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>Gallery</Text>
      </View>
      <FlashList
        style={styles.galleryList}
        data={DATA}
        masonry
        numColumns={2}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={{
              height: Math.random() * 200 + 100,
              backgroundColor: "#ccc",
              margin: 5,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    padding: 16,
    height: 80,
  },
  titleText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  galleryList: {
    flex: 1,
    paddingInline: 10,
  },
});

export default gallery;

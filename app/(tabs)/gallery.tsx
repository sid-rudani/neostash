import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const imageSize = (width - 30) / 2; // Two columns with padding

interface MediaAsset {
  id: string;
  uri: string;
  width: number;
  height: number;
}

const gallery = () => {
  const [images, setImages] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "This app needs access to your photos to display them in the gallery.",
        );
        setLoading(false);
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: MediaLibrary.SortBy.creationTime,
        first: 100, // Load first 100 images, you can implement pagination later
      });

      setImages(media.assets);
      setLoading(false);
    })();
  }, []);

  const renderItem = ({ item }: { item: MediaAsset }) => {
    const aspectRatio = item.width / item.height;
    const height = imageSize / aspectRatio;

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.uri }}
          style={[styles.image, { height }]}
          contentFit="cover"
          placeholder={require("../../assets/images/icon.png")}
          transition={200}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.titleText}>Gallery</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading images...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>Gallery</Text>
      </View>
      <FlashList
        style={styles.galleryList}
        data={images}
        masonry
        numColumns={2}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
  imageContainer: {
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: imageSize,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default gallery;

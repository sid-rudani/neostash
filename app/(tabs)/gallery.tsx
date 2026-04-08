import { Feather, Ionicons } from "@expo/vector-icons"; // Added Feather
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import your DB helpers
import {
  getPhotoMetadata,
  initDb,
  syncAllAssetsToDb,
} from "../../components/db";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 30) / 2;

const GalleryScreen = () => {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [after, setAfter] = useState<string | undefined>(undefined);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPage = useCallback(async (cursor?: string) => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: MediaLibrary.SortBy.creationTime,
        first: 30,
        after: cursor,
      });

      const newIds = media.assets.map((a) => a.id);
      await syncAllAssetsToDb(newIds);

      const enriched = await Promise.all(
        media.assets.map(async (asset) => {
          const meta = await getPhotoMetadata(asset.id);
          return {
            ...asset,
            isLiked: meta?.isLiked === 1,
            title: meta?.title || "",
          };
        }),
      );

      setImages((prev) => (cursor ? [...prev, ...enriched] : enriched));
      setAfter(media.endCursor);
      setHasNextPage(media.hasNextPage);
    } catch (error) {
      console.error("Gallery fetch error:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      initDb();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Gallery access is needed.");
        setLoading(false);
        return;
      }
      fetchPage();
    })();
  }, []);

  const loadMore = () => {
    if (hasNextPage && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchPage(after);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const aspectRatio = item.width / item.height || 1;
    const itemHeight = Math.min(COLUMN_WIDTH / aspectRatio, 300);

    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => {
          router.push({
            pathname: "/EventsListDetails",
            params: {
              item: JSON.stringify({
                key: item.id,
                poster: item.uri,
                title: item.title || "Gallery Memory",
                location: "Gallery",
                date: new Date(item.creationTime).toLocaleDateString(),
              }),
            },
          });
        }}
      >
        <Image
          source={{ uri: item.uri }}
          style={[styles.image, { height: itemHeight }]}
          contentFit="cover"
          transition={200}
        />
        {item.isLiked && (
          <View style={styles.heartBadge}>
            <Ionicons name="heart" size={12} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── SEARCH HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.titleText}>Vault</Text>
        <TouchableOpacity
          style={styles.searchTrigger}
          onPress={() => router.push("/search")} // Navigates to search.tsx
        >
          <Feather name="search" size={18} color="#888" />
          <Text style={styles.searchText}>Search memories...</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={images}
        masonry
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isLoadingMore ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 12,
  },
  searchTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
    height: 45,
    borderRadius: 12,
    gap: 10,
  },
  searchText: {
    color: "#888",
    fontSize: 15,
  },
  imageContainer: {
    margin: 5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },
  image: { width: "100%" },
  heartBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ff4d6d",
    borderRadius: 10,
    padding: 4,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default GalleryScreen;

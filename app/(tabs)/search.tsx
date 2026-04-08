import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPhotoMetadata, searchByKeyword } from "../../components/db";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = width / 2 - 24;

const SearchScreen = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to perform the hybrid search
  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    // 1. Get matching assetIds from SQLite FTS5 index
    const matchedIds = await searchByKeyword(text);

    if (matchedIds.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    // 2. Fetch the actual Assets from MediaLibrary to get URIs
    // We only fetch assets that match our SQLite results
    const assets = await MediaLibrary.getAssetsAsync({
      first: matchedIds.length,
      // Note: In a production app with thousands of photos,
      // you'd filter these specifically by ID or use a custom hook.
    });

    // Filter to only show assets found in the DB search
    const filteredAssets = assets.assets.filter((a) =>
      matchedIds.includes(a.id),
    );

    // 3. Enrich with Metadata (Likes/Titles)
    const enriched = await Promise.all(
      filteredAssets.map(async (asset) => {
        const meta = await getPhotoMetadata(asset.id);
        return {
          ...asset,
          title: meta?.title || "Untitled",
          isLiked: meta?.isLiked === 1,
        };
      }),
    );

    setResults(enriched);
    setLoading(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#999" />
          <TextInput
            placeholder="Search memories, locations, notes..."
            placeholderTextColor="#999"
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Results Section */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                router.push({
                  pathname: "/EventsListDetails",
                  params: {
                    item: JSON.stringify({
                      key: item.id,
                      poster: item.uri,
                      title: item.title,
                      location: "Gallery",
                      date: new Date(item.creationTime).toLocaleDateString(),
                    }),
                  },
                });
              }}
            >
              <Image source={{ uri: item.uri }} style={styles.resultImage} />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.isLiked && (
                  <Ionicons name="heart" size={12} color="#ff4d6d" />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.center}>
          <Feather name="image" size={48} color="#eee" />
          <Text style={styles.emptyText}>
            {query.length > 0
              ? "No memories match that search"
              : "Search for a memory..."}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 12,
    color: "#999",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.3,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    marginRight: 4,
  },
});

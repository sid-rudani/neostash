import { useTheme } from "@/hooks/use-theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
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
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);

    const matchedIds = await searchByKeyword(text);

    if (matchedIds.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      matchedIds.map(async (id) => {
        try {
          const asset: any = await MediaLibrary.getAssetInfoAsync(id);
          if (!asset) return null;
          const meta = await getPhotoMetadata(id);
          return {
            ...asset,
            title: meta?.title || "Untitled",
            note: meta?.note || "",
            isLiked: meta?.isLiked === 1,
          };
        } catch {
          return null;
        }
      })
    );

    setResults(enriched.filter(Boolean));
    setLoading(false);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Search size={18} color={theme.textMuted} strokeWidth={2} />
          <TextInput
            placeholder="Search memories, locations, notes..."
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text }]}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.accent} />
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
              style={[styles.card, { backgroundColor: theme.cardBg }]}
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
                <View style={{ flex: 1, marginRight: 4 }}>
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  {item.note ? (
                    <Text style={styles.cardDesc} numberOfLines={1}>
                      {item.note}
                    </Text>
                  ) : null}
                </View>
                {item.isLiked && (
                  <Ionicons name="heart" size={12} color={theme.heartRed} />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.center}>
          <Feather name="image" size={48} color={theme.border} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
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
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    gap: 8,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: { marginTop: 12, fontSize: 14 },
  listContent: { padding: 16 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 16 },
  card: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.3,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultImage: { width: "100%", height: "100%" },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.52)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#fff" },
  cardDesc: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 },
});

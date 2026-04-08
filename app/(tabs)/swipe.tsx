import { useTheme } from "@/hooks/use-theme";
import { EvilIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Directions,
  FlingGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getPhotoMetadata,
  initDb,
  syncAllAssetsToDb,
} from "../../components/db";

const { width } = Dimensions.get("screen");
const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;
const OVERFLOW_HEIGHT = 80;
const SPACING = 10;
const PAGE_SIZE = 25;

export default function SwipeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const theme = useTheme();
  const [data, setData] = React.useState<any[]>([]);
  const [isIndexing, setIsIndexing] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false); // To prevent duplicate calls
  const [index, setIndex] = React.useState(0);

  // Pagination tracking
  const [endCursor, setEndCursor] = React.useState<string | undefined>(
    undefined,
  );
  const [hasNextPage, setHasNextPage] = React.useState(true);

  const scrollXIndex = React.useRef(new Animated.Value(0)).current;
  const scrollXAnimated = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scrollXAnimated, {
      toValue: scrollXIndex,
      useNativeDriver: true,
    }).start();
  }, [index]);

  /**
   * Fetch and Enrich Batch Logic
   */
  const fetchAndProcessBatch = async (after?: string) => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: MediaLibrary.SortBy.creationTime,
      first: PAGE_SIZE,
      after,
    });

    // 1. Sync new IDs to DB for searchability
    const newIds = media.assets.map((a) => a.id);
    await syncAllAssetsToDb(newIds);

    // 2. Enrich with DB Metadata
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

    // 3. Update States
    setData((prev) => [...prev, ...enriched]);
    setEndCursor(media.endCursor);
    setHasNextPage(media.hasNextPage);
    setIsLoadingMore(false);
  };

  const initializeApp = async () => {
    await initDb();
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery access is required.");
      return;
    }
    await fetchAndProcessBatch();
    setIsIndexing(false);
  };

  React.useEffect(() => {
    initializeApp();
  }, []);

  // Sync DB updates when returning to screen
  React.useEffect(() => {
    const syncData = async () => {
      if (isFocused && data.length > 0) {
        const updatedData = await Promise.all(
          data.map(async (asset) => {
            const meta = await getPhotoMetadata(asset.id);
            return {
              ...asset,
              isLiked: meta?.isLiked === 1,
              title: meta?.title || "",
            };
          }),
        );
        setData(updatedData);
      }
    };
    syncData();
  }, [isFocused]);

  /**
   * Endless Logic: Check if we need to load more when index changes
   */
  const setActiveIndex = React.useCallback(
    (i: number) => {
      scrollXIndex.setValue(i);
      setIndex(i);

      // If we are 5 cards away from the end, fetch the next page
      if (hasNextPage && i >= data.length - 5 && !isLoadingMore) {
        console.log("Fetching next batch...");
        fetchAndProcessBatch(endCursor);
      }
    },
    [data.length, hasNextPage, endCursor, isLoadingMore],
  );

  if (isIndexing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ marginTop: 10, color: theme.textMuted }}>Opening your vault...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler
        direction={Directions.LEFT}
        onHandlerStateChange={(ev) => {
          if (ev.nativeEvent.state === State.END && index < data.length - 1)
            setActiveIndex(index + 1);
        }}
      >
        <FlingGestureHandler
          direction={Directions.RIGHT}
          onHandlerStateChange={(ev) => {
            if (ev.nativeEvent.state === State.END && index > 0)
              setActiveIndex(index - 1);
          }}
        >
          <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar hidden />

            <View style={styles.overflowContainer}>
              <Animated.View
                style={{
                  transform: [
                    {
                      translateY: scrollXAnimated.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [OVERFLOW_HEIGHT, 0, -OVERFLOW_HEIGHT],
                      }),
                    },
                  ],
                }}
              >
                {data.map((item, i) => (
                  <View key={`${item.id}-${i}`} style={styles.itemContainer}>
                    <Text style={[styles.titleText, { color: theme.text }]}>
                      {item.title || `Memory #${i + 1}`}
                    </Text>
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>
                      {new Date(item.creationTime).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            </View>

            <FlatList
              data={data}
              keyExtractor={(item, i) => `${item.id}-${i}`}
              horizontal
              inverted
              scrollEnabled={false}
              extraData={index}
              contentContainerStyle={styles.flatListContent}
              renderItem={({ item, index: i }) => {
                const inputRange = [i - 1, i, i + 1];
                const translateX = scrollXAnimated.interpolate({
                  inputRange,
                  outputRange: [50, 0, -100],
                });
                const scale = scrollXAnimated.interpolate({
                  inputRange,
                  outputRange: [0.8, 1, 1.3],
                });
                const opacity = scrollXAnimated.interpolate({
                  inputRange,
                  outputRange: [0.001, 1, 0.001],
                });

                const zIndex = i === index ? 10 : 0;
                const pointerEvents = i === index ? "auto" : "none";

                // PERFORMANCE: Only render immediate neighbors
                if (i > index + 2 || i < index - 1) return null;

                return (
                  <Animated.View
                    style={[
                      styles.cardContainer,
                      {
                        zIndex,
                        opacity,
                        transform: [{ translateX }, { scale }],
                      },
                    ]}
                    pointerEvents={pointerEvents}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        router.push({
                          pathname: "/EventsListDetails",
                          params: {
                            item: JSON.stringify({
                              key: item.id,
                              poster: item.uri,
                              title: item.title || `Memory #${i + 1}`,
                              location: "Gallery",
                              date: new Date(
                                item.creationTime,
                              ).toLocaleDateString(),
                            }),
                          },
                        });
                      }}
                    >
                      <Image source={{ uri: item.uri }} style={styles.image} />
                      {item.isLiked && (
                        <View style={styles.heartBadge}>
                          <EvilIcons name="heart" size={24} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              }}
            />
            {/* Loading Indicator for next page */}
            {isLoadingMore && (
              <View style={styles.bottomLoader}>
                <ActivityIndicator size="small" color={theme.accent} />
              </View>
            )}
          </SafeAreaView>
        </FlingGestureHandler>
      </FlingGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  overflowContainer: {
    height: OVERFLOW_HEIGHT,
    overflow: "hidden",
    marginTop: 20,
  },
  itemContainer: {
    height: OVERFLOW_HEIGHT,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  titleText: { fontSize: 24, fontWeight: "900", textTransform: "uppercase" },
  dateText: { fontSize: 14, color: "#999" },
  flatListContent: { flex: 1, justifyContent: "center", padding: 20 },
  cardContainer: { position: "absolute", left: -ITEM_WIDTH / 2 },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    backgroundColor: "#222",
  },
  heartBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ff4d6d",
    borderRadius: 20,
    padding: 4,
  },
  bottomLoader: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
});

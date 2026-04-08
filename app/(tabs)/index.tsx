import { useTheme } from "@/hooks/use-theme";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { Heart, Search, Sparkles, Clock } from "lucide-react-native";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFavoritePhotos } from "../../components/db";

const { width } = Dimensions.get("window");

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

interface MediaAsset {
  id: string;
  uri: string;
  creationTime?: number;
}

const SectionHeader = ({ title, count, theme }: { title: string; count?: number; theme: any }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
    {count !== undefined && (
      <View style={[styles.countBadge, { backgroundColor: theme.surfaceHigh }]}>
        <Text style={[styles.countText, { color: theme.textMuted }]}>{count}</Text>
      </View>
    )}
  </View>
);

const PhotoCard = ({
  item,
  cardWidth,
  cardHeight,
  onPress,
  theme,
}: {
  item: MediaAsset;
  cardWidth: number;
  cardHeight: number;
  onPress: () => void;
  theme: any;
}) => (
  <TouchableOpacity
    activeOpacity={0.88}
    onPress={onPress}
    style={{ width: cardWidth, height: cardHeight, borderRadius: 14, overflow: "hidden", backgroundColor: theme.cardBg }}
  >
    <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<"memories" | "favorites">("memories");
  const [recentPhotos, setRecentPhotos] = useState<MediaAsset[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") return;
      setHasPermission(true);
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        sortBy: MediaLibrary.SortBy.creationTime,
        first: 30,
      });
      setRecentPhotos(assets as any);
    })();
  }, []);

  useEffect(() => {
    if (activeTab === "favorites" && isFocused && hasPermission) {
      (async () => {
        const favs = await getFavoritePhotos();
        const enriched = await Promise.all(
          favs.map(async (meta) => {
            try {
              const asset = await MediaLibrary.getAssetInfoAsync(meta.id);
              if (!asset) return null;
              return { ...asset, title: meta.title, isLiked: true };
            } catch {
              return null;
            }
          })
        );
        setFavorites(enriched.filter(Boolean));
      })();
    }
  }, [activeTab, isFocused, hasPermission]);

  const openPhoto = useCallback(
    (item: any) => {
      router.push({
        pathname: "/EventsListDetails",
        params: {
          item: JSON.stringify({
            key: item.id,
            poster: item.uri,
            title: item.title || "Memory",
            location: "Gallery",
            date: new Date(item.creationTime).toLocaleDateString(),
          }),
        },
      });
    },
    [router]
  );

  const MOSAIC_GAP = 6;
  const MOSAIC_WIDTH = width - 32;
  const COL = (MOSAIC_WIDTH - MOSAIC_GAP * 2) / 3;
  const heroPhotos = recentPhotos.slice(0, 6);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.greeting, { color: theme.textMuted }]}>{getGreeting()}</Text>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Your Memories</Text>
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: theme.surfaceHigh, borderColor: theme.border }]}
            onPress={() => router.push("/search")}
            activeOpacity={0.75}
          >
            <Search size={18} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Tags row */}
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { backgroundColor: theme.accentBg, borderColor: theme.isDark ? "#5A3F1A" : "#D4BFA0" }]}>
            <Sparkles size={11} color={theme.accent} strokeWidth={2} />
            <Text style={[styles.tagText, { color: theme.accent }]}>AI Search Active</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: theme.accentBg, borderColor: theme.isDark ? "#5A3F1A" : "#D4BFA0" }]}>
            <Clock size={11} color={theme.accent} strokeWidth={2} />
            <Text style={[styles.tagText, { color: theme.accent }]}>{recentPhotos.length} Recent</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={[styles.tabRow, { backgroundColor: theme.surface }]}>
          {(["memories", "favorites"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              style={[styles.tabPill, activeTab === t && { backgroundColor: theme.accent }]}
              activeOpacity={0.8}
            >
              {t === "favorites" && (
                <Heart
                  size={13}
                  color={activeTab === t ? theme.bg : theme.textMuted}
                  fill={activeTab === t ? theme.bg : "transparent"}
                  strokeWidth={2}
                />
              )}
              <Text style={[styles.tabPillText, { color: activeTab === t ? theme.bg : theme.textMuted }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "memories" ? (
          <>
            {/* Hero Mosaic */}
            <View style={styles.mosaicContainer}>
              {heroPhotos.length === 0 ? (
                <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={styles.emptyIcon}>📷</Text>
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No photos yet</Text>
                  <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                    {hasPermission ? "Add photos to your library to see them here" : "Grant media library permission to get started"}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: MOSAIC_GAP }}>
                  <PhotoCard
                    item={heroPhotos[0]}
                    cardWidth={COL * 1.55}
                    cardHeight={COL * 1.55 * 1.45}
                    onPress={() => openPhoto(heroPhotos[0])}
                    theme={theme}
                  />
                  <View style={{ gap: MOSAIC_GAP, flex: 1 }}>
                    {[heroPhotos[1], heroPhotos[2]].map(
                      (p) =>
                        p && (
                          <PhotoCard
                            key={p.id}
                            item={p}
                            cardWidth={COL * 1.45}
                            cardHeight={(COL * 1.55 * 1.45 - MOSAIC_GAP) / 2}
                            onPress={() => openPhoto(p)}
                            theme={theme}
                          />
                        )
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Recent strip */}
            {recentPhotos.length > 3 && (
              <View style={styles.section}>
                <SectionHeader title="Recent" count={recentPhotos.length} theme={theme} />
                <FlatList
                  data={recentPhotos.slice(3)}
                  horizontal
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10 }}
                  renderItem={({ item }) => (
                    <PhotoCard item={item} cardWidth={120} cardHeight={150} onPress={() => openPhoto(item)} theme={theme} />
                  )}
                />
              </View>
            )}

            {/* On This Day card */}
            {recentPhotos.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="On This Day" theme={theme} />
                <TouchableOpacity
                  style={[styles.dayCard, { backgroundColor: theme.cardBg }]}
                  onPress={() => openPhoto(recentPhotos[Math.floor(recentPhotos.length / 2)])}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: recentPhotos[Math.floor(recentPhotos.length / 2)]?.uri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={400}
                  />
                  <View style={styles.dayCardOverlay} />
                  <View style={styles.dayCardContent}>
                    <Sparkles size={14} color={theme.accent} strokeWidth={2} />
                    <Text style={styles.dayCardLabel}>
                      {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </Text>
                    <Text style={styles.dayCardSub}>A memory from your past</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.section, { paddingBottom: 40 }]}>
            {favorites.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={styles.emptyIcon}>🤍</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No favorites yet</Text>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>Tap the heart on any photo to add it here</Text>
              </View>
            ) : (
              <FlatList
                data={favorites}
                numColumns={2}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.favCard, { backgroundColor: theme.cardBg }]}
                    onPress={() => openPhoto(item)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: item.uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
                    <View style={styles.favOverlay}>
                      <Heart size={12} color={theme.heartRed} fill={theme.heartRed} />
                      <Text style={styles.favTitle} numberOfLines={1}>{item.title || "Favorite"}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  greeting: { fontSize: 13, letterSpacing: 0.4, fontWeight: "500", marginBottom: 2 },
  heroTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  searchBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, justifyContent: "center", alignItems: "center", marginTop: 4 },
  tagsRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.2 },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 20, padding: 4, borderRadius: 14, alignSelf: "flex-start" },
  tabPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  tabPillText: { fontSize: 13, fontWeight: "600" },
  mosaicContainer: { marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", letterSpacing: -0.2 },
  countBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  countText: { fontSize: 11, fontWeight: "600" },
  dayCard: { height: 190, borderRadius: 18, overflow: "hidden" },
  dayCardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.42)" },
  dayCardContent: { position: "absolute", bottom: 16, left: 16, gap: 3 },
  dayCardLabel: { fontSize: 20, fontWeight: "700", color: "#fff", letterSpacing: -0.3 },
  dayCardSub: { fontSize: 12, color: "rgba(255,255,255,0.65)" },
  favCard: { flex: 1, height: 200, borderRadius: 14, overflow: "hidden" },
  favOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "rgba(0,0,0,0.55)" },
  favTitle: { fontSize: 11, fontWeight: "600", color: "#fff", flex: 1 },
  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: 60, borderRadius: 18, borderWidth: 1, gap: 6 },
  emptyIcon: { fontSize: 36, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptyText: { fontSize: 13, textAlign: "center", paddingHorizontal: 32, lineHeight: 19 },
});

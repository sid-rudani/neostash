import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Heart, History, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PEOPLE_DATA = [
  { id: "1", name: "Lara", initials: "L" },
  { id: "2", name: "Neha", initials: "N" },
  { id: "3", name: "Bhai", initials: "B" },
  { id: "4", name: "Emma", initials: "E" },
];

const MOMENTS_DATA = [
  { id: "1", title: "Moment 1" },
  { id: "2", title: "Moment 2" },
  { id: "3", title: "Moment 3" },
];

const PLACES_DATA = [
  { id: "1", name: "Beach" },
  { id: "2", name: "Mountain" },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<"favorites" | "history">();

  const PersonCard = ({ item }: { item: (typeof PEOPLE_DATA)[0] }) => (
    <View style={styles.personCard}>
      <View style={[styles.avatar, { backgroundColor: getRandomColor() }]}>
        <ThemedText type="defaultSemiBold" style={styles.avatarText}>
          {item.initials}
        </ThemedText>
      </View>
      <ThemedText style={styles.personName}>{item.name}</ThemedText>
    </View>
  );

  const MomentCard = () => <View style={styles.momentCard} />;

  const PlaceCard = ({ item }: { item: (typeof PLACES_DATA)[0] }) => (
    <View style={styles.placeCard}>
      <ThemedText style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
        {item.name}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Search */}
        <View style={styles.header}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: Colors[colorScheme ?? "light"].background },
            ]}
          >
            <Search />
            <TextInput
              placeholder="Search"
              style={styles.searchInput}
              placeholderTextColor={
                Colors[colorScheme ?? "light"].tabIconDefault
              }
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("favorites")}
            style={[styles.tab, activeTab === "favorites" && styles.activeTab]}
          >
            <Heart />
            <ThemedText style={styles.tabText}>Favorites</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("history")}
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
          >
            <History />
            <ThemedText style={styles.tabText}>History</ThemedText>
          </TouchableOpacity>
        </View>

        {/* People Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">People</ThemedText>
            <ThemedText style={{ fontSize: 18 }}>›</ThemedText>
          </View>
          <FlatList
            data={PEOPLE_DATA}
            renderItem={({ item }) => <PersonCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal={true}
            contentContainerStyle={styles.flatListContent}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Curated Moments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Curated Moments</ThemedText>
            <ThemedText style={{ fontSize: 18 }}>›</ThemedText>
          </View>
          <FlatList
            data={MOMENTS_DATA}
            renderItem={MomentCard}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.flatListContent}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Places Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Places</ThemedText>
            <ThemedText style={{ fontSize: 18 }}>›</ThemedText>
          </View>
          <FlatList
            data={PLACES_DATA}
            renderItem={({ item }) => <PlaceCard item={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            contentContainerStyle={styles.flatListContent}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getRandomColor() {
  const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#95E1D3"];
  return colors[Math.floor(Math.random() * colors.length)];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 40,
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 4,
    borderRadius: 20,
  },
  activeTab: {
    borderWidth: 2,
    borderColor: "#000",
  },
  tabText: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  flatListContent: {
    gap: 12,
  },
  personCard: {
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    color: "#fff",
  },
  personName: {
    fontSize: 12,
    textAlign: "center",
  },
  momentCard: {
    width: 300,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#FFB6C1",
  },
  placeCard: {
    width: 300,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#FF8C42",
    justifyContent: "flex-end",
    padding: 12,
  },
});

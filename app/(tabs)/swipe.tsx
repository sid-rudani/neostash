import { ThemedText } from "@/components/themed-text";
import React, { useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const EVENTS_DATA = [
  {
    id: "1",
    title: "Freshers Party",
    location: "NIT Warangal",
    date: "Sept 12, 2025",
    image: "#1A1A2E",
  },
  {
    id: "2",
    title: "Tech Summit",
    location: "Hyderabad",
    date: "Oct 5, 2025",
    image: "#16213E",
  },
];

export default function SwipeScreen() {
  const [events] = useState(EVENTS_DATA);

  const EventCard = ({ item }: { item: (typeof EVENTS_DATA)[0] }) => (
    <View style={styles.eventCard}>
      <View style={[styles.eventImage, { backgroundColor: item.image }]}></View>
      <View style={styles.eventDetails}>
        <ThemedText type="title" style={styles.eventTitle}>
          {item.title}
        </ThemedText>
        <View style={styles.eventMeta}>
          <ThemedText style={styles.eventLocation}>{item.location}</ThemedText>
          <ThemedText style={styles.eventDate}>{item.date}</ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        renderItem={({ item }) => <EventCard item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    gap: 0,
  },
  eventCard: {
    width: width,
    height: "100%",
    paddingHorizontal: 16,
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  eventImage: {
    width: "100%",
    height: "70%",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  particlesContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  particle: {
    position: "absolute",
    borderRadius: 50,
    opacity: 0.7,
  },
  eventDetails: {
    height: "30%",
    justifyContent: "center",
    gap: 8,
  },
  eventTitle: {
    fontSize: 28,
  },
  eventMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventLocation: {
    fontSize: 14,
  },
  eventDate: {
    fontSize: 14,
  },
});

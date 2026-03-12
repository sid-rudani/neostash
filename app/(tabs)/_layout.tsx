import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  GalleryHorizontalEnd,
  House,
  Image,
  Search,
  SlidersVertical,
} from "lucide-react-native";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <House strokeWidth={2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <GalleryHorizontalEnd size={24} strokeWidth={2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Search size={24} strokeWidth={2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <Image size={24} strokeWidth={1.5} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <SlidersVertical size={24} strokeWidth={1.5} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

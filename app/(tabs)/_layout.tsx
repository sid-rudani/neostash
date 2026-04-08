import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  GalleryHorizontalEnd,
  House,
  Image,
  Search,
  SlidersVertical,
} from "lucide-react-native";

const DARK_TAB = { bg: "#0D0D0F", border: "#1E1E23", tint: "#C8A96E", inactive: "#52525A" };
const LIGHT_TAB = { bg: "#FFFFFF", border: "#E6E3DD", tint: "#9E7C4F", inactive: "#9A948C" };

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tab = colorScheme === "dark" ? DARK_TAB : LIGHT_TAB;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tab.tint,
        tabBarInactiveTintColor: tab.inactive,
        tabBarStyle: {
          backgroundColor: tab.bg,
          borderTopColor: tab.border,
          borderTopWidth: 1,
        },
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

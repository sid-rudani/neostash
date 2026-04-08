import { AntDesign, EvilIcons, Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useTheme } from "@/hooks/use-theme";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import Reanimated from "react-native-reanimated";
import {
  Directions,
  FlingGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
// Removed legacy react-navigation-shared-element to fix build

// Import your DB helpers
import { getPhotoMetadata, updatePhotoMetadata } from "../components/db";

const SPACING = 16;
const { height, width } = Dimensions.get("window");
const BOTTOM_SHEET_HEIGHT = height * 0.52;
const DELAY = 300;
const DURATION = 500;

const fadeInBottom = {
  0: { opacity: 0, translateY: 60 },
  1: { opacity: 1, translateY: 0 },
};

interface EventItem {
  key: string;
  poster: string;
  title: string;
  location: string;
  date: string;
}

interface Person {
  id: string;
  avatar?: string;
}

const EventsListDetails: React.FC = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const item: EventItem =
    typeof params.item === "string" ? JSON.parse(params.item) : params.item;

  const [liked, setLiked] = React.useState(false);
  const [textNote, setTextNote] = React.useState("");
  const [displayTitle, setDisplayTitle] = React.useState(item.title); // State for Title
  const [editingText, setEditingText] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState(false); // State for Title Editing
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [hasVoice] = React.useState(false);
  const [people] = React.useState<Person[]>([{ id: "1" }]);

  const sheetY = React.useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;

  React.useEffect(() => {
    const loadMetadata = async () => {
      const meta = await getPhotoMetadata(item.key);
      if (meta) {
        setLiked(meta.isLiked === 1);
        setTextNote(meta.note || "");
        if (meta.title) setDisplayTitle(meta.title);
      }
    };

    loadMetadata();

    Animated.spring(sheetY, {
      toValue: 0,
      useNativeDriver: true,
      delay: DELAY,
      bounciness: 12,
    }).start();
  }, [item.key]);

  const saveToDb = async (
    newLiked: boolean,
    newNote: string,
    newTitle: string,
  ) => {
    await updatePhotoMetadata(item.key, {
      isLiked: newLiked ? 1 : 0,
      note: newNote,
      title: newTitle,
    });
  };

  const toggleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    await saveToDb(nextLiked, textNote, displayTitle);
  };

  const handleFinishNoteEditing = async () => {
    setEditingText(false);
    await saveToDb(liked, textNote, displayTitle);
  };

  const handleFinishTitleEditing = async () => {
    setEditingTitle(false);
    await saveToDb(liked, textNote, displayTitle);
  };

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/swipe");
    }
  };

  const onSwipeUp = (ev: any) => {
    if (ev.nativeEvent.state === State.END) close();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler
        direction={Directions.UP}
        onHandlerStateChange={onSwipeUp}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <Reanimated.Image
            // @ts-ignore sharedTransitionTag is experimental/missing in Reanimated 4.1 typing
            sharedTransitionTag={`item.${item.key}.image`}
            source={{ uri: item.poster }}
            style={[StyleSheet.absoluteFillObject]}
          />

          <Animatable.View
            animation="fadeIn"
            duration={DURATION * 2}
            delay={DELAY}
            useNativeDriver
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(0,0,0,0.25)" },
            ]}
          />

          <Animatable.View
            animation={fadeInBottom}
            duration={DURATION}
            delay={DELAY}
            useNativeDriver
            style={styles.topBar}
          >
            <TouchableOpacity onPress={close} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleLike} style={styles.iconBtn}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={22}
                color={liked ? "#ff4d6d" : "#fff"}
              />
            </TouchableOpacity>
          </Animatable.View>

          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: sheetY }], backgroundColor: theme.bgElevated }]}
          >
            <View style={[styles.handle, { backgroundColor: theme.border }]} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              {/* EDITABLE TITLE */}
              <Animatable.View
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 100}
                useNativeDriver
              >
                {editingTitle ? (
                  <View style={styles.inputContainer}>
                    <TextInput
                      autoFocus
                      value={displayTitle}
                      onChangeText={setDisplayTitle}
                      onBlur={handleFinishTitleEditing}
                      style={[
                        styles.title,
                        { color: theme.text },
                        {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border,
                          flex: 1,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      onPress={handleFinishTitleEditing}
                      style={styles.saveTickBtn}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={32}
                        color="#4CAF50"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setEditingTitle(true)}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                      {displayTitle}
                    </Text>
                  </TouchableOpacity>
                )}
              </Animatable.View>

              <Animatable.View
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 200}
                useNativeDriver
                style={styles.metaRow}
              >
                <EvilIcons name="location" size={16} color={theme.textMuted} />
                <Text style={[styles.metaText, { color: theme.textMuted }]}>{item.location}</Text>
                <Text style={[styles.metaText, { marginLeft: "auto", color: theme.textMuted }]}>
                  {item.date}
                </Text>
              </Animatable.View>

              {/* ATTACH TEXT BOX */}
              <Animatable.View
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 300}
                useNativeDriver
                style={styles.attachRow}
              >
                <View style={styles.attachLeft}>
                  <Feather
                    name="edit-2"
                    size={18}
                    color={theme.textMuted}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.attachLabel, { color: theme.text }]}>Attach Text</Text>
                    {editingText ? (
                      <View style={styles.inputContainer}>
                        <TextInput
                          autoFocus
                          multiline
                          value={textNote}
                          onChangeText={setTextNote}
                          onBlur={handleFinishNoteEditing}
                          style={[styles.textInput, { color: theme.text, borderBottomColor: theme.border }]}
                          placeholder="A picture keeps the scene — your words keep the feeling"
                        />
                        <TouchableOpacity
                          onPress={handleFinishNoteEditing}
                          style={styles.saveTickBtn}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={26}
                            color="#888"
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => setEditingText(true)}>
                        <Text
                          style={[
                            styles.attachPlaceholder,
                            textNote ? styles.attachValue : null,
                          ]}
                          numberOfLines={3}
                        >
                          {textNote ||
                            "A picture keeps the scene — your words keep the feeling"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Animatable.View>

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              <Animatable.View
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 400}
                useNativeDriver
                style={styles.attachRow}
              >
                <View style={styles.attachLeft}>
                  <Ionicons
                    name="mic-outline"
                    size={20}
                    color={theme.textMuted}
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.attachLabel, { color: theme.text }]}>Attach Voice</Text>
                    <Text style={styles.attachPlaceholder}>
                      {hasVoice
                        ? "Recording #1 — tap to play"
                        : "Some memories deserve to be heard, not just written."}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.micBtn, { backgroundColor: theme.surfaceHigh }]}>
                  <Ionicons name="mic" size={18} color={theme.textMuted} />
                </TouchableOpacity>
              </Animatable.View>

              <View style={[styles.divider, { backgroundColor: theme.divider }]} />

              <Animatable.View
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 500}
                useNativeDriver
                style={styles.attachRow}
              >
                <View style={styles.attachLeft}>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    color={theme.textMuted}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={[styles.attachLabel, { color: theme.text }]}>People</Text>
                </View>
                <View style={styles.peopleRow}>
                  {people.map((p) => (
                    <View key={p.id} style={styles.avatar}>
                      {p.avatar ? (
                        <Image
                          source={{ uri: p.avatar }}
                          style={styles.avatarImg}
                        />
                      ) : (
                        <Ionicons name="person" size={18} color="#aaa" />
                      )}
                    </View>
                  ))}
                  <TouchableOpacity style={styles.addAvatar}>
                    <AntDesign name="plus" size={16} color="#888" />
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            </ScrollView>
          </Animated.View>
        </View>
      </FlingGestureHandler>
    </GestureHandlerRootView>
  );
};

(EventsListDetails as any).sharedElements = (route: any) => {
  const params = route?.params;
  if (!params?.item) return [];
  const item: EventItem =
    typeof params.item === "string" ? JSON.parse(params.item) : params.item;
  return [{ id: `item.${item.key}.image` }, { id: "general.bg" }];
};

export default EventsListDetails;

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING,
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING * 1.5,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: -0.5,
    color: "#111",
    marginBottom: 6,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  metaText: {
    fontSize: 13,
    color: "#555",
    marginLeft: 2,
  },
  attachRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  attachLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  attachLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    marginBottom: 3,
  },
  attachPlaceholder: {
    fontSize: 12,
    color: "#bbb",
    lineHeight: 18,
  },
  attachValue: {
    color: "#444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    color: "#444",
    lineHeight: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 4,
    minHeight: 40,
  },
  saveTickBtn: {
    paddingLeft: 10,
    justifyContent: "center",
  },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  peopleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  addAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
});

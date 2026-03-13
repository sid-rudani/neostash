import { AntDesign, EvilIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Directions,
    FlingGestureHandler,
    GestureHandlerRootView,
    State,
} from 'react-native-gesture-handler';
// @ts-ignore: no types available
import * as Animatable from 'react-native-animatable';
// @ts-ignore: no types available
import { SharedElement } from 'react-navigation-shared-element';

const SPACING = 16;
const { height, width } = Dimensions.get('window');
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


  const [liked, setLiked] = React.useState(false);
  const [textNote, setTextNote] = React.useState('');
  const [editingText, setEditingText] = React.useState(false);
  const [hasVoice] = React.useState(false); // replace with real recording logic
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [people] = React.useState<Person[]>([{ id: '1' }]);

 
  const sheetY = React.useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;

  React.useEffect(() => {
    Animated.spring(sheetY, {
      toValue: 0,
      useNativeDriver: true,
      delay: DELAY,
      bounciness: 12,
    }).start();
  }, []);

  if (!params.item) return null;

  const item: EventItem =
    typeof params.item === 'string' ? JSON.parse(params.item) : params.item;

  const isLabelled = textNote.trim().length > 0 || hasVoice;

  const close = () => {
    router.replace('/(tabs)/swipe');
  };

  const onSwipeUp = (ev: any) => {
    if (ev.nativeEvent.state === State.END) close();
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler direction={Directions.UP} onHandlerStateChange={onSwipeUp}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>

          {/* ── Full-screen image ── */}
          <SharedElement
            id={`item.${item.key}.image`}
            style={StyleSheet.absoluteFillObject}
            key={`details-image-${item.key}`}
          >
            <Image
              source={{ uri: item.poster }}
              style={[StyleSheet.absoluteFillObject, { resizeMode: 'cover' }]}
            />
          </SharedElement>

          {/* ── Dark overlay ── */}
          <Animatable.View
            animation="fadeIn"
            duration={DURATION * 2}
            delay={DELAY}
            useNativeDriver
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: 'rgba(0,0,0,0.25)' },
            ]}
          />

          {/* ── Top bar: back + like ── */}
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
            <TouchableOpacity
              onPress={() => setLiked((v) => !v)}
              style={styles.iconBtn}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={22}
                color={liked ? '#ff4d6d' : '#fff'}
              />
            </TouchableOpacity>
          </Animatable.View>

          {/* ── Bottom sheet ── */}
          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY: sheetY }] },
            ]}
          >
            {/* drag handle */}
            <View style={styles.handle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              {/* title / location / date */}
              <Animatable.Text
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 100}
                useNativeDriver
                style={styles.title}
                numberOfLines={1}
              >
                {item.title}
              </Animatable.Text>

              <Animatable.View
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 200}
                useNativeDriver
                style={styles.metaRow}
              >
                <EvilIcons name="location" size={16} color="#555" />
                <Text style={styles.metaText}>{item.location}</Text>
                <Text style={[styles.metaText, { marginLeft: 'auto' }]}>
                  {item.date}
                </Text>
              </Animatable.View>

              {/* ── LABELLED: show voice player ── */}
              {isLabelled && hasVoice && (
                <Animatable.View
                  animation={fadeInBottom}
                  duration={DURATION}
                  delay={DELAY + 250}
                  useNativeDriver
                  style={styles.playerRow}
                >
                  <Text style={styles.playerLabel}>Recording #1</Text>
                  <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsPlaying((v) => !v)}
                    style={styles.playBtn}
                  >
                    <Ionicons
                      name={(isPlaying ? 'ios-pause' : 'ios-play') as any}
                      size={32}
                      color="#222"
                    />
                  </TouchableOpacity>
                </Animatable.View>
              )}

              {/* ── Attach Text ── */}
              <Animatable.View
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 300}
                useNativeDriver
                style={styles.attachRow}
              >
                <View style={styles.attachLeft}>
                  <Feather name="edit-2" size={18} color="#888" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attachLabel}>Attach Text</Text>
                    {editingText ? (
                      <TextInput
                        autoFocus
                        multiline
                        value={textNote}
                        onChangeText={setTextNote}
                        onBlur={() => setEditingText(false)}
                        style={styles.textInput}
                        placeholder="A picture keeps the scene — your words keep the feeling"
                        placeholderTextColor="#bbb"
                      />
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
                            'A picture keeps the scene — your words keep the feeling'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Animatable.View>

              <View style={styles.divider} />

              {/* ── Attach Voice ── */}
              <Animatable.View
                animation={fadeInBottom}
                duration={DURATION}
                delay={DELAY + 400}
                useNativeDriver
                style={styles.attachRow}
              >
                <View style={styles.attachLeft}>
                  <Ionicons name="mic-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attachLabel}>Attach Voice</Text>
                    <Text style={styles.attachPlaceholder}>
                      {hasVoice
                        ? 'Recording #1 — tap to play'
                        : 'Some memories deserve to be heard, not just written.'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.micBtn}>
                  <Ionicons name="mic" size={18} color="#888" />
                </TouchableOpacity>
              </Animatable.View>

              <View style={styles.divider} />

              {/* ── People ── */}
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
                    color="#888"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.attachLabel}>People</Text>
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


(EventsListDetails as any).sharedElements = (
  route: any,
) => {
  const params = route?.params;
  if (!params?.item) return [];
  const item: EventItem =
    typeof params.item === 'string' ? JSON.parse(params.item) : params.item;
  return [
    { id: `item.${item.key}.image` },
    { id: 'general.bg' },
  ];
};

export default EventsListDetails;


const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING * 1.5,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    color: '#111',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 2,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  playerLabel: {
    fontSize: 12,
    color: '#555',
    width: 80,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: '#333',
    borderRadius: 2,
  },
  playBtn: {
    marginLeft: 4,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  attachLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  attachLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
  },
  attachPlaceholder: {
    fontSize: 12,
    color: '#bbb',
    lineHeight: 18,
  },
  attachValue: {
    color: '#444',
  },
  textInput: {
    fontSize: 12,
    color: '#444',
    lineHeight: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 4,
    minHeight: 40,
  },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

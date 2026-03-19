/**
 *
 * Inspiration: https://dribbble.com/shots/3731362-Event-cards-iOS-interaction
 */

import { EvilIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Directions,
    FlingGestureHandler,
    GestureHandlerRootView,
    State,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore: shared element types missing
import { SharedElement } from 'react-navigation-shared-element';
const { width, height } = Dimensions.get('screen');

// Types
interface PhotoItem {
  key: string;
  title: string;
  location: string;
  date: string;
  poster: string;
}



interface OverflowItemsProps {
  data: PhotoItem[];
  scrollXAnimated: Animated.Value;
}

// https://www.creative-flyers.com
const DATA: PhotoItem[] = [
  {
    key:'1',
    title: 'Afro vibes',

    location: 'Mumbai, India',
    date: 'Nov 17th, 2020',
    poster:
      'https://www.creative-flyers.com/wp-content/uploads/2020/07/Afro-vibes-flyer-template.jpg',
  },
  {
      key:'2',
    title: 'Jungle Party',
    location: 'Unknown',
    date: 'Sept 3rd, 2020',
    poster:
      'https://www.creative-flyers.com/wp-content/uploads/2019/11/Jungle-Party-Flyer-Template-1.jpg',
  },
  {
    key:'3',
    title: '4th Of July',
    location: 'New York, USA',
    date: 'Oct 11th, 2020',
    poster:
      'https://www.creative-flyers.com/wp-content/uploads/2020/06/4th-Of-July-Invitation.jpg',
  },
  {
    key:'4',
    title: 'Summer festival',
    location: 'Bucharest, Romania',
    date: 'Aug 17th, 2020',
    poster:
      'https://www.creative-flyers.com/wp-content/uploads/2020/07/Summer-Music-Festival-Poster.jpg',
  },
  {
    key:'5',
    title: 'BBQ with friends',
    location: 'Prague, Czech Republic',
    date: 'Sept 11th, 2020',
    poster:
      'https://www.creative-flyers.com/wp-content/uploads/2020/06/BBQ-Flyer-Psd-Template.jpg',
  },
  {
    key:'6',
    title: 'Festival music',
    location: 'Berlin, Germany',
    date: 'Apr 21th, 2021',
    poster:
      'https://www.creative-flyers.com/wp-content/uploads/2020/06/Festival-Music-PSD-Template.jpg',
  },
  {
    key:'7',
    title: 'Beach House',
    location: 'Liboa, Portugal',
    date: 'Aug 12th, 2020',
    poster:
      'https://www.creative-flyers.com/wp-content/uploads/2020/06/Summer-Beach-House-Flyer.jpg',
  },
];

const OVERFLOW_HEIGHT = 70;
const SPACING = 10;
const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.7;
const VISIBLE_ITEMS = 3;

const OverflowItems: React.FC<OverflowItemsProps> = ({ data, scrollXAnimated }) => {
  const inputRange = [-1, 0, 1];
  const translateY = scrollXAnimated.interpolate({
    inputRange,
    outputRange: [OVERFLOW_HEIGHT, 0, -OVERFLOW_HEIGHT],
  });
  return (
    <View style={styles.overflowContainer}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {data.map((item, index) => {
          
          return (
            <View key={`${item.key}-${index}`} style={styles.itemContainer}>
              <Text style={[styles.title]} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.itemContainerRow}>
                <Text style={[styles.location]}>
                  <EvilIcons
                    name='location'
                    size={16}
                    color='black'
                    style={{ marginRight: 5 }}
                  />
                  {item.location}
                </Text>
                <Text style={[styles.date]}>{item.date}</Text>
              </View>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
};

export default function SwipeScreen(): React.ReactElement {
  const router = useRouter();
  const [data, setData] = React.useState<PhotoItem[]>(DATA);
  const scrollXIndex = React.useRef(new Animated.Value(0)).current;
  const scrollXAnimated = React.useRef(new Animated.Value(-1)).current;
  const [index, setIndex] = React.useState(0);
  
  const setActiveIndex = React.useCallback((activeIndex: number) => {
    scrollXIndex.setValue(activeIndex);
    setIndex(activeIndex);
  }, [scrollXIndex]);

  React.useEffect(() => {
    if (index === data.length - VISIBLE_ITEMS - 1) {
      
      const suffix = data.length;
      const more = data.map((d, i) => ({
        ...d,
        key: `${d.key}-${suffix + i}`,
      }));
      setData([...data, ...more]);
    }
  });

  React.useEffect(() => {
    Animated.spring(scrollXAnimated, {
      toValue: scrollXIndex,
      useNativeDriver: true,
    }).start();
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FlingGestureHandler
        key='left'
        direction={Directions.LEFT}
        onHandlerStateChange={(ev) => {
          if (ev.nativeEvent.state === State.END) {
            if (index === data.length - 1) {
              return;
            }
            setActiveIndex(index + 1);
          }
        }}
      >
        <FlingGestureHandler
          key='right'
          direction={Directions.RIGHT}
          onHandlerStateChange={(ev) => {
            if (ev.nativeEvent.state === State.END) {
              if (index === 0) {
                return;
              }
              setActiveIndex(index - 1);
            }
          }}
        >
          <SafeAreaView style={styles.container}>
            <StatusBar hidden />
            <OverflowItems data={data} scrollXAnimated={scrollXAnimated} />
            <FlatList<PhotoItem>
              data={data}
              keyExtractor={(item, i)=>`${item.key}-${i}`}
              horizontal
              inverted
              contentContainerStyle={{
                flex: 1,
                justifyContent: 'center',
                padding: SPACING * 2,
                marginTop: 50,
              }}
              scrollEnabled={false}
              removeClippedSubviews={false}
              renderItem={({ item, index:i }) => {
                const inputRange = [i - 1, i, i+ 1];
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
                  outputRange: [0, 1, 0],
                });
                

                const zIndex = i === index ? 10 : 0;
                const pointerEvents = i === index ? 'auto' : 'none';
                return (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      left: -ITEM_WIDTH / 2,
                      opacity,
                      zIndex,
                      transform: [
                        {
                          translateX,
                        },
                        { scale },
                      ],
                    }}
                    pointerEvents={pointerEvents}
                  >
                    <TouchableOpacity activeOpacity={.9}
                    onPress={() => {
                      router.push({
                        pathname: '/(tabs)/EventsListDetails',
                        params: { item: JSON.stringify(item), key: `${item.key}-${Date.now()}` },
                      });
                    }}>
                      <SharedElement id={`item.${item.key}.image`} key={`shared-${item.key}`}>
                    <Image
                      source={{ uri: item.poster }}
                      style={{
                        width: ITEM_WIDTH,
                        height: ITEM_HEIGHT,
                        borderRadius: 14,
                      }}
                    />
                    </SharedElement>
                    </TouchableOpacity>
                  </Animated.View>
                );
              }}
            />
            <SharedElement id='general.bg' style={[StyleSheet.absoluteFillObject,{
              transform:[{translateY:height}]
            }]} key="general-bg">
            <View style={
                        [
                            StyleSheet.absoluteFillObject,
                            {
                                backgroundColor:'#fff',
                                borderRadius:16
                            }
                        ]
                    }></View>
            </SharedElement>
          </SafeAreaView>
        </FlingGestureHandler>
      </FlingGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  location: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
  },
  itemContainer: {
    height: OVERFLOW_HEIGHT,
    padding: SPACING * 2,
  },
  itemContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overflowContainer: {
    height: OVERFLOW_HEIGHT,
    overflow: 'hidden',
  },
});

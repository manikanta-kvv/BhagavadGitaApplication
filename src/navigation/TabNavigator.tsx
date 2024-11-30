import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';
import ChapterListScreen from '../screens/ChapterListScreen';
import ChapterDetailScreen from '../screens/ChapterDetailScreen';
import { createStackNavigator } from '@react-navigation/stack';

type ProfileStackParamList = {
  ProfileMain: undefined;
  ChapterList: undefined;
  ChapterDetail: { 
    chapterNumber: number;
    chapterName: string;
  };
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="ChapterList" component={ChapterListScreen} options={{ title: 'Chapters' }} />
      <ProfileStack.Screen 
        name="ChapterDetail" 
        component={ChapterDetailScreen} 
        options={({ route }) => ({ 
          title: `Chapter ${route.params.chapterNumber}` 
        })} 
      />
    </ProfileStack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={focused ? '#000000' : color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#2C3E50',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          textShadowColor: 'rgba(0, 0, 0, 0.1)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 1,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.text,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Gita Slokas',
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
} 
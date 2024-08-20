import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import weatherDescKo from './weatherDescKo';

export default function App() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const API_KEY = '784ab24ff2ed5d94d4288abed9e25d13';

  const weather = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setOk(false);
        return;
      }
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000,
      });
      const location = await Location.reverseGeocodeAsync(
        { latitude, longitude },
        { useGoogleMaps: false }
      );
      setCity(location[0]?.city || location[0]?.district || 'Unknown location');

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const json = await response.json();
      console.log(json.daily);
      setDays(json.daily);
    } catch (error) {
      console.error("Weather function error:", error);
    }
  };

  const getWeatherDescription = (id) => {
    const descriptionObj = weatherDescKo.find((desc) => parseInt(Object.keys(desc)[0]) === id);
    return descriptionObj ? descriptionObj[id] : '설명 없음';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('ko-KR', options);
  };

  useEffect(() => {
    console.log('weatherDescKo:', weatherDescKo); // weatherDescKo의 값을 확인
    weather();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'skyblue' }}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator color="white" style={{ marginTop: 10 }} size="large" />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <Text style={styles.date}>{formatDate(day.dt)}</Text>
              <Text style={styles.temp}>{parseFloat(day.temp.day).toFixed(1)}
                <Text style={styles.unit}>°C</Text>
              </Text>
              {
                day.weather && day.weather[0] && (
                  <>
                    <Image
                      source={{ uri: `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png` }}
                      style={styles.weatherIcon}
                    />
                    <Text style={styles.tinyText}>{getWeatherDescription(day.weather[0].id)}</Text>
                  </>
                )
              }
            </View>
          ))
        )
        }
      </ScrollView >
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'tomato',
  },
  city: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 58,
    fontWeight: '500',
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  temp: {
    marginTop: 30,
    fontWeight: '600',
    fontSize: 120,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginTop: 20,
  },
  tinyText: {
    fontSize: 20,
    marginTop: 10,
  },
  date: {
    fontSize: 30,
  },
  unit: {
    fontSize: 50,
  }
});

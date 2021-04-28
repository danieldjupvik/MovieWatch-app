import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import {
  baseBackdropUrl,
  apiKey,
  basePosterUrl,
  personUrl,
  creditPerson,
} from '../settings/api';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Loader from '../components/Loader';
import * as WebBrowser from 'expo-web-browser';
import i18n from 'i18n-js';
import brandIcon from '../assets/icon.png';

import axios from 'axios';
import { useColorScheme } from 'react-native-appearance';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  backgroundColorDark,
  backgroundColorLight,
  textColorDark,
  textColorLight,
} from '../colors/colors';
import { borderRadius, boxShadow } from '../styles/globalStyles';
import posterLoader from '../assets/poster-loader.jpg';
import { monthNames } from '../components/RenderDetails';
import tmdbLogo from '../assets/tmdb-logo-small.png';

const PersonDetails = ({ route, navigation }) => {
  const { id } = route.params;
  const { creditId } = route.params;

  const [loader, setLoader] = useState(true);
  const [person, setPerson] = useState([]);
  const [personCredit, setPersonCredit] = useState([]);

  const colorScheme = useColorScheme();

  const scrollBarTheme = colorScheme === 'light' ? 'light' : 'dark';
  const themeTextStyle =
    colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;
  const themeContainerStyle =
    colorScheme === 'light' ? styles.lightContainer : styles.darkContainer;
  const themeBtnBackground =
    colorScheme === 'light'
      ? styles.lightThemeBtnBackground
      : styles.darkThemeBtnBackground;

  useEffect(() => {
    const getPerson = async () => {
      try {
        const response = await axios.get(
          `${personUrl + id + apiKey}&append_to_response=combined_credits`
        );
        setPerson(response.data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoader(false);
      }
    };
    getPerson();
  }, []);

  useEffect(() => {
    const getCreditPerson = async () => {
      try {
        const response = await axios.get(`${creditPerson + creditId + apiKey}`);
        setPersonCredit(response.data);
        console.log(response.data.media);
      } catch (e) {
        console.log(e);
      } finally {
        setLoader(false);
      }
    };
    getCreditPerson();
  }, []);

  var dBirthday = new Date(person.birthday);
  var year = dBirthday.getFullYear();
  var month = monthNames[dBirthday.getMonth()];
  var day = dBirthday.getDate();
  var birthday = `${day}. ${month} ${year}`;

  var dDeathday = new Date(person.birthday);
  var year = dDeathday.getFullYear();
  var month = monthNames[dDeathday.getMonth()];
  var day = dDeathday.getDate();
  var deathday = `${day}. ${month} ${year}`;

  const goToWebsite = () => {
    WebBrowser.openBrowserAsync(person.homepage);
  };

  return (
    <SafeAreaView style={[styles.container, themeContainerStyle]}>
      {loader ? (
        <Loader />
      ) : (
        <View style={styles.scrollViewWrapper}>
          <ScrollView indicatorStyle={scrollBarTheme}>
            <View style={styles.main}>
              <ImageBackground
                source={{
                  uri: `${baseBackdropUrl + personCredit.media?.backdrop_path}`,
                }}
                style={styles.backdrop}
                defaultSource={posterLoader}
                ImageCacheEnum={'force-cache'}
              >
                <View style={styles.child} />
              </ImageBackground>
              <View style={boxShadow}>
                <Image
                  source={{
                    uri: `${basePosterUrl + person.profile_path}`,
                  }}
                  defaultSource={posterLoader}
                  ImageCacheEnum={'force-cache'}
                  style={styles.posterImg}
                />
              </View>
              <Text style={[styles.title, styles.runtime, themeTextStyle]}>
                {person.name}
              </Text>

              <Text style={[styles.genre, themeTextStyle]}>
                <Text style={styles.category}>{i18n.t('birthday')}</Text>{' '}
                {birthday}
              </Text>

              {person.deathday ? (
                <Text style={[styles.genre, themeTextStyle]}>
                  <Text style={styles.category}>{i18n.t('deathday')}</Text>{' '}
                  {deathday}
                </Text>
              ) : null}

              <Text style={[styles.genre, themeTextStyle]}>
                <Text style={styles.category}>{i18n.t('gender')}</Text>{' '}
                {person.gender === 1 ? i18n.t('female') : i18n.t('male')}
              </Text>

              <Text style={[styles.genre, themeTextStyle]}>
                <Text style={styles.category}>{i18n.t('birthPlace')}</Text>{' '}
                {person.place_of_birth}
              </Text>

              {person.homepage ? (
                <View style={styles.homepageButtonMain}>
                  <TouchableOpacity
                    style={styles.homepageButtonDiv}
                    onPress={goToWebsite}
                  >
                    <Text
                      style={[
                        styles.homepageButton,
                        themeTextStyle,
                        themeBtnBackground,
                      ]}
                    >
                      {i18n.t('homepage')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <Text style={[styles.overview, styles.runtime, themeTextStyle]}>
                {person.biography}
              </Text>
            </View>

            <View style={styles.moviesMain}>
              <Text style={[styles.moviesHeading, themeTextStyle]}>
                {i18n.t('knownFor')}
              </Text>
              <ScrollView horizontal={true} indicatorStyle={scrollBarTheme}>
                <View style={styles.moviesDiv}>
                  {personCredit.person?.known_for.map((movie, idx) => {
                    if (movie.poster_path !== null) {
                      let mediaType;
                      if (movie.media_type === 'movie') {
                        mediaType = 'Details';
                      } else {
                        mediaType = 'SeriesDetails';
                      }
                      return (
                        <TouchableOpacity
                          style={styles.moviesCard}
                          key={idx}
                          onPress={() =>
                            navigation.push(mediaType, {
                              id: movie.id,
                              headerTitle: movie.title,
                            })
                          }
                        >
                          <View style={boxShadow}>
                            <Image
                              style={styles.posterImage}
                              source={{
                                uri: `${basePosterUrl + movie.poster_path}`,
                              }}
                              ImageCacheEnum={'force-cache'}
                            />
                          </View>
                          <View style={styles.ratingDiv}>
                            <Image
                              source={tmdbLogo}
                              style={styles.tmdbLogo}
                              resizeMode='contain'
                            />
                            <Text style={[styles.rating, themeTextStyle]}>
                              {Math.floor((movie.vote_average * 100) / 10)}%
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={styles.moviesMain}>
              <Text style={[styles.moviesHeading, themeTextStyle]}>
                {i18n.t('appearsIn')}
              </Text>
              <ScrollView horizontal={true} indicatorStyle={scrollBarTheme}>
                <View style={styles.moviesDiv}>
                  {person.combined_credits?.cast.map((movie, idx) => {
                    if (movie.poster_path !== null) {
                      let mediaType;
                      if (movie.media_type === 'movie') {
                        mediaType = 'Details';
                      } else {
                        mediaType = 'SeriesDetails';
                      }
                      return (
                        <TouchableOpacity
                          style={styles.moviesCard}
                          key={idx}
                          onPress={() =>
                            navigation.push(mediaType, {
                              id: movie.id,
                              headerTitle: movie.title,
                            })
                          }
                        >
                          <View style={boxShadow}>
                            <Image
                              style={styles.posterImage}
                              source={{
                                uri: `${basePosterUrl + movie.poster_path}`,
                              }}
                              ImageCacheEnum={'force-cache'}
                            />
                          </View>
                          <View style={styles.ratingDiv}>
                            <Image
                              source={tmdbLogo}
                              style={styles.tmdbLogo}
                              resizeMode='contain'
                            />
                            <Text style={[styles.rating, themeTextStyle]}>
                              {Math.floor((movie.vote_average * 100) / 10)}%
                            </Text>
                          </View>
                          <View style={styles.ratingDiv}>
                            <Text style={[styles.rating, themeTextStyle]}>
                              {movie.media_type === 'movie' ? 'Movie' : 'TV'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  })}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const globalFontsize = 16;
const globalPadding = 5;
const normalFontWeight = '400';
const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    width: deviceWidth,
    justifyContent: 'center',
  },
  scrollViewWrapper: {
    marginBottom: 45,
  },
  backdrop: {
    width: '100%',
    height: 250,
  },
  posterImg: {
    width: 120,
    height: 180,
    marginTop: -250 / 2,
    marginLeft: 20,
    borderRadius: borderRadius,
  },
  title: {
    marginTop: 30,
    marginBottom: 10,
    marginLeft: 22,
    marginRight: 22,
    fontSize: 20,
    fontWeight: 'bold',
  },
  overview: {
    marginLeft: 22,
    marginRight: 22,
    fontSize: globalFontsize,
    fontWeight: normalFontWeight,
    marginTop: 20,
    lineHeight: 29,
  },
  genre: {
    marginLeft: 22,
    marginRight: 22,
    fontSize: globalFontsize,
    fontWeight: normalFontWeight,
    marginTop: globalPadding,
    marginBottom: globalPadding,
    lineHeight: 29,
  },
  runtime: {
    marginBottom: globalPadding * 4,
  },
  child: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  rating: {
    marginLeft: 22,
    fontSize: globalFontsize,
    fontWeight: normalFontWeight,
    marginTop: 20,
    marginBottom: globalPadding,
  },
  tagline: {
    marginLeft: 22,
    opacity: 0.7,
    fontSize: 16,
  },
  category: {
    opacity: 0.7,
  },
  castMain: {
    marginTop: 25 + globalPadding,
    marginBottom: 25 + globalPadding,
    marginLeft: 22,
  },
  castDiv: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 30,
  },
  castCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  profileImage: {
    width: deviceWidth / 4.5,
    height: deviceWidth / 4.5,
    marginBottom: 5,
    borderRadius: 50,
  },
  textName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  textCharacter: {
    paddingTop: 8,
    fontSize: 12,
  },
  castHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 20,
  },
  homepageButton: {
    fontSize: 17,
    fontWeight: '600',
    padding: 8,
  },
  homepageButtonMain: {
    alignItems: 'flex-start',
  },
  homepageButtonDiv: {
    marginLeft: 22,
    marginTop: globalPadding * 7,
    marginBottom: globalPadding * 3,
  },
  moviesMain: {
    marginBottom: 25 + globalPadding,
    marginLeft: 22,
  },
  moviesDiv: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 30,
  },
  moviesCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  posterImage: {
    width: deviceWidth / 4.5,
    height: deviceWidth / 3,
    marginBottom: 13,
  },
  rating: {
    marginLeft: 6,
  },
  ratingDiv: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tmdbLogo: {
    width: 25,
    height: 12,
  },
  moviesHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 20,
  },
  lightContainer: {
    backgroundColor: backgroundColorLight,
  },
  darkContainer: {
    backgroundColor: backgroundColorDark,
  },
  lightThemeText: {
    color: textColorLight,
  },
  darkThemeText: {
    color: textColorDark,
  },
  lightThemeBtnBackground: {
    backgroundColor: 'lightgrey',
  },
  darkThemeBtnBackground: {
    backgroundColor: '#4a4b4d',
  },
});

export default PersonDetails;

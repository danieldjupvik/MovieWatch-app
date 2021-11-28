import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
} from 'react-native';
import {
  detailsSeriesUrl,
  apiKey,
  basePosterUrl,
  baseBackdropUrl,
  baseProfileUrl,
} from '../settings/api';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Loader from '../components/Loader';
import * as WebBrowser from 'expo-web-browser';
import i18n from 'i18n-js';
import axios from 'axios';
import { useColorScheme } from 'react-native-appearance';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  backgroundColorDark,
  backgroundColorLight,
  textColorDark,
  textColorLight,
  primaryButton,
} from '../colors/colors';
import { borderRadius, boxShadow } from '../styles/globalStyles';
import ButtonStyles from '../styles/buttons';
import posterLoader from '../assets/poster-loader.jpg';
import noImage from '../assets/no-image.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import imdbLogo from '../assets/imdb-logo.png';
import tmdbLogo from '../assets/tmdb-logo-small.png';
import freshNegative from '../assets/freshNegative.png';
import freshPositive from '../assets/freshPositive.png';

export const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const RenderSeriesDetails = ({ navigation, id }) => {
  const [loader, setLoader] = useState(true);
  const [series, setSeries] = useState([]);
  const [videos, setVideos] = useState([]);
  const [appearance, setAppearance] = useState();
  const [movieExist, setMovieExist] = useState();
  const [sessionId, setSessionId] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [stateFinish, setStateFinish] = useState(true);
  const [digitalRelease, setDigitalRelease] = useState();
  const [releaseNote, setReleaseNote] = useState();
  const [omdb, setOmdb] = useState();
  const [rottenTomato, setRottenTomato] = useState();
  const [imdbVotes, setImdbVotes] = useState();
  const [lastEpisodeShow, setLastEpisodeShow] = useState(true);

  useEffect(() => {
    const getAppearance = async () => {
      try {
        const value = await AsyncStorage.getItem('appearance');
        if (value !== null) {
          setAppearance(value);
        } else {
          setAppearance('auto');
          console.log('there is no appearance set');
        }
      } catch (e) {
        alert('error reading home value');
      }
    };
    getAppearance();
  }, []);

  const defaultColor = useColorScheme();
  let colorScheme = appearance === 'auto' ? defaultColor : appearance;
  const scrollBarTheme = colorScheme === 'light' ? 'light' : 'dark';
  const themeTextStyle =
    colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText;
  const themeContainerStyle =
    colorScheme === 'light' ? styles.lightContainer : styles.darkContainer;
  const themeBoxStyle =
    colorScheme === 'light' ? styles.lightThemeBox : styles.darkThemeBox;

  useEffect(() => {
    let isCancelled = false;
    setStateFinish(false);
    const getSeries = async () => {
      try {
        const videos = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}/videos${apiKey}&language=en-US'
          }`
        );
        const sessionId = await AsyncStorage.getItem('sessionId');
        const response = await axios.get(
          `${
            detailsSeriesUrl +
            id +
            apiKey +
            '&append_to_response=translations,recommendations,similar,credits,external_ids'
          }`
        );
        setVideos(videos.data.results);
        getOmdbInfo(response.data.external_ids.imdb_id);
        setSeries(response.data);
        setSessionId(sessionId);
        // {
        //   sessionId ? getMovieState(sessionId) : null;
        // }
      } catch (e) {
        console.log(e);
      } finally {
      }
    };
    getSeries();
    return () => {
      isCancelled = true;
    };
  }, []);

  const getOmdbInfo = async (imdbId) => {
    try {
      const response = await axios.get(
        `https://www.omdbapi.com/?apikey=f2b37edc&i=${imdbId}`
      );
      setOmdb(response.data);
      setImdbVotes(JSON.parse(response.data.imdbVotes.replaceAll(',', '')));
      setRottenTomato(
        JSON.parse(
          response.data.Ratings.filter(
            (source) => source.Source === 'Rotten Tomatoes'
          )
            .map((type) => type.Value)[0]
            .replace('%', '')
        )
      );
      return response;
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  // const getMovieState = async (session) => {
  //   try {
  //     const response = await axios.get(
  //       `https://api.themoviedb.org/3/movie/${id}/account_states${apiKey}&session_id=${session}`
  //     );
  //     console.log(response.data.watchlist);
  //     setMovieExist(response.data.watchlist);
  //     return response;
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     setStateFinish(true);
  //   }
  // };

  // const watchListFunction = () => {
  //   if (sessionId) {
  //     setMovieExist(!movieExist);
  //     if (movieExist) {
  //       removeMovieToWatchlist();
  //       console.log('movie was removed');
  //     } else {
  //       setMovieToWatchlist();
  //       console.log('movie was added');
  //     }
  //   } else {
  //     setModalVisible(true);
  //   }
  // };

  // const setMovieToWatchlist = async () => {
  //   try {
  //     const response = await axios({
  //       method: 'POST',
  //       url: `https://api.themoviedb.org/3/account/${id}/watchlist${apiKey}&session_id=${sessionId}`,
  //       headers: {
  //         'Content-Type': 'application/json;charset=utf-8',
  //       },
  //       data: {
  //         media_type: 'movie',
  //         media_id: series.id,
  //         watchlist: true,
  //       },
  //     });
  //     return response;
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //   }
  //   return response;
  // };

  // const removeMovieToWatchlist = async () => {
  //   try {
  //     const response = await axios({
  //       method: 'POST',
  //       url: `https://api.themoviedb.org/3/account/${id}/watchlist${apiKey}&session_id=${sessionId}`,
  //       headers: {
  //         'Content-Type': 'application/json;charset=utf-8',
  //       },
  //       data: {
  //         media_type: 'movie',
  //         media_id: series.id,
  //         watchlist: false,
  //       },
  //     });
  //     return response;
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //   }
  //   return response;
  // };

  // premiere
  var d = new Date(series.first_air_date);

  var year = d.getFullYear();
  var month = monthNames[d.getMonth()];
  var day = d.getDate();
  var releaseDate = `${day}. ${month} ${year}`;

  // Next episode

  const nextEpisode = (date) => {
    var newDate = new Date(date);
    var nextYear = newDate.getFullYear();
    var nextMonth = monthNames[newDate.getMonth()];
    var nextDay = newDate.getDate();
    var nextReleaseDate = `${nextDay}. ${nextMonth} ${nextYear}`;
    return nextReleaseDate;
  };

  const nextAirCountdown = (date) => {
    var cleanDate = date.replaceAll('-', '/');
    var dates = `${cleanDate} 00:00 AM`;
    var end = new Date(dates);
    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var _day = _hour * 24;

    var now = new Date();
    var distance = end - now;

    var days = Math.floor(distance / _day);
    var hours = Math.floor((distance % _day) / _hour);
    var dayString = days > 1 ? i18n.t('days') : i18n.t('day');
    var hourString = hours > 1 ? i18n.t('hours') : i18n.t('hour');
    var timeUntilAir = `${days} ${dayString} ${hours} ${hourString}`;

    if (distance < 0) {
      return false;
    }

    return timeUntilAir;
  };

  const goToWebsite = () => {
    WebBrowser.openBrowserAsync(series.homepage);
  };

  const numFormatter = (num) => {
    if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed() + 'k';
    } else if (num > 1000000) {
      return (num / 1000000).toFixed(1) + 'm';
    } else if (num < 900) {
      return num;
    }
  };

  return (
    <SafeAreaView style={[styles.container, themeContainerStyle]}>
      <View style={modal.centeredView}>
        <Modal
          animationType='fade'
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View
            style={[
              modal.centeredView,
              modalVisible ? { backgroundColor: 'rgba(0,0,0,0.5)' } : '',
            ]}
          >
            <View style={[modal.modalView, themeBoxStyle]}>
              <Text style={[modal.modalText, themeTextStyle]}>
                {i18n.t('watchlistModalTex')}
              </Text>
              <TouchableOpacity
                style={[
                  ButtonStyles.smallButtonStyling,
                  { backgroundColor: primaryButton },
                ]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={modal.textStyle}>{i18n.t('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      {loader ? (
        <Loader loadingStyle={styles.Loader} />
      ) : (
        <View style={styles.scrollViewWrapper}>
          <ScrollView indicatorStyle={scrollBarTheme}>
            <View style={styles.main}>
              <ImageBackground
                source={{
                  uri: `${baseBackdropUrl + series.backdrop_path}`,
                }}
                style={styles.backdrop}
                defaultSource={posterLoader}
                ImageCacheEnum={'force-cache'}
              >
                <View style={styles.child} />
              </ImageBackground>
              <View style={[styles.imageDiv, boxShadow]}>
                <Image
                  source={{
                    uri: `${basePosterUrl + series.poster_path}`,
                  }}
                  defaultSource={posterLoader}
                  ImageCacheEnum={'force-cache'}
                  style={styles.posterImg}
                />
                {/* {!stateFinish && sessionId ? (
                  <Loader
                    loadingStyle={styles.watchListLoader}
                    color={'white'}
                    size={'small'}
                  />
                ) : (
                  <Pressable onPress={watchListFunction}>
                    <View style={styles.watchListDiv}>
                      <FontAwesome5
                        name={'bookmark'}
                        solid={movieExist}
                        style={{ color: 'red', fontSize: 25 }}
                      />
                      <Text style={styles.watchListText}>
                        {i18n.t('watchlistBtn')}
                      </Text>
                    </View>
                  </Pressable>
                )} */}
              </View>
              <Text style={[styles.title, themeTextStyle]} selectable>
                {series.original_name}
              </Text>
              <View style={styles.underTitleDiv}>
                <View style={styles.underTitleElem}>
                  <Text style={[styles.underTitle, themeTextStyle]}>
                    {year}
                  </Text>
                </View>
                <Text style={[styles.separators, themeTextStyle]}>•</Text>
                <View style={styles.underTitleElem}>
                  <Text style={[styles.underTitle, themeTextStyle]}>
                    {series.episode_run_time[0]} min
                  </Text>
                </View>
                <Text style={[styles.separators, themeTextStyle]}>•</Text>
                <View style={styles.underTitleElem}>
                  <Text style={[styles.underTitle, themeTextStyle]}>
                    {omdb?.Rated}
                  </Text>
                </View>
              </View>

              <View style={styles.underTitleDiv2}>
                <View style={styles.underTitleElem}>
                  <Text style={[styles.underTitle, themeTextStyle]}>
                    {series.number_of_seasons} {i18n.t('totalSeasons')}
                  </Text>
                </View>
                <Text style={[styles.separators, themeTextStyle]}>•</Text>
                <View style={styles.underTitleElem}>
                  <Text style={[styles.underTitle, themeTextStyle]}>
                    {series.number_of_episodes} {i18n.t('totalEpisodes')}
                  </Text>
                </View>
              </View>

              <Text style={[styles.rating, styles.runtime, themeTextStyle]}>
                <Text style={styles.category}>{i18n.t('releaseDate')}</Text>{' '}
                {releaseDate}
              </Text>

              <Text style={[styles.genre, themeTextStyle]}>
                <Text style={styles.category}>{i18n.t('status')}</Text>{' '}
                {series.status}
              </Text>

              {series.created_by[0] ? (
                <Text style={[styles.genre, themeTextStyle]}>
                  <Text style={styles.category}>{i18n.t('createdBy')}</Text>{' '}
                  {series.created_by[0].name}
                </Text>
              ) : null}
              <Text style={[styles.genre, themeTextStyle]}>
                <Text style={styles.category}>{i18n.t('genres')}</Text>{' '}
                {series.genres?.map((genre) => genre.name).join(', ')}
              </Text>

              <View style={[styles.rating, styles.ratingDiv]}>
                <View style={[styles.ratingWrapper]}>
                  <Image
                    source={tmdbLogo}
                    style={styles.tmdbLogo}
                    resizeMode='contain'
                  />
                  <View style={styles.ratingElem}>
                    <Text style={[themeTextStyle]}>
                      {Math.floor((series.vote_average * 100) / 10)}%{' '}
                    </Text>
                    <Text style={[styles.ratingCounter, themeTextStyle]}>
                      {numFormatter(series.vote_count)}
                    </Text>
                  </View>
                </View>
                {omdb.imdbRating !== 'N/A' ? (
                  <View style={[styles.ratingWrapper]}>
                    <Image
                      source={imdbLogo}
                      style={styles.imdbLogo}
                      resizeMode='contain'
                    />
                    <View style={styles.ratingElem}>
                      <Text style={[themeTextStyle]}>
                        {omdb?.imdbRating}/10
                      </Text>
                      <Text style={[styles.ratingCounter, themeTextStyle]}>
                        {numFormatter(imdbVotes)}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {rottenTomato ? (
                  <View style={[styles.ratingWrapper]}>
                    <Image
                      source={rottenTomato > 60 ? freshPositive : freshNegative}
                      style={styles.rottenLogo}
                      resizeMode='cover'
                    />
                    <View style={styles.ratingElem}>
                      <Text style={[themeTextStyle]}>{rottenTomato}% </Text>
                      <Text style={[styles.ratingCounter, themeTextStyle]}>
                        {rottenTomato > 60 ? 'Fresh' : 'Rotten'}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.overview, themeTextStyle]}>
                {series.overview}
              </Text>
            </View>
            {series.next_episode_to_air &&
            nextAirCountdown(series.next_episode_to_air.air_date) ? (
              <View style={styles.episodeMain}>
                <Text style={[styles.episodeHeading, themeTextStyle]}>
                  {i18n.t('nextEpisodeToAir')}
                </Text>
                <View style={[styles.infoDiv, themeBoxStyle, boxShadow]}>
                  <Text style={[styles.timeUntilAir, themeTextStyle]}>
                    {i18n.t('airsIn') +
                      ' ' +
                      nextAirCountdown(series.next_episode_to_air.air_date)}
                  </Text>
                  <View
                    style={{
                      borderBottomColor: 'grey',
                      borderBottomWidth: 1,
                      // opacity: 0.6,
                      marginBottom: 10,
                    }}
                  />
                  {
                    <Text style={[styles.episodeName, themeTextStyle]}>
                      {series.next_episode_to_air.episode_number} -{' '}
                      {series.next_episode_to_air.name}
                    </Text>
                  }
                  <Text style={[styles.releaseDate, themeTextStyle]}>
                    {nextEpisode(series.next_episode_to_air.air_date)}
                  </Text>

                  <Text
                    numberOfLines={3}
                    style={[styles.NextEpisodeOverview, themeTextStyle]}
                  >
                    {series.next_episode_to_air.overview}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {series.last_episode_to_air ? (
                  <View style={styles.episodeMain}>
                    <Text style={[styles.episodeHeading, themeTextStyle]}>
                      {i18n.t('lastEpisodeToAir')}
                    </Text>
                    <View style={[styles.infoDiv, themeBoxStyle]}>
                      <Text style={[styles.episodeName, themeTextStyle]}>
                        {series.last_episode_to_air.episode_number} -{' '}
                        {series.last_episode_to_air.name}
                      </Text>
                      <Text style={[styles.releaseDate, themeTextStyle]}>
                        {nextEpisode(series.last_episode_to_air.air_date)}
                      </Text>
                      <Text
                        numberOfLines={3}
                        style={[styles.NextEpisodeOverview, themeTextStyle]}
                      >
                        {series.last_episode_to_air.overview}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </>
            )}
            {series.seasons.length > 0 ? (
              <View style={styles.seasonMain}>
                <Text style={[styles.moviesHeading, themeTextStyle]}>
                  {i18n.t('seasons')}
                </Text>
                <ScrollView showsHorizontalScrollIndicator={false}>
                  <View style={styles.seasonDiv}>
                    {series.seasons.map((serie, idx) => {
                      if (serie.poster_path !== null) {
                        return (
                          <TouchableOpacity
                            style={styles.seasonCard}
                            key={idx}
                            onPress={() =>
                              navigation.push('SeriesSeason', {
                                id: series.id,
                                headerTitle:
                                  i18n.t('season') + ' ' + serie.season_number,
                                season: serie.season_number,
                              })
                            }
                          >
                            <View style={boxShadow}>
                              <Image
                                style={styles.seasonImage}
                                source={{
                                  uri: `${basePosterUrl + serie.poster_path}`,
                                }}
                                ImageCacheEnum={'force-cache'}
                              />
                            </View>
                            <Text style={[styles.textName, themeTextStyle]}>
                              {i18n.t('seasons')} {serie.season_number}
                            </Text>
                            <Text
                              numberOfLines={2}
                              style={[styles.textCharacter, themeTextStyle]}
                            >
                              {serie.episode_count} {i18n.t('episodes')}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : null}
            <View style={styles.trailerMain}>
              <Text style={[styles.trailerHeading, themeTextStyle]}>
                {i18n.t('extras')}
              </Text>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.trailerDiv}>
                  {videos
                    .filter(
                      (type) =>
                        type.type === 'Trailer' && type.site === 'YouTube'
                    )
                    .map((video, idx) => {
                      var maxLimit = 32;
                      return (
                        <View style={styles.videoDiv} key={idx}>
                          <View style={boxShadow}>
                            <WebView
                              allowsFullscreenVideo
                              useWebKit
                              allowsInlineMediaPlayback
                              mediaPlaybackRequiresUserAction
                              javaScriptEnabled
                              scrollEnabled={false}
                              style={styles.videoElem}
                              source={{
                                uri: `https://www.youtube.com/embed/${video.key}`,
                              }}
                            />
                          </View>
                          <Text style={[styles.videoText, themeTextStyle]}>
                            {video.name.length > maxLimit
                              ? video.name.substring(0, maxLimit - 3) + '...'
                              : video.name}
                          </Text>
                          <Text style={[styles.typeText, themeTextStyle]}>
                            {video.type}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              </ScrollView>
            </View>
            <View style={styles.castMain}>
              <Text style={[styles.castHeading, themeTextStyle]}>
                {i18n.t('cast')}
              </Text>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                <View style={styles.castDiv}>
                  {series.credits.cast.slice(0, 20).map((cast, idx) => {
                    const profilePicture = {
                      uri: `${baseProfileUrl + cast.profile_path}`,
                    };
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() =>
                          navigation.push('PersonDetails', {
                            id: cast.id,
                            creditId: cast.credit_id,
                            headerTitle: cast.name,
                          })
                        }
                      >
                        <View style={styles.castCard}>
                          <View style={boxShadow}>
                            <Image
                              style={styles.profileImage}
                              source={
                                cast.profile_path ? profilePicture : noImage
                              }
                              ImageCacheEnum={'force-cache'}
                            />
                          </View>
                          <Text style={[styles.textName, themeTextStyle]}>
                            {cast.name}
                          </Text>
                          <Text
                            numberOfLines={2}
                            style={[styles.textCharacter, themeTextStyle]}
                          >
                            {cast.character}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
            {series.recommendations.results.length > 0 ? (
              <View style={styles.moviesMain}>
                <Text style={[styles.moviesHeading, themeTextStyle]}>
                  {i18n.t('recommendations')}
                </Text>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={styles.moviesDiv}>
                    {series.recommendations.results
                      .slice(0, 50)
                      .map((series, idx) => {
                        if (series.poster_path !== null) {
                          return (
                            <TouchableOpacity
                              style={styles.moviesCard}
                              key={idx}
                              onPress={() =>
                                navigation.push('SeriesDetails', {
                                  id: series.id,
                                  headerTitle: series.original_name,
                                })
                              }
                            >
                              <View style={boxShadow}>
                                <Image
                                  style={styles.posterImage}
                                  source={{
                                    uri: `${
                                      basePosterUrl + series.poster_path
                                    }`,
                                  }}
                                  ImageCacheEnum={'force-cache'}
                                />
                              </View>
                              <View style={styles.ratingDivRec}>
                                <Image
                                  source={tmdbLogo}
                                  style={styles.tmdbLogoRec}
                                  resizeMode='contain'
                                />
                                <Text
                                  style={[styles.textRating, themeTextStyle]}
                                >
                                  {Math.floor((series.vote_average * 100) / 10)}
                                  %
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        }
                      })}
                  </View>
                </ScrollView>
              </View>
            ) : null}
            {series.similar.results.length > 0 ? (
              <View style={styles.moviesMain}>
                <Text style={[styles.moviesHeading, themeTextStyle]}>
                  {i18n.t('similar')}
                </Text>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={styles.moviesDiv}>
                    {series.similar.results.slice(0, 50).map((series, idx) => {
                      if (series.poster_path !== null) {
                        return (
                          <TouchableOpacity
                            style={styles.moviesCard}
                            key={idx}
                            onPress={() =>
                              navigation.push('SeriesDetails', {
                                id: series.id,
                                headerTitle: series.original_name,
                              })
                            }
                          >
                            <View style={boxShadow}>
                              <Image
                                style={styles.posterImage}
                                source={{
                                  uri: `${basePosterUrl + series.poster_path}`,
                                }}
                                ImageCacheEnum={'force-cache'}
                              />
                            </View>
                            <View style={styles.ratingDivRec}>
                              <Image
                                source={tmdbLogo}
                                style={styles.tmdbLogoRec}
                                resizeMode='contain'
                              />
                              <Text style={[styles.textRating, themeTextStyle]}>
                                {Math.floor((series.vote_average * 100) / 10)}%
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      }
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : null}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const globalFontsize = 17;
const globalPadding = 5;
const normalFontWeight = '300';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchListLoader: {
    marginTop: -48,
    marginRight: 65,
  },
  scrollViewWrapper: {
    marginBottom: 45,
  },
  main: {
    width: deviceWidth,
    justifyContent: 'center',
  },
  Loader: {
    marginBottom: deviceHeight / 2.2,
  },
  backdrop: {
    width: '100%',
    height: 250,
  },
  child: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  posterImg: {
    width: 120,
    height: 180,
    marginTop: -250 / 2,
    marginLeft: 20,
    borderRadius: borderRadius,
  },
  imageDiv: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  watchListDiv: {
    marginTop: -40,
    marginRight: 50,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchListText: {
    fontWeight: '600',
    fontSize: 19,
    color: 'white',
    marginLeft: 10,
  },
  title: {
    marginTop: 30,
    marginBottom: 12,
    marginLeft: 22,
    marginRight: 22,
    fontSize: 19,
    fontWeight: 'bold',
  },
  underTitleDiv: {
    marginLeft: 22,
    marginRight: 22,
    flex: 1,
    flexDirection: 'row',
  },
  underTitleDiv2: {
    marginLeft: 22,
    marginRight: 22,
    marginTop: 6,
    flex: 1,
    flexDirection: 'row',
  },
  underTitleElem: {},
  separators: {
    opacity: 0.6,
    marginRight: 7.5,
    marginLeft: 7.5,
  },
  underTitle: {
    opacity: 0.6,
    fontWeight: '400',
    fontSize: 14.5,
  },
  overview: {
    marginLeft: 22,
    marginRight: 22,
    fontSize: globalFontsize,
    fontWeight: normalFontWeight,
    marginTop: 20,
    lineHeight: 29,
  },
  episodeMain: {
    marginTop: 35 + globalPadding,
    marginLeft: 22,
    marginRight: 22,
  },
  episodeHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  episodeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  releaseDate: {
    marginTop: 10,
    opacity: 0.7,
    fontSize: 14,
  },
  infoDiv: {
    marginTop: 12,
    padding: 10,
    borderRadius: borderRadius,
  },
  NextEpisodeOverview: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '400',
    paddingBottom: 3,
  },
  timeUntilAir: {
    // marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 15,
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
  rating: {
    marginLeft: 22,
    marginRight: 22,
    fontSize: globalFontsize,
    fontWeight: normalFontWeight,
    marginTop: 20,
    marginBottom: globalPadding,
  },
  ratingDiv: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  ratingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingElem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 4,
  },
  ratingCounter: {
    opacity: 0.7,
  },
  imdbLogo: {
    width: 40,
    height: 18,
    marginRight: 7,
  },
  tmdbLogo: {
    width: 40,
    height: 17,
    marginRight: 7,
  },
  rottenLogo: {
    width: 25,
    height: 25,
    marginRight: 7,
  },
  tagline: {
    marginLeft: 22,
    opacity: 0.7,
    fontSize: 16,
  },
  category: {
    opacity: 0.7,
  },
  trailerMain: {
    marginTop: 35 + globalPadding,
    marginBottom: 25 + globalPadding,
    marginLeft: 22,
  },
  trailerHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 20,
  },
  trailerDiv: {
    flex: 1,
    flexDirection: 'row',
  },
  videoDiv: {
    textAlign: 'center',
  },
  videoText: {
    fontWeight: '600',
    fontSize: 13,
  },
  typeText: {
    paddingTop: 5,
    opacity: 0.7,
  },
  videoElem: {
    marginBottom: 10,
    width: deviceWidth / 1.9,
    height: deviceWidth / 3.4,
    marginRight: 30,
    borderRadius: borderRadius,
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
    width: deviceWidth / 4.5,
    textAlign: 'center',
  },
  profileImage: {
    width: deviceWidth / 4.5,
    height: deviceWidth / 4.5,
    marginBottom: 8,
    borderRadius: 50,
  },
  textName: {
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  textCharacter: {
    paddingTop: 5,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
  },
  castHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 20,
  },
  seasonCard: {
    alignItems: 'flex-start',
    marginRight: 18,
    marginBottom: 18,
  },
  seasonMain: {
    marginTop: 35 + globalPadding,
    marginLeft: 22,
  },
  seasonDiv: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginBottom: 20,
  },
  seasonImage: {
    width: deviceWidth / 3.9,
    height: deviceWidth / 2.4,
    marginBottom: 13,
    borderRadius: borderRadius,
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
    borderRadius: borderRadius,
  },
  textRating: {
    // paddingTop: 8,
    marginLeft: 6,
    fontSize: 12,
  },
  ratingDivRec: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tmdbLogoRec: {
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
  darkThemeBox: {
    backgroundColor: '#313337',
  },
  lightThemeBox: {
    backgroundColor: '#bfc5ce',
  },
});

export const modal = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: borderRadius,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'left',
    fontSize: 14,
    lineHeight: 22,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 25,
  },
});
export default RenderSeriesDetails;

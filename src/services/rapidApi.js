const MASTER_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600';

function getRandomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const apiCache = {};

const fetchAPI = async (url, host, method = 'GET', body = null) => {
  const cacheKey = url + (body ? JSON.stringify(body) : '');
  if (method === 'GET' && apiCache[cacheKey]) {
    return apiCache[cacheKey];
  }

  const options = {
    method,
    headers: {
      'x-rapidapi-key': MASTER_KEY,
      'x-rapidapi-host': host
    }
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.warn(`API call failed for ${host} with status ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (method === 'GET' && data) {
      apiCache[cacheKey] = data;
    }
    return data;
  } catch (error) {
    console.error(`Fetch error for ${host}:`, error);
    return null;
  }
};

const getMockData = (type) => {
  return [];
};

const getMockActors = () => {
  return [];
};

export const fetchMovies = async () => {
  const data = await fetchAPI('https://advanced-movie-search.p.rapidapi.com/discover/movie?with_genres=28', 'advanced-movie-search.p.rapidapi.com');
  const results = data?.results || [];
  if (results.length === 0) return [];
  return results.filter(item => item?.poster_path).slice(0, 8).map((item, idx) => ({
    id: item?.id?.toString() || `m_${idx}`,
    title: item?.title || item?.original_title || 'Popular Movie',
    price: getRandomPrice(10, 25),
    image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    type: 'Movie',
    category: 'Movie',
    description: item?.overview || 'A blockbuster hit playing now near you.'
  }));
};

export const fetchEvents = async () => {
  const data = await fetchAPI('https://real-time-events-search.p.rapidapi.com/search-events?query=Concerts', 'real-time-events-search.p.rapidapi.com');
  const results = data?.data || [];
  if (results.length === 0) return getMockData('Event');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.event_id || `e_${idx}`,
    title: item?.name || item?.title || 'Live Event',
    price: getRandomPrice(50, 150),
    image: item?.image_url || item?.thumbnail || FALLBACK_IMAGE,
    type: 'Event',
    category: 'Event',
    description: item?.description || 'Join the crowd for an unforgettable experience.'
  }));
};

export const fetchTravel = async () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const dateStr = nextWeek.toISOString().split('T')[0];
  const data = await fetchAPI(`https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights?originSkyId=JFK&destinationSkyId=LHR&date=${dateStr}`, 'sky-scrapper.p.rapidapi.com');
  const results = data?.data?.itineraries || [];
  if (results.length === 0) return getMockData('Travel');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.id || `t_${idx}`,
    title: item?.legs?.[0]?.carriers?.marketing?.[0]?.name ? `${item.legs[0].carriers.marketing[0].name} Flight` : 'International Flight',
    price: item?.price?.raw || getRandomPrice(300, 800),
    image: item?.legs?.[0]?.carriers?.marketing?.[0]?.logoUrl || FALLBACK_IMAGE,
    type: 'Travel',
    category: 'Travel',
    description: `Flight from ${item?.legs?.[0]?.origin?.name || 'JFK'} to ${item?.legs?.[0]?.destination?.name || 'LHR'}`
  }));
};

export const fetchStays = async () => {
  const arr = new Date();
  arr.setDate(arr.getDate() + 7);
  const dep = new Date();
  dep.setDate(dep.getDate() + 11);
  const arrStr = arr.toISOString().split('T')[0];
  const depStr = dep.toISOString().split('T')[0];
  const data = await fetchAPI(`https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=20088325&search_type=CITY&arrival_date=${arrStr}&departure_date=${depStr}`, 'booking-com15.p.rapidapi.com');
  const results = data?.data?.hotels || data?.result || [];
  if (results.length === 0) return getMockData('Stays');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.hotel_id?.toString() || item?.id?.toString() || `st_${idx}`,
    title: item?.hotel_name || item?.name || 'Luxury Stay',
    price: item?.price_breakdown?.gross_price || getRandomPrice(150, 450),
    image: item?.max_photo_url || item?.main_photo_url || FALLBACK_IMAGE,
    type: 'Stays',
    category: 'Stays',
    description: item?.address || 'Experience the ultimate relaxing getaway.'
  }));
};

export const fetchDining = async () => {
  const data = await fetchAPI('https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants?locationId=60763', 'tripadvisor16.p.rapidapi.com');
  const results = data?.data?.data || data?.data || [];
  if (results.length === 0) return getMockData('Dining');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.location_id?.toString() || `d_${idx}`,
    title: item?.name || 'Premium Dining',
    price: getRandomPrice(40, 120),
    image: item?.heroImgUrl || item?.image?.url || FALLBACK_IMAGE,
    type: 'Dining',
    category: 'Dining',
    description: item?.establishmentTypeAndCuisineTags?.join(', ') || 'An exquisite culinary journey.'
  }));
};

// 1. fetchTMDBMovies
export const fetchTMDBMovies = async () => {
  const data = await fetchAPI('https://tmdb-movies-and-tv-shows-api-by-apirobots.p.rapidapi.com/v1/tmdb/random', 'tmdb-movies-and-tv-shows-api-by-apirobots.p.rapidapi.com');
  const results = data ? [data] : []; 
  if (results.length === 0) return [];
  return results.filter(item => item?.poster_path).map((item, idx) => ({
    id: item?.id?.toString() || `tmdb_${idx}`,
    title: item?.title || item?.name || 'Random TMDB Movie',
    price: getRandomPrice(10, 20),
    image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    type: 'Movie',
    category: 'Movie',
    description: item?.overview || 'A random movie pick from TMDB.'
  }));
};

// 2. fetchIMDBCast
export const fetchIMDBCast = async (actorId = 'nm0000158') => {
  const data = await fetchAPI(`https://imdb236.p.rapidapi.com/api/imdb/cast/${actorId}/titles`, 'imdb236.p.rapidapi.com');
  const results = data?.titles || [];
  if (results.length === 0) return getMockActors(); 
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.id || `imdb_${idx}`,
    name: item?.title || 'Actor Title',
    image: item?.image?.url || FALLBACK_IMAGE,
  }));
};

// 3. fetchBookingComHotels
export const fetchBookingComHotels = async (lat = '40.7128', lng = '-74.0060') => {
  const data = await fetchAPI(`https://apidojo-booking-v1.p.rapidapi.com/properties/list-by-map?latitude=${lat}&longitude=${lng}`, 'apidojo-booking-v1.p.rapidapi.com');
  const results = data?.result || [];
  if (results.length === 0) return getMockData('Stays');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.hotel_id || `bh_${idx}`,
    title: item?.hotel_name || 'Booking Dojo Stay',
    price: item?.price_breakdown?.gross_price || getRandomPrice(150, 450),
    image: item?.max_photo_url || FALLBACK_IMAGE,
    type: 'Stays',
    category: 'Hotel',
    description: item?.address || 'Luxury stay via apidojo.'
  }));
};

// 4. fetchTastyRecipes
export const fetchTastyRecipes = async (query = 'popular') => {
  const data = await fetchAPI(`https://tasty.p.rapidapi.com/recipes/list?from=0&size=16&q=${encodeURIComponent(query)}`, 'tasty.p.rapidapi.com');
  let results = data?.results || [];

  if (results.length === 0) {
    // Fallback to TheMealDB since RapidAPI Tasty endpoint returns 403 (Not Subscribed)
    try {
      const q = query.toLowerCase();
      let searchKey = query.replace(/popular|food|recipes/gi, '').trim() || 'chicken';
      
      if (q.includes('indian')) searchKey = 'curry';
      else if (q.includes('italian')) searchKey = 'pasta';
      else if (q.includes('chinese')) searchKey = 'beef';
      else if (q.includes('mexican')) searchKey = 'chicken';
      else if (q.includes('japanese')) searchKey = 'sushi';
      else if (q.includes('thai')) searchKey = 'thai';
      else if (q.includes('desserts') || q.includes('dessert')) searchKey = 'cake';

      const fbResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchKey}`);
      const fbData = await fbResponse.json();
      if (fbData.meals) {
        results = fbData.meals.map(m => ({
          id: m.idMeal,
          name: m.strMeal,
          thumbnail_url: m.strMealThumb,
          description: m.strInstructions ? m.strInstructions.slice(0, 120) + '...' : `Authentic ${searchKey} recipe.`
        }));
      }
    } catch (e) {
      console.warn("MealDB fallback failed");
    }
  }

  if (results.length === 0) return getMockData('Dining');

  return results.slice(0, 16).map((item, idx) => ({
    id: item?.id || `tr_${idx}`,
    title: item?.name || 'Tasty Recipe',
    price: getRandomPrice(5, 15),
    image: item?.thumbnail_url || FALLBACK_IMAGE,
    type: 'Dining',
    category: 'Recipe',
    description: item?.description || 'Delicious recipe instructions.'
  }));
};

// 5. fetchSportScoreEvents
export const fetchSportScoreEvents = async () => {
  const data = await fetchAPI('https://sportscore1.p.rapidapi.com/events/search', 'sportscore1.p.rapidapi.com', 'POST', { query: 'football' });
  const results = data?.data || [];
  if (results.length === 0) return getMockData('Sports');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.id || `sse_${idx}`,
    title: item?.name || 'Sporting Event',
    price: getRandomPrice(50, 200),
    image: item?.home_team?.logo || item?.away_team?.logo || item?.league?.logo || `https://picsum.photos/seed/sport_${item?.id || idx}/600/900`,
    type: 'Sports',
    category: 'Event',
    description: item?.status || 'Live sports action.'
  }));
};

// 6. fetchStreamingAvailability
export const fetchStreamingAvailability = async (id = 'tt0111161', type = 'movie') => {
  const data = await fetchAPI(`https://streaming-availability.p.rapidapi.com/shows/${type}/${id}`, 'streaming-availability.p.rapidapi.com');
  const item = data;
  if (!item) return [];
  return [{
    id: item?.id || `sa_${id}`,
    title: item?.title || 'Streaming Show',
    price: getRandomPrice(5, 15),
    image: item?.posterURLs?.original || FALLBACK_IMAGE,
    type: 'Movie',
    category: 'Streaming',
    description: item?.overview || 'Available for streaming now.'
  }];
};

// 7. fetchSportPitches
export const fetchSportPitches = async (eventId = '983367') => {
  const data = await fetchAPI(`https://sportapi7.p.rapidapi.com/api/v1/event/${eventId}/atbat/983367/pitches`, 'sportapi7.p.rapidapi.com');
  const results = data?.pitches || [];
  if (results.length === 0) return getMockData('Sports');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.id || `sp_${idx}`,
    title: `Pitch ${item?.pitchNumber || idx}`,
    price: getRandomPrice(10, 50),
    image: FALLBACK_IMAGE,
    type: 'Sports',
    category: 'Highlight',
    description: item?.description || 'Exciting baseball pitch.'
  }));
};

// 8. fetchYoutubeTrailers
export const fetchYoutubeTrailers = async (query = 'Avengers Trailer') => {
  const data = await fetchAPI(`https://youtube138.p.rapidapi.com/search/?q=${encodeURIComponent(query)}&hl=en&gl=US`, 'youtube138.p.rapidapi.com', 'GET');
  const results = data?.contents || [];
  if (results.length === 0) return []; 
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.video?.videoId || `yt_${idx}`,
    title: item?.video?.title?.runs?.[0]?.text || 'Trailer Video',
    price: getRandomPrice(0, 10),
    image: item?.video?.thumbnails?.[0]?.url || FALLBACK_IMAGE,
    type: 'Movie',
    category: 'Trailer',
    description: item?.video?.descriptionSnippet?.runs?.[0]?.text || 'Watch the latest trailer.'
  }));
};

// 9. fetchCarRentals
export const fetchCarRentals = async (lat = '40.7128', lng = '-74.0060') => {
  const data = await fetchAPI(`https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals?latitude=${lat}&longitude=${lng}`, 'booking-com15.p.rapidapi.com');
  const results = data?.data?.results || [];
  if (results.length === 0) return getMockData('Travel');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.vehicle?.id || `cr_${idx}`,
    title: item?.vehicle?.make_model || 'Premium Car Rental',
    price: item?.price?.gross || getRandomPrice(50, 150),
    image: item?.vehicle?.image_url || FALLBACK_IMAGE,
    type: 'Travel',
    category: 'Rental',
    description: 'Rent a car for your next journey.'
  }));
};

// 10. fetchRealTimeSearch
export const fetchRealTimeSearch = async (query = 'Top places to visit') => {
  const data = await fetchAPI(`https://real-time-web-search.p.rapidapi.com/ai-mode?prompt=${encodeURIComponent(query)}`, 'real-time-web-search.p.rapidapi.com');
  const results = data?.results || [];
  if (results.length === 0) return getMockData('Search');
  return results.slice(0, 8).map((item, idx) => ({
    id: `rts_${idx}`,
    title: item?.title || 'Search Result',
    price: getRandomPrice(10, 50),
    image: FALLBACK_IMAGE,
    type: 'Travel',
    category: 'Search',
    description: item?.snippet || 'Real-time search results powered by AI.'
  }));
};

// 11. fetchAirbnbStays
export const fetchAirbnbStays = async (placeId = 'ChIJOwg_06VPwokRYv534QaPC8g') => {
  const data = await fetchAPI(`https://airbnb19.p.rapidapi.com/api/v2/searchPropertyByPlaceId?id=${placeId}`, 'airbnb19.p.rapidapi.com');
  const results = data?.data || [];
  if (results.length === 0) return getMockData('Stays');
  return results.slice(0, 8).map((item, idx) => ({
    id: item?.id || `ab_${idx}`,
    title: item?.name || 'Airbnb Property',
    price: item?.price?.rate || getRandomPrice(100, 300),
    image: item?.images?.[0] || FALLBACK_IMAGE,
    type: 'Stays',
    category: 'Airbnb',
    description: item?.publicAddress || 'Book your dream Airbnb.'
  }));
};

// 12. fetchChatGPT
export const fetchChatGPT = async (message = 'Plan a trip to Paris') => {
  const body = {
    messages: [{ role: 'user', content: message }]
  };
  const data = await fetchAPI('https://chatgpt-42.p.rapidapi.com/conversationgpt4-2', 'chatgpt-42.p.rapidapi.com', 'POST', body);
  if (!data) return [{ description: 'I am currently offline due to API limits.' }];
  return [{
    id: `gpt_${Date.now()}`,
    title: 'AI Itinerary',
    price: getRandomPrice(5, 20),
    image: FALLBACK_IMAGE,
    type: 'Travel',
    category: 'AI Planner',
    description: data?.result || data?.choices?.[0]?.message?.content || 'Your personal AI trip plan.'
  }];
};

// 13. fetchIMDBPopularActors
export const fetchIMDBPopularActors = async () => {
  const data = await fetchAPI('https://imdb236.p.rapidapi.com/api/imdb/popular-names', 'imdb236.p.rapidapi.com');
  const results = data?.names || data?.results || [];
  if (results.length === 0) return getMockActors();
  return results.slice(0, 10).map((item, idx) => ({
    id: item?.id || `actor_${idx}`,
    name: item?.primaryName || item?.name || 'IMDB Actor',
    image: item?.primaryImage?.url || item?.image?.url || FALLBACK_IMAGE,
  }));
};

// ============================================================================
// Compatibility mappings for current UI imports
// ============================================================================

export async function getTrendingMovies() { return fetchMovies(); }
export async function getNowPlayingMovies() { return fetchMovies(); }
export async function getUpcomingMovies() { return fetchTMDBMovies(); }
export async function searchMovies() { return fetchMovies(); }
export async function getMovieDetails(id) {
  if (!id) return null;
  const cleanId = id.toString().replace('m_', '').replace('tmdb_', '');
  
  let found = null;
  for (const key in apiCache) {
    const data = apiCache[key];
    const results = data?.results || data?.data || data?.pitches || data?.contents || [];
    
    // Sometimes it's an array directly
    const list = Array.isArray(results) ? results : Array.isArray(data) ? data : [data];
    
    found = list.find(m => 
      m?.id?.toString() === cleanId || 
      m?.location_id?.toString() === cleanId ||
      m?.event_id?.toString() === cleanId ||
      m?.hotel_id?.toString() === cleanId
    );
    if (found) break;
  }

  if (found) {
    return {
      id: id,
      title: found.title || found.name || found.original_title || 'Feature Presentation',
      overview: found.overview || found.description || 'Get ready for an amazing experience.',
      poster_path: found.poster_path || found.image_url,
      backdrop_path: found.backdrop_path,
      vote_average: found.vote_average || 8.0,
      runtime: 120,
      genres: [{name: 'Entertainment'}],
    };
  }

  // Fallback if not found in cache (e.g., hard refresh on movie detail page)
  return {
    id: id,
    title: "Feature Presentation",
    overview: "Get ready for an amazing cinematic experience. Select your seats below.",
    vote_average: 8.0,
    runtime: 120,
    genres: [{name: "Cinema"}]
  };
}
export async function getMovieCredits() { return { cast: [], crew: [] }; }

export async function getLiveEvents() { return fetchSportScoreEvents(); }
export async function getUpcomingEvents() { return fetchEvents(); }
export async function searchEvents() { return fetchEvents(); }
export async function getEventDetails() { return null; }

export async function getPopularActors() { return fetchIMDBPopularActors(); }

export async function searchHotels() { return fetchStays(); }
export async function searchYouTubeTrailer(q) { return fetchYoutubeTrailers(q); }
export async function searchRecipes(q) { return fetchTastyRecipes(q); }
export async function askConcierge(msg) { return fetchChatGPT(msg); }
export async function realTimeSearch(q) { return fetchRealTimeSearch(q); }

import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit';
import type { INewsItem } from '../models/models';

interface IInitialState {
  news: INewsItem[];
  hasMore: boolean;
  loading: boolean;
}

const initialState: IInitialState = {
  news: [],
  hasMore: true,
  loading: false,
};

const createSliceWithThunk = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const newsSlice = createSliceWithThunk({
  name: 'news',
  initialState,
  reducers: (creators) => ({
    fetchNews: creators.asyncThunk<INewsItem[], number>(
      async (skipValue, { rejectWithValue }) => {
        try {
          const baseUrl = import.meta.env.VITE_BASE_URL;
          const route = '/posts';
          const queryParams = `?limit=10&skip=${skipValue}`;

          const request = baseUrl + route + queryParams;
          const response = await fetch(request);

          if (!response.ok) {
            return rejectWithValue('Ошибка при получении данных от сервера...');
          }

          const data = await response.json();
          return data.posts;
        } catch (err) {
          return rejectWithValue(err);
        }
      },
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          const news = action.payload;

          if (!state.news.length) {
            state.news = news;
          } else {
            const existingIds = new Set(state.news.map((post) => post.id));

            const filteredPosts = news.filter(
              (newsItem) => !existingIds.has(newsItem.id)
            );

            state.news = [...state.news, ...filteredPosts];
          }

          if (news.length < 10) {
            state.hasMore = false;
          }
        },
        rejected: (state) => {
          state.news = [];
          state.hasMore = false;
        },
        settled: (state) => {
          state.loading = false;
        },
      }
    ),
  }),
});

export const { fetchNews } = newsSlice.actions;
export default newsSlice.reducer;

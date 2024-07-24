import { createSlice, configureStore } from '@reduxjs/toolkit';

const initialState = { holdings: {}, hot: {}, watch: {} };

const stocklistSlice = createSlice({
  name: 'stocklist',
  initialState,
  reducers: {
    setHoldings(state, action) {
      state.holdings = action.payload;
    },
    setHot(state, action) {
      state.hot = action.payload;
    },
    setWatch(state, action) {
      state.watch[action.payload.watchId] = action.payload.stockList;
    },
    setTickers(state, action) {
      state.tickers = action.payload;
    },
    setAccounts(state, action) {
      state.accounts = action.payload;
    }
  }
});

const store = configureStore({
  reducer: stocklistSlice.reducer
});

export const stocklistActions = stocklistSlice.actions;

export default store;

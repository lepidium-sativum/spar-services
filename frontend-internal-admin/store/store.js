import { configureStore } from "@reduxjs/toolkit";
import commonSlice from "./slices/commonSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authSlice from "./slices/authSlice";
const persistConfig = {
  key: "root",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice);
const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    commonReducer: commonSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);
export { store, persistor };

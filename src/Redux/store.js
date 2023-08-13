import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { walletReducer } from './reducers';

const rootReducer = combineReducers({
  wallet: walletReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
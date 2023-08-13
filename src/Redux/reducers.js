const initialState = {
    account: null,
  };
  
  export const walletReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'CONNECT_WALLET':
        return { ...state, account: action.payload };
      default:
        return state;
    }
  };
  
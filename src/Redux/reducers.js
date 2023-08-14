const initialState = {
  account: null,
  candidates: [], // Candidates bilgisini saklamak için yeni bir alan ekleyin
};

export const walletReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'CONNECT_WALLET':
      return { ...state, account: action.payload };
    case 'SET_CANDIDATES': // Candidates bilgisini güncellemek için yeni bir durum işlemi ekleyin
      return { ...state, candidates: action.payload };
    default:
      return state;
  }
};

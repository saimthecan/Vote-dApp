import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Provider } from 'react-redux';
import store from './Redux/store';

import Navbar from './components/Navbar';
import Vote from "./components/Vote";
import Home from "./components/Home"
import ResetVote from "./components/ResetVote";

function App() {
  return (
    <ChakraProvider theme={theme}>
       <ToastContainer />
      <Provider store={store}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/resetvote" element={<ResetVote />} />
          </Routes>
        </Router>
      </Provider>
    </ChakraProvider>
  );
}

export default App;

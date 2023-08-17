import React, { useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  Flex,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  useBreakpointValue,
} from "@chakra-ui/react";
import Web3 from "web3";
import contractAbi from "./contractAbi.json";
import { connect } from "react-redux";

export const Vote = (props) => {
  const { dispatch, candidates } = props;
  const [voteSuccess, setVoteSuccess] = React.useState(false);
  const [votingOver, setVotingOver] = React.useState(false);
  const [selfVote, setSelfVote] = React.useState(false);
  const [alreadyVoted, setAlreadyVoted] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState("");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isGoerli, setIsGoerli] = React.useState(false);

  const contractAddress = "0xf98d5e0e0cc00a3f01b580834c4d36d780f1df5d";

  const getCandidates = useCallback(async () => {
    if (isGoerli) {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      const candidatesArray = await contract.methods.getCandidates().call();
      dispatch({ type: "SET_CANDIDATES", payload: candidatesArray });
    }
  }, [dispatch, isGoerli]);

  const updateNetworkAndFetchCandidates = useCallback(async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const chainId = await web3.eth.getChainId();
      if (chainId.toString() === "5") {
        setIsGoerli(true);
        const contract = new web3.eth.Contract(contractAbi, contractAddress);
        const candidatesArray = await contract.methods.getCandidates().call();
        dispatch({ type: "SET_CANDIDATES", payload: candidatesArray });
      } else {
        setIsGoerli(false);
        dispatch({ type: "SET_CANDIDATES", payload: [] });
      }
    }
  }, [dispatch, contractAddress]);

  useEffect(() => {
    updateNetworkAndFetchCandidates(); // İlk yüklenme anında çalıştır
    if (window.ethereum) {
      window.ethereum.on("chainChanged", updateNetworkAndFetchCandidates);
      return () => {
        window.ethereum.removeListener(
          "chainChanged",
          updateNetworkAndFetchCandidates
        );
      };
    }
  }, [updateNetworkAndFetchCandidates]);

  useEffect(() => {
    getCandidates();
  }, [isGoerli, dispatch, getCandidates]); // added getCandidates to dependency array

  const wallets = candidates;

  useEffect(() => {
    if (props.wallet) {
      setWarningMessage(""); // Cüzdan bağlandığında uyarı mesajını temizleyin
    }
  }, [props.wallet]); // props.wallet değiştiğinde bu useEffect tetiklenir

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      contract.methods
        .voteFinished()
        .call()
        .then((result) => setVotingOver(result));
    }
  }, []); // Bağlam değiştiğinde bu useEffect tetiklenir

  const clearMessages = () => {
    setVoteSuccess(false);
    setSelfVote(false);
    setAlreadyVoted(false);
  };

  const voteForCandidate = async (wallet) => {
    if (!props.wallet) {
      // Redux'tan alınan cüzdan adresi
      setWarningMessage("Please connect your wallet");
      setTimeout(() => setWarningMessage(""), 3000);
      return; // Cüzdan bağlı değilse işlemi burada sonlandırın
    }

    setWarningMessage("");

    clearMessages();

    if (votingOver) {
      setWarningMessage("Sorry, voting is over");
      setTimeout(() => setWarningMessage(""), 3000); // Mesajı 3 saniye sonra temizler
      return;
    }

    if (
      wallet &&
      props.wallet &&
      wallet.toLowerCase() === props.wallet.toLowerCase()
    ) {
      setSelfVote(true);
      setTimeout(clearMessages, 3000); // Mesajı 3 saniye sonra temizler
      return;
    }

    if (wallet === props.wallet) {
      console.log("Attempting to vote for self!"); // Debugging line
      setSelfVote(true);
      setTimeout(() => setSelfVote(false), 3000);
      return;
    }

    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractAbi, contractAddress);

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const refund = await contract.methods.refunds(accounts[0]).call();
        if (refund > 0) {
          setAlreadyVoted(true);
          setTimeout(clearMessages, 3000); // Clears the message after 3 seconds
          return;
        }

        // Fetch the vote fee from the contract
        const voteFee = await contract.methods.voteFee().call();

        await contract.methods.vote(wallet).send({
          from: accounts[0],
          value: voteFee, // Use the fetched vote fee as the value
        });
        console.log(`Oy verildi: ${wallet}`);
        setVoteSuccess(true);
        setTimeout(clearMessages, 3000);
      } catch (error) {
        console.error("Oylama başarısız:", error);
      }
    }
  };

  return (
    <Box
      bg={`linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('/bg.jpg')`}
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
      minHeight="100vh"
    >
      <Container paddingTop="4.5rem">
        <Box
          padding="4"
          borderColor="gray.500"
          textAlign="center"
          bg="gray.200"
          boxShadow="xl"
          borderRadius="18px"
        >
          <Heading as="h1" size="lg" mb="4">
            Vote dApp
          </Heading>
          <VStack spacing="4">
            {isGoerli ? (
              wallets.map((wallet, index) => (
                <Flex
                  key={index}
                  justifyContent="space-between"
                  px="2"
                  border={[0, "1px solid"]}
                  borderColor="gray.600"
                  borderRadius="md"
                  padding="2"
                  alignItems="center"
                  flexWrap={["wrap", "nowrap"]}
                  ml={[2.5, 0]}
                >
                  <Box
                    flex="1"
                    overflowX={["scroll", "visible"]}
                    whiteSpace={["nowrap", "normal"]}
                  >
                    <Text fontSize={["sm", "md"]} textAlign="left">
                      {wallet}
                    </Text>
                  </Box>
                  <Button
                    mr={["0.5rem", 0]}
                    ml={["0.5rem", "1rem"]}
                    colorScheme="blue"
                    onClick={() => voteForCandidate(wallet)}
                    size={isMobile ? "sm" : "md"}
                  >
                    Vote
                  </Button>
                </Flex>
              ))
            ) : (
              <Alert
                status="warning"
                borderRadius="md"
                mt={4}
                borderColor="yellow.200"
                borderWidth="1px"
              >
                <AlertDescription color="black">
                  Please connect to the Goerli test network
                </AlertDescription>
              </Alert>
            )}
          </VStack>
          {warningMessage && (
            <Alert
              status="warning"
              borderRadius="md"
              mt={4}
              border="1px solid"
              borderColor="red.200"
            >
              <AlertIcon />
              <AlertDescription color="black">
                {warningMessage}
              </AlertDescription>
            </Alert>
          )}
          {voteSuccess && (
            <Alert
              status="success"
              borderRadius="md"
              mt={4}
              borderColor="green.200"
              borderWidth="1px"
            >
              <AlertDescription color="black">
                Congratulations! You voted successfully.
              </AlertDescription>
            </Alert>
          )}
          {selfVote && (
            <Alert
              status="error"
              borderRadius="md"
              mt={4}
              borderColor="red.200"
              borderWidth="1px"
            >
              <AlertDescription color="black">
                Unfortunately, you cannot vote for yourself.
              </AlertDescription>
            </Alert>
          )}
          {alreadyVoted && (
            <Alert
              status="warning"
              borderRadius="md"
              mt={4}
              borderColor="yellow.200"
              borderWidth="1px"
            >
              <AlertDescription color="black">
                You have already voted!
              </AlertDescription>
            </Alert>
          )}
        </Box>
      </Container>
    </Box>
  );
};
const mapStateToProps = (state) => ({
  wallet: state.wallet.account,
  candidates: state.wallet.candidates, // Bu bileşende kullanmak üzere candidates bilgisini de alın
});

export default connect(mapStateToProps)(Vote);

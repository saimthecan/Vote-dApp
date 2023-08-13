import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  VStack,
  InputGroup,
  InputRightAddon,
  Heading,
} from "@chakra-ui/react";
import Web3 from "web3";
import contractAbi from "./contractAbi.json";
import { connect } from "react-redux";
import { useCallback } from "react";

export const ResetVote = (props) => {
  const [isOwner, setIsOwner] = useState(false);
  const [newStartAmt, setNewStartAmt] = useState("");
  const [newMaxVotes, setNewMaxVotes] = useState("");
  const [candidates, setCandidates] = useState([""]);
  const [warningMessage, setWarningMessage] = React.useState("");
  const [votingOver, setVotingOver] = React.useState(false);
  const contractAddress = "0xc10bcb6d2948963257fff713f64e7de8bd38a191";
  const web3 = new Web3(window.ethereum);
  const isValidAddress = useCallback(
    (address) => web3.utils.isAddress(address),
    [web3.utils]
  ); // useCallback ile fonksiyonu tanımlayın

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

  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractAbi, contractAddress);
      contract.methods
        .getOwner()
        .call()
        .then((owner) => {
          const ownerLower = owner.toLowerCase();
          const walletLower = props.wallet ? props.wallet.toLowerCase() : "";
          setIsOwner(walletLower === ownerLower);
          console.log("owner", ownerLower);
        });
    }
  }, [props.wallet]);

  useEffect(() => {
    const invalidAddressIndexes = candidates.reduce(
      (indexes, candidate, index) => {
        if (candidate.trim() !== "" && !isValidAddress(candidate)) {
          indexes.push(index + 1); // 1 tabanlı index
        }
        return indexes;
      },
      []
    );

    if (invalidAddressIndexes.length > 0) {
      // Geçersiz adresler bulundu, hata mesajı göster
      setWarningMessage(
        `The address at entries : ${invalidAddressIndexes.join(
          ", "
        )} has an unidentified ethereum address`
      );
    } else {
      setWarningMessage("");
    }
  }, [candidates, isValidAddress]);

  const handleResetVote = async () => {
    if (!props.wallet) {
      setWarningMessage("Please connect your wallet");
      setTimeout(() => setWarningMessage(""), 3000);
      return;
    }

    if (!votingOver) {
      setWarningMessage("Sorry, voting is not over yet");
      setTimeout(() => setWarningMessage(""), 3000);
      return;
    }

    if (
      newStartAmt === "" ||
      newMaxVotes === "" ||
      candidates.some((candidate) => candidate === "")
    ) {
      setWarningMessage("Please enter all values");
      setTimeout(() => setWarningMessage(""), 3000);
      return;
    }

    if (!isOwner) {
      setWarningMessage("Sorry, only the contract holder can do this");
      setTimeout(() => setWarningMessage(""), 3000);
      return;
    }

    // Adreslerin geçerli olup olmadığını kontrol edin
    if (candidates.some((candidate) => !isValidAddress(candidate))) {
      setWarningMessage(
        "Please enter the correct Ethereum address and try again"
      );
      setTimeout(() => setWarningMessage(""), 3000);
      return;
    }

    const newStartAmtInWei = web3.utils.toWei(newStartAmt.toString(), "ether");

    if (isNaN(newMaxVotes)) {
      setWarningMessage("New Max Votes must be a valid number");
      setTimeout(() => setWarningMessage(""), 3000);
      return;
    }

    const contract = new web3.eth.Contract(contractAbi, contractAddress);

    console.log("gwei", typeof newStartAmt);
    console.log("candidates", typeof candidates);
    console.log("votes", typeof newMaxVotes);

    // Metamask kullanıcıya işlemi onaylatma
    contract.methods
      .resetVote(newStartAmtInWei, newMaxVotes, candidates)
      .send({ from: props.wallet, value: newStartAmtInWei })
      .once("confirmation", () => {
        console.log("Vote has been reset successfully.");
      })
      .catch((error) => {
        if (error.message.includes("User denied transaction signature")) {
          // Kullanıcının işlemi reddettiği durum için genel hata kodu
          setWarningMessage("You canceled the transaction");
        } else {
          console.error("An unexpected error occurred:", error);
        }
        setTimeout(() => setWarningMessage(""), 3000);
      });
  };

  const updateCandidate = (index, value) => {
    const newCandidates = [...candidates];
    newCandidates[index] = value;
    setCandidates(newCandidates);
  };

  const addCandidateInput = () => {
    setCandidates([...candidates, ""]);
  };

  const removeLastCandidateInput = () => {
    if (candidates.length > 1) {
      const newCandidates = candidates.slice(0, -1);
      setCandidates(newCandidates);
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
            Reset Vote
          </Heading>
          <Input
            onInput={(e) => {
              let value = e.target.value;
              // Regex kullanarak sadece tam sayı veya ondalıklı sayıları kabul et
              if (!value.match(/^\d*\.?\d*$/) || value === ".") {
                e.target.value = newStartAmt; // Geçersiz bir değer girilirse, önceki değeri kullanın
                return; // Geçersiz ise, işleme devam etme
              }
              setNewStartAmt(value);
            }}
            type="text" // tipi "text" olarak değiştirin
            placeholder="New Start Amount (in Ether)"
            value={newStartAmt}
          />

          <Input
            type="text" // Tipi "text" olarak değiştirin
            pattern="\d*" // Yalnızca tam sayılar kabul edilir
            mt="4"
            placeholder="New Max Votes"
            value={newMaxVotes}
            onChange={(e) => {
              const value = e.target.value;
              // Yalnızca tam sayılar kabul edilir, ya da boş bir dize
              if (value.match(/^\d*$/) || value === "") {
                setNewMaxVotes(value ? Number(value) : ""); // Eğer değer boş ise, boş dize atayın
              }
            }}
          />

          <VStack spacing={4} mt="4">
            {candidates.map((candidate, index) => (
              <InputGroup key={index}>
                <Input
                  placeholder="Candidate Address"
                  value={candidate}
                  onChange={(e) => updateCandidate(index, e.target.value)}
                  borderColor="gray.500" // Add this line to explicitly set the border color
                  borderWidth="1px" // Add this line to set the border width
                />
                {index === candidates.length - 1 && (
                  <InputRightAddon>
                    <Button size="sm" onClick={addCandidateInput}>
                      +
                    </Button>
                    <Button
                      size="sm"
                      onClick={removeLastCandidateInput}
                      colorScheme="red"
                      isDisabled={candidates.length === 1}
                    >
                      -
                    </Button>
                  </InputRightAddon>
                )}
              </InputGroup>
            ))}
          </VStack>

          <Button mt="4" colorScheme="blue" onClick={handleResetVote}>
            Reset Vote
          </Button>
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
        </Box>
      </Container>
    </Box>
  );
};

// Durumu bu bileşenle bağlayın
const mapStateToProps = (state) => ({
  wallet: state.wallet.account, // Burada cüzdanın depolandığı yeri belirtin
});

export default connect(mapStateToProps)(ResetVote);

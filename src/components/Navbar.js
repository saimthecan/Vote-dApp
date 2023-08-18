
import React, { useEffect } from "react";
import { FaUser } from "react-icons/fa"; // User icon'unu içe aktarma
import {
  Flex,
  Box,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Image,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ChevronDownIcon } from '@chakra-ui/icons';
import { toast } from "react-toastify";
import { Link as RouterLink } from "react-router-dom";
import { connect } from "react-redux";
import { connectWallet as connectWalletAction } from "../Redux/actions";
import "../App.css";
import Web3 from "web3";
import contractAbi from "./contractAbi.json";

export const Navbar = (props) => {
  const { connectWalletAction, wallet } = props;
  const [isConnected, setIsConnected] = React.useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const web3 = new Web3(window.ethereum);
  const contractAddress = "0xc31a47dd10c2d6b5700941d5f145ef0adc27dbd6";
  const contract = new web3.eth.Contract(contractAbi, contractAddress);

  //CLAIM FUNCTIONS
  const handleClaim = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",

      });
      const isVotingOver = await contract.methods.voteFinished().call();

      if (!isVotingOver) {
        toast.error("Voting is not over yet.", {
          position: "top-right",
        });
        return;
      }

      let candidatesFromContract = await contract.methods.getCandidates().call(); // Sözleşmeden adayları alın
    let winnerAddress = "";
    let maxVotes = 0;
    for (const candidate of candidatesFromContract) {
      const candidateVotes = await contract.methods.votes(candidate).call();
      if (candidateVotes >= maxVotes) {
        maxVotes = candidateVotes;
        winnerAddress = candidate;
      }
      }

      // Kullanıcının bu adres olup olmadığını kontrol edin
       if (props.wallet.toLowerCase() !== winnerAddress.toLowerCase()) {
      toast.error("I'm sorry you didn't win the vote, you can't claim.", {
        position: "top-right",
      });
      return;
    }

      await contract.methods.claim().send({ from: accounts[0] });
      toast.success("Claim successful!", {
        position: "top-right",
      });
    } catch (error) {
      console.error("Hata:", error);
      alert("An error occurred while claiming.");
    }
  };

  //REFUND FUNCTION
  const handleRefund = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const isVotingOver = await contract.methods.voteFinished().call();
      const userVotes = await contract.methods.getUserVotes(accounts[0]).call();
      const hasRefunded = await contract.methods
        .hasRefunded(accounts[0])
        .call();
      const isWinner =
        (await contract.methods.votes(accounts[0]).call()) >=
        (await contract.methods.maxVotes().call());

      if (!isVotingOver) {
        toast.error("Voting is not over yet.", {
          position: "top-right",
        });
      } else if (Number(userVotes) === 0) {
        toast.error(
          "You did not participate in the voting, you cannot refund.",
          {
            position: "top-right",
          }
        );
      } else if (isWinner) {
        toast.error("Winner cannot refund.", {
          position: "top-right",
        });
      } else if (hasRefunded) {
        toast.error("You have already refunded.", {
          position: "top-right",
        });
      } else {
        await contract.methods.refund().send({ from: accounts[0] });
        toast.success("Refund successful!", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Refund işlemi başarısız", error);
    }
  };

  //CONNECT WALLET FUNCTION
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = accounts[0];
        await props.connectWalletAction(address);
        setIsConnected(true);
        localStorage.setItem("walletAddress", address);
      } catch (error) {
        console.error("Kullanıcı reddetti:", error);
      }
    } else {
      console.log("Metamask yüklenmedi. Lütfen Metamask yükleyin.");
    }
  };

  //DISCONNECT WALLET FUNCTION
  const disconnectWallet = () => {
    localStorage.removeItem("walletAddress");
    connectWalletAction(null); // Redux'daki cüzdan adresini null olarak ayarla
    setIsConnected(false); // Bağlantının kesildiğini belirtmek için durumu güncelleyin
  };

  //CONNECT BUTTON FUNCTION
  const handleConnectClick = () => {
    if (wallet) {
      // Cüzdan zaten bağlıysa, kullanıcıya bağlantısını kesip kesmek istemediğini sorun
      if (window.confirm("Cüzdanınızı bağlantısını kesmek istiyor musunuz?")) {
        disconnectWallet();
      }
    } else {
      // Cüzdan bağlı değilse, bağlantı işlemini başlat
      connectWallet();
    }
  };

  useEffect(() => {
    if (isConnected) {
      console.log("Wallet address after action:", wallet);
    }
  }, [isConnected, wallet]); // `wallet` değişkeni bağımlılık olarak eklenir

  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress"); // Adresi yerel depolamadan al
    if (savedAddress) {
      connectWalletAction(savedAddress); // Adresi Redux'a aktar
    }
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        connectWalletAction(accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      // Bu, useEffect'in temizleme işlevi olmalıdır
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, [connectWalletAction]);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      bg="teal.500"
      color="white"
      w="100%"
    >
      <Flex align="center">
        <Box>
         <Link as={RouterLink} to="/">
            <Image
              src="/logo.png" // Public klasörünüzün içindeki yolu
              alt="LOGO"
              width="50px"
              height="50px"
            />
          </Link></Box>
          <Box ml={isMobile ? 2 : 10}>
          <Link as={RouterLink} to="/" mr={isMobile ? 2.5 : 5}>
            Home
          </Link>
          <Link as={RouterLink} to="/vote" mr={isMobile ? 2.5 : 5}>
            Vote
          </Link>
          <Link as={RouterLink} to="/resetvote">
            Reset Vote
          </Link>
        </Box>
      </Flex>
      <Box>
        {wallet ? (
          <>
            <Box display={isMobile ? "none" : "block"}>
              {/* PC görünümünde gösterilen düğmeler */}
              <Button
                variant="outline"
                colorScheme="whiteAlpha"
                color="white"
                onClick={handleClaim}
                mr={3}
              >
                Claim
              </Button>
              <Button
                variant="outline"
                colorScheme="whiteAlpha"
                color="white"
                onClick={handleRefund}
                mr={3}
              >
                Refund
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  colorScheme="teal"
                  bg="teal.700"
                  variant="solid"
                  _hover={{ bg: "teal.700" }}
                >
                  {wallet.substring(0, 8) + "..."}
                </MenuButton>
                <MenuList bg="teal.500" border="none">
                  <MenuItem
                    className="custom-menu-item"
                    onClick={disconnectWallet}
                    color="white"
                    h="auto"
                    p={2}
                    m={0}
                  >
                    Disconnect
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
            <Box display={isMobile ? "block" : "none"}>
              {/* Mobil görünümde gösterilen kullanıcı simgesi */}
              <Menu>
                <MenuButton as={IconButton} icon={<FaUser />} />
                <MenuList bg="teal.500" border="none">
                  <MenuItem bg="teal" onClick={handleClaim} color="white">
                    Claim
                  </MenuItem>
                  <MenuItem bg="teal.500" onClick={handleRefund} color="white">
                    Refund
                  </MenuItem>
                  <MenuItem bg="teal.400" onClick={disconnectWallet} color="white">
                    Disconnect
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </>
        ) : (
          <Button
          colorScheme="teal"
          bg="teal.700"
          variant="solid"
          onClick={handleConnectClick}
          size={isMobile ? "sm" : "md"} // Mobil görünümde buton boyutunu "sm" olarak ayarla
        >
          Connect
        </Button>
        )}
      </Box>
    </Flex>
  );
};

const mapStateToProps = (state) => ({
  wallet: state.wallet.account,
});

export default connect(mapStateToProps, { connectWalletAction })(Navbar);

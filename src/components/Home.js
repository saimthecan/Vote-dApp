import React, { useState } from "react";
import { Box, Text, Flex, Collapse, Button, Icon } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";

export const Home = () => {
  const [showCandidates, setShowCandidates] = useState(false);
  const [showVote, setShowVote] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showResetVote, setShowResetVote] = useState(false);
  const [showWhydApp, setShowWhydApp] = useState(false);

  const DescriptionText = (props) => (
    <Text
      style={{ textIndent: "-20px", paddingLeft: "3rem", paddingTop: "1rem" }}
    >
      • {props.children}
    </Text>
  );

  return (
    <Box
      w="100%"
      minH="100vh"
      p={5}
      bg={`linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('/bg.jpg')`}
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
    >
      <Box w="100%" p={5}>
        <Box bg="gray.300" p={5} textAlign="center">
          <Text fontSize="xl" fontWeight="bold">
            Welcome to Our Voting Platform!
          </Text>
        </Box>

        <Flex flexWrap="wrap" justifyContent="space-between" direction="column">
          <Box bg="gray.200" p={5} w="100%" borderWidth={1}>
            <Button variant="link" onClick={() => setShowWhydApp(!showWhydApp)}>
              <Icon
                as={showWhydApp ? ChevronDownIcon : ChevronRightIcon}
                mr={2}
              />
              <Text fontSize="lg" fontWeight="semibold">
                Why should I use Vote dApp?
              </Text>
            </Button>
            <Collapse in={showWhydApp} mt={3}>
              <DescriptionText>
                Votes are protected by the decentralization of the blockchain,
                cannot be changed, and cannot be interfered with from outside.
              </DescriptionText>
            </Collapse>
          </Box>
          <Box bg="gray.200" p={5} w="100%" borderWidth={1}>
            <Button
              variant="link"
              onClick={() => setShowCandidates(!showCandidates)}
            >
              <Icon
                as={showCandidates ? ChevronDownIcon : ChevronRightIcon}
                mr={2}
              />
              <Text fontSize="lg" fontWeight="semibold">
                Conditions
              </Text>
            </Button>
            <Collapse in={showCandidates} mt={3}>
              <DescriptionText>
                The person who reaches the number of votes determined by the
                contract owner is eligible to win the prize.
              </DescriptionText>
              <DescriptionText>
                The contract owner determines the reward amount and it is in
                ether.
              </DescriptionText>
            </Collapse>
          </Box>

          <Box bg="gray.200" p={5} w="100%" borderWidth={1}>
            <Button variant="link" onClick={() => setShowVote(!showVote)}>
              <Icon as={showVote ? ChevronDownIcon : ChevronRightIcon} mr={2} />
              <Text fontSize="lg" fontWeight="semibold">
                How to Vote
              </Text>
            </Button>
            <Collapse in={showVote} mt={3}>
              <DescriptionText>
                You can vote by clicking on the vote button next to the
                candidates you want.
              </DescriptionText>
              <DescriptionText>
                The voting fee is 1/10th of the prize. (a voting fee has been
                added to prevent voting by bots)
              </DescriptionText>
              <DescriptionText>You cannot vote more than once.</DescriptionText>
              <DescriptionText>
                If you are a candidate, you cannot vote for yourself.
              </DescriptionText>
            </Collapse>
          </Box>

          <Box bg="gray.200" p={5} w="100%" borderWidth={1}>
            <Button variant="link" onClick={() => setShowRefund(!showRefund)}>
              <Icon
                as={showRefund ? ChevronDownIcon : ChevronRightIcon}
                mr={2}
              />
              <Text fontSize="lg" fontWeight="semibold">
                Refund Policy
              </Text>
            </Button>
            <Collapse in={showRefund} mt={3}>
              <DescriptionText>
                After voting is over, you can get your voting fee back by
                clicking the Refund button.
              </DescriptionText>
              <DescriptionText>
                You can only refund if you participated in the vote.
              </DescriptionText>
              <DescriptionText>
                If you do not refund before the reset vote, you will lose your
                right to refund.
              </DescriptionText>
            </Collapse>
          </Box>

          <Box bg="gray.200" p={5} w="100%" borderWidth={1}>
            <Button variant="link" onClick={() => setShowClaim(!showClaim)}>
              <Icon
                as={showClaim ? ChevronDownIcon : ChevronRightIcon}
                mr={2}
              />
              <Text fontSize="lg" fontWeight="semibold">
                How do I get the prize
              </Text>
            </Button>
            <Collapse in={showClaim} mt={3}>
              <DescriptionText>
                You can claim the reward by clicking the Claim button.
              </DescriptionText>
            </Collapse>
          </Box>

          <Box bg="gray.200" p={5} w="100%" borderWidth={1}>
            <Button
              variant="link"
              onClick={() => setShowResetVote(!showResetVote)}
            >
              <Icon
                as={showResetVote ? ChevronDownIcon : ChevronRightIcon}
                mr={2}
              />
              <Text fontSize="lg" fontWeight="semibold">
                What is a Reset Vote
              </Text>
            </Button>
            <Collapse in={showResetVote} mt={3}>
              <DescriptionText>
                Reset Vote is used to restart voting after voting has ended.
              </DescriptionText>
              <DescriptionText>
                Only the contract owner can perform Reset Vote.
              </DescriptionText>
            </Collapse>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default Home;

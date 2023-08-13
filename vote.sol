// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract Vote {
    address[] private candidates;
    mapping(address => bool) public isCandidate;
    mapping(address => bool) public hasRefunded;
    mapping(address => uint256) public userVotes; // Kullanıcıların oylarını takip etmek için
    uint256 public voteFee;
    uint256 public startAmt;
    uint256 public maxVotes;
    bool public voteFinished;
    address private owner;

    mapping(address => uint256) public votes;
    mapping(address => uint256) public refunds;

    constructor(uint256 _startAmt, uint256 _maxVotes, address[] memory _candidates) payable {
        owner = msg.sender;
        require(_startAmt == msg.value, "should equal to start amount");
        require(_startAmt > 10, "should bigger than 10");

        candidates = _candidates;

        for (uint i = 0; i < _candidates.length; i++) {
            isCandidate[_candidates[i]] = true;
        }

        startAmt = _startAmt;
        voteFee = _startAmt / 10;
        maxVotes = _maxVotes;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this");
        _;
    }

    modifier onlyFinished() {
        require(voteFinished, "not finished");
        _;
    }

    modifier onlyNotFinished() {
        require(!voteFinished, "finished");
        _;
    }

    modifier isValidCandidate(address _candidate) {
        require(isCandidate[_candidate], "Not a valid candidate");
        _;
    }

    function vote(address _who) external payable onlyNotFinished isValidCandidate(_who) {
        require(refunds[msg.sender] == 0, "Already voted");
        require(msg.value == voteFee, "You must pay exactly the vote fee");
        require(votes[_who] < maxVotes, "Max votes reached for this candidate");
        require(msg.sender != _who, "You cannot vote for yourself");

        votes[_who] += 1;
        refunds[msg.sender] += msg.value;
        userVotes[msg.sender] += 1;

        if (votes[_who] == maxVotes) {
            voteFinished = true;
        }
    }

    function claim() external onlyFinished {
        require(votes[msg.sender] >= maxVotes, "Not the winner");
        _transferFunds(msg.sender, startAmt);
        startAmt = 0;
    }

     function refund() external onlyFinished {
    require(userVotes[msg.sender] > 0, "You did not participate in the voting, you cannot refund.");
    require(votes[msg.sender] < maxVotes, "Winner cannot refund");
    require(!hasRefunded[msg.sender], "Already refunded");
    _transferFunds(msg.sender, refunds[msg.sender]);
    refunds[msg.sender] = 0;
    hasRefunded[msg.sender] = true;
}


    function getUserVotes(address user) public view returns (uint256) {
    return userVotes[user];
}


   function resetVote(uint256 _newStartAmt ,uint256 _newMaxVotes, address[] memory _newCandidates) external payable onlyOwner {
    require(voteFinished, "Vote must be finished before resetting");

    // Adayları ve oy sayılarını sıfırla
    for (uint i = 0; i < candidates.length; i++) {
        isCandidate[candidates[i]] = false;
        votes[candidates[i]] = 0;
    }

    // Geri ödemeleri sıfırla
    for (uint i = 0; i < candidates.length; i++) {
        refunds[candidates[i]] = 0;
    }

      // Geri ödemeleri ve iade durumlarını sıfırla
    for (uint i = 0; i < candidates.length; i++) {
        refunds[candidates[i]] = 0;
        hasRefunded[candidates[i]] = false; // İade durumunu sıfırla
    }

    startAmt = _newStartAmt;
    voteFee = _newStartAmt / 10;
    candidates = _newCandidates;
    maxVotes = _newMaxVotes;
    voteFinished = false;

    // Yeni adayları ayarla
    for (uint i = 0; i < _newCandidates.length; i++) {
        isCandidate[_newCandidates[i]] = true;
    }

    // Kullanıcı oylarını sıfırla
    for (uint i = 0; i < candidates.length; i++) {
        userVotes[candidates[i]] = 0;
    }
}

    function _transferFunds(address to, uint256 amount) private {
        (bool success, ) = payable(to).call{ value: amount }("");
        require(success, "Transfer failed");
    }

    function getOwner() public view returns (address) {
    return owner;
}

}

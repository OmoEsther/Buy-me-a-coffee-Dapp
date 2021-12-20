// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract CoffeePortal {
    uint256 totalCoffee;
    uint256 coffeePrice;

    address payable public owner;

    event NewCoffee(
        address indexed from,
        uint256 timestamp,
        string message,
        string name
    );

    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;


    constructor(uint256 _coffeePrice) payable {
        owner = payable(msg.sender);
        coffeePrice = _coffeePrice * (10**18);
    }

    struct Coffee {
        address giver; // The address of the user who buys me a coffee.
        string message; // The message the user sent.
        string name; // The name of the user who buys me a coffee.
        uint256 timestamp; // The timestamp when the user buys me a coffee.
    }

    /*
     * I declare variable coffee that lets me store an array of structs.
     * This is what lets me hold all the coffee anyone ever sends to me!
     */
    Coffee[] coffee;

    /*
     * I added a function getAllCoffee which will return the struct array, coffee, to us.
     * This will make it easy to retrieve the coffee from our website!
     */
    function getAllCoffee() public view returns (Coffee[] memory) {
        return coffee;
    }

    // Get All coffee bought
    function getTotalCoffee() public view returns (uint256) {
        return totalCoffee;
    }

    // Get Coffee Amount
    function getCoffeeAmount() public view returns (uint256) {
        return coffeePrice;
    }

    function buyCoffee(
        string memory _message,
        string memory _name
    ) public payable {
        require(IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                owner,
                coffeePrice            ),
            "Transfer failed"
        );

        totalCoffee += 1;

        /*
         * This is where I actually store the coffee data in the array.
         */
        coffee.push(Coffee(msg.sender, _message, _name, block.timestamp));
        
        emit NewCoffee(msg.sender, block.timestamp, _message, _name);
    }
}

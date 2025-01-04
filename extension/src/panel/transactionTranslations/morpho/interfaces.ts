import { Interface } from 'ethers'

export const morphoBundlerInterface = new Interface([
  'function erc4626Deposit(address, uint256, uint256, address) external payable',
  'function erc4626Mint(address, uint256, uint256, address) external payable',
  'function erc4626Redeem(address, uint256, uint256, address, address) external payable',
  'function erc4626Withdraw(address, uint256, uint256, address, address) external payable',
  'function morphoSupplyCollateral((address,address,address,address,uint256) marketParams,uint256 assets,address onBehalf,bytes data) external payable',
  'function reallocateTo(address publicAllocator, address vault, uint256 value, ((address,address,address,address,uint256), uint128)[] withdrawals,(address,address,address,address,uint256) supplyMarketParams) external payable',
  'function morphoBorrow((address,address,address,address,uint256) marketParams, uint256 assets, uint256 shares, uint256 slippageAmount, address receiver) external payable',
])

export const publicAllocatorInterface = new Interface([
  'function reallocateTo(address vault, ((address,address,address,address,uint256), uint128)[] withdrawals,(address,address,address,address,uint256) supplyMarketParams) external payable',
])

export const erc4626Interface = new Interface([
  'function deposit(uint256, address) external payable',
  'function mint(uint256, address) external payable',
  'function redeem(uint256, address, address) external payable',
  'function withdraw(uint256, address, address) external payable',
  'function approve(address, uint256) external',
  'function asset() external view returns (address)',
  'function convertToAssets(uint256) external view returns (uint256)',
])

export const morphoInterface = new Interface([
  'function supplyCollateral((address,address,address,address,uint256) marketParams, uint256 assets, address onBehalf, bytes calldata data)',
  'function borrow((address,address,address,address,uint256) marketParams, uint256 assets, uint256 shares, address onBehalf, address receiver) external returns (uint256, uint256)',
])

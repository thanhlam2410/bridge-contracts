const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
})
const { isAddress, toBN } = require('web3').utils
const envalid = require('envalid')
const { ZERO_ADDRESS } = require('./constants')

// Validations and constants
const validBridgeModes = ['NATIVE_TO_ERC', 'ERC_TO_ERC', 'ERC_TO_NATIVE', 'ERC_TO_ERC_MULTIPLE']
const bigNumValidator = envalid.makeValidator(x => toBN(x))
const validateAddress = address => {
  if (isAddress(address)) {
    return address
  }

  throw new Error(`Invalid address: ${address}`)
}
const addressValidator = envalid.makeValidator(validateAddress)
const addressesValidator = envalid.makeValidator(addresses => {
  addresses.split(' ').forEach(validateAddress)
  return addresses
})

const { BRIDGE_MODE, DEPLOY_REWARDABLE_TOKEN, USE_EXISTING_TOKEN } = process.env

if (!validBridgeModes.includes(BRIDGE_MODE)) {
  throw new Error(`Invalid bridge mode: ${BRIDGE_MODE}`)
}

let validations = {
  DEPLOYMENT_ACCOUNT_PRIVATE_KEY: envalid.str(),
  DEPLOYMENT_GAS_LIMIT: bigNumValidator(),
  HOME_DEPLOYMENT_GAS_PRICE: bigNumValidator(),
  FOREIGN_DEPLOYMENT_GAS_PRICE: bigNumValidator(),
  GET_RECEIPT_INTERVAL_IN_MILLISECONDS: bigNumValidator(),
  HOME_RPC_URL: envalid.str(),
  HOME_BRIDGE_OWNER: addressValidator(),
  HOME_UPGRADEABLE_ADMIN: addressValidator(),
  HOME_DAILY_LIMIT: bigNumValidator(),
  HOME_MAX_AMOUNT_PER_TX: bigNumValidator(),
  HOME_MIN_AMOUNT_PER_TX: bigNumValidator(),
  HOME_REQUIRED_BLOCK_CONFIRMATIONS: envalid.num(),
  HOME_GAS_PRICE: bigNumValidator(),
  FOREIGN_RPC_URL: envalid.str(),
  FOREIGN_BRIDGE_OWNER: addressValidator(),
  FOREIGN_UPGRADEABLE_ADMIN: addressValidator(),
  FOREIGN_REQUIRED_BLOCK_CONFIRMATIONS: envalid.num(),
  FOREIGN_GAS_PRICE: bigNumValidator(),
  VALIDATORS: addressesValidator()
}

if (BRIDGE_MODE === 'NATIVE_TO_ERC') {
  validations = {
    ...validations,
    HOME_CONSENSUS_ADDRESS: addressValidator(),
    FOREIGN_DAILY_LIMIT: bigNumValidator(),
    FOREIGN_MAX_AMOUNT_PER_TX: bigNumValidator(),
    FOREIGN_MIN_AMOUNT_PER_TX: bigNumValidator(),
    USE_EXISTING_TOKEN: envalid.bool(),
    DEPLOY_REWARDABLE_TOKEN: envalid.bool()
  }
  if (USE_EXISTING_TOKEN == 'true') {
    validations = {
      ...validations,
      BRIDGEABLE_TOKEN_ADDRESS: addressValidator()
    }
  } else {
    validations = {
    ...validations,
      BRIDGEABLE_TOKEN_NAME: envalid.str(),
      BRIDGEABLE_TOKEN_SYMBOL: envalid.str(),
      BRIDGEABLE_TOKEN_DECIMALS: envalid.num(),
      BRIDGEABLE_TOKEN_PRE_MINTED: envalid.bool(),
      BRIDGEABLE_TOKEN_INITIAL_SUPPLY_ETH: envalid.num()
    }
  }
  if (DEPLOY_REWARDABLE_TOKEN == 'true') {
    validations = {
      ...validations,
      DPOS_VALIDATOR_SET_ADDRESS: addressValidator(),
      BLOCK_REWARD_ADDRESS: addressValidator()
    }
  }
}
if (BRIDGE_MODE === 'ERC_TO_ERC') {
  validations = {
    ...validations,
    HOME_VALIDATORS_OWNER: addressesValidator(),
    FOREIGN_VALIDATORS_OWNER: addressValidator(),
    REQUIRED_NUMBER_OF_VALIDATORS: envalid.num(),
    ERC20_TOKEN_ADDRESS: addressValidator(),
    BRIDGEABLE_TOKEN_NAME: envalid.str(),
    BRIDGEABLE_TOKEN_SYMBOL: envalid.str(),
    BRIDGEABLE_TOKEN_DECIMALS: envalid.num()
  }
}
if (BRIDGE_MODE === 'ERC_TO_NATIVE') {
  validations = {
    ...validations,
    HOME_VALIDATORS_OWNER: addressesValidator(),
    FOREIGN_VALIDATORS_OWNER: addressValidator(),
    REQUIRED_NUMBER_OF_VALIDATORS: envalid.num(),
    ERC20_TOKEN_ADDRESS: addressValidator(),
    BLOCK_REWARD_ADDRESS: addressValidator({
      default: ZERO_ADDRESS
    })
  }
}
if(BRIDGE_MODE === 'ERC_TO_ERC_MULTIPLE') {
  validations = {
    ...validations,
    HOME_VALIDATORS_OWNER: addressesValidator(),
    FOREIGN_VALIDATORS_OWNER: addressValidator(),
    REQUIRED_NUMBER_OF_VALIDATORS: envalid.num(),
    HOME_FACTORY_OWNER: addressValidator(),
    HOME_MAPPER_OWNER: addressValidator(),
    FOREIGN_FACTORY_OWNER: addressValidator(),
  }
}

const env = envalid.cleanEnv(process.env, validations)

module.exports = env

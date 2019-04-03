import Provider from '../../Provider'
import { padHexStart } from '../../crypto'
import { ensureAddressStandardFormat, ensureHexEthFormat } from './EthereumUtil'

export default class EthereumERC20Provider extends Provider {
  constructor (contractAddress) {
    super()
    this._contractAddress = ensureAddressStandardFormat(contractAddress)
  }

  generateErc20Transfer (to, value) {
    const functionSignature = 'a9059cbb'
    const encodedAddress = padHexStart(ensureAddressStandardFormat(to), 64)
    const encodedValue = padHexStart(value.toString(16), 64)
    return functionSignature + encodedAddress + encodedValue
  }

  erc20Transfer (to, value) {
    const txBytecode = this.generateErc20Transfer(to, value)
    return this.getMethod('sendTransaction')(ensureHexEthFormat(this._contractAddress), 0, txBytecode)
  }

  getContractAddress () {
    return this._contractAddress
  }

  async getBalance (addresses) {
    const functionSignature = '0x70a08231'
    addresses = addresses
      .map(address => String(address))
    const addrs = addresses.map(ensureHexEthFormat)
    const promiseBalances = await Promise.all(addrs.map(address => this.getMethod('jsonrpc')('eth_call', { data: functionSignature + padHexStart(ensureAddressStandardFormat(address), 64), to: ensureHexEthFormat(this._contractAddress) }, 'latest')))
    return promiseBalances.map(balance => parseInt(balance, 16))
      .reduce((acc, balance) => acc + balance, 0)
  }
}

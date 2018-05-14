import bigi = require('bigi');
import bitcoin = require('bitcoinjs-lib');

// For testing only
function rng() {
    return new Buffer('12345678901234567890123456789012');
}

// Generate a random bitcoin address
const keyPair1 = bitcoin.ECPair.makeRandom({rng});
const address = keyPair1.getAddress();
keyPair1.toWIF();

// Generate an address from a SHA256 hash
const hash = bitcoin.crypto.sha256(Buffer.from('correct horse battery staple', 'utf8'));
const d = bigi.fromBuffer(hash);
const keyPair2 = new bitcoin.ECPair(d);

// Generate a random keypair for alternative networks
const keyPair3 = bitcoin.ECPair.makeRandom({network: bitcoin.networks.litecoin, rng});
keyPair3.toWIF();
keyPair3.getAddress();
const network = keyPair3.getNetwork();

// Test TransactionBuilder and Transaction
const txb = new bitcoin.TransactionBuilder();
txb.addInput('aa94ab02c182214f090e99a0d57021caffd0f195a81c24602b1028b130b63e31', 0);
txb.addOutput(Buffer.from('76a91437b88b58816af9d5a51af0b41d30cef80efb3a4388ac', 'hex'), 15000);
txb.sign(0, keyPair1);
const tx = txb.build();
tx.toHex();
tx.hasWitnesses();
tx.hashForWitnessV0(0, new Buffer('12345678901234567890123456789012'), 2, 3);

// Test functions in address
const rsBase58Check = bitcoin.address.fromBase58Check(address);
const rsBech32 = bitcoin.address.fromBech32('bc1qawh6c0k44h2z83kwzwy4ky7m3yktrv06cvgefx');
const rsOutputScript = bitcoin.address.fromOutputScript(Buffer.from('76a91437b88b58816af9d5a51af0b41d30cef80efb3a4388ac', 'hex'));
const rsOutputScriptWithNetwork = bitcoin.address.fromOutputScript(Buffer.from('76a91437b88b58816af9d5a51af0b41d30cef80efb3a4388ac', 'hex'), network);
bitcoin.address.toBase58Check(rsBase58Check.hash, rsBase58Check.version);
bitcoin.address.toBech32(rsBech32.data, rsBech32.version, rsBech32.prefix);
bitcoin.address.toOutputScript(address);
// bitcoin.address.toOutputScript(address, network);

const redeemScript = bitcoin.script.multisig.output.encode(
	2,
	[
		Buffer.from('026fe004ccd0ef7a0e3c3c58d1e6b38651193ca3f4f8754664d6c2a15102598f2c', 'hex'),
		Buffer.from('03bc0a97da826610b7bea456c732b883ccdf14e155c65865f1674c28fe5da5c478', 'hex'),
		Buffer.from('027c65efbe522e949f99f036fa3f19a61b4d8164a912dc48a72f15dd700dfd0b8b', 'hex'),
	]
);
bitcoin.script.scriptHash.input.encode(
	bitcoin.script.multisig.input.encodeStack(
		[
			Buffer.from('304402207148ded256dd11078a2536101e49c358c0ec50e35416606a12e258acb1e03edf022030cc094cee47bf49f69c077efb8e0bd827e6bebd2aab73d7e2f9b07758ba144001', 'hex'),
			Buffer.from('3045022100a65cbe293919ac97e58e221e0c141f904bc0eff99eaa0dc1b7896da4635d4cd5022013965d6a898c1130b93d4c848fa247f60ed2127772e1f952071a4ca746f977a401', 'hex'),
		],
		redeemScript,
	),
	redeemScript,
);

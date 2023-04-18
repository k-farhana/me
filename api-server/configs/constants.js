const { buildCCPOrg1, buildCCPOrg2 } = require('../utils/appUtil');

exports.MSP_ORGINFO_MAP = {
	'Org1MSP': { caHost: 'ca.org1.example.com', orgName: 'org1', buildCCPOrg: buildCCPOrg1 },
	'Org2MSP': { caHost: 'ca.org2.example.com', orgName: 'org2', buildCCPOrg: buildCCPOrg2 }
}

exports.CHANNEL_NAME = "producer-channel"

exports.LAC_TEST_APPLICATION_STATUS = {
	IN_PROCESS: 'in-process',
	COMPLETED: 'completed'
}

exports.AUCTION_STATUS = {
	ON_GOING: 'on-going',
	COMPLETED: 'completed'
}

exports.BID_STATUS = {
	REQUESTED_TEST_REPORT: 'requested-test-report',
	TEST_REPORT_ADDED: 'test-report-added',
	INVOICE_ADDED: 'invoice-added',
	ORDERED: 'ordered'
}

exports.CHAINCODE_NAME = {
	FABCAR: 'fabcar',
	LAC_SAMPLE_TEST_APPLICATION: 'lacsampletestapplication',
	AUCTION: 'auction',
	LOAN: 'loan'
}

exports.LOAN_WINDOW_STATUS = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected'
}

exports.LOAN_WINDOW_STATUSES = [this.LOAN_WINDOW_STATUS.PENDING, this.LOAN_WINDOW_STATUS.APPROVED, this.LOAN_WINDOW_STATUS.REJECTED]

exports.LOAN_STATUS = {
	IN_PROCESS: 'in-process',
	APPROVED: 'approved',
	REJECTED: 'rejected'
}

exports.LOAN_STATUSES = [this.LOAN_STATUS.IN_PROCESS, this.LOAN_STATUS.APPROVED, this.LOAN_STATUS.REJECTED]

exports.LOAN_WINDOW_TYPE = { FPO: 'fpo', FARMER: 'farmer' }
exports.LOAN_WINDOW_TYPES = [this.LOAN_WINDOW_TYPE.FPO, this.LOAN_WINDOW_TYPE.FARMER]

exports.JWT_SECRET = 'secret'

exports.USER_TYPE = {
	FPO: 'fpo',
	LENDING_PARTNER: 'lendingpartner',
	CORPORATE_CLIENT: 'corporateclient',
	NISA: 'nisa'
}

exports.USER_TYPES = [this.USER_TYPE.FPO, this.USER_TYPE.CORPORATE_CLIENT, this.USER_TYPE.LENDING_PARTNER, this.USER_TYPE.NISA]
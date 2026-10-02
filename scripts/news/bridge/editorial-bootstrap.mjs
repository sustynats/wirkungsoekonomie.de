import {bridgePath} from './contract.mjs';

// Published transport contracts are immutable. A newer runtime must not crash
// (or overwrite historical instructions) merely because the prose evolved.
// New installations receive the current contract; existing versions stay put.
export async function ensureEditorialContracts(transport, contracts) {
  const result = [];
  for (const contract of contracts) {
    if (!['3.0', '4.0'].includes(contract.schema_version)) throw Error('EDITORIAL_CONTRACT_VERSION_INVALID');
    const file = bridgePath('98_CONFIG', `editorial-request-contract-${contract.schema_version[0]}.json`);
    const existing = await transport.metadata(file);
    if (existing) {
      const saved = JSON.parse(await transport.read(file));
      if (saved.schema_version !== contract.schema_version || saved.workflow !== 'single_final_approval'
          || !saved.output_schema) throw Error('EDITORIAL_EXISTING_CONTRACT_INVALID');
      result.push({version: contract.schema_version, status: 'existing_immutable'});
    } else {
      await transport.writeAtomic(file, contract);
      result.push({version: contract.schema_version, status: 'installed'});
    }
  }
  return result;
}

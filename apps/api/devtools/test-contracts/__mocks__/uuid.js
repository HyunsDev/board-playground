const fake = () => '00000000-0000-0000-0000-000000000000';

module.exports = {
  MAX: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
  NIL: '00000000-0000-0000-0000-000000000000',
  parse: () => '',
  stringify: () => '',
  v1: fake,
  v1ToV6: fake,
  v3: fake,
  v4: fake,
  v5: fake,
  v6: fake,
  v6ToV1: fake,
  v7: fake,
  validate: () => true,
  version: () => 4,
  default: fake,
};

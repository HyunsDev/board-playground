const handler = {
  get: () => proxy,
  apply: (_target, _thisArg, args) => String(args[0] ?? ''),
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const proxy = new Proxy(() => '', handler);

module.exports = proxy;
module.exports.default = proxy;

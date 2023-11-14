export default {
  listen: {
    hash: 'U2FsdGVkX18u3a/kwz5awtnhPAK/z0ffjH31VzXrQOYmB/kw6lVtSUuplRUUMstq',
    chunk1: 'U2FsdGVkX1+9PAAaso9C5apmE+AfyGuysske2FIMV/B7SL6ILzDNLLSnyAwtkAdM',
    chunk2: 'U2FsdGVkX1+J/c0NjDeWmLHLQjMlxTyH6tt2+3NI9rI='
  },
  environments: {
    production: {
      port: 3000,
      origin: "https://www.sweetq.es"
    },
    development: {
      port: 3000,
      origin: "http://localhost:4200"
    }
  }
}
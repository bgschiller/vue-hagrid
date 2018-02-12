const Hagrid = require('../src/index');

describe('Hagrid', () => {
  it('can add', () => {
    assert.equal(1 + 1, 2);
  });
});

// It should handle dynamically registered modules
// does not dispatch actions if no subscribers exist.
// refreshes when the getter changes.
// removes watcher when components unsubscribe
// doesn't crash hard when a modules is removed.
import {createLoadActions} from '../../lib/load-data';

describe('load-data/creators', () => {
  describe('createLoadActions', () => {
    it('creates 3 actions: load, success, failed', () => {
      const actions = createLoadActions<{}>('foobar');

      expect(actions.load.type).toEqual('[foobar] Load')
      expect(actions.success.type).toEqual('[foobar] Load Success')
      expect(actions.failed.type).toEqual('[foobar] Load Failed')
    })
  });

});

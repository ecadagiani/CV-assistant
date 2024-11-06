import { atom, atomFamily } from 'recoil';
import { INPUT_TYPE } from 'src/constants';

export const inputTypeState = atom({
  key: 'inputTypeState',
  default: {
    type: INPUT_TYPE.DEFAULT,
    data: {},
  },
});

export const inputValueStateFamily = atomFamily({
  key: 'inputValueStateFamily',
  default: {
    value: '',
  },
});
